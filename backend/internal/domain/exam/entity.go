package exam

import "time"

type Exam struct {
	ID               string    `json:"id" db:"id"`
	ExamPackID       int       `json:"examPackId" db:"exam_pack_id"`
	Name             string    `json:"name" db:"name"`
	StartDate        time.Time `json:"startDate" db:"start_date"`
	EndDate          time.Time `json:"endDate" db:"end_date"`
	Level            string    `json:"level" db:"level"`
	Batch            string    `json:"batch" db:"batch"`
	TotalMarks       int       `json:"totalMarks" db:"total_marks"`
	PassingMarks     int       `json:"passingMarks" db:"passing_marks"`
	PerQuestionMarks int       `json:"perQuestionMarks" db:"per_question_marks"`
	NegativeMarks    float64   `json:"negativeMarks" db:"negative_marks"`
	IsPrivate        bool      `json:"isPrivate" db:"is_private"`
	Passcode         string    `json:"passcode" db:"passcode"`
	DurationMinutes  int       `json:"durationMinutes" db:"duration_minutes"`
	CreatedAt        time.Time `json:"created_at" db:"created_at"`
	UpdatedAt        time.Time `json:"updated_at" db:"updated_at"`
}

type Question struct {
	ID            int       `json:"id" db:"id"`
	ExamID        string    `json:"examId" db:"exam_id"`
	Type          string    `json:"type" db:"type"` // mcq, passage, picture
	QuestionText  string    `json:"questionText" db:"question_text"`
	Options       []string  `json:"options" db:"options"`
	CorrectAnswer string    `json:"correctAnswer" db:"correct_answer"`
	Passage       *string   `json:"passage,omitempty" db:"passage"`
	PictureURL    *string   `json:"pictureUrl,omitempty" db:"picture_url"`
	CreatedAt     time.Time `json:"created_at" db:"created_at"`
}
