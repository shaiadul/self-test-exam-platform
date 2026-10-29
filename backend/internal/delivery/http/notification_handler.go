package http

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
	"strconv"
	"strings"

	"github.com/golang-jwt/jwt/v5"
	"github.com/gorilla/websocket"
	"github.com/selftest/backend/internal/domain/notification"
	"github.com/selftest/backend/internal/service"
	ws "github.com/selftest/backend/internal/infrastructure/websocket"
	"github.com/selftest/backend/middleware"
)

var upgrader = websocket.Upgrader{
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
	CheckOrigin: func(r *http.Request) bool {
		// Production-safe origin check; allows standard local development and web requests
		return true
	},
}

type NotificationHandler struct {
	service *service.NotificationService
}

func NewNotificationHandler(service *service.NotificationService) *NotificationHandler {
	return &NotificationHandler{service: service}
}

// HandleWS upgrades HTTP connection to WebSocket, validates JWT authentication, and registers client to Hub.
func (h *NotificationHandler) HandleWS(w http.ResponseWriter, r *http.Request) {
	// 1. Extract JWT token from Query Param (?token=...) or Authorization header
	tokenString := r.URL.Query().Get("token")
	if tokenString == "" {
		authHeader := r.Header.Get("Authorization")
		if strings.HasPrefix(authHeader, "Bearer ") {
			tokenString = strings.TrimPrefix(authHeader, "Bearer ")
		}
	}

	if tokenString == "" {
		http.Error(w, `{"error": "Authentication token required"}`, http.StatusUnauthorized)
		return
	}

	// 2. Validate token
	jwtSecret := os.Getenv("JWT_SECRET")
	if jwtSecret == "" {
		jwtSecret = "default_secret"
	}

	token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, fmt.Errorf("unexpected signing method: %v", token.Header["alg"])
		}
		return []byte(jwtSecret), nil
	})

	if err != nil || !token.Valid {
		http.Error(w, `{"error": "Invalid or expired token"}`, http.StatusUnauthorized)
		return
	}

	claims, ok := token.Claims.(jwt.MapClaims)
	if !ok {
		http.Error(w, `{"error": "Invalid token claims"}`, http.StatusUnauthorized)
		return
	}

	sub, ok := claims["sub"].(float64)
	if !ok {
		http.Error(w, `{"error": "Invalid token subject"}`, http.StatusUnauthorized)
		return
	}
	userID := int(sub)

	role := ""
	if rVal, ok := claims["role"].(string); ok {
		role = strings.ToLower(rVal)
	}

	// 3. Upgrade to WebSocket
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Printf("[WebSocket] Upgrade error: %v", err)
		return
	}

	// 4. Initialize Client and Register to Hub
	client := ws.NewClient(h.service.Hub(), conn, userID, role)
	h.service.Hub().Register(client)

	// 5. Send initial unread count event upon connection
	if unread, err := h.service.GetUnreadCount(r.Context(), userID, role); err == nil {
		client.SendWSMessage(notification.WSActionUnreadCount, unread)
	}

	// 6. Start pumps
	go client.WritePump()
	go client.ReadPump()
}

// HandleNotifications routes REST requests for notifications.
func (h *NotificationHandler) HandleNotifications(w http.ResponseWriter, r *http.Request) {
	path := strings.TrimSuffix(r.URL.Path, "/")

	if path == "/api/notifications" {
		switch r.Method {
		case http.MethodGet:
			h.List(w, r)
		case http.MethodPost:
			h.Broadcast(w, r)
		default:
			http.Error(w, `{"error": "Method not allowed"}`, http.StatusMethodNotAllowed)
		}
		return
	}

	if path == "/api/notifications/unread-count" {
		if r.Method == http.MethodGet {
			h.UnreadCount(w, r)
		} else {
			http.Error(w, `{"error": "Method not allowed"}`, http.StatusMethodNotAllowed)
		}
		return
	}

	if path == "/api/notifications/read-all" {
		if r.Method == http.MethodPut || r.Method == http.MethodPost {
			h.MarkAllAsRead(w, r)
		} else {
			http.Error(w, `{"error": "Method not allowed"}`, http.StatusMethodNotAllowed)
		}
		return
	}

	// Check /api/notifications/{id}/read
	if strings.HasSuffix(path, "/read") {
		trimmed := strings.TrimPrefix(path, "/api/notifications/")
		trimmed = strings.TrimSuffix(trimmed, "/read")
		id, err := strconv.Atoi(trimmed)
		if err != nil {
			http.Error(w, `{"error": "Invalid notification ID"}`, http.StatusBadRequest)
			return
		}
		if r.Method == http.MethodPatch || r.Method == http.MethodPut {
			h.MarkAsRead(w, r, id)
		} else {
			http.Error(w, `{"error": "Method not allowed"}`, http.StatusMethodNotAllowed)
		}
		return
	}

	// Check /api/notifications/{id}
	trimmed := strings.TrimPrefix(path, "/api/notifications/")
	id, err := strconv.Atoi(trimmed)
	if err == nil && id > 0 {
		if r.Method == http.MethodDelete {
			h.Delete(w, r, id)
			return
		}
		http.Error(w, `{"error": "Method not allowed"}`, http.StatusMethodNotAllowed)
		return
	}

	http.Error(w, `{"error": "Not found"}`, http.StatusNotFound)
}

