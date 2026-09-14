package user

type UserRepository interface {
	Create(user *User) error
	GetByEmail(email string) (*User, error)
	GetByID(id int) (*User, error)
	GetRoleByID(id int) (string, error)
	GetSummaryByID(id int) (*UserSummary, error)
	GetSummariesByIDs(ids []int) (map[int]UserSummary, error)
	Update(user *User) error
	GetAll() ([]User, error)
	UpdateRole(id int, role string) error
	UpdateRoleAndLimit(id int, role *string, examLimit *int) error
	UpdateExamPackLimit(id int, limit int) error
	Delete(id int) error
	GetUserCountByRole(role string) (int, error)
	CountIncompleteTeachers() (int, error)
	GetStudentRank(userID int) (int, error)
}
