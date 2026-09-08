package persistence

import (
	"database/sql"
	"errors"
	"time"

	"github.com/selftest/backend/internal/domain/attempt"
)

type PostgresAttemptRepository struct {
	db *sql.DB
}

func NewPostgresAttemptRepository(db *sql.DB) *PostgresAttemptRepository {
	return &PostgresAttemptRepository{db: db}
}

func (r *PostgresAttemptRepository) CreateExamAttempt(a *attempt.ExamAttempt) error {
	query := `
		INSERT INTO exam_attempts (user_id, exam_id, answers, total, correct, wrong, negative, final_score, passed, warning_count, security_message, created_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
		RETURNING id`

	a.CreatedAt = time.Now()
	return r.db.QueryRow(
		query,
		a.UserID,
		a.ExamID,
		a.Answers,
		a.Total,
		a.Correct,
		a.Wrong,
		a.Negative,
		a.FinalScore,
		a.Passed,
		a.WarningCount,
		a.SecurityMessage,
		a.CreatedAt,
	).Scan(&a.ID)
}

func (r *PostgresAttemptRepository) GetExamAttemptsByUserID(userID int) ([]attempt.ExamAttempt, error) {
	query := `
		SELECT id, user_id, exam_id, answers, total, correct, wrong, negative, final_score, passed, warning_count, security_message, created_at
		FROM exam_attempts
		WHERE user_id = $1
		ORDER BY created_at DESC`

	rows, err := r.db.Query(query, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var attempts []attempt.ExamAttempt
	for rows.Next() {
		var a attempt.ExamAttempt
		err := rows.Scan(
			&a.ID,
			&a.UserID,
			&a.ExamID,
			&a.Answers,
			&a.Total,
			&a.Correct,
			&a.Wrong,
			&a.Negative,
			&a.FinalScore,
			&a.Passed,
			&a.WarningCount,
			&a.SecurityMessage,
			&a.CreatedAt,
		)
		if err != nil {
			return nil, err
		}
		attempts = append(attempts, a)
	}

	return attempts, nil
}

func (r *PostgresAttemptRepository) GetExamAttemptsByExamID(examID string) ([]attempt.ExamAttempt, error) {
	query := `
		SELECT id, user_id, exam_id, answers, total, correct, wrong, negative, final_score, passed, warning_count, security_message, created_at
		FROM exam_attempts
		WHERE exam_id = $1
		ORDER BY created_at DESC`

	rows, err := r.db.Query(query, examID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var attempts []attempt.ExamAttempt
	for rows.Next() {
		var a attempt.ExamAttempt
		err := rows.Scan(
			&a.ID,
			&a.UserID,
			&a.ExamID,
			&a.Answers,
			&a.Total,
			&a.Correct,
			&a.Wrong,
			&a.Negative,
			&a.FinalScore,
			&a.Passed,
			&a.WarningCount,
			&a.SecurityMessage,
			&a.CreatedAt,
		)
		if err != nil {
			return nil, err
		}
		attempts = append(attempts, a)
	}

	return attempts, nil
}

func (r *PostgresAttemptRepository) GetAllExamAttempts() ([]attempt.ExamAttempt, error) {
	query := `
		SELECT id, user_id, exam_id, answers, total, correct, wrong, negative, final_score, passed, warning_count, security_message, created_at
		FROM exam_attempts
		ORDER BY created_at DESC`

	rows, err := r.db.Query(query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var attempts []attempt.ExamAttempt
	for rows.Next() {
		var a attempt.ExamAttempt
		err := rows.Scan(
			&a.ID,
			&a.UserID,
			&a.ExamID,
			&a.Answers,
			&a.Total,
			&a.Correct,
			&a.Wrong,
			&a.Negative,
			&a.FinalScore,
			&a.Passed,
			&a.WarningCount,
			&a.SecurityMessage,
			&a.CreatedAt,
		)
		if err != nil {
			return nil, err
		}
		attempts = append(attempts, a)
	}

	return attempts, nil
}

func (r *PostgresAttemptRepository) GetExamAttemptByID(id int) (*attempt.ExamAttempt, error) {
	query := `
		SELECT id, user_id, exam_id, answers, total, correct, wrong, negative, final_score, passed, warning_count, security_message, created_at
		FROM exam_attempts
		WHERE id = $1`

	var a attempt.ExamAttempt
	err := r.db.QueryRow(query, id).Scan(
		&a.ID,
		&a.UserID,
		&a.ExamID,
		&a.Answers,
		&a.Total,
		&a.Correct,
		&a.Wrong,
		&a.Negative,
		&a.FinalScore,
		&a.Passed,
		&a.WarningCount,
		&a.SecurityMessage,
		&a.CreatedAt,
	)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, nil
		}
		return nil, err
	}
	return &a, nil
}