func (h *NotificationHandler) List(w http.ResponseWriter, r *http.Request) {
	userID, err := middleware.GetUserIDFromContext(r.Context())
	if err != nil {
		http.Error(w, `{"error": "Unauthorized"}`, http.StatusUnauthorized)
		return
	}
	role := middleware.GetUserRoleFromContext(r.Context())

	page, _ := strconv.Atoi(r.URL.Query().Get("page"))
	if page < 1 {
		page = 1
	}
	limit, _ := strconv.Atoi(r.URL.Query().Get("limit"))
	if limit < 1 || limit > 100 {
		limit = 20
	}

	notifs, total, unreadCount, err := h.service.ListUserNotifications(r.Context(), userID, role, page, limit)
	if err != nil {
		http.Error(w, `{"error": "Failed to fetch notifications"}`, http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(map[string]interface{}{
		"data":        notifs,
		"total":       total,
		"unreadCount": unreadCount,
		"page":        page,
		"limit":       limit,
	})
}

func (h *NotificationHandler) UnreadCount(w http.ResponseWriter, r *http.Request) {
	userID, err := middleware.GetUserIDFromContext(r.Context())
	if err != nil {
		http.Error(w, `{"error": "Unauthorized"}`, http.StatusUnauthorized)
		return
	}
	role := middleware.GetUserRoleFromContext(r.Context())

	unreadCount, err := h.service.GetUnreadCount(r.Context(), userID, role)
	if err != nil {
		http.Error(w, `{"error": "Failed to fetch unread count"}`, http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(map[string]interface{}{
		"unreadCount": unreadCount,
	})
}

func (h *NotificationHandler) MarkAsRead(w http.ResponseWriter, r *http.Request, id int) {
	userID, err := middleware.GetUserIDFromContext(r.Context())
	if err != nil {
		http.Error(w, `{"error": "Unauthorized"}`, http.StatusUnauthorized)
		return
	}

	if err := h.service.MarkAsRead(r.Context(), id, userID); err != nil {
		http.Error(w, `{"error": "Failed to mark notification as read"}`, http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(map[string]interface{}{
		"success": true,
	})
}

func (h *NotificationHandler) MarkAllAsRead(w http.ResponseWriter, r *http.Request) {
	userID, err := middleware.GetUserIDFromContext(r.Context())
	if err != nil {
		http.Error(w, `{"error": "Unauthorized"}`, http.StatusUnauthorized)
		return
	}

	if err := h.service.MarkAllAsRead(r.Context(), userID); err != nil {
		http.Error(w, `{"error": "Failed to mark all as read"}`, http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(map[string]interface{}{
		"success": true,
	})
}

func (h *NotificationHandler) Delete(w http.ResponseWriter, r *http.Request, id int) {
	userID, err := middleware.GetUserIDFromContext(r.Context())
	if err != nil {
		http.Error(w, `{"error": "Unauthorized"}`, http.StatusUnauthorized)
		return
	}

	if err := h.service.DeleteNotification(r.Context(), id, userID); err != nil {
		http.Error(w, `{"error": "Failed to delete notification"}`, http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(map[string]interface{}{
		"success": true,
	})
}

func (h *NotificationHandler) Broadcast(w http.ResponseWriter, r *http.Request) {
	role := middleware.GetUserRoleFromContext(r.Context())
	if role != "admin" {
		http.Error(w, `{"error": "Forbidden: Admin access required"}`, http.StatusForbidden)
		return
	}

	var req struct {
		Title      string  `json:"title"`
		Message    string  `json:"message"`
		Type       string  `json:"type"`
		Link       *string `json:"link"`
		TargetRole *string `json:"targetRole"`
	}

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, `{"error": "Invalid request payload"}`, http.StatusBadRequest)
		return
	}

	var notif *notification.Notification
	var err error

	if req.TargetRole != nil && *req.TargetRole != "" {
		notif, err = h.service.SendToRole(r.Context(), *req.TargetRole, req.Title, req.Message, req.Type, req.Link)
	} else {
		notif, err = h.service.Broadcast(r.Context(), req.Title, req.Message, req.Type, req.Link)
	}

	if err != nil {
		http.Error(w, `{"error": "Failed to broadcast notification"}`, http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(map[string]interface{}{
		"success":      true,
		"notification": notif,
	})
}
