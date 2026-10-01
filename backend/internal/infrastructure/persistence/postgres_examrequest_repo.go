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

func (r *PostgresExamRequestRepository) GetStats() (map[string]int64, error) {
	stats := map[string]int64{
		"total":    0,
		"pending":  0,
		"approved": 0,
		"rejected": 0,
		"pack":     0,
		"limit":    0,
	}

	type countResult struct {
		Status string
		Type   string
		Count  int64
	}

	var results []countResult
	err := r.db.Model(&examrequest.ExamRequest{}).
		Select("status, type, count(*) as count").
		Group("status, type").
		Scan(&results).Error
	if err != nil {
		return stats, err
	}

	for _, res := range results {
		stats["total"] += res.Count
		switch res.Status {
		case examrequest.StatusPending:
			stats["pending"] += res.Count
		case examrequest.StatusApproved:
			stats["approved"] += res.Count
		case examrequest.StatusRejected:
			stats["rejected"] += res.Count
		}

		switch res.Type {
		case examrequest.TypePack:
			stats["pack"] += res.Count
		case examrequest.TypeLimit:
			stats["limit"] += res.Count
		}
	}

	return stats, nil
}

func (r *PostgresExamRequestRepository) ClearRequests(reqType string, status string) (int64, error) {
	q := r.db.Model(&examrequest.ExamRequest{})

	if reqType != "" && reqType != "all" && reqType != "quota" {
		q = q.Where("type = ?", reqType)
	}

	switch status {
	case "pending":
		q = q.Where("status = ?", examrequest.StatusPending)
	case "approved":
		q = q.Where("status = ?", examrequest.StatusApproved)
	case "rejected":
		q = q.Where("status = ?", examrequest.StatusRejected)
	case "resolved", "handled":
		q = q.Where("status IN (?, ?)", examrequest.StatusApproved, examrequest.StatusRejected)
	case "all", "":
		// clear all
	default:
		q = q.Where("status = ?", status)
	}

	res := q.Delete(&examrequest.ExamRequest{})
	return res.RowsAffected, res.Error
}
