package http

import (
	"encoding/json"
	"fmt"
	"net/http"
	"strconv"
	"strings"

	"github.com/selftest/backend/internal/domain/exampack"
	"github.com/selftest/backend/internal/service"
)

type ExamPackHandler struct {
	packService *service.ExamPackService
	examService *service.ExamService
}

func NewExamPackHandler(packService *service.ExamPackService, examService *service.ExamService) *ExamPackHandler {
	return &ExamPackHandler{
		packService: packService,
		examService: examService,
	}
}

func (h *ExamPackHandler) HandleExamPacks(w http.ResponseWriter, r *http.Request) {
	path := r.URL.Path

	if path == "/api/exam-packs" || path == "/api/exam-packs/" {
		switch r.Method {
		case http.MethodGet:
			h.ListExamPacks(w, r)
		case http.MethodPost:
			h.CreateExamPack(w, r)
		default:
			http.Error(w, `{"error": "Method not allowed"}`, http.StatusMethodNotAllowed)
		}
		return
	}

	trimmed := strings.TrimPrefix(path, "/api/exam-packs/")
	parts := strings.Split(trimmed, "/")

	if len(parts) == 2 && parts[1] == "exams" {
		packID, err := strconv.Atoi(parts[0])
		if err != nil {
			http.Error(w, `{"error": "Invalid Exam Pack ID"}`, http.StatusBadRequest)
			return
		}

		switch r.Method {
		case http.MethodGet:
			h.ListExams(w, r, packID)
		case http.MethodPost:
			h.CreateExam(w, r, packID)
		default:
			http.Error(w, `{"error": "Method not allowed"}`, http.StatusMethodNotAllowed)
		}
		return
	}

	if len(parts) == 1 && parts[0] != "" {
		id, err := strconv.Atoi(parts[0])
		if err != nil {
			http.Error(w, `{"error": "Invalid Exam Pack ID"}`, http.StatusBadRequest)
			return
		}

		switch r.Method {
		case http.MethodGet:
			h.GetExamPack(w, r, id)
		case http.MethodPut:
			h.UpdateExamPack(w, r, id)
		case http.MethodDelete:
			h.DeleteExamPack(w, r, id)
		default:
			http.Error(w, `{"error": "Method not allowed"}`, http.StatusMethodNotAllowed)
		}
		return
	}

	http.Error(w, `{"error": "Page not found"}`, http.StatusNotFound)
}

func (h *ExamPackHandler) ListExamPacks(w http.ResponseWriter, r *http.Request) {
	packs, err := h.packService.ListExamPacks()
	if err != nil {
		http.Error(w, fmt.Sprintf(`{"error": "%v"}`, err), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(packs)
}

func (h *ExamPackHandler) GetExamPack(w http.ResponseWriter, r *http.Request, id int) {
	pack, err := h.packService.GetExamPack(id)
	if err != nil {
		if err == service.ErrExamPackNotFound {
			http.Error(w, `{"error": "Exam Pack not found"}`, http.StatusNotFound)
			return
		}
		http.Error(w, fmt.Sprintf(`{"error": "%v"}`, err), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(pack)
}

func (h *ExamPackHandler) CreateExamPack(w http.ResponseWriter, r *http.Request) {
	var pack exampack.ExamPack
	if err := json.NewDecoder(r.Body).Decode(&pack); err != nil {
		http.Error(w, `{"error": "Invalid request body"}`, http.StatusBadRequest)
		return
	}

	if pack.Title == "" || pack.Description == "" || pack.Category == "" {
		http.Error(w, `{"error": "Title, Description, and Category are required"}`, http.StatusBadRequest)
		return
	}

	if err := h.packService.CreateExamPack(&pack); err != nil {
		http.Error(w, fmt.Sprintf(`{"error": "Failed to create exam pack: %v"}`, err), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(pack)
}

func (h *ExamPackHandler) UpdateExamPack(w http.ResponseWriter, r *http.Request, id int) {
	pack, err := h.packService.GetExamPack(id)
	if err != nil || pack == nil {
		http.Error(w, `{"error": "Exam Pack not found"}`, http.StatusNotFound)
		return
	}

	var req struct {
		Title       string `json:"title"`
		Description string `json:"description"`
		Category    string `json:"category"`
		Image       string `json:"image"`
	}

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, `{"error": "Invalid request body"}`, http.StatusBadRequest)
		return
	}

	if req.Title != "" {
		pack.Title = req.Title
	}
	if req.Description != "" {
		pack.Description = req.Description
	}
	if req.Category != "" {
		pack.Category = req.Category
	}
	if req.Image != "" {
		pack.Image = req.Image
	}

	if err := h.packService.UpdateExamPack(pack); err != nil {
		http.Error(w, fmt.Sprintf(`{"error": "Failed to update exam pack: %v"}`, err), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(pack)
}

func (h *ExamPackHandler) DeleteExamPack(w http.ResponseWriter, r *http.Request, id int) {
	if err := h.packService.DeleteExamPack(id); err != nil {
		http.Error(w, fmt.Sprintf(`{"error": "Failed to delete: %v"}`, err), http.StatusInternalServerError)
		return
	}
	w.WriteHeader(http.StatusNoContent)
}

func (h *ExamPackHandler) ListExams(w http.ResponseWriter, r *http.Request, packID int) {
	exams, err := h.examService.ListExamsByPack(packID)
	if err != nil {
		http.Error(w, fmt.Sprintf(`{"error": "%v"}`, err), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(exams)
}

func (h *ExamPackHandler) CreateExam(w http.ResponseWriter, r *http.Request, packID int) {
	var input service.CreateExamInput
	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		http.Error(w, `{"error": "Invalid request body"}`, http.StatusBadRequest)
		return
	}

	created, err := h.examService.CreateExam(packID, input)
	if err != nil {
		switch err {
		case service.ErrExamNameRequired, service.ErrInvalidStartDate, service.ErrInvalidEndDate, service.ErrEndDateBeforeStart:
			http.Error(w, fmt.Sprintf(`{"error": "%v"}`, err), http.StatusBadRequest)
		default:
			http.Error(w, fmt.Sprintf(`{"error": "Failed to create exam: %v"}`, err), http.StatusInternalServerError)
		}
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(created)
}
