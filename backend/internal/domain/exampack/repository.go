package exampack

type ExamPackRepository interface {
	GetExamPacks() ([]ExamPack, error)
	GetExamPackByID(id int) (*ExamPack, error)
	CreateExamPack(pack *ExamPack) error
	UpdateExamPack(pack *ExamPack) error
	DeleteExamPack(id int) error
}
