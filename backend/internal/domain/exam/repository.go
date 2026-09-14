package exam

import "time"

type ExamRepository interface {
	GetExamsByPackID(packID int) ([]Exam, error)
	GetExamByID(id string) (*Exam, error)
	GetUpcomingExamsForUser(userID int, now time.Time) ([]Exam, error)
	CreateExam(exam *Exam) error
	CreateExamWithinLimit(exam *Exam, creatorID int, limit int) (bool, error)
	CreateExamWithinPackLimit(exam *Exam, packID int, limit int) (bool, error)
	UpdateExam(exam *Exam) error
	DeleteExam(id string) error
	CountExamsByCreator(creatorID int) (int, error)

	GetQuestionsByExamID(examID string) ([]Question, error)
	CountAllQuestions() (int, error)
	GetQuestionByID(id int) (*Question, error)
	CreateQuestion(question *Question) error
	UpdateQuestion(question *Question) error
	DeleteQuestion(id int) error
}
