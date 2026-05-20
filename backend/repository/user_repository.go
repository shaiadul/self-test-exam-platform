package repository

import (
	"database/sql"
	"errors"
	"time"

	"github.com/selftest/backend/model"
)

type UserRepository interface {
	Create(user *model.User) error
	GetByEmail(email string) (*model.User, error)
	GetByID(id int) (*model.User, error)
	Update(user *model.User) error
}

type SQLUserRepository struct {
	db *sql.DB
}

func NewSQLUserRepository(db *sql.DB) UserRepository {
	return &SQLUserRepository{db: db}
}

func (r *SQLUserRepository) Create(user *model.User) error {
	query := `
		INSERT INTO users (name, email, password, role, image, phone, level, batch, board, institution, address, created_at, updated_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
		RETURNING id`
	
	now := time.Now()
	user.CreatedAt = now
	user.UpdatedAt = now
	if user.Role == "" {
		user.Role = "student"
	}

	err := r.db.QueryRow(
		query,
		user.Name,
		user.Email,
		user.Password,
		user.Role,
		user.Image,
		user.Phone,
		user.Level,
		user.Batch,
		user.Board,
		user.Institution,
		user.Address,
		user.CreatedAt,
		user.UpdatedAt,
	).Scan(&user.ID)

	return err
}

func (r *SQLUserRepository) GetByEmail(email string) (*model.User, error) {
	query := `
		SELECT id, name, email, password, role, image, phone, level, batch, board, institution, address, created_at, updated_at
		FROM users
		WHERE email = $1`

	var user model.User
	err := r.db.QueryRow(query, email).Scan(
		&user.ID,
		&user.Name,
		&user.Email,
		&user.Password,
		&user.Role,
		&user.Image,
		&user.Phone,
		&user.Level,
		&user.Batch,
		&user.Board,
		&user.Institution,
		&user.Address,
		&user.CreatedAt,
		&user.UpdatedAt,
	)

	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, nil // Not found, no error
		}
		return nil, err
	}

	return &user, nil
}

func (r *SQLUserRepository) GetByID(id int) (*model.User, error) {
	query := `
		SELECT id, name, email, password, role, image, phone, level, batch, board, institution, address, created_at, updated_at
		FROM users
		WHERE id = $1`

	var user model.User
	err := r.db.QueryRow(query, id).Scan(
		&user.ID,
		&user.Name,
		&user.Email,
		&user.Password,
		&user.Role,
		&user.Image,
		&user.Phone,
		&user.Level,
		&user.Batch,
		&user.Board,
		&user.Institution,
		&user.Address,
		&user.CreatedAt,
		&user.UpdatedAt,
	)

	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, nil // Not found
		}
		return nil, err
	}

	return &user, nil
}

func (r *SQLUserRepository) Update(user *model.User) error {
	query := `
		UPDATE users
		SET name = $1, image = $2, phone = $3, level = $4, batch = $5, board = $6, institution = $7, address = $8, updated_at = $9
		WHERE id = $10`

	user.UpdatedAt = time.Now()
	_, err := r.db.Exec(
		query,
		user.Name,
		user.Image,
		user.Phone,
		user.Level,
		user.Batch,
		user.Board,
		user.Institution,
		user.Address,
		user.UpdatedAt,
		user.ID,
	)

	return err
}
