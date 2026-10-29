package persistence

import (
	"context"
	"strings"
	"time"

	"gorm.io/gorm"

	"github.com/selftest/backend/internal/domain/notification"
)

type PostgresNotificationRepository struct {
	db *gorm.DB
}

func NewPostgresNotificationRepository(db *gorm.DB) *PostgresNotificationRepository {
	return &PostgresNotificationRepository{db: db}
}

func (r *PostgresNotificationRepository) Create(ctx context.Context, notif *notification.Notification) error {
	return r.db.WithContext(ctx).Create(notif).Error
}

func (r *PostgresNotificationRepository) GetByID(ctx context.Context, id int) (*notification.Notification, error) {
	var notif notification.Notification
	err := r.db.WithContext(ctx).First(&notif, id).Error
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, nil
		}
		return nil, err
	}
	return &notif, nil
}

func (r *PostgresNotificationRepository) userScope(userID int, userRole string) func(db *gorm.DB) *gorm.DB {
	normRole := strings.ToLower(strings.TrimSpace(userRole))
	return func(db *gorm.DB) *gorm.DB {
		return db.Where("user_id = ? OR (user_id IS NULL AND (role IS NULL OR role = '' OR LOWER(role) = ?))", userID, normRole)
	}
}

func (r *PostgresNotificationRepository) ListByUserID(ctx context.Context, userID int, userRole string, limit, offset int) ([]notification.Notification, int64, error) {
	var notifs []notification.Notification
	var total int64

	query := r.db.WithContext(ctx).Model(&notification.Notification{}).Scopes(r.userScope(userID, userRole))

	if err := query.Count(&total).Error; err != nil {
		return nil, 0, err
	}

	if limit <= 0 {
		limit = 20
	}
	if offset < 0 {
		offset = 0
	}

	err := query.Order("created_at DESC").
		Limit(limit).
		Offset(offset).
		Find(&notifs).Error
	if err != nil {
		return nil, 0, err
	}

	return notifs, total, nil
}

func (r *PostgresNotificationRepository) GetUnreadCount(ctx context.Context, userID int, userRole string) (int64, error) {
	var count int64
	err := r.db.WithContext(ctx).
		Model(&notification.Notification{}).
		Scopes(r.userScope(userID, userRole)).
		Where("is_read = ?", false).
		Count(&count).Error
	return count, err
}

func (r *PostgresNotificationRepository) MarkAsRead(ctx context.Context, id int, userID int) error {
	now := time.Now()
	return r.db.WithContext(ctx).
		Model(&notification.Notification{}).
		Where("id = ? AND (user_id = ? OR user_id IS NULL)", id, userID).
		Updates(map[string]interface{}{
			"is_read": true,
			"read_at": &now,
		}).Error
}

func (r *PostgresNotificationRepository) MarkAllAsRead(ctx context.Context, userID int) error {
	now := time.Now()
	return r.db.WithContext(ctx).
		Model(&notification.Notification{}).
		Where("is_read = ? AND (user_id = ? OR user_id IS NULL)", false, userID).
		Updates(map[string]interface{}{
			"is_read": true,
			"read_at": &now,
		}).Error
}

func (r *PostgresNotificationRepository) Delete(ctx context.Context, id int, userID int) error {
	return r.db.WithContext(ctx).
		Where("id = ? AND (user_id = ? OR user_id IS NULL)", id, userID).
		Delete(&notification.Notification{}).Error
}
