package storage

import (
	"bytes"
	"context"
	"net/http"
	"os"
	"testing"

	"github.com/joho/godotenv"
	"github.com/selftest/backend/internal/domain/upload"
)

func TestLiveR2Upload(t *testing.T) {
	_ = godotenv.Load("../../../.env")

	if os.Getenv("S3_ACCESS_KEY_ID") == "" {
		t.Skip("No S3 credentials")
	}

	storage, err := NewS3Storage()
	if err != nil {
		t.Fatalf("Failed to init S3 storage: %v", err)
	}

	res, err := storage.GeneratePresignedURL(context.Background(), upload.PresignUploadRequest{
		FileName:    "test.jpg",
		ContentType: "image/jpeg",
		Folder:      "test",
	})
	if err != nil {
		t.Fatalf("GeneratePresignedURL failed: %v", err)
	}

	t.Logf("Generated UploadURL: %s", res.UploadURL)
	t.Logf("Generated PublicURL: %s", res.PublicURL)

	// Now attempt actual HTTP PUT
	sampleData := []byte("fake-image-data-for-testing")
	req, err := http.NewRequest(http.MethodPut, res.UploadURL, bytes.NewReader(sampleData))
	if err != nil {
		t.Fatalf("Failed to create HTTP request: %v", err)
	}
	req.Header.Set("Content-Type", "image/jpeg")

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		t.Fatalf("Failed to PUT to presigned URL: %v", err)
	}
	defer resp.Body.Close()

	t.Logf("R2 response status: %d", resp.StatusCode)
	if resp.StatusCode < 200 || resp.StatusCode >= 300 {
		buf := new(bytes.Buffer)
		buf.ReadFrom(resp.Body)
		t.Fatalf("R2 upload returned non-2xx status: %d, body: %s", resp.StatusCode, buf.String())
	}
}
