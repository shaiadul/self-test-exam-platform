package examrequest

type ExamRequestRepository interface {
	Create(req *ExamRequest) error
	GetByID(id int) (*ExamRequest, error)
	GetByTeacher(teacherID int) ([]ExamRequest, error)
	GetAll() ([]ExamRequest, error)
	UpdateStatus(id int, status string, adminNote *string) error
	GetStats() (map[string]int64, error)
	ClearRequests(reqType string, status string) (int64, error)
}
