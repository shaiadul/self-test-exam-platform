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
	GetAll() ([]model.User, error)
	UpdateRole(id int, role string) error
	Delete(id int) error
}

type SQLUserRepository struct {
	db *sql.DB
}

func NewSQLUserRepository(db *sql.DB) UserRepository {
	return &SQLUserRepository{db: db}
}

func (r *SQLUserRepository) Create(user *model.User) error {
	query := `
		INSERT INTO users (name, email, password, role, image, phone, level, batch, board, institution, address, subject, designation, admin_tier, admin_dept, admin_base, created_at, updated_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
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
		user.Subject,
		user.Designation,
		user.AdminTier,
		user.AdminDept,
		user.AdminBase,
		user.CreatedAt,
		user.UpdatedAt,
	).Scan(&user.ID)

	return err
}

func (r *SQLUserRepository) GetByEmail(email string) (*model.User, error) {
	query := `
		SELECT id, name, email, password, role, image, phone, level, batch, board, institution, address, subject, designation, admin_tier, admin_dept, admin_base, created_at, updated_at
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
		&user.Subject,
		&user.Designation,
		&user.AdminTier,
		&user.AdminDept,
		&user.AdminBase,
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
		SELECT id, name, email, password, role, image, phone, level, batch, board, institution, address, subject, designation, admin_tier, admin_dept, admin_base, created_at, updated_at
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
		&user.Subject,
		&user.Designation,
		&user.AdminTier,
		&user.AdminDept,
		&user.AdminBase,
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
		SET name = $1, image = $2, phone = $3, level = $4, batch = $5, board = $6, institution = $7, address = $8, subject = $9, designation = $10, admin_tier = $11, admin_dept = $12, admin_base = $13, updated_at = $14
		WHERE id = $15`

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
		user.Subject,
		user.Designation,
		user.AdminTier,
		user.AdminDept,
		user.AdminBase,
		user.UpdatedAt,
		user.ID,
	)

	return err
}

func (r *SQLUserRepository) GetAll() ([]model.User, error) {
	query := `
		SELECT id, name, email, role, image, phone, level, batch, board, institution, address, subject, designation, admin_tier, admin_dept, admin_base, created_at, updated_at
		FROM users
		ORDER BY id ASC`

	rows, err := r.db.Query(query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var users []model.User
	for rows.Next() {
		var u model.User
		err := rows.Scan(
			&u.ID,
			&u.Name,
			&u.Email,
			&u.Role,
			&u.Image,
			&u.Phone,
			&u.Level,
			&u.Batch,
			&u.Board,
			&u.Institution,
			&u.Address,
			&u.Subject,
			&u.Designation,
			&u.AdminTier,
			&u.AdminDept,
			&u.AdminBase,
			&u.CreatedAt,
			&u.UpdatedAt,
		)
		if err != nil {
			return nil, err
		}
		users = append(users, u)
	}

	return users, nil
}

func (r *SQLUserRepository) UpdateRole(id int, role string) error {
	query := `UPDATE users SET role = $1, updated_at = $2 WHERE id = $3`
	_, err := r.db.Exec(query, role, time.Now(), id)
	return err
}

func (r *SQLUserRepository) Delete(id int) error {
	_, err := r.db.Exec("DELETE FROM users WHERE id = $1", id)
	return err
}
