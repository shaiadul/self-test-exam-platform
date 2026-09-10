package persistence

import (
	"database/sql"
	"errors"
	"time"

	"github.com/selftest/backend/internal/domain/user"
)

type PostgresUserRepository struct {
	db *sql.DB
}

func NewPostgresUserRepository(db *sql.DB) *PostgresUserRepository {
	return &PostgresUserRepository{db: db}
}

func (r *PostgresUserRepository) Create(u *user.User) error {
	query := `
		INSERT INTO users (name, email, password, role, image, phone, level, batch, board, institution, address, subject, designation, admin_tier, admin_dept, admin_base, created_at, updated_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
		RETURNING id`

	now := time.Now()
	u.CreatedAt = now
	u.UpdatedAt = now
	if u.Role == "" {
		u.Role = "student"
	}

	err := r.db.QueryRow(
		query,
		u.Name,
		u.Email,
		u.Password,
		u.Role,
		u.Image,
		u.Phone,
		u.Level,
		u.Batch,
		u.Board,
		u.Institution,
		u.Address,
		u.Subject,
		u.Designation,
		u.AdminTier,
		u.AdminDept,
		u.AdminBase,
		u.CreatedAt,
		u.UpdatedAt,
	).Scan(&u.ID)

	return err
}

func (r *PostgresUserRepository) GetByEmail(email string) (*user.User, error) {
	query := `
		SELECT id, name, email, password, role, image, phone, level, batch, board, institution, address, subject, designation, admin_tier, admin_dept, admin_base, exam_limit, created_at, updated_at
		FROM users
		WHERE email = $1`

	var u user.User
	err := r.db.QueryRow(query, email).Scan(
		&u.ID,
		&u.Name,
		&u.Email,
		&u.Password,
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
		&u.ExamLimit,
		&u.CreatedAt,
		&u.UpdatedAt,
	)

	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, nil // Not found, no error
		}
		return nil, err
	}

	return &u, nil
}

func (r *PostgresUserRepository) GetByID(id int) (*user.User, error) {
	query := `
		SELECT id, name, email, password, role, image, phone, level, batch, board, institution, address, subject, designation, admin_tier, admin_dept, admin_base, exam_limit, created_at, updated_at
		FROM users
		WHERE id = $1`

	var u user.User
	err := r.db.QueryRow(query, id).Scan(
		&u.ID,
		&u.Name,
		&u.Email,
		&u.Password,
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
		&u.ExamLimit,
		&u.CreatedAt,
		&u.UpdatedAt,
	)

	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, nil // Not found
		}
		return nil, err
	}

	return &u, nil
}

func (r *PostgresUserRepository) Update(u *user.User) error {
	query := `
		UPDATE users
		SET name = $1, image = $2, phone = $3, level = $4, batch = $5, board = $6, institution = $7, address = $8, subject = $9, designation = $10, admin_tier = $11, admin_dept = $12, admin_base = $13, updated_at = $14
		WHERE id = $15`

	u.UpdatedAt = time.Now()
	_, err := r.db.Exec(
		query,
		u.Name,
		u.Image,
		u.Phone,
		u.Level,
		u.Batch,
		u.Board,
		u.Institution,
		u.Address,
		u.Subject,
		u.Designation,
		u.AdminTier,
		u.AdminDept,
		u.AdminBase,
		u.UpdatedAt,
		u.ID,
	)

	return err
}

func (r *PostgresUserRepository) GetAll() ([]user.User, error) {
	query := `
		SELECT u.id, u.name, u.email, u.role, u.image, u.phone, u.level, u.batch, u.board, u.institution, u.address, u.subject, u.designation, u.admin_tier, u.admin_dept, u.admin_base, u.exam_limit, COALESCE(COUNT(e.id), 0)::int AS created_exams_count, u.created_at, u.updated_at
		FROM users u
		LEFT JOIN exams e ON e.created_by = u.id
		GROUP BY u.id
		ORDER BY u.id ASC`

	rows, err := r.db.Query(query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var users []user.User
	for rows.Next() {
		var u user.User
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
			&u.ExamLimit,
			&u.CreatedExamsCount,
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

func (r *PostgresUserRepository) UpdateRole(id int, role string) error {
	query := `UPDATE users SET role = $1, updated_at = $2 WHERE id = $3`
	_, err := r.db.Exec(query, role, time.Now(), id)
	return err
}

func (r *PostgresUserRepository) UpdateRoleAndLimit(id int, role *string, examLimit *int) error {
	if role != nil && examLimit != nil {
		query := `UPDATE users SET role = $1, exam_limit = $2, updated_at = $3 WHERE id = $4`
		_, err := r.db.Exec(query, *role, *examLimit, time.Now(), id)
		return err
	} else if role != nil {
		return r.UpdateRole(id, *role)
	} else if examLimit != nil {
		query := `UPDATE users SET exam_limit = $1, updated_at = $2 WHERE id = $3`
		_, err := r.db.Exec(query, *examLimit, time.Now(), id)
		return err
	}
	return nil
}

func (r *PostgresUserRepository) Delete(id int) error {
	_, err := r.db.Exec("DELETE FROM users WHERE id = $1", id)
	return err
}

func (r *PostgresUserRepository) GetUserCountByRole(role string) (int, error) {
	var count int
	err := r.db.QueryRow(`SELECT COUNT(*) FROM users WHERE role = $1`, role).Scan(&count)
	return count, err
}

func (r *PostgresUserRepository) GetStudentRank(userID int) (int, error) {
	// Rank = number of students with a higher average final_score + 1
	query := `
		SELECT COUNT(DISTINCT ea2.user_id) + 1
		FROM (
			SELECT user_id, AVG(final_score) AS avg_score
			FROM exam_attempts
			GROUP BY user_id
		) ea2
		WHERE ea2.avg_score > COALESCE((
			SELECT AVG(final_score)
			FROM exam_attempts
			WHERE user_id = $1
		), 0)`

	var rank int
	err := r.db.QueryRow(query, userID).Scan(&rank)
	if err != nil {
		return 0, err
	}
	return rank, nil
}
