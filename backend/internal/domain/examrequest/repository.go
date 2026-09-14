package examrequest

type ExamRequestRepository interface {
	Create(req *ExamRequest) error
	GetByID(id int) (*ExamRequest, error)
	GetByTeacher(teacherID int) ([]ExamRequest, error)
	GetAll() ([]ExamRequest, error)
	UpdateStatus(id int, status string, adminNote *string) error
}
