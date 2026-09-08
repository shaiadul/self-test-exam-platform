package http

import (
	"encoding/json"
	"fmt"
	"net/http"
	"strconv"
	"strings"

	"github.com/selftest/backend/internal/domain/system"
	"github.com/selftest/backend/internal/service"
)

type SystemHandler struct {
	systemService *service.SystemService
}

func NewSystemHandler(systemService *service.SystemService) *SystemHandler {
	return &SystemHandler{systemService: systemService}
}

func (h *SystemHandler) HandlePermissions(w http.ResponseWriter, r *http.Request) {
	path := r.URL.Path

	if path == "/api/admin/permissions" || path == "/api/admin/permissions/" {
		if r.Method == http.MethodGet {
			perms, err := h.systemService.GetPermissions()
			if err != nil {
				http.Error(w, fmt.Sprintf(`{"error": "Failed to fetch permissions: %v"}`, err), http.StatusInternalServerError)
				return
			}
			w.Header().Set("Content-Type", "application/json")
			json.NewEncoder(w).Encode(perms)
		} else {
			http.Error(w, `{"error": "Method not allowed"}`, http.StatusMethodNotAllowed)
		}
		return
	}

	idStr := strings.TrimPrefix(path, "/api/admin/permissions/")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		http.Error(w, `{"error": "Invalid ID parameter"}`, http.StatusBadRequest)
		return
	}

	if r.Method == http.MethodPut {
		var req struct {
			Access string `json:"access"`
		}
		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			http.Error(w, `{"error": "Invalid request body"}`, http.StatusBadRequest)
			return
		}
		if err := h.systemService.UpdatePermission(id, req.Access); err != nil {
			http.Error(w, fmt.Sprintf(`{"error": "Failed to update permission: %v"}`, err), http.StatusInternalServerError)
			return
		}
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusOK)
		w.Write([]byte(`{"success": true}`))
	} else {
		http.Error(w, `{"error": "Method not allowed"}`, http.StatusMethodNotAllowed)
	}
}

func (h *SystemHandler) HandleSystemAssets(w http.ResponseWriter, r *http.Request) {
	path := r.URL.Path

	if path == "/api/assets" || path == "/api/assets/" {
		switch r.Method {
		case http.MethodGet:
			filterType := r.URL.Query().Get("type")
			assets, err := h.systemService.GetSystemAssets(filterType)
			if err != nil {
				http.Error(w, fmt.Sprintf(`{"error": "%v"}`, err), http.StatusInternalServerError)
				return
			}
			w.Header().Set("Content-Type", "application/json")
			json.NewEncoder(w).Encode(assets)

		case http.MethodPost:
			var req system.SystemAsset
			if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
				http.Error(w, `{"error": "Invalid request body"}`, http.StatusBadRequest)
				return
			}
			if err := h.systemService.CreateSystemAsset(&req); err != nil {
				if err == service.ErrAssetTypeAndValueReq {
					http.Error(w, `{"error": "Type and Value are required"}`, http.StatusBadRequest)
					return
				}
				http.Error(w, fmt.Sprintf(`{"error": "%v"}`, err), http.StatusInternalServerError)
				return
			}
			w.Header().Set("Content-Type", "application/json")
			w.WriteHeader(http.StatusCreated)
			json.NewEncoder(w).Encode(req)

		default:
			http.Error(w, `{"error": "Method not allowed"}`, http.StatusMethodNotAllowed)
		}
		return
	}

	idStr := strings.TrimPrefix(path, "/api/assets/")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		http.Error(w, `{"error": "Invalid ID parameter"}`, http.StatusBadRequest)
		return
	}

	if r.Method == http.MethodDelete {
		if err := h.systemService.DeleteSystemAsset(id); err != nil {
			http.Error(w, fmt.Sprintf(`{"error": "%v"}`, err), http.StatusInternalServerError)
			return
		}
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusOK)
		w.Write([]byte(`{"success": true}`))
	} else {
		http.Error(w, `{"error": "Method not allowed"}`, http.StatusMethodNotAllowed)
	}
}

func (h *SystemHandler) HandleTransactions(w http.ResponseWriter, r *http.Request) {
	path := r.URL.Path

	if path == "/api/transactions/summary" || path == "/api/transactions/summary/" {
		if r.Method == http.MethodGet {
			summary, err := h.systemService.GetFinancialSummary()
			if err != nil {
				http.Error(w, fmt.Sprintf(`{"error": "%v"}`, err), http.StatusInternalServerError)
				return
			}
			w.Header().Set("Content-Type", "application/json")
			json.NewEncoder(w).Encode(summary)
		} else {
			http.Error(w, `{"error": "Method not allowed"}`, http.StatusMethodNotAllowed)
		}
		return
	}

	if path == "/api/transactions" || path == "/api/transactions/" {
		switch r.Method {
		case http.MethodGet:
			txs, err := h.systemService.GetTransactions()
			if err != nil {
				http.Error(w, fmt.Sprintf(`{"error": "%v"}`, err), http.StatusInternalServerError)
				return
			}
			w.Header().Set("Content-Type", "application/json")
			json.NewEncoder(w).Encode(txs)

		case http.MethodPost:
			var req system.Transaction
			if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
				http.Error(w, `{"error": "Invalid request body"}`, http.StatusBadRequest)
				return
			}
			if err := h.systemService.CreateTransaction(&req); err != nil {
				if err == service.ErrTransactionRequired {
					http.Error(w, `{"error": "Type, positive Amount, and Description are required"}`, http.StatusBadRequest)
					return
				}
				http.Error(w, fmt.Sprintf(`{"error": "%v"}`, err), http.StatusInternalServerError)
				return
			}
			w.Header().Set("Content-Type", "application/json")
			w.WriteHeader(http.StatusCreated)
			json.NewEncoder(w).Encode(req)

		default:
			http.Error(w, `{"error": "Method not allowed"}`, http.StatusMethodNotAllowed)
		}
		return
	}

	http.Error(w, `{"error": "Page not found"}`, http.StatusNotFound)
}
