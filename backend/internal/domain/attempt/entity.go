package attempt

import (
	"time"
)

type ExamAttempt struct {
	ID              int       `json:"id" db:"id"`
	UserID          int       `json:"userId" db:"user_id"`
	ExamID          string    `json:"examId" db:"exam_id"`
	Answers         string    `json:"answers" db:"answers"` // JSON string map of question ID to chosen option
	Total           int       `json:"total" db:"total"`
	Correct         int       `json:"correct" db:"correct"`
	Wrong           int       `json:"wrong" db:"wrong"`
	Negative        float64   `json:"negative" db:"negative"`
	FinalScore      float64   `json:"finalScore" db:"final_score"`
	Passed          bool      `json:"passed" db:"passed"`
	WarningCount    int       `json:"warningCount" db:"warning_count"`
	SecurityMessage string    `json:"securityMessage" db:"security_message"`
	CreatedAt       time.Time `json:"createdAt" db:"created_at"`
}

type SubmitExamRequest struct {
	Answers         map[string]interface{} `json:"answers"`
	WarningCount    int                    `json:"warningCount"`
	SecurityMessage string                 `json:"securityMessage"`
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
