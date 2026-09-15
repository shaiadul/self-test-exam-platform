package persistence

import (
	"gorm.io/gorm"

	"github.com/selftest/backend/internal/domain/report"
)

type PostgresReportRepository struct {
	db *gorm.DB
}

func NewPostgresReportRepository(db *gorm.DB) *PostgresReportRepository {
	return &PostgresReportRepository{db: db}
}

func (r *PostgresReportRepository) GetAnalysisStats() (*report.ExamAnalysisStats, error) {
	var stats struct {
		TotalExams    int64
		TotalPacks    int64
		TotalStudents int64
		TotalTeachers int64
	}

	err := r.db.Raw(`
		SELECT
			(SELECT COUNT(*) FROM exams) AS total_exams,
			(SELECT COUNT(*) FROM exam_packs) AS total_packs,
			(SELECT COUNT(*) FROM users WHERE role = 'student') AS total_students,
			(SELECT COUNT(*) FROM users WHERE role = 'teacher') AS total_teachers`).
		Scan(&stats).Error
	if err != nil {
		return nil, err
	}

	return &report.ExamAnalysisStats{
		TotalExams:    int(stats.TotalExams),
		TotalStudents: int(stats.TotalStudents),
		TotalPacks:    int(stats.TotalPacks),
		TotalTeachers: int(stats.TotalTeachers),
	}, nil
}
