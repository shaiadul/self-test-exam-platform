package user

type UserRepository interface {
	Create(user *User) error
	GetByEmail(email string) (*User, error)
	GetByID(id int) (*User, error)
	Update(user *User) error
	GetAll() ([]User, error)
	UpdateRole(id int, role string) error
	UpdateRoleAndLimit(id int, role *string, examLimit *int) error
	Delete(id int) error
	GetUserCountByRole(role string) (int, error)
	GetStudentRank(userID int) (int, error)
}
