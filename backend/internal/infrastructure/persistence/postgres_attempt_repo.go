package persistence

import (
	"errors"

	"gorm.io/gorm"

	"github.com/selftest/backend/internal/domain/attempt"
)

type PostgresAttemptRepository struct {
	db *gorm.DB
}

func NewPostgresAttemptRepository(db *gorm.DB) *PostgresAttemptRepository {
	return &PostgresAttemptRepository{db: db}
}

func (r *PostgresAttemptRepository) CreateExamAttempt(a *attempt.ExamAttempt) error {
	return r.db.Create(a).Error
}

func (r *PostgresAttemptRepository) GetExamAttemptsByUserID(userID int) ([]attempt.ExamAttempt, error) {
	attempts := []attempt.ExamAttempt{}
	err := r.db.Model(&attempt.ExamAttempt{}).
		Where("user_id = ?", userID).
		Order("created_at DESC").
		Find(&attempts).Error
	if err != nil {
		return nil, err
	}
	return attempts, nil
}

func (r *PostgresAttemptRepository) GetExamAttemptsByExamID(examID string) ([]attempt.ExamAttempt, error) {
	attempts := []attempt.ExamAttempt{}
	err := r.db.Model(&attempt.ExamAttempt{}).
		Where("exam_id = ?", examID).
		Order("created_at DESC").
		Find(&attempts).Error
	if err != nil {
		return nil, err
	}
	return attempts, nil
}

func (r *PostgresAttemptRepository) GetExamAttemptStatsByExamIDs(examIDs []string) (map[string]attempt.ExamAttemptStats, error) {
	stats := map[string]attempt.ExamAttemptStats{}
	if len(examIDs) == 0 {
		return stats, nil
	}

	var rows []struct {
		ExamID  string
		Total   int
		Passed  int
		Highest float64
		Lowest  float64
		Sum     float64
	}

	err := r.db.Model(&attempt.ExamAttempt{}).
		Select(`
			exam_id,
			COUNT(*)::int AS total,
			COALESCE(SUM(CASE WHEN passed THEN 1 ELSE 0 END), 0)::int AS passed,
			COALESCE(MAX(final_score), 0) AS highest,
			COALESCE(MIN(final_score), 0) AS lowest,
			COALESCE(SUM(final_score), 0) AS sum`).
		Where("exam_id IN ?", examIDs).
		Group("exam_id").
		Scan(&rows).Error
	if err != nil {
		return nil, err
	}

	for _, row := range rows {
		stats[row.ExamID] = attempt.ExamAttemptStats{
			Total:   row.Total,
			Passed:  row.Passed,
			Highest: row.Highest,
			Lowest:  row.Lowest,
			Sum:     row.Sum,
		}
	}

	return stats, nil
}

func (r *PostgresAttemptRepository) GetAllExamAttempts() ([]attempt.ExamAttempt, error) {
	attempts := []attempt.ExamAttempt{}
	err := r.db.Model(&attempt.ExamAttempt{}).
		Order("created_at DESC").
		Find(&attempts).Error
	if err != nil {
		return nil, err
	}
	return attempts, nil
}

func (r *PostgresAttemptRepository) GetExamAttemptByID(id int) (*attempt.ExamAttempt, error) {
	var a attempt.ExamAttempt
	err := r.db.First(&a, id).Error
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, nil
		}
		return nil, err
	}
	return &a, nil
}
