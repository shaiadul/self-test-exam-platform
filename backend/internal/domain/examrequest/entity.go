package examrequest

import "time"

// Request types. "pack" asks to raise the teacher's exam pack allowance
// (or to be granted a new pack), "limit" asks to raise the exam creation
// limit of an existing pack owned by the teacher.
const (
	TypePack  = "pack"
	TypeLimit = "limit"
)

// Request statuses.
const (
	StatusPending  = "pending"
	StatusApproved = "approved"
	StatusRejected = "rejected"
)

type ExamRequest struct {
	ID             int       `json:"id" db:"id" gorm:"primaryKey;autoIncrement"`
	TeacherID      int       `json:"teacherId" db:"teacher_id" gorm:"not null"`
	TeacherName    string    `json:"teacherName,omitempty" db:"teacher_name" gorm:"->;-:migration"`
	Type           string    `json:"type" db:"type" gorm:"not null"`
	PackID         *int      `json:"packId,omitempty" db:"pack_id"`
	PackTitle      string    `json:"packTitle,omitempty" db:"pack_title" gorm:"->;-:migration"`
	Title          string    `json:"title" db:"title" gorm:"not null"`
	Description    string    `json:"description" db:"description"`
	RequestedLimit int       `json:"requestedLimit" db:"requested_limit" gorm:"not null;default:0"`
	Status         string    `json:"status" db:"status" gorm:"not null;default:pending"`
	AdminNote      *string   `json:"adminNote,omitempty" db:"admin_note"`
	CreatedAt      time.Time `json:"created_at" db:"created_at" gorm:"autoCreateTime"`
	UpdatedAt      time.Time `json:"updated_at" db:"updated_at" gorm:"autoUpdateTime"`
}
