package persistence

import (
	"errors"
	"math"
	"strings"
	"time"

	"gorm.io/gorm"

	"github.com/selftest/backend/internal/domain/exam"
)

type PostgresExamRepository struct {
	db *gorm.DB
}

func NewPostgresExamRepository(db *gorm.DB) *PostgresExamRepository {
	return &PostgresExamRepository{db: db}
}

const examColumns = `id, exam_pack_id, name, start_date, end_date, level, batch, total_marks, passing_marks, per_question_marks, negative_marks, COALESCE(is_private, false) AS is_private, COALESCE(passcode, '') AS passcode, COALESCE(duration_minutes, 30) AS duration_minutes, COALESCE(randomization, false) AS randomization, COALESCE(feedback, true) AS feedback, created_by, created_at, updated_at`

const examColumnsE = `e.id, e.exam_pack_id, e.name, e.start_date, e.end_date, e.level, e.batch, e.total_marks, e.passing_marks, e.per_question_marks, e.negative_marks, COALESCE(e.is_private, false) AS is_private, COALESCE(e.passcode, '') AS passcode, COALESCE(e.duration_minutes, 30) AS duration_minutes, COALESCE(e.randomization, false) AS randomization, COALESCE(e.feedback, true) AS feedback, e.created_by, e.created_at, e.updated_at`

func (r *PostgresExamRepository) ListExams(filter exam.ExamFilter) ([]exam.Exam, exam.PaginationMeta, error) {
	page := filter.Page
	if page < 1 {
		page = 1
	}
	perPage := filter.PerPage
	if perPage < 1 {
		perPage = 10
	} else if perPage > 100 {
		perPage = 100
	}

	query := r.db.Model(&exam.Exam{})

	if filter.Search != "" {
		searchTerm := "%" + strings.TrimSpace(filter.Search) + "%"
		query = query.Where("name ILIKE ? OR level ILIKE ? OR batch ILIKE ?", searchTerm, searchTerm, searchTerm)
	}

	if filter.PackID != nil {
		query = query.Where("exam_pack_id = ?", *filter.PackID)
	}

	if filter.Level != "" {
		query = query.Where("level ILIKE ?", filter.Level)
	}

	if filter.Batch != "" {
		query = query.Where("batch ILIKE ?", filter.Batch)
	}

	if filter.TeacherID != nil {
		query = query.Where("created_by = ?", *filter.TeacherID)
	}

	var totalItems int64
	if err := query.Count(&totalItems).Error; err != nil {
		return nil, exam.PaginationMeta{}, err
	}

	totalPages := 0
	if totalItems > 0 {
		totalPages = int(math.Ceil(float64(totalItems) / float64(perPage)))
	}

	offset := (page - 1) * perPage
	exams := []exam.Exam{}
	err := query.
		Select(examColumns).
		Order("start_date DESC").
		Offset(offset).
		Limit(perPage).
		Find(&exams).Error
	if err != nil {
		return nil, exam.PaginationMeta{}, err
	}

	meta := exam.PaginationMeta{
		TotalItems:  totalItems,
		TotalPages:  totalPages,
		CurrentPage: page,
		PerPage:     perPage,
	}

	return exams, meta, nil
}

func (r *PostgresExamRepository) GetExamsByPackID(packID int) ([]exam.Exam, error) {
	exams := []exam.Exam{}
	err := r.db.Model(&exam.Exam{}).
		Select(examColumns).
		Where("exam_pack_id = ?", packID).
		Order("start_date ASC").
		Find(&exams).Error
	if err != nil {
		return nil, err
	}
	return exams, nil
}

func (r *PostgresExamRepository) GetExamByID(id string) (*exam.Exam, error) {
	var e exam.Exam
	err := r.db.Model(&exam.Exam{}).
		Select(examColumns).
		Where("id = ?", id).
		First(&e).Error
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, nil
		}
		return nil, err
	}
	return &e, nil
}

func (r *PostgresExamRepository) GetExamsByIDs(ids []string) ([]exam.Exam, error) {
	exams := []exam.Exam{}
	if len(ids) == 0 {
		return exams, nil
	}

	err := r.db.Model(&exam.Exam{}).
		Select(examColumns).
		Where("id IN ?", ids).
		Find(&exams).Error
	if err != nil {
		return nil, err
	}
	return exams, nil
}

