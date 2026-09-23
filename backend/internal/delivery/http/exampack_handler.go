package http

import (
	"encoding/json"
	"fmt"
	"net/http"
	"strconv"
	"strings"

	"github.com/selftest/backend/internal/domain/exam"
	"github.com/selftest/backend/internal/domain/exampack"
	"github.com/selftest/backend/internal/service"
	"github.com/selftest/backend/middleware"
	"github.com/selftest/backend/pkg/pagination"
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
	userID, _ := middleware.GetUserIDFromContext(r.Context())
	userRole := middleware.GetUserRoleFromContext(r.Context())
	if userRole == "" && userID > 0 {
		userRole, _ = h.packService.RoleOf(userID)
	}
	userRole = strings.ToLower(userRole)

	q := r.URL.Query()
	mineVal := q.Get("mine")
	manageVal := q.Get("manage")
	isManage := manageVal == "true" || manageVal == "1" || strings.Contains(r.Header.Get("Referer"), "manage-exam-pack")
	onlyMine := mineVal == "true" || mineVal == "1"

	var packs []exampack.ExamPack
	var err error

	if isManage {
		// In manage exam pack:
		// 1. Student must NOT see anything: return empty slice
		// 2. Teacher can see and manage their own exam packs
		// 3. Admin can manage all exam packs
		switch userRole {
		case "student":
			packs = []exampack.ExamPack{}
		case "teacher":
			if userID > 0 {
				packs, err = h.packService.ListExamPacks(userID, true)
				// Extra safety: ensure strictly owned packs
				filtered := make([]exampack.ExamPack, 0, len(packs))
				for _, p := range packs {
					if p.CreatedBy != nil && *p.CreatedBy == userID {
						filtered = append(filtered, p)
					}
				}
				packs = filtered
			} else {
				packs = []exampack.ExamPack{}
			}
		case "admin":
			packs, err = h.packService.ListExamPacks(userID, false)
		default:
			packs = []exampack.ExamPack{}
		}
	} else if onlyMine {
		if userRole == "student" || userID <= 0 {
			packs = []exampack.ExamPack{}
		} else {
			packs, err = h.packService.ListExamPacks(userID, true)
			filtered := make([]exampack.ExamPack, 0, len(packs))
			for _, p := range packs {
				if p.CreatedBy != nil && *p.CreatedBy == userID {
					filtered = append(filtered, p)
				}
			}
			packs = filtered
		}
	} else {
		packs, err = h.packService.ListExamPacks(userID, false)
	}

	if err != nil {
		http.Error(w, fmt.Sprintf(`{"error": "%v"}`, err), http.StatusInternalServerError)
		return
	}

	params := pagination.Parse(r)
	if params.Search != "" {
		lowerSearch := strings.ToLower(params.Search)
		filtered := make([]exampack.ExamPack, 0)
		for _, p := range packs {
			if strings.Contains(strings.ToLower(p.Title), lowerSearch) ||
				strings.Contains(strings.ToLower(p.Description), lowerSearch) ||
				strings.Contains(strings.ToLower(p.Category), lowerSearch) {
				filtered = append(filtered, p)
			}
		}
		packs = filtered
	}
	if params.Category != "" && params.Category != "All" {
		lowerCat := strings.ToLower(params.Category)
		filtered := make([]exampack.ExamPack, 0)
		for _, p := range packs {
			if strings.ToLower(p.Category) == lowerCat {
				filtered = append(filtered, p)
			}
		}
		packs = filtered
	}

	resp := pagination.PaginateSlice(packs, params)
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(resp)
}

