package service

import (
	"context"
	"testing"
	"time"

	"github.com/selftest/backend/internal/domain/notification"
	ws "github.com/selftest/backend/internal/infrastructure/websocket"
)

type mockNotificationRepo struct {
	notifs      []notification.Notification
	unreadCount int64
}

func (m *mockNotificationRepo) Create(ctx context.Context, notif *notification.Notification) error {
	notif.ID = len(m.notifs) + 1
	notif.CreatedAt = time.Now()
	m.notifs = append(m.notifs, *notif)
	m.unreadCount++
	return nil
}

func (m *mockNotificationRepo) GetByID(ctx context.Context, id int) (*notification.Notification, error) {
	for _, n := range m.notifs {
		if n.ID == id {
			return &n, nil
		}
	}
	return nil, nil
}

func (m *mockNotificationRepo) ListByUserID(ctx context.Context, userID int, userRole string, limit, offset int) ([]notification.Notification, int64, error) {
	return m.notifs, int64(len(m.notifs)), nil
}

func (m *mockNotificationRepo) GetUnreadCount(ctx context.Context, userID int, userRole string) (int64, error) {
	return m.unreadCount, nil
}

func (m *mockNotificationRepo) MarkAsRead(ctx context.Context, id int, userID int) error {
	for i := range m.notifs {
		if m.notifs[i].ID == id {
			m.notifs[i].IsRead = true
			if m.unreadCount > 0 {
				m.unreadCount--
			}
		}
	}
	return nil
}

func (m *mockNotificationRepo) MarkAllAsRead(ctx context.Context, userID int) error {
	for i := range m.notifs {
		m.notifs[i].IsRead = true
	}
	m.unreadCount = 0
	return nil
}

func (m *mockNotificationRepo) Delete(ctx context.Context, id int, userID int) error {
	filtered := []notification.Notification{}
	for _, n := range m.notifs {
		if n.ID != id {
			filtered = append(filtered, n)
		}
	}
	m.notifs = filtered
	return nil
}

func TestNotificationService(t *testing.T) {
	repo := &mockNotificationRepo{}
	hub := ws.NewHub(nil)
	go hub.Run()

	svc := NewNotificationService(repo, hub, nil)
	ctx := context.Background()

	// 1. SendToUser
	notif, err := svc.SendToUser(ctx, 10, "Exam Alert", "You passed the exam!", notification.TypeSuccess, nil)
	if err != nil {
		t.Fatalf("Unexpected error: %v", err)
	}
	if notif.Title != "Exam Alert" {
		t.Errorf("Expected title 'Exam Alert', got '%s'", notif.Title)
	}

	// 2. Unread Count
	count, err := svc.GetUnreadCount(ctx, 10, "student")
	if err != nil || count != 1 {
		t.Errorf("Expected unread count 1, got %d (err: %v)", count, err)
	}

	// 3. Mark as read
	err = svc.MarkAsRead(ctx, notif.ID, 10)
	if err != nil {
		t.Fatalf("Unexpected mark as read error: %v", err)
	}
	count, _ = svc.GetUnreadCount(ctx, 10, "student")
	if count != 0 {
		t.Errorf("Expected unread count 0 after mark read, got %d", count)
	}

	// 4. Mark all as read
	_, _ = svc.SendToUser(ctx, 10, "Notice", "System maintenance", notification.TypeInfo, nil)
	err = svc.MarkAllAsRead(ctx, 10)
	if err != nil {
		t.Fatalf("Unexpected mark all read error: %v", err)
	}
	count, _ = svc.GetUnreadCount(ctx, 10, "student")
	if count != 0 {
		t.Errorf("Expected unread count 0, got %d", count)
	}
}
