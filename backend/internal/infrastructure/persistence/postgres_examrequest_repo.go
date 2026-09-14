package persistence

import (
	"database/sql"
	"errors"
	"time"

	"github.com/selftest/backend/internal/domain/examrequest"
)

type PostgresExamRequestRepository struct {
	db *sql.DB
}

func NewPostgresExamRequestRepository(db *sql.DB) *PostgresExamRequestRepository {
	return &PostgresExamRequestRepository{db: db}
}

const requestColumns = `r.id, r.teacher_id, u.name AS teacher_name, r.type, r.pack_id, COALESCE(p.title, '') AS pack_title, r.title, r.description, r.requested_limit, r.status, r.admin_note, r.created_at, r.updated_at`

const requestJoin = `FROM exam_requests r
	LEFT JOIN users u ON u.id = r.teacher_id
	LEFT JOIN exam_packs p ON p.id = r.pack_id`

func scanRequest(row interface {
	Scan(dest ...interface{}) error
}) (*examrequest.ExamRequest, error) {
	var req examrequest.ExamRequest
	err := row.Scan(
		&req.ID,
		&req.TeacherID,
		&req.TeacherName,
		&req.Type,
		&req.PackID,
		&req.PackTitle,
		&req.Title,
		&req.Description,
		&req.RequestedLimit,
		&req.Status,
		&req.AdminNote,
		&req.CreatedAt,
		&req.UpdatedAt,
	)
	if err != nil {
		return nil, err
	}
	return &req, nil
}

func (r *PostgresExamRequestRepository) Create(req *examrequest.ExamRequest) error {
	query := `
		INSERT INTO exam_requests (teacher_id, type, pack_id, title, description, requested_limit, status, admin_note, created_at, updated_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
		RETURNING id`

	now := time.Now()
	req.CreatedAt = now
	req.UpdatedAt = now
	if req.Status == "" {
		req.Status = examrequest.StatusPending
	}

	return r.db.QueryRow(
		query,
		req.TeacherID,
		req.Type,
		req.PackID,
		req.Title,
		req.Description,
		req.RequestedLimit,
		req.Status,
		req.AdminNote,
		req.CreatedAt,
		req.UpdatedAt,
	).Scan(&req.ID)
}

func (r *PostgresExamRequestRepository) GetByID(id int) (*examrequest.ExamRequest, error) {
	query := `SELECT ` + requestColumns + ` ` + requestJoin + ` WHERE r.id = $1`

	req, err := scanRequest(r.db.QueryRow(query, id))
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, nil
		}
		return nil, err
	}
	return req, nil
}

func (r *PostgresExamRequestRepository) GetByTeacher(teacherID int) ([]examrequest.ExamRequest, error) {
	query := `SELECT ` + requestColumns + ` ` + requestJoin + ` WHERE r.teacher_id = $1 ORDER BY r.created_at DESC`
	return r.queryRequests(query, teacherID)
}

func (r *PostgresExamRequestRepository) GetAll() ([]examrequest.ExamRequest, error) {
	query := `SELECT ` + requestColumns + ` ` + requestJoin + ` ORDER BY r.created_at DESC`
	return r.queryRequests(query)
}

func (r *PostgresExamRequestRepository) queryRequests(query string, args ...interface{}) ([]examrequest.ExamRequest, error) {
	rows, err := r.db.Query(query, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	requests := []examrequest.ExamRequest{}
	for rows.Next() {
		req, err := scanRequest(rows)
		if err != nil {
			return nil, err
		}
		requests = append(requests, *req)
	}
	return requests, nil
}

func (r *PostgresExamRequestRepository) UpdateStatus(id int, status string, adminNote *string) error {
	query := `UPDATE exam_requests SET status = $1, admin_note = $2, updated_at = $3 WHERE id = $4`
	_, err := r.db.Exec(query, status, adminNote, time.Now(), id)
	return err
}
