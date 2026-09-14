package http

import (
	"encoding/json"
	"fmt"
	"net/http"
	"strconv"
	"strings"

	"github.com/selftest/backend/internal/domain/examrequest"
	"github.com/selftest/backend/internal/service"
	"github.com/selftest/backend/middleware"
)

type ExamRequestHandler struct {
	requestService *service.ExamRequestService
}

func NewExamRequestHandler(requestService *service.ExamRequestService) *ExamRequestHandler {
	return &ExamRequestHandler{requestService: requestService}
}

func (h *ExamRequestHandler) HandleRequests(w http.ResponseWriter, r *http.Request) {
	path := r.URL.Path

	if path == "/api/requests" || path == "/api/requests/" {
		switch r.Method {
		case http.MethodGet:
			h.List(w, r)
		case http.MethodPost:
			h.Create(w, r)
		default:
			http.Error(w, `{"error": "Method not allowed"}`, http.StatusMethodNotAllowed)
		}
		return
	}

	trimmed := strings.TrimPrefix(path, "/api/requests/")
	parts := strings.Split(trimmed, "/")
	if len(parts) == 1 && parts[0] != "" {
		id, err := strconv.Atoi(parts[0])
		if err != nil {
			http.Error(w, `{"error": "Invalid request ID"}`, http.StatusBadRequest)
			return
		}
		if r.Method == http.MethodPut {
			h.Review(w, r, id)
		} else {
			http.Error(w, `{"error": "Method not allowed"}`, http.StatusMethodNotAllowed)
		}
		return
	}

	http.Error(w, `{"error": "Page not found"}`, http.StatusNotFound)
}

func (h *ExamRequestHandler) List(w http.ResponseWriter, r *http.Request) {
	userID, err := middleware.GetUserIDFromContext(r.Context())
	if err != nil {
		http.Error(w, `{"error": "Unauthorized"}`, http.StatusUnauthorized)
		return
	}

	requests, err := h.requestService.List(userID)
	if err != nil {
		http.Error(w, fmt.Sprintf(`{"error": "%v"}`, err), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(requests)
}

func (h *ExamRequestHandler) Create(w http.ResponseWriter, r *http.Request) {
	userID, err := middleware.GetUserIDFromContext(r.Context())
	if err != nil {
		http.Error(w, `{"error": "Unauthorized"}`, http.StatusUnauthorized)
		return
	}

	var req examrequest.ExamRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, `{"error": "Invalid request body"}`, http.StatusBadRequest)
		return
	}

	created, err := h.requestService.Create(userID, req)
	if err != nil {
		switch err {
		case service.ErrInvalidRequest:
			http.Error(w, fmt.Sprintf(`{"error": "%v"}`, err), http.StatusBadRequest)
		case service.ErrForbidden:
			http.Error(w, fmt.Sprintf(`{"error": "%v"}`, err), http.StatusForbidden)
		case service.ErrExamPackNotFound:
			http.Error(w, `{"error": "Exam pack not found"}`, http.StatusNotFound)
		default:
			http.Error(w, fmt.Sprintf(`{"error": "Failed to submit request: %v"}`, err), http.StatusInternalServerError)
		}
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(created)
}

func (h *ExamRequestHandler) Review(w http.ResponseWriter, r *http.Request, id int) {
	userID, err := middleware.GetUserIDFromContext(r.Context())
	if err != nil {
		http.Error(w, `{"error": "Unauthorized"}`, http.StatusUnauthorized)
		return
	}

	var body struct {
		Status    string  `json:"status"`
		AdminNote *string `json:"adminNote"`
	}
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
		http.Error(w, `{"error": "Invalid request body"}`, http.StatusBadRequest)
		return
	}

	updated, err := h.requestService.Review(userID, id, body.Status, body.AdminNote)
	if err != nil {
		switch err {
		case service.ErrRequestNotFound:
			http.Error(w, `{"error": "Request not found"}`, http.StatusNotFound)
		case service.ErrRequestHandled:
			http.Error(w, fmt.Sprintf(`{"error": "%v"}`, err), http.StatusConflict)
		case service.ErrInvalidRequest:
			http.Error(w, fmt.Sprintf(`{"error": "%v"}`, err), http.StatusBadRequest)
		case service.ErrForbidden:
			http.Error(w, fmt.Sprintf(`{"error": "%v"}`, err), http.StatusForbidden)
		default:
			http.Error(w, fmt.Sprintf(`{"error": "Failed to review request: %v"}`, err), http.StatusInternalServerError)
		}
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(updated)
}
