package attempt

type AttemptRepository interface {
	CreateExamAttempt(attempt *ExamAttempt) error
	GetExamAttemptsByUserID(userID int) ([]ExamAttempt, error)
	GetExamAttemptsByExamID(examID string) ([]ExamAttempt, error)
	GetExamAttemptStatsByExamIDs(examIDs []string) (map[string]ExamAttemptStats, error)
	GetAllExamAttempts() ([]ExamAttempt, error)
	GetExamAttemptByID(id int) (*ExamAttempt, error)
}
