package persistence

import (
	"database/sql"

	"github.com/selftest/backend/internal/domain/report"
)

type PostgresReportRepository struct {
	db *sql.DB
}

func NewPostgresReportRepository(db *sql.DB) *PostgresReportRepository {
	return &PostgresReportRepository{db: db}
}

func (r *PostgresReportRepository) GetAnalysisStats() (*report.ExamAnalysisStats, error) {
	var totalExams, totalStudents, totalPacks, totalTeachers int

	err := r.db.QueryRow(`
		SELECT
			(SELECT COUNT(*) FROM exams),
			(SELECT COUNT(*) FROM exam_packs),
			(SELECT COUNT(*) FROM users WHERE role = 'student'),
			(SELECT COUNT(*) FROM users WHERE role = 'teacher')`,
	).Scan(&totalExams, &totalPacks, &totalStudents, &totalTeachers)
	if err != nil {
		return nil, err
	}

	return &report.ExamAnalysisStats{
		TotalExams:    totalExams,
		TotalStudents: totalStudents,
		TotalPacks:    totalPacks,
		TotalTeachers: totalTeachers,
	}, nil
}
