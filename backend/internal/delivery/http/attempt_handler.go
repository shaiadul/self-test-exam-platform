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

	idStr := strings.TrimPrefix(path, "/api/attempts/")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		http.Error(w, `{"error": "Invalid ID parameter"}`, http.StatusBadRequest)
		return
	}

	if r.Method == http.MethodGet {
		h.GetAttemptDetails(w, r, id)
	} else {
		http.Error(w, `{"error": "Method not allowed"}`, http.StatusMethodNotAllowed)
	}
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
	res, err := h.attemptService.GetAttemptDetails(id)
	if err != nil {
		if err == service.ErrAttemptNotFound {
			http.Error(w, `{"error": "Attempt not found"}`, http.StatusNotFound)
			return
		}
		http.Error(w, fmt.Sprintf(`{"error": "Failed to fetch attempt: %v"}`, err), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(res)
}
