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
	ID             int       `json:"id" db:"id"`
	TeacherID      int       `json:"teacherId" db:"teacher_id"`
	TeacherName    string    `json:"teacherName,omitempty" db:"teacher_name"`
	Type           string    `json:"type" db:"type"`
	PackID         *int      `json:"packId,omitempty" db:"pack_id"`
	PackTitle      string    `json:"packTitle,omitempty" db:"pack_title"`
	Title          string    `json:"title" db:"title"`
	Description    string    `json:"description" db:"description"`
	RequestedLimit int       `json:"requestedLimit" db:"requested_limit"`
	Status         string    `json:"status" db:"status"`
	AdminNote      *string   `json:"adminNote,omitempty" db:"admin_note"`
	CreatedAt      time.Time `json:"created_at" db:"created_at"`
	UpdatedAt      time.Time `json:"updated_at" db:"updated_at"`
}
