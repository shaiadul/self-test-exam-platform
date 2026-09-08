package http

import (
	"encoding/json"
	"fmt"
	"net/http"

	"github.com/selftest/backend/internal/domain/upload"
	"github.com/selftest/backend/internal/service"
)

type UploadHandler struct {
	uploadService *service.UploadService
}

func NewUploadHandler(uploadService *service.UploadService) *UploadHandler {
	return &UploadHandler{uploadService: uploadService}
}

func (h *UploadHandler) HandlePresign(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, `{"error": "Method not allowed"}`, http.StatusMethodNotAllowed)
		return
	}

	var req upload.PresignUploadRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, `{"error": "Invalid request body"}`, http.StatusBadRequest)
		return
	}

	res, err := h.uploadService.GeneratePresignedUpload(r.Context(), req)
	if err != nil {
		if err == service.ErrInvalidContentType || err == service.ErrMissingFileName {
			http.Error(w, fmt.Sprintf(`{"error": "%v"}`, err), http.StatusBadRequest)
			return
		}
		http.Error(w, fmt.Sprintf(`{"error": "%v"}`, err), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(res)
}

func (h *UploadHandler) HandleDirectUpload(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, `{"error": "Method not allowed"}`, http.StatusMethodNotAllowed)
		return
	}

	// Max 10MB file
	if err := r.ParseMultipartForm(10 << 20); err != nil {
		http.Error(w, `{"error": "File size exceeds 10MB limit"}`, http.StatusBadRequest)
		return
	}

	file, header, err := r.FormFile("file")
	if err != nil {
		http.Error(w, `{"error": "No file uploaded under form key 'file'"}`, http.StatusBadRequest)
		return
	}
	defer file.Close()

	folder := r.FormValue("folder")
	contentType := header.Header.Get("Content-Type")
	if contentType == "" {
		contentType = "image/jpeg"
	}

	res, err := h.uploadService.DirectUpload(r.Context(), folder, header.Filename, contentType, file, header.Size)
	if err != nil {
		if err == service.ErrInvalidContentType || err == service.ErrMissingFileName {
			http.Error(w, fmt.Sprintf(`{"error": "%v"}`, err), http.StatusBadRequest)
			return
		}
		http.Error(w, fmt.Sprintf(`{"error": "%v"}`, err), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(res)
}

