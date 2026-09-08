package service

import (
	"context"
	"errors"
	"io"
	"strings"

	"github.com/selftest/backend/internal/domain/upload"
)

var (
	ErrInvalidContentType = errors.New("only image uploads are supported (jpeg, png, webp, gif, svg)")
	ErrMissingFileName    = errors.New("file name is required")
)

type UploadService struct {
	storage upload.StorageService
}

func NewUploadService(storage upload.StorageService) *UploadService {
	return &UploadService{storage: storage}
}

func (s *UploadService) GeneratePresignedUpload(ctx context.Context, req upload.PresignUploadRequest) (*upload.PresignUploadResponse, error) {
	if strings.TrimSpace(req.FileName) == "" {
		return nil, ErrMissingFileName
	}

	contentType := strings.ToLower(strings.TrimSpace(req.ContentType))
	if !strings.HasPrefix(contentType, "image/") {
		return nil, ErrInvalidContentType
	}

	// Allowed folders
	folder := strings.ToLower(strings.TrimSpace(req.Folder))
	switch folder {
	case "avatars", "exam-packs", "questions", "banners", "assets":
		// valid
	default:
		folder = "general"
	}
	req.Folder = folder

	return s.storage.GeneratePresignedURL(ctx, req)
}

func (s *UploadService) DirectUpload(ctx context.Context, folder string, fileName string, contentType string, data io.Reader, size int64) (*upload.PresignUploadResponse, error) {
	if strings.TrimSpace(fileName) == "" {
		return nil, ErrMissingFileName
	}

	contentType = strings.ToLower(strings.TrimSpace(contentType))
	if !strings.HasPrefix(contentType, "image/") {
		return nil, ErrInvalidContentType
	}

	folder = strings.ToLower(strings.TrimSpace(folder))
	switch folder {
	case "avatars", "exam-packs", "questions", "banners", "assets":
		// valid
	default:
		folder = "general"
	}

	return s.storage.DirectUpload(ctx, folder, fileName, contentType, data, size)
}

