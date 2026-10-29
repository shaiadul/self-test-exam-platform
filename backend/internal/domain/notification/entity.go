package notification

import "time"

const (
	TypeInfo    = "info"
	TypeSuccess = "success"
	TypeWarning = "warning"
	TypeError   = "error"
)

// WebSocket Event Action Constants
const (
	WSActionNotification = "notification"
	WSActionUnreadCount  = "unread_count"
	WSActionPing         = "ping"
	WSActionPong         = "pong"
)

// Notification represents a persistent notification in the database.
type Notification struct {
	ID        int        `json:"id" db:"id" gorm:"primaryKey;autoIncrement"`
	UserID    *int       `json:"userId,omitempty" db:"user_id" gorm:"index"`
	Role      *string    `json:"role,omitempty" db:"role" gorm:"index"` // nil = all roles, or "student", "teacher", "admin"
	Title     string     `json:"title" db:"title" gorm:"not null"`
	Message   string     `json:"message" db:"message" gorm:"not null"`
	Type      string     `json:"type" db:"type" gorm:"not null;default:'info'"`
	Link      *string    `json:"link,omitempty" db:"link"`
	IsRead    bool       `json:"isRead" db:"is_read" gorm:"not null;default:false;index"`
	ReadAt    *time.Time `json:"readAt,omitempty" db:"read_at"`
	CreatedAt time.Time  `json:"createdAt" db:"created_at" gorm:"autoCreateTime;index"`
}

// WSMessage is the envelope sent over WebSocket connections.
type WSMessage struct {
	Type      string      `json:"type"`
	Payload   interface{} `json:"payload"`
	Timestamp time.Time   `json:"timestamp"`
}

// CreateNotificationDTO provides input parameters for creating notifications.
type CreateNotificationDTO struct {
	UserID  *int    `json:"userId,omitempty"`
	Role    *string `json:"role,omitempty"`
	Title   string  `json:"title"`
	Message string  `json:"message"`
	Type    string  `json:"type"`
	Link    *string `json:"link,omitempty"`
}
