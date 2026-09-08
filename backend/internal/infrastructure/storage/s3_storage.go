package storage

import (
	"context"
	"errors"
	"fmt"
	"io"
	"os"
	"path/filepath"
	"strings"
	"time"

	"github.com/aws/aws-sdk-go-v2/aws"
	awsconfig "github.com/aws/aws-sdk-go-v2/config"
	"github.com/aws/aws-sdk-go-v2/credentials"
	"github.com/aws/aws-sdk-go-v2/service/s3"
	"github.com/google/uuid"
	"github.com/selftest/backend/internal/domain/upload"
)

type S3Storage struct {
	client        *s3.Client
	presignClient *s3.PresignClient
	bucket        string
	publicURL     string
	endpoint      string
	isConfigured  bool
}

func NewS3Storage() (*S3Storage, error) {
	bucket := os.Getenv("S3_BUCKET")
	accessKey := os.Getenv("S3_ACCESS_KEY_ID")
	secretKey := os.Getenv("S3_SECRET_ACCESS_KEY")
	region := os.Getenv("S3_REGION")
	endpoint := os.Getenv("S3_ENDPOINT")
	publicURL := os.Getenv("S3_PUBLIC_URL")
	forcePathStyle := os.Getenv("S3_FORCE_PATH_STYLE") == "true"

	if region == "" {
		region = "auto" // Default for Cloudflare R2
	}

	// Check if configured
	if bucket == "" || accessKey == "" || secretKey == "" {
		// Return unconfigured instance that gives a clear message when called
		return &S3Storage{
			isConfigured: false,
			bucket:       bucket,
			publicURL:    publicURL,
			endpoint:     endpoint,
		}, nil
	}

	cfg, err := awsconfig.LoadDefaultConfig(context.TODO(),
		awsconfig.WithRegion(region),
		awsconfig.WithCredentialsProvider(credentials.NewStaticCredentialsProvider(accessKey, secretKey, "")),
	)
	if err != nil {
		return nil, fmt.Errorf("failed to load S3 configuration: %w", err)
	}

	client := s3.NewFromConfig(cfg, func(o *s3.Options) {
		if endpoint != "" {
			o.BaseEndpoint = aws.String(endpoint)
		}
		o.UsePathStyle = forcePathStyle
	})

	presignClient := s3.NewPresignClient(client)

	return &S3Storage{
		client:        client,
		presignClient: presignClient,
		bucket:        bucket,
		publicURL:     publicURL,
		endpoint:      endpoint,
		isConfigured:  true,
	}, nil
}

func (s *S3Storage) GeneratePresignedURL(ctx context.Context, req upload.PresignUploadRequest) (*upload.PresignUploadResponse, error) {
	if !s.isConfigured {
		return nil, errors.New("S3 storage is not configured. Please set S3_BUCKET, S3_ACCESS_KEY_ID, and S3_SECRET_ACCESS_KEY in .env")
	}

	// Determine folder
	folder := strings.TrimSpace(req.Folder)
	if folder == "" {
		folder = "general"
	}
	folder = strings.Trim(folder, "/")

	// Sanitize extension
	ext := strings.ToLower(filepath.Ext(req.FileName))
	if ext == "" {
		switch req.ContentType {
		case "image/jpeg", "image/jpg":
			ext = ".jpg"
		case "image/png":
			ext = ".png"
		case "image/webp":
			ext = ".webp"
		case "image/gif":
			ext = ".gif"
		case "image/svg+xml":
			ext = ".svg"
		default:
			ext = ".jpg"
		}
	}

	// Generate unique key
	uniqueID := uuid.New().String()
	key := fmt.Sprintf("uploads/%s/%s%s", folder, uniqueID, ext)

	// Presign PUT request (valid for 15 minutes)
	presignedReq, err := s.presignClient.PresignPutObject(ctx, &s3.PutObjectInput{
		Bucket:      aws.String(s.bucket),
		Key:         aws.String(key),
		ContentType: aws.String(req.ContentType),
	}, s3.WithPresignExpires(15*time.Minute))
	if err != nil {
		return nil, fmt.Errorf("failed to generate presigned upload URL: %w", err)
	}

	// Determine public URL
	var publicURL string
	if s.publicURL != "" {
		publicURL = fmt.Sprintf("%s/%s", strings.TrimRight(s.publicURL, "/"), key)
	} else if s.endpoint != "" {
		publicURL = fmt.Sprintf("%s/%s/%s", strings.TrimRight(s.endpoint, "/"), s.bucket, key)
	} else {
		publicURL = fmt.Sprintf("https://%s.s3.amazonaws.com/%s", s.bucket, key)
	}

	return &upload.PresignUploadResponse{
		UploadURL: presignedReq.URL,
		PublicURL: publicURL,
		Key:       key,
	}, nil
}

func (s *S3Storage) DirectUpload(ctx context.Context, folder string, fileName string, contentType string, data io.Reader, size int64) (*upload.PresignUploadResponse, error) {
	if !s.isConfigured {
		return nil, errors.New("S3 storage is not configured. Please set S3_BUCKET, S3_ACCESS_KEY_ID, and S3_SECRET_ACCESS_KEY in .env")
	}

	folder = strings.TrimSpace(folder)
	if folder == "" {
		folder = "general"
	}
	folder = strings.Trim(folder, "/")

	ext := strings.ToLower(filepath.Ext(fileName))
	if ext == "" {
		switch contentType {
		case "image/jpeg", "image/jpg":
			ext = ".jpg"
		case "image/png":
			ext = ".png"
		case "image/webp":
			ext = ".webp"
		case "image/gif":
			ext = ".gif"
		case "image/svg+xml":
			ext = ".svg"
		default:
			ext = ".jpg"
		}
	}

	uniqueID := uuid.New().String()
	key := fmt.Sprintf("uploads/%s/%s%s", folder, uniqueID, ext)

	input := &s3.PutObjectInput{
		Bucket:      aws.String(s.bucket),
		Key:         aws.String(key),
		Body:        data,
		ContentType: aws.String(contentType),
	}
	if size > 0 {
		input.ContentLength = aws.Int64(size)
	}

	_, err := s.client.PutObject(ctx, input)
	if err != nil {
		return nil, fmt.Errorf("failed to upload object directly to S3/R2: %w", err)
	}

	var publicURL string
	if s.publicURL != "" {
		publicURL = fmt.Sprintf("%s/%s", strings.TrimRight(s.publicURL, "/"), key)
	} else if s.endpoint != "" {
		publicURL = fmt.Sprintf("%s/%s/%s", strings.TrimRight(s.endpoint, "/"), s.bucket, key)
	} else {
		publicURL = fmt.Sprintf("https://%s.s3.amazonaws.com/%s", s.bucket, key)
	}

	return &upload.PresignUploadResponse{
		UploadURL: "",
		PublicURL: publicURL,
		Key:       key,
	}, nil
}

