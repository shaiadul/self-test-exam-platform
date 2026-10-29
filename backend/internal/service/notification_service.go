package service

import (
	"context"
	"errors"
	"strings"

	"github.com/selftest/backend/internal/domain/notification"
	"github.com/selftest/backend/internal/domain/user"
	ws "github.com/selftest/backend/internal/infrastructure/websocket"
)

var (
	ErrNotificationNotFound = errors.New("notification not found")
)

type NotificationService struct {
	repo     notification.NotificationRepository
	hub      *ws.Hub
	userRepo user.UserRepository
}

func NewNotificationService(repo notification.NotificationRepository, hub *ws.Hub, userRepo user.UserRepository) *NotificationService {
	return &NotificationService{
		repo:     repo,
		hub:      hub,
		userRepo: userRepo,
	}
}

// Hub returns the underlying WebSocket hub.
func (s *NotificationService) Hub() *ws.Hub {
	return s.hub
}

// SendToUser creates a notification for a specific user and delivers it in real-time over WebSocket.
func (s *NotificationService) SendToUser(ctx context.Context, userID int, title, message, notifType string, link *string) (*notification.Notification, error) {
	if notifType == "" {
		notifType = notification.TypeInfo
	}

	notif := &notification.Notification{
		UserID:  &userID,
		Title:   strings.TrimSpace(title),
		Message: strings.TrimSpace(message),
		Type:    notifType,
		Link:    link,
		IsRead:  false,
	}

	if err := s.repo.Create(ctx, notif); err != nil {
		return nil, err
	}

	// Real-time WebSocket delivery
	if s.hub != nil {
		s.hub.SendToUser(userID, notification.WSActionNotification, notif)

		// Push updated unread badge count
		if unreadCount, err := s.repo.GetUnreadCount(ctx, userID, ""); err == nil {
			s.hub.SendToUser(userID, notification.WSActionUnreadCount, unreadCount)
		}
	}

	return notif, nil
}

// SendToRole creates a notification for all users of a specific role and pushes it via WebSocket.
func (s *NotificationService) SendToRole(ctx context.Context, role, title, message, notifType string, link *string) (*notification.Notification, error) {
	normRole := strings.ToLower(strings.TrimSpace(role))
	if notifType == "" {
		notifType = notification.TypeInfo
	}

	notif := &notification.Notification{
		Role:    &normRole,
		Title:   strings.TrimSpace(title),
		Message: strings.TrimSpace(message),
		Type:    notifType,
		Link:    link,
		IsRead:  false,
	}

	if err := s.repo.Create(ctx, notif); err != nil {
		return nil, err
	}

	if s.hub != nil {
		s.hub.SendToRole(normRole, notification.WSActionNotification, notif)
	}

	return notif, nil
}

// Broadcast creates a global notification for everyone and pushes it via WebSocket.
func (s *NotificationService) Broadcast(ctx context.Context, title, message, notifType string, link *string) (*notification.Notification, error) {
	if notifType == "" {
		notifType = notification.TypeInfo
	}

	notif := &notification.Notification{
		Title:   strings.TrimSpace(title),
		Message: strings.TrimSpace(message),
		Type:    notifType,
		Link:    link,
		IsRead:  false,
	}

	if err := s.repo.Create(ctx, notif); err != nil {
		return nil, err
	}

	if s.hub != nil {
		s.hub.Broadcast(notification.WSActionNotification, notif)
	}

	return notif, nil
}

// ListUserNotifications returns paginated notifications for the requesting user alongside total count and unread count.
func (s *NotificationService) ListUserNotifications(ctx context.Context, userID int, role string, page, limit int) ([]notification.Notification, int64, int64, error) {
	if limit <= 0 {
		limit = 20
	}
	if page <= 0 {
		page = 1
	}
	offset := (page - 1) * limit

	notifs, total, err := s.repo.ListByUserID(ctx, userID, role, limit, offset)
	if err != nil {
		return nil, 0, 0, err
	}

	unreadCount, _ := s.repo.GetUnreadCount(ctx, userID, role)

	return notifs, total, unreadCount, nil
}

// GetUnreadCount retrieves the number of unread notifications for a user.
func (s *NotificationService) GetUnreadCount(ctx context.Context, userID int, role string) (int64, error) {
	return s.repo.GetUnreadCount(ctx, userID, role)
}

// MarkAsRead marks a single notification as read and pushes the updated badge count.
func (s *NotificationService) MarkAsRead(ctx context.Context, id int, userID int) error {
	if err := s.repo.MarkAsRead(ctx, id, userID); err != nil {
		return err
	}

	if s.hub != nil {
		if unreadCount, err := s.repo.GetUnreadCount(ctx, userID, ""); err == nil {
			s.hub.SendToUser(userID, notification.WSActionUnreadCount, unreadCount)
		}
	}

	return nil
}

// MarkAllAsRead marks all unread notifications for the user as read and pushes unread count 0.
func (s *NotificationService) MarkAllAsRead(ctx context.Context, userID int) error {
	if err := s.repo.MarkAllAsRead(ctx, userID); err != nil {
		return err
	}

	if s.hub != nil {
		s.hub.SendToUser(userID, notification.WSActionUnreadCount, int64(0))
	}

	return nil
}

// DeleteNotification removes a notification and updates badge count.
func (s *NotificationService) DeleteNotification(ctx context.Context, id int, userID int) error {
	if err := s.repo.Delete(ctx, id, userID); err != nil {
		return err
	}

	if s.hub != nil {
		if unreadCount, err := s.repo.GetUnreadCount(ctx, userID, ""); err == nil {
			s.hub.SendToUser(userID, notification.WSActionUnreadCount, unreadCount)
		}
	}

	return nil
}
