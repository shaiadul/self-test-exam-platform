package http

import (
	"encoding/json"
	"fmt"
	"net/http"
	"strconv"
	"strings"

	"github.com/selftest/backend/internal/domain/user"
	"github.com/selftest/backend/internal/service"
	"github.com/selftest/backend/middleware"
)

type AuthHandler struct {
	userService *service.UserService
}

func NewAuthHandler(userService *service.UserService) *AuthHandler {
	return &AuthHandler{userService: userService}
}

func (h *AuthHandler) Register(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, `{"error": "Method not allowed"}`, http.StatusMethodNotAllowed)
		return
	}

	var req user.RegisterRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, `{"error": "Invalid request body"}`, http.StatusBadRequest)
		return
	}

	res, err := h.userService.Register(req)
	if err != nil {
		switch err {
		case service.ErrMissingFields:
			http.Error(w, `{"error": "Name, email, and password are required"}`, http.StatusBadRequest)
		case service.ErrEmailExists:
			http.Error(w, `{"error": "Email is already registered"}`, http.StatusConflict)
		default:
			http.Error(w, fmt.Sprintf(`{"error": "%v"}`, err), http.StatusInternalServerError)
		}
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(res)
}

func (h *AuthHandler) Login(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, `{"error": "Method not allowed"}`, http.StatusMethodNotAllowed)
		return
	}

	var req user.LoginRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, `{"error": "Invalid request body"}`, http.StatusBadRequest)
		return
	}

	res, err := h.userService.Login(req)
	if err != nil {
		if err == service.ErrInvalidCreds {
			http.Error(w, `{"error": "Invalid email or password"}`, http.StatusUnauthorized)
			return
		}
		http.Error(w, fmt.Sprintf(`{"error": "%v"}`, err), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(res)
}

func (h *AuthHandler) GetProfile(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, `{"error": "Method not allowed"}`, http.StatusMethodNotAllowed)
		return
	}

	userID, err := middleware.GetUserIDFromContext(r.Context())
	if err != nil {
		http.Error(w, `{"error": "Unauthorized context"}`, http.StatusUnauthorized)
		return
	}

	u, err := h.userService.GetProfile(userID)
	if err != nil {
		if err == service.ErrUserNotFound {
			http.Error(w, `{"error": "User not found"}`, http.StatusNotFound)
			return
		}
		http.Error(w, fmt.Sprintf(`{"error": "%v"}`, err), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(u)
}

func (h *AuthHandler) CompleteProfile(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost && r.Method != http.MethodPut {
		http.Error(w, `{"error": "Method not allowed"}`, http.StatusMethodNotAllowed)
		return
	}

	userID, err := middleware.GetUserIDFromContext(r.Context())
	if err != nil {
		http.Error(w, `{"error": "Unauthorized context"}`, http.StatusUnauthorized)
		return
	}

	var req user.CompleteProfileRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, `{"error": "Invalid request body"}`, http.StatusBadRequest)
		return
	}

	u, err := h.userService.CompleteProfile(userID, req)
	if err != nil {
		if err == service.ErrUserNotFound {
			http.Error(w, `{"error": "User not found"}`, http.StatusNotFound)
			return
		}
		http.Error(w, fmt.Sprintf(`{"error": "%v"}`, err), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(u)
}

func (h *AuthHandler) HandleAdminUsers(w http.ResponseWriter, r *http.Request) {
	path := r.URL.Path
	if path == "/api/admin/users" || path == "/api/admin/users/" {
		if r.Method == http.MethodGet {
			users, err := h.userService.ListUsers()
			if err != nil {
				http.Error(w, fmt.Sprintf(`{"error": "Failed to fetch users: %v"}`, err), http.StatusInternalServerError)
				return
			}
			w.Header().Set("Content-Type", "application/json")
			json.NewEncoder(w).Encode(users)
		} else {
			http.Error(w, `{"error": "Method not allowed"}`, http.StatusMethodNotAllowed)
		}
		return
	}

	idStr := strings.TrimPrefix(path, "/api/admin/users/")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		http.Error(w, `{"error": "Invalid ID parameter"}`, http.StatusBadRequest)
		return
	}

	switch r.Method {
	case http.MethodPut:
		var req struct {
			Role string `json:"role"`
		}
		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			http.Error(w, `{"error": "Invalid request body"}`, http.StatusBadRequest)
			return
		}
		if err := h.userService.UpdateUserRole(id, req.Role); err != nil {
			http.Error(w, fmt.Sprintf(`{"error": "Failed to update user role: %v"}`, err), http.StatusInternalServerError)
			return
		}
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusOK)
		w.Write([]byte(`{"success": true}`))

	case http.MethodDelete:
		if err := h.userService.DeleteUser(id); err != nil {
			http.Error(w, fmt.Sprintf(`{"error": "Failed to delete user: %v"}`, err), http.StatusInternalServerError)
			return
		}
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusOK)
		w.Write([]byte(`{"success": true}`))

	default:
		http.Error(w, `{"error": "Method not allowed"}`, http.StatusMethodNotAllowed)
	}
}
