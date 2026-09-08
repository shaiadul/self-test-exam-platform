package exampack

import "time"

type ExamPack struct {
	ID          int       `json:"id" db:"id"`
	Title       string    `json:"title" db:"title"`
	Description string    `json:"description" db:"description"`
	Image       string    `json:"image" db:"image"`
	Category    string    `json:"category" db:"category"`
	TotalExams  int       `json:"totalExams" db:"total_exams"`
	CreatedAt   time.Time `json:"created_at" db:"created_at"`
	UpdatedAt   time.Time `json:"updated_at" db:"updated_at"`
}
