package persistence

import (
	"time"

	"gorm.io/gorm"

	"github.com/selftest/backend/internal/domain/examrequest"
)

type PostgresExamRequestRepository struct {
	db *gorm.DB
}

func NewPostgresExamRequestRepository(db *gorm.DB) *PostgresExamRequestRepository {
	return &PostgresExamRequestRepository{db: db}
}

const requestColumns = `r.id, r.teacher_id, u.name AS teacher_name, r.type, r.pack_id, COALESCE(p.title, '') AS pack_title, r.title, r.description, r.requested_limit, r.status, r.admin_note, r.created_at, r.updated_at`

func (r *PostgresExamRequestRepository) baseQuery() *gorm.DB {
	return r.db.Table("exam_requests AS r").
		Select(requestColumns).
		Joins("LEFT JOIN users u ON u.id = r.teacher_id").
		Joins("LEFT JOIN exam_packs p ON p.id = r.pack_id")
}

func (r *PostgresExamRequestRepository) Create(req *examrequest.ExamRequest) error {
	if req.Status == "" {
		req.Status = examrequest.StatusPending
	}
	return r.db.Create(req).Error
}

func (r *PostgresExamRequestRepository) GetByID(id int) (*examrequest.ExamRequest, error) {
	var req examrequest.ExamRequest
	res := r.baseQuery().Where("r.id = ?", id).Limit(1).Scan(&req)
	if res.Error != nil {
		return nil, res.Error
	}
	if res.RowsAffected == 0 {
		return nil, nil
	}
	return &req, nil
}

func (r *PostgresExamRequestRepository) GetByTeacher(teacherID int) ([]examrequest.ExamRequest, error) {
	requests := []examrequest.ExamRequest{}
	err := r.baseQuery().
		Where("r.teacher_id = ?", teacherID).
		Order("r.created_at DESC").
		Scan(&requests).Error
	if err != nil {
		return nil, err
	}
	return requests, nil
}

func (r *PostgresExamRequestRepository) GetAll() ([]examrequest.ExamRequest, error) {
	requests := []examrequest.ExamRequest{}
	err := r.baseQuery().
		Order("r.created_at DESC").
		Scan(&requests).Error
	if err != nil {
		return nil, err
	}
	return requests, nil
}

func (r *PostgresExamRequestRepository) UpdateStatus(id int, status string, adminNote *string) error {
	return r.db.Model(&examrequest.ExamRequest{}).
		Where("id = ?", id).
		Updates(map[string]interface{}{
			"status":     status,
			"admin_note": adminNote,
			"updated_at": time.Now(),
		}).Error
}
