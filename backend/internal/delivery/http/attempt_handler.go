package http

import (
	"encoding/json"
	"fmt"
	"net/http"
	"strconv"
	"strings"

	"github.com/selftest/backend/internal/service"
	"github.com/selftest/backend/middleware"
)

type AttemptHandler struct {
	attemptService *service.AttemptService
}

func NewAttemptHandler(attemptService *service.AttemptService) *AttemptHandler {
	return &AttemptHandler{attemptService: attemptService}
}

func (h *AttemptHandler) HandleAttempts(w http.ResponseWriter, r *http.Request) {
	path := r.URL.Path

	if path == "/api/attempts" || path == "/api/attempts/" {
		if r.Method == http.MethodGet {
			h.GetUserAttempts(w, r)
		} else {
			http.Error(w, `{"error": "Method not allowed"}`, http.StatusMethodNotAllowed)
		}
		return
	}

	rest := strings.Trim(strings.TrimPrefix(path, "/api/attempts/"), "/")
	segments := strings.Split(rest, "/")
	id, err := strconv.Atoi(segments[0])
	if err != nil {
		http.Error(w, `{"error": "Invalid ID parameter"}`, http.StatusBadRequest)
		return
	}

	if len(segments) == 2 && segments[1] == "questions" {
		if r.Method == http.MethodGet {
			h.GetAttemptQuestions(w, r, id)
		} else {
			http.Error(w, `{"error": "Method not allowed"}`, http.StatusMethodNotAllowed)
		}
		return
	}

	if len(segments) == 1 {
		if r.Method == http.MethodGet {
			h.GetAttemptDetails(w, r, id)
		} else {
			http.Error(w, `{"error": "Method not allowed"}`, http.StatusMethodNotAllowed)
		}
		return
	}

	http.Error(w, `{"error": "Page not found"}`, http.StatusNotFound)
}

func (h *AttemptHandler) GetUserAttempts(w http.ResponseWriter, r *http.Request) {
	userID, err := middleware.GetUserIDFromContext(r.Context())
	if err != nil {
		http.Error(w, `{"error": "Unauthorized context"}`, http.StatusUnauthorized)
		return
	}

	results, err := h.attemptService.GetUserAttempts(userID)
	if err != nil {
		http.Error(w, fmt.Sprintf(`{"error": "Failed to fetch attempts: %v"}`, err), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(results)
}

func (h *AttemptHandler) GetAttemptDetails(w http.ResponseWriter, r *http.Request, id int) {
	userID, err := middleware.GetUserIDFromContext(r.Context())
	if err != nil {
		http.Error(w, `{"error": "Unauthorized"}`, http.StatusUnauthorized)
		return
	}

	res, err := h.attemptService.GetAttemptDetails(userID, id)
	if err != nil {
		switch err {
		case service.ErrAttemptNotFound:
			http.Error(w, `{"error": "Attempt not found"}`, http.StatusNotFound)
		case service.ErrForbidden:
			http.Error(w, `{"error": "You do not have access to this attempt"}`, http.StatusForbidden)
		default:
			http.Error(w, fmt.Sprintf(`{"error": "Failed to fetch attempt: %v"}`, err), http.StatusInternalServerError)
		}
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(res)
}

func (h *AttemptHandler) GetAttemptQuestions(w http.ResponseWriter, r *http.Request, id int) {
	userID, err := middleware.GetUserIDFromContext(r.Context())
	if err != nil {
		http.Error(w, `{"error": "Unauthorized"}`, http.StatusUnauthorized)
		return
	}

	questions, err := h.attemptService.GetAttemptQuestions(userID, id)
	if err != nil {
		switch err {
		case service.ErrAttemptNotFound:
			http.Error(w, `{"error": "Attempt not found"}`, http.StatusNotFound)
		case service.ErrForbidden:
			http.Error(w, `{"error": "You do not have access to this attempt"}`, http.StatusForbidden)
		default:
			http.Error(w, fmt.Sprintf(`{"error": "Failed to fetch attempt questions: %v"}`, err), http.StatusInternalServerError)
		}
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(questions)
}
