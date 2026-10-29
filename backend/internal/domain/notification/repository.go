package notification

import "context"

type NotificationRepository interface {
	Create(ctx context.Context, notif *Notification) error
	GetByID(ctx context.Context, id int) (*Notification, error)
	ListByUserID(ctx context.Context, userID int, userRole string, limit, offset int) ([]Notification, int64, error)
	GetUnreadCount(ctx context.Context, userID int, userRole string) (int64, error)
	MarkAsRead(ctx context.Context, id int, userID int) error
	MarkAllAsRead(ctx context.Context, userID int) error
	Delete(ctx context.Context, id int, userID int) error
}
