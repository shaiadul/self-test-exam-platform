package upload

type PresignUploadRequest struct {
	FileName    string `json:"fileName"`
	ContentType string `json:"contentType"`
	Folder      string `json:"folder"` // e.g., "avatars", "exam-packs", "questions"
}

type PresignUploadResponse struct {
	UploadURL string `json:"uploadUrl"`
	PublicURL string `json:"publicUrl"`
	Key       string `json:"key"`
}
