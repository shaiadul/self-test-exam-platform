package attempt

import (
	"time"
)

type ExamAttempt struct {
	ID              int       `json:"id" db:"id" gorm:"primaryKey;autoIncrement"`
	UserID          int       `json:"userId" db:"user_id" gorm:"not null"`
	ExamID          string    `json:"examId" db:"exam_id" gorm:"type:varchar(50);not null"`
	Answers         string    `json:"answers" db:"answers" gorm:"type:jsonb;not null"` // JSON string map of question ID to chosen option
	Total           int       `json:"total" db:"total" gorm:"not null"`
	Correct         int       `json:"correct" db:"correct" gorm:"not null"`
	Wrong           int       `json:"wrong" db:"wrong" gorm:"not null"`
	Negative        float64   `json:"negative" db:"negative" gorm:"type:numeric(6,2);not null"`
	FinalScore      float64   `json:"finalScore" db:"final_score" gorm:"type:numeric(6,2);not null"`
	Passed          bool      `json:"passed" db:"passed" gorm:"not null"`
	WarningCount    int       `json:"warningCount" db:"warning_count" gorm:"default:0"`
	SecurityMessage string    `json:"securityMessage" db:"security_message"`
	CreatedAt       time.Time `json:"createdAt" db:"created_at" gorm:"autoCreateTime"`
}

type SubmitExamRequest struct {
	Answers         map[string]interface{} `json:"answers"`
	WarningCount    int                    `json:"warningCount"`
	SecurityMessage string                 `json:"securityMessage"`
	Passcode        string                 `json:"passcode"`
}

type SubmitExamResponse struct {
	ExamAttempt
	UserName string `json:"userName"`
}

type AttemptWithExam struct {
	ID              int       `json:"id"`
	UserID          int       `json:"userId"`
	ExamID          string    `json:"examId"`
	ExamName        string    `json:"examName"`
	PackName        string    `json:"packName"`
	Answers         string    `json:"answers"`
	Total           int       `json:"total"`
	Correct         int       `json:"correct"`
	Wrong           int       `json:"wrong"`
	Negative        float64   `json:"negative"`
	FinalScore      float64   `json:"finalScore"`
	Passed          bool      `json:"passed"`
	WarningCount    int       `json:"warningCount"`
	SecurityMessage string    `json:"securityMessage"`
	CreatedAt       time.Time `json:"createdAt"`
}

type AttemptDetailsResponse struct {
	ID               int       `json:"id"`
	UserID           int       `json:"userId"`
	UserName         string    `json:"userName"`
	ExamID           string    `json:"examId"`
	ExamName         string    `json:"examName"`
	ExamPackID       int       `json:"examPackId"`
	PackName         string    `json:"packName"`
	Answers          string    `json:"answers"`
	Total            int       `json:"total"`
	Correct          int       `json:"correct"`
	Wrong            int       `json:"wrong"`
	Negative         float64   `json:"negative"`
	FinalScore       float64   `json:"finalScore"`
	Passed           bool      `json:"passed"`
	WarningCount     int       `json:"warningCount"`
	SecurityMessage  string    `json:"securityMessage"`
	CreatedAt        time.Time `json:"createdAt"`
	StartDate        time.Time `json:"startDate"`
	EndDate          time.Time `json:"endDate"`
	Level            string    `json:"level"`
	Batch            string    `json:"batch"`
	PerQuestionMarks int       `json:"perQuestionMarks"`
	TotalMarks       int       `json:"totalMarks"`
	PassingMarks     int       `json:"passingMarks"`
	NegativeMarks    float64   `json:"negativeMarks"`
}

type EvaluationResult struct {
	Total      int
	Correct    int
	Wrong      int
	NegScore   float64
	FinalScore float64
	Passed     bool
}

// ExamAttemptStats aggregates attempt metrics for a single exam.
type ExamAttemptStats struct {
	Total   int
	Passed  int
	Highest float64
	Lowest  float64
	Sum     float64
}

func (s ExamAttemptStats) Average() float64 {
	if s.Total == 0 {
		return 0
	}
	return s.Sum / float64(s.Total)
}
