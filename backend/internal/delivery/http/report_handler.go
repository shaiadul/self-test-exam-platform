package http

import (
	"encoding/json"
	"fmt"
	"net/http"
	"strings"

	"github.com/selftest/backend/internal/service"
	"github.com/selftest/backend/middleware"
)

type ReportHandler struct {
	reportService *service.ReportService
}

func NewReportHandler(reportService *service.ReportService) *ReportHandler {
	return &ReportHandler{reportService: reportService}
}

func (h *ReportHandler) GetDashboardStats(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, `{"error": "Method not allowed"}`, http.StatusMethodNotAllowed)
		return
	}

	userID, err := middleware.GetUserIDFromContext(r.Context())
	if err != nil {
		http.Error(w, `{"error": "Unauthorized context"}`, http.StatusUnauthorized)
		return
	}

	stats, err := h.reportService.GetDashboardStats(userID)
	if err != nil {
		if err == service.ErrUserNotFound {
			http.Error(w, `{"error": "User not found"}`, http.StatusNotFound)
			return
		}
		if err == service.ErrUnknownRole {
			http.Error(w, `{"error": "Unknown user role"}`, http.StatusBadRequest)
			return
		}
		http.Error(w, fmt.Sprintf(`{"error": "%v"}`, err), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(stats)
}

func (h *ReportHandler) HandleTeacherReports(w http.ResponseWriter, r *http.Request) {
	path := r.URL.Path

	if path == "/api/teacher/reports" || path == "/api/teacher/reports/" {
		if r.Method == http.MethodGet {
			h.GetTeacherReports(w, r)
		} else {
			http.Error(w, `{"error": "Method not allowed"}`, http.StatusMethodNotAllowed)
		}
		return
	}

	examID := strings.TrimPrefix(path, "/api/teacher/reports/")
	if examID == "" {
		http.Error(w, `{"error": "Invalid Exam ID"}`, http.StatusBadRequest)
		return
	}

	if r.Method == http.MethodGet {
		h.GetTeacherReportDetails(w, r, examID)
	} else {
		http.Error(w, `{"error": "Method not allowed"}`, http.StatusMethodNotAllowed)
	}
}

func (h *ReportHandler) GetTeacherReports(w http.ResponseWriter, r *http.Request) {
	reports, err := h.reportService.GetTeacherReports()
	if err != nil {
		http.Error(w, fmt.Sprintf(`{"error": "%v"}`, err), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(reports)
}

func (h *ReportHandler) GetTeacherReportDetails(w http.ResponseWriter, r *http.Request, examID string) {
	detail, err := h.reportService.GetTeacherReportDetails(examID)
	if err != nil {
		if err == service.ErrExamNotFound {
			http.Error(w, `{"error": "Exam not found"}`, http.StatusNotFound)
			return
		}
		http.Error(w, fmt.Sprintf(`{"error": "%v"}`, err), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(detail)
}

func (h *ReportHandler) GetExamAnalysisStats(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, `{"error": "Method not allowed"}`, http.StatusMethodNotAllowed)
		return
	}

	stats, err := h.reportService.GetExamAnalysisStats()
	if err != nil {
		http.Error(w, fmt.Sprintf(`{"error": "%v"}`, err), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(stats)
}
