package http

import (
	"encoding/json"
	"fmt"
	"net/http"
	"strings"

	"github.com/selftest/backend/internal/service"
	"github.com/selftest/backend/middleware"
)

type AdminToolsHandler struct {
	toolsService *service.AdminToolsService
}

func NewAdminToolsHandler(toolsService *service.AdminToolsService) *AdminToolsHandler {
	return &AdminToolsHandler{toolsService: toolsService}
}

func (h *AdminToolsHandler) HandleTools(w http.ResponseWriter, r *http.Request) {
	path := r.URL.Path

	userID, err := middleware.GetUserIDFromContext(r.Context())
	if err != nil {
		http.Error(w, `{"error": "Unauthorized"}`, http.StatusUnauthorized)
		return
	}

	if err := h.toolsService.VerifyAdmin(userID); err != nil {
		http.Error(w, `{"error": "Forbidden: Admin privileges required"}`, http.StatusForbidden)
		return
	}

	switch {
	case path == "/api/admin/tools/overview" || path == "/api/admin/tools/overview/":
		if r.Method != http.MethodGet {
			http.Error(w, `{"error": "Method not allowed"}`, http.StatusMethodNotAllowed)
			return
		}
		h.GetOverview(w, r)

	case path == "/api/admin/tools/cache/clear" || path == "/api/admin/tools/cache/clear/":
		if r.Method != http.MethodPost {
			http.Error(w, `{"error": "Method not allowed"}`, http.StatusMethodNotAllowed)
			return
		}
		h.ClearCache(w, r)

	case path == "/api/admin/tools/requests/clear" || path == "/api/admin/tools/requests/clear/":
		if r.Method != http.MethodPost {
			http.Error(w, `{"error": "Method not allowed"}`, http.StatusMethodNotAllowed)
			return
		}
		h.ClearRequests(w, r)

	default:
		http.Error(w, `{"error": "Endpoint not found"}`, http.StatusNotFound)
	}
}

func (h *AdminToolsHandler) GetOverview(w http.ResponseWriter, r *http.Request) {
	overview, err := h.toolsService.GetOverview(r.Context())
	if err != nil {
		http.Error(w, fmt.Sprintf(`{"error": "%v"}`, err), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(overview)
}

func (h *AdminToolsHandler) ClearCache(w http.ResponseWriter, r *http.Request) {
	if err := h.toolsService.ClearCache(r.Context()); err != nil {
		http.Error(w, fmt.Sprintf(`{"error": "Failed to clear cache: %v"}`, err), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"success": true,
		"message": "Backend cache flushed and invalidated successfully.",
	})
}

func (h *AdminToolsHandler) ClearRequests(w http.ResponseWriter, r *http.Request) {
	var body struct {
		Target string `json:"target"` // "all", "quota", "institution"
		Scope  string `json:"scope"`  // "all", "resolved", "pending"
	}

	if r.Body != nil && r.ContentLength > 0 {
		_ = json.NewDecoder(r.Body).Decode(&body)
	}

	target := strings.TrimSpace(body.Target)
	if target == "" {
		target = "quota"
	}

	scope := strings.TrimSpace(body.Scope)
	if scope == "" {
		scope = "all"
	}

	result, err := h.toolsService.ClearRequestApprovalData(r.Context(), target, scope)
	if err != nil {
		http.Error(w, fmt.Sprintf(`{"error": "%v"}`, err), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(result)
}
