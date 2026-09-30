package service

import (
	"context"
	"io"
	"testing"

	"github.com/selftest/backend/internal/domain/upload"
)

type mockStorage struct {
	lastReq upload.PresignUploadRequest
}

func (m *mockStorage) GeneratePresignedURL(ctx context.Context, req upload.PresignUploadRequest) (*upload.PresignUploadResponse, error) {
	m.lastReq = req
	return &upload.PresignUploadResponse{
		UploadURL: "https://mock-s3.example.com/upload",
		PublicURL: "https://cdn.example.com/" + req.Folder + "/" + req.FileName,
		Key:       req.Folder + "/" + req.FileName,
	}, nil
}

func (m *mockStorage) DirectUpload(ctx context.Context, folder string, fileName string, contentType string, data io.Reader, size int64) (*upload.PresignUploadResponse, error) {
	return &upload.PresignUploadResponse{
		UploadURL: "",
		PublicURL: "https://cdn.example.com/" + folder + "/" + fileName,
		Key:       folder + "/" + fileName,
	}, nil
}

func TestUploadService_Validation(t *testing.T) {
	mock := &mockStorage{}
	svc := NewUploadService(mock)
	ctx := context.Background()

	t.Run("Reject missing file name", func(t *testing.T) {
		_, err := svc.GeneratePresignedUpload(ctx, upload.PresignUploadRequest{
			FileName:    "",
			ContentType: "image/png",
		})
		if err != ErrMissingFileName {
			t.Errorf("expected ErrMissingFileName, got %v", err)
		}
	})

	t.Run("Reject non-image content type", func(t *testing.T) {
		_, err := svc.GeneratePresignedUpload(ctx, upload.PresignUploadRequest{
			FileName:    "document.pdf",
			ContentType: "application/pdf",
		})
		if err != ErrInvalidContentType {
			t.Errorf("expected ErrInvalidContentType, got %v", err)
		}
	})

	t.Run("Allow valid image and normalize folder", func(t *testing.T) {
		res, err := svc.GeneratePresignedUpload(ctx, upload.PresignUploadRequest{
			FileName:    "avatar.jpg",
			ContentType: "image/jpeg",
			Folder:      "AVATARS",
		})
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}
		if res.UploadURL == "" || res.PublicURL == "" {
			t.Errorf("expected upload and public URLs to be non-empty")
		}
		if mock.lastReq.Folder != "avatars" {
			t.Errorf("expected folder to be normalized to 'avatars', got %s", mock.lastReq.Folder)
		}
	})
}
