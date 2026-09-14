package exampack

type ExamPackRepository interface {
	GetExamPacks() ([]ExamPack, error)
	GetExamPacksByCreator(creatorID int) ([]ExamPack, error)
	GetExamPackByID(id int) (*ExamPack, error)
	CountExamPacksByCreator(creatorID int) (int, error)
	CreateExamPack(pack *ExamPack) error
	CreateExamPackWithinLimit(pack *ExamPack, creatorID int, limit int) (bool, error)
	UpdateExamPack(pack *ExamPack) error
	UpdateExamPackLimit(id int, limit int) error
	DeleteExamPack(id int) error
}
