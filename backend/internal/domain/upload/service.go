package upload

import (
	"context"
	"io"
)

type StorageService interface {
	GeneratePresignedURL(ctx context.Context, req PresignUploadRequest) (*PresignUploadResponse, error)
	DirectUpload(ctx context.Context, folder string, fileName string, contentType string, data io.Reader, size int64) (*PresignUploadResponse, error)
}

