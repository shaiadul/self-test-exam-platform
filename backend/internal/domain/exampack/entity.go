package exampack

import "time"

type ExamPack struct {
	ID          int       `json:"id" db:"id" gorm:"primaryKey;autoIncrement"`
	Title       string    `json:"title" db:"title" gorm:"not null"`
	Description string    `json:"description" db:"description" gorm:"not null"`
	Image       string    `json:"image" db:"image" gorm:"not null"`
	Category    string    `json:"category" db:"category" gorm:"not null"`
	ExamLimit   int       `json:"examLimit" db:"exam_limit" gorm:"default:6"`
	CreatedBy   *int      `json:"createdBy,omitempty" db:"created_by"`
	TotalExams  int       `json:"totalExams" db:"total_exams" gorm:"->;-:migration"`
	CreatedAt   time.Time `json:"created_at" db:"created_at" gorm:"autoCreateTime"`
	UpdatedAt   time.Time `json:"updated_at" db:"updated_at" gorm:"autoUpdateTime"`
}

const DefaultExamLimit = 6
