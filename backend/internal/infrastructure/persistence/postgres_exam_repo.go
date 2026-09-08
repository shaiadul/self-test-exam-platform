package persistence

import (
	"database/sql"
	"errors"
	"time"

	"github.com/lib/pq"
	"github.com/selftest/backend/internal/domain/exam"
)

type PostgresExamRepository struct {
	db *sql.DB
}

func NewPostgresExamRepository(db *sql.DB) *PostgresExamRepository {
	return &PostgresExamRepository{db: db}
}

func (r *PostgresExamRepository) GetExamsByPackID(packID int) ([]exam.Exam, error) {
	query := `
		SELECT id, exam_pack_id, name, start_date, end_date, level, batch, total_marks, passing_marks, per_question_marks, negative_marks, COALESCE(is_private, false), COALESCE(passcode, ''), COALESCE(duration_minutes, 30), created_at, updated_at
		FROM exams
		WHERE exam_pack_id = $1
		ORDER BY start_date ASC`

	rows, err := r.db.Query(query, packID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var exams []exam.Exam
	for rows.Next() {
		var e exam.Exam
		err := rows.Scan(
			&e.ID,
			&e.ExamPackID,
			&e.Name,
			&e.StartDate,
			&e.EndDate,
			&e.Level,
			&e.Batch,
			&e.TotalMarks,
			&e.PassingMarks,
			&e.PerQuestionMarks,
			&e.NegativeMarks,
			&e.IsPrivate,
			&e.Passcode,
			&e.DurationMinutes,
			&e.CreatedAt,
			&e.UpdatedAt,
		)
		if err != nil {
			return nil, err
		}
		exams = append(exams, e)
	}

	return exams, nil
}

func (r *PostgresExamRepository) GetExamByID(id string) (*exam.Exam, error) {
	query := `
		SELECT id, exam_pack_id, name, start_date, end_date, level, batch, total_marks, passing_marks, per_question_marks, negative_marks, COALESCE(is_private, false), COALESCE(passcode, ''), COALESCE(duration_minutes, 30), created_at, updated_at
		FROM exams
		WHERE id = $1`

	var e exam.Exam
	err := r.db.QueryRow(query, id).Scan(
		&e.ID,
		&e.ExamPackID,
		&e.Name,
		&e.StartDate,
		&e.EndDate,
		&e.Level,
		&e.Batch,
		&e.TotalMarks,
		&e.PassingMarks,
		&e.PerQuestionMarks,
		&e.NegativeMarks,
		&e.IsPrivate,
		&e.Passcode,
		&e.DurationMinutes,
		&e.CreatedAt,
		&e.UpdatedAt,
	)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, nil
		}
		return nil, err
	}

	return &e, nil
}

func (r *PostgresExamRepository) GetUpcomingExamsForUser(userID int, now time.Time) ([]exam.Exam, error) {
	query := `
		SELECT e.id, e.exam_pack_id, e.name, e.start_date, e.end_date, e.level, e.batch, e.total_marks, e.passing_marks, e.per_question_marks, e.negative_marks, COALESCE(e.is_private, false), COALESCE(e.passcode, ''), COALESCE(e.duration_minutes, 30), e.created_at, e.updated_at
		FROM exams e
		LEFT JOIN exam_attempts a ON e.id = a.exam_id AND a.user_id = $1
		WHERE a.id IS NULL AND e.end_date > $2
		ORDER BY e.start_date ASC
		LIMIT 5`

	rows, err := r.db.Query(query, userID, now)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var exams []exam.Exam
	for rows.Next() {
		var e exam.Exam
		err := rows.Scan(
			&e.ID,
			&e.ExamPackID,
			&e.Name,
			&e.StartDate,
			&e.EndDate,
			&e.Level,
			&e.Batch,
			&e.TotalMarks,
			&e.PassingMarks,
			&e.PerQuestionMarks,
			&e.NegativeMarks,
			&e.IsPrivate,
			&e.Passcode,
			&e.DurationMinutes,
			&e.CreatedAt,
			&e.UpdatedAt,
		)
		if err != nil {
			return nil, err
		}
		exams = append(exams, e)
	}

	return exams, nil
}

func (r *PostgresExamRepository) CreateExam(e *exam.Exam) error {
	query := `
		INSERT INTO exams (id, exam_pack_id, name, start_date, end_date, level, batch, total_marks, passing_marks, per_question_marks, negative_marks, is_private, passcode, duration_minutes, created_at, updated_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)`

	now := time.Now()
	e.CreatedAt = now
	e.UpdatedAt = now

	_, err := r.db.Exec(
		query,
		e.ID,
		e.ExamPackID,
		e.Name,
		e.StartDate,
		e.EndDate,
		e.Level,
		e.Batch,
		e.TotalMarks,
		e.PassingMarks,
		e.PerQuestionMarks,
		e.NegativeMarks,
		e.IsPrivate,
		e.Passcode,
		e.DurationMinutes,
		e.CreatedAt,
		e.UpdatedAt,
	)
	return err
}

func (r *PostgresExamRepository) UpdateExam(e *exam.Exam) error {
	query := `
		UPDATE exams
		SET name = $1, start_date = $2, end_date = $3, level = $4, batch = $5, total_marks = $6, passing_marks = $7, per_question_marks = $8, negative_marks = $9, is_private = $10, passcode = $11, duration_minutes = $12, updated_at = $13
		WHERE id = $14`

	e.UpdatedAt = time.Now()
	_, err := r.db.Exec(
		query,
		e.Name,
		e.StartDate,
		e.EndDate,
		e.Level,
		e.Batch,
		e.TotalMarks,
		e.PassingMarks,
		e.PerQuestionMarks,
		e.NegativeMarks,
		e.IsPrivate,
		e.Passcode,
		e.DurationMinutes,
		e.UpdatedAt,
		e.ID,
	)
	return err
}

func (r *PostgresExamRepository) DeleteExam(id string) error {
	_, err := r.db.Exec("DELETE FROM exams WHERE id = $1", id)
	return err
}

func (r *PostgresExamRepository) GetQuestionsByExamID(examID string) ([]exam.Question, error) {
	query := `
		SELECT id, exam_id, type, question_text, options, correct_answer, passage, picture_url, created_at
		FROM questions
		WHERE exam_id = $1
		ORDER BY id ASC`

	rows, err := r.db.Query(query, examID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var questions []exam.Question
	for rows.Next() {
		var q exam.Question
		var optSlice []string
		err := rows.Scan(
			&q.ID,
			&q.ExamID,
			&q.Type,
			&q.QuestionText,
			pq.Array(&optSlice),
			&q.CorrectAnswer,
			&q.Passage,
			&q.PictureURL,
			&q.CreatedAt,
		)
		if err != nil {
			return nil, err
		}
		q.Options = optSlice
		questions = append(questions, q)
	}

	return questions, nil
}

func (r *PostgresExamRepository) CreateQuestion(q *exam.Question) error {
	query := `
		INSERT INTO questions (exam_id, type, question_text, options, correct_answer, passage, picture_url, created_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
		RETURNING id`

	q.CreatedAt = time.Now()
	return r.db.QueryRow(
		query,
		q.ExamID,
		q.Type,
		q.QuestionText,
		pq.Array(q.Options),
		q.CorrectAnswer,
		q.Passage,
		q.PictureURL,
		q.CreatedAt,
	).Scan(&q.ID)
}