func (h *ExamPackHandler) GetExamPack(w http.ResponseWriter, r *http.Request, id int) {
	userID, _ := middleware.GetUserIDFromContext(r.Context())
	pack, err := h.packService.GetExamPack(userID, id)
	if err != nil {
		switch err {
		case service.ErrExamPackNotFound:
			http.Error(w, `{"error": "Exam Pack not found"}`, http.StatusNotFound)
		case service.ErrForbidden:
			http.Error(w, `{"error": "You do not have access to this exam pack"}`, http.StatusForbidden)
		default:
			http.Error(w, fmt.Sprintf(`{"error": "%v"}`, err), http.StatusInternalServerError)
		}
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

	userID, _ := middleware.GetUserIDFromContext(r.Context())
	if err := h.packService.CreateExamPack(userID, &pack); err != nil {
		if strings.Contains(err.Error(), "exam pack creation limit reached") {
			http.Error(w, fmt.Sprintf(`{"error": "%v"}`, err), http.StatusForbidden)
			return
		}
		if err == service.ErrForbidden {
			http.Error(w, fmt.Sprintf(`{"error": "%v"}`, err), http.StatusForbidden)
			return
		}
		http.Error(w, fmt.Sprintf(`{"error": "Failed to create exam pack: %v"}`, err), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(pack)
}

func (h *ExamPackHandler) UpdateExamPack(w http.ResponseWriter, r *http.Request, id int) {
	userID, _ := middleware.GetUserIDFromContext(r.Context())
	pack, err := h.packService.GetExamPack(userID, id)
	if err != nil || pack == nil {
		if err == service.ErrForbidden {
			http.Error(w, `{"error": "You do not have access to this exam pack"}`, http.StatusForbidden)
			return
		}
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

	if err := h.packService.UpdateExamPack(userID, pack); err != nil {
		if err == service.ErrForbidden {
			http.Error(w, fmt.Sprintf(`{"error": "%v"}`, err), http.StatusForbidden)
			return
		}
		http.Error(w, fmt.Sprintf(`{"error": "Failed to update exam pack: %v"}`, err), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(pack)
}

func (h *ExamPackHandler) DeleteExamPack(w http.ResponseWriter, r *http.Request, id int) {
	userID, _ := middleware.GetUserIDFromContext(r.Context())
	if err := h.packService.DeleteExamPack(userID, id); err != nil {
		switch err {
		case service.ErrExamPackNotFound:
			http.Error(w, `{"error": "Exam Pack not found"}`, http.StatusNotFound)
		case service.ErrForbidden:
			http.Error(w, fmt.Sprintf(`{"error": "%v"}`, err), http.StatusForbidden)
		default:
			http.Error(w, fmt.Sprintf(`{"error": "Failed to delete: %v"}`, err), http.StatusInternalServerError)
		}
		return
	}
	w.WriteHeader(http.StatusNoContent)
}

func (h *ExamPackHandler) ListExams(w http.ResponseWriter, r *http.Request, packID int) {
	userID, _ := middleware.GetUserIDFromContext(r.Context())
	userRole := middleware.GetUserRoleFromContext(r.Context())
	if userRole == "" && userID > 0 {
		userRole, _ = h.packService.RoleOf(userID)
	}
	userRole = strings.ToLower(userRole)

	q := r.URL.Query()
	isManage := q.Get("manage") == "true" || q.Get("manage") == "1" || strings.Contains(r.Header.Get("Referer"), "manage-exam-pack")

	if isManage {
		if userRole == "student" {
			params := pagination.Parse(r)
			resp := pagination.PaginateSlice([]exam.Exam{}, params)
			w.Header().Set("Content-Type", "application/json")
			json.NewEncoder(w).Encode(resp)
			return
		}
		if userRole == "teacher" {
			pack, err := h.packService.GetExamPack(userID, packID)
			if err != nil {
				http.Error(w, `{"error": "Exam Pack not found"}`, http.StatusNotFound)
				return
			}
			if pack.CreatedBy == nil || *pack.CreatedBy != userID {
				http.Error(w, `{"error": "You do not have access to this exam pack"}`, http.StatusForbidden)
				return
			}
		}
	}

	exams, err := h.examService.ListExamsByPack(userID, packID)
	if err != nil {
		switch err {
		case service.ErrExamPackNotFound:
			http.Error(w, `{"error": "Exam Pack not found"}`, http.StatusNotFound)
		case service.ErrForbidden:
			http.Error(w, `{"error": "You do not have access to this exam pack"}`, http.StatusForbidden)
		default:
			http.Error(w, fmt.Sprintf(`{"error": "%v"}`, err), http.StatusInternalServerError)
		}
		return
	}

	params := pagination.Parse(r)
	if params.Search != "" {
		lowerSearch := strings.ToLower(params.Search)
		filtered := make([]exam.Exam, 0)
		for _, e := range exams {
			if strings.Contains(strings.ToLower(e.Name), lowerSearch) ||
				strings.Contains(strings.ToLower(e.Level), lowerSearch) ||
				strings.Contains(strings.ToLower(e.Batch), lowerSearch) {
				filtered = append(filtered, e)
			}
		}
		exams = filtered
	}

	resp := pagination.PaginateSlice(exams, params)
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(resp)
}

func (h *ExamPackHandler) CreateExam(w http.ResponseWriter, r *http.Request, packID int) {
	var input service.CreateExamInput
	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		http.Error(w, `{"error": "Invalid request body"}`, http.StatusBadRequest)
		return
	}

	userID, _ := middleware.GetUserIDFromContext(r.Context())

	created, err := h.examService.CreateExam(packID, input, userID)
	if err != nil {
		if strings.Contains(err.Error(), "exam creation limit reached") {
			http.Error(w, fmt.Sprintf(`{"error": "%v"}`, err.Error()), http.StatusForbidden)
			return
		}
		switch err {
		case service.ErrExamNameRequired, service.ErrInvalidStartDate, service.ErrInvalidEndDate, service.ErrEndDateBeforeStart, service.ErrPasscodeRequired, service.ErrInvalidDuration, service.ErrInvalidPassMark, service.ErrInvalidPerQMark, service.ErrInvalidNegativeMark:
			http.Error(w, fmt.Sprintf(`{"error": "%v"}`, err), http.StatusBadRequest)
		case service.ErrForbidden:
			http.Error(w, fmt.Sprintf(`{"error": "%v"}`, err), http.StatusForbidden)
		case service.ErrExamPackNotFound:
			http.Error(w, `{"error": "Exam Pack not found"}`, http.StatusNotFound)
		default:
			http.Error(w, fmt.Sprintf(`{"error": "Failed to create exam: %v"}`, err), http.StatusInternalServerError)
		}
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(created)
}