func (r *PostgresExamRepository) GetUpcomingExamsForUser(userID int, now time.Time) ([]exam.Exam, error) {
	exams := []exam.Exam{}
	err := r.db.Table("exams AS e").
		Select(examColumnsE).
		Joins("LEFT JOIN exam_attempts a ON e.id = a.exam_id AND a.user_id = ?", userID).
		Where("a.id IS NULL AND e.end_date > ?", now).
		Order("e.start_date ASC").
		Limit(5).
		Scan(&exams).Error
	if err != nil {
		return nil, err
	}
	return exams, nil
}

func (r *PostgresExamRepository) CreateExam(e *exam.Exam) error {
	return r.db.Create(e).Error
}

func (r *PostgresExamRepository) CreateExamWithinLimit(e *exam.Exam, creatorID int, limit int) (bool, error) {
	return r.createExamWithinLimit(e, "created_by = ?", creatorID, limit)
}

func (r *PostgresExamRepository) CreateExamWithinPackLimit(e *exam.Exam, packID int, limit int) (bool, error) {
	return r.createExamWithinLimit(e, "exam_pack_id = ?", packID, limit)
}

// createExamWithinLimit inserts the exam only if the current count for the
// given quota scope is below limit. An advisory lock serialises concurrent
// requests for the same scope so they cannot both pass the quota check.
func (r *PostgresExamRepository) createExamWithinLimit(e *exam.Exam, scope string, scopeID int, limit int) (bool, error) {
	created := false

	err := r.db.Transaction(func(tx *gorm.DB) error {
		if err := tx.Exec("SELECT pg_advisory_xact_lock(?)", int64(scopeID)).Error; err != nil {
			return err
		}

		if limit >= 0 {
			var count int64
			if err := tx.Model(&exam.Exam{}).Where(scope, scopeID).Count(&count).Error; err != nil {
				return err
			}
			if count >= int64(limit) {
				return nil
			}
		}

		if err := tx.Select("*").Omit("created_at", "updated_at").Create(e).Error; err != nil {
			return err
		}
		created = true
		return nil
	})

	if err != nil {
		return false, err
	}
	return created, nil
}

func (r *PostgresExamRepository) UpdateExam(e *exam.Exam) error {
	return r.db.Model(&exam.Exam{}).
		Where("id = ?", e.ID).
		Select(
			"name", "start_date", "end_date", "level", "batch", "total_marks",
			"passing_marks", "per_question_marks", "negative_marks", "is_private",
			"passcode", "duration_minutes", "randomization", "feedback", "updated_at",
		).
		Updates(e).Error
}

func (r *PostgresExamRepository) DeleteExam(id string) error {
	return r.db.Delete(&exam.Exam{}, "id = ?", id).Error
}

func (r *PostgresExamRepository) CountExamsByCreator(creatorID int) (int, error) {
	var count int64
	err := r.db.Model(&exam.Exam{}).Where("created_by = ?", creatorID).Count(&count).Error
	return int(count), err
}

func (r *PostgresExamRepository) CountAllQuestions() (int, error) {
	var count int64
	err := r.db.Model(&exam.Question{}).Count(&count).Error
	return int(count), err
}

func (r *PostgresExamRepository) GetQuestionsByExamID(examID string) ([]exam.Question, error) {
	questions := []exam.Question{}
	err := r.db.Model(&exam.Question{}).
		Where("exam_id = ?", examID).
		Order("id ASC").
		Find(&questions).Error
	if err != nil {
		return nil, err
	}
	return questions, nil
}

func (r *PostgresExamRepository) GetQuestionByID(id int) (*exam.Question, error) {
	var q exam.Question
	err := r.db.First(&q, id).Error
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, nil
		}
		return nil, err
	}
	return &q, nil
}

func (r *PostgresExamRepository) CreateQuestion(q *exam.Question) error {
	return r.db.Create(q).Error
}

func (r *PostgresExamRepository) UpdateQuestion(q *exam.Question) error {
	return r.db.Model(&exam.Question{}).
		Where("id = ?", q.ID).
		Select("type", "question_text", "options", "correct_answer", "passage", "picture_url").
		Updates(q).Error
}

func (r *PostgresExamRepository) DeleteQuestion(id int) error {
	return r.db.Delete(&exam.Question{}, id).Error
}
