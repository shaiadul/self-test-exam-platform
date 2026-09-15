package exam

import "time"

type Exam struct {
	ID               string    `json:"id" db:"id" gorm:"primaryKey;type:varchar(50)"`
	ExamPackID       int       `json:"examPackId" db:"exam_pack_id" gorm:"not null"`
	Name             string    `json:"name" db:"name" gorm:"not null"`
	StartDate        time.Time `json:"startDate" db:"start_date" gorm:"not null"`
	EndDate          time.Time `json:"endDate" db:"end_date" gorm:"not null"`
	Level            string    `json:"level" db:"level"`
	Batch            string    `json:"batch" db:"batch"`
	TotalMarks       int       `json:"totalMarks" db:"total_marks" gorm:"default:10"`
	PassingMarks     int       `json:"passingMarks" db:"passing_marks" gorm:"default:33"` // pass threshold as a percentage of total marks
	PerQuestionMarks int       `json:"perQuestionMarks" db:"per_question_marks" gorm:"default:1"`
	NegativeMarks    float64   `json:"negativeMarks" db:"negative_marks" gorm:"type:numeric(4,2);default:-0.5"`
	IsPrivate        bool      `json:"isPrivate" db:"is_private" gorm:"default:false"`
	Passcode         string    `json:"passcode" db:"passcode" gorm:"type:varchar(100);default:''"`
	DurationMinutes  int       `json:"durationMinutes" db:"duration_minutes" gorm:"default:30"`
	CreatedBy        *int      `json:"createdBy,omitempty" db:"created_by"`
	CreatedAt        time.Time `json:"created_at" db:"created_at" gorm:"autoCreateTime"`
	UpdatedAt        time.Time `json:"updated_at" db:"updated_at" gorm:"autoUpdateTime"`
}

type Question struct {
	ID            int       `json:"id" db:"id" gorm:"primaryKey;autoIncrement"`
	ExamID        string    `json:"examId" db:"exam_id" gorm:"not null"`
	Type          string    `json:"type" db:"type" gorm:"not null"` // mcq, passage, picture
	QuestionText  string    `json:"questionText" db:"question_text" gorm:"not null"`
	Options       []string  `json:"options" db:"options" gorm:"type:text[];serializer:pg_string_array;not null"`
	CorrectAnswer string    `json:"correctAnswer" db:"correct_answer" gorm:"not null"`
	Passage       *string   `json:"passage,omitempty" db:"passage"`
	PictureURL    *string   `json:"pictureUrl,omitempty" db:"picture_url"`
	CreatedBy     *int      `json:"createdBy,omitempty" db:"created_by"`
	CreatedAt     time.Time `json:"created_at" db:"created_at" gorm:"autoCreateTime"`
}
