package repository

import (
	"database/sql"
	"errors"
	"time"

	"github.com/lib/pq"
	"github.com/selftest/backend/model"
)

type ExamRepository interface {
	GetExamPacks() ([]model.ExamPack, error)
	GetExamPackByID(id int) (*model.ExamPack, error)
	CreateExamPack(pack *model.ExamPack) error
	UpdateExamPack(pack *model.ExamPack) error
	DeleteExamPack(id int) error

	GetExamsByPackID(packID int) ([]model.Exam, error)
	GetExamByID(id string) (*model.Exam, error)
	CreateExam(exam *model.Exam) error
	UpdateExam(exam *model.Exam) error
	DeleteExam(id string) error

	GetQuestionsByExamID(examID string) ([]model.Question, error)
	CreateQuestion(question *model.Question) error

	CreateExamAttempt(attempt *model.ExamAttempt) error
	GetExamAttemptsByUserID(userID int) ([]model.ExamAttempt, error)
	GetExamAttemptsByExamID(examID string) ([]model.ExamAttempt, error)
	GetAllExamAttempts() ([]model.ExamAttempt, error)
	GetExamAttemptByID(id int) (*model.ExamAttempt, error)
	GetPermissions() ([]model.Permission, error)
	UpdatePermission(id int, access string) error

	GetSystemAssets() ([]model.SystemAsset, error)
	CreateSystemAsset(asset *model.SystemAsset) error
	DeleteSystemAsset(id int) error

	GetTransactions() ([]model.Transaction, error)
	GetFinancialSummary() (*model.FinancialSummary, error)
	CreateTransaction(tx *model.Transaction) error

	GetAnalysisStats() (*model.ExamAnalysisStats, error)
}

type SQLExamRepository struct {
	db *sql.DB
}

func NewSQLExamRepository(db *sql.DB) ExamRepository {
	return &SQLExamRepository{db: db}
}

func (r *SQLExamRepository) GetExamPacks() ([]model.ExamPack, error) {
	query := `
		SELECT id, title, description, category, image, created_at, updated_at
		FROM exam_packs
		ORDER BY created_at DESC`

	rows, err := r.db.Query(query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var packs []model.ExamPack
	for rows.Next() {
		var p model.ExamPack
		err := rows.Scan(
			&p.ID,
			&p.Title,
			&p.Description,
			&p.Category,
			&p.Image,
			&p.CreatedAt,
			&p.UpdatedAt,
		)
		if err != nil {
			return nil, err
		}

		// Calculate total exams
		r.db.QueryRow("SELECT COUNT(*) FROM exams WHERE exam_pack_id = $1", p.ID).Scan(&p.TotalExams)

		packs = append(packs, p)
	}

	return packs, nil
}

func (r *SQLExamRepository) GetExamPackByID(id int) (*model.ExamPack, error) {
	query := `
		SELECT id, title, description, category, image, created_at, updated_at
		FROM exam_packs
		WHERE id = $1`

	var p model.ExamPack
	err := r.db.QueryRow(query, id).Scan(
		&p.ID,
		&p.Title,
		&p.Description,
		&p.Category,
		&p.Image,
		&p.CreatedAt,
		&p.UpdatedAt,
	)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, nil
		}
		return nil, err
	}

	// Calculate total exams
	r.db.QueryRow("SELECT COUNT(*) FROM exams WHERE exam_pack_id = $1", p.ID).Scan(&p.TotalExams)

	return &p, nil
}

func (r *SQLExamRepository) CreateExamPack(pack *model.ExamPack) error {
	query := `
		INSERT INTO exam_packs (title, description, category, image, created_at, updated_at)
		VALUES ($1, $2, $3, $4, $5, $6)
		RETURNING id`

	now := time.Now()
	pack.CreatedAt = now
	pack.UpdatedAt = now

	return r.db.QueryRow(
		query,
		pack.Title,
		pack.Description,
		pack.Category,
		pack.Image,
		pack.CreatedAt,
		pack.UpdatedAt,
	).Scan(&pack.ID)
}

func (r *SQLExamRepository) UpdateExamPack(pack *model.ExamPack) error {
	query := `
		UPDATE exam_packs
		SET title = $1, description = $2, category = $3, image = $4, updated_at = $5
		WHERE id = $6`

	pack.UpdatedAt = time.Now()
	_, err := r.db.Exec(
		query,
		pack.Title,
		pack.Description,
		pack.Category,
		pack.Image,
		pack.UpdatedAt,
		pack.ID,
	)
	return err
}

func (r *SQLExamRepository) DeleteExamPack(id int) error {
	_, err := r.db.Exec("DELETE FROM exam_packs WHERE id = $1", id)
	return err
}

func (r *SQLExamRepository) GetExamsByPackID(packID int) ([]model.Exam, error) {
	query := `
		SELECT id, exam_pack_id, name, start_date, end_date, level, batch, total_marks, passing_marks, per_question_marks, negative_marks, created_at, updated_at
		FROM exams
		WHERE exam_pack_id = $1
		ORDER BY start_date ASC`

	rows, err := r.db.Query(query, packID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var exams []model.Exam
	for rows.Next() {
		var e model.Exam
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

func (r *SQLExamRepository) GetExamByID(id string) (*model.Exam, error) {
	query := `
		SELECT id, exam_pack_id, name, start_date, end_date, level, batch, total_marks, passing_marks, per_question_marks, negative_marks, created_at, updated_at
		FROM exams
		WHERE id = $1`

	var e model.Exam
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

func (r *SQLExamRepository) CreateExam(exam *model.Exam) error {
	query := `
		INSERT INTO exams (id, exam_pack_id, name, start_date, end_date, level, batch, total_marks, passing_marks, per_question_marks, negative_marks, created_at, updated_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)`

	now := time.Now()
	exam.CreatedAt = now
	exam.UpdatedAt = now

	_, err := r.db.Exec(
		query,
		exam.ID,
		exam.ExamPackID,
		exam.Name,
		exam.StartDate,
		exam.EndDate,
		exam.Level,
		exam.Batch,
		exam.TotalMarks,
		exam.PassingMarks,
		exam.PerQuestionMarks,
		exam.NegativeMarks,
		exam.CreatedAt,
		exam.UpdatedAt,
	)
	return err
}

func (r *SQLExamRepository) UpdateExam(exam *model.Exam) error {
	query := `
		UPDATE exams
		SET name = $1, start_date = $2, end_date = $3, level = $4, batch = $5, total_marks = $6, passing_marks = $7, per_question_marks = $8, negative_marks = $9, updated_at = $10
		WHERE id = $11`

	exam.UpdatedAt = time.Now()
	_, err := r.db.Exec(
		query,
		exam.Name,
		exam.StartDate,
		exam.EndDate,
		exam.Level,
		exam.Batch,
		exam.TotalMarks,
		exam.PassingMarks,
		exam.PerQuestionMarks,
		exam.NegativeMarks,
		exam.UpdatedAt,
		exam.ID,
	)
	return err
}

func (r *SQLExamRepository) DeleteExam(id string) error {
	_, err := r.db.Exec("DELETE FROM exams WHERE id = $1", id)
	return err
}

func (r *SQLExamRepository) GetQuestionsByExamID(examID string) ([]model.Question, error) {
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

	var questions []model.Question
	for rows.Next() {
		var q model.Question
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

func (r *SQLExamRepository) CreateQuestion(q *model.Question) error {
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

func (r *SQLExamRepository) CreateExamAttempt(attempt *model.ExamAttempt) error {
	query := `
		INSERT INTO exam_attempts (user_id, exam_id, answers, total, correct, wrong, negative, final_score, passed, warning_count, security_message, created_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
		RETURNING id`

	attempt.CreatedAt = time.Now()
	return r.db.QueryRow(
		query,
		attempt.UserID,
		attempt.ExamID,
		attempt.Answers,
		attempt.Total,
		attempt.Correct,
		attempt.Wrong,
		attempt.Negative,
		attempt.FinalScore,
		attempt.Passed,
		attempt.WarningCount,
		attempt.SecurityMessage,
		attempt.CreatedAt,
	).Scan(&attempt.ID)
}

func (r *SQLExamRepository) GetExamAttemptsByUserID(userID int) ([]model.ExamAttempt, error) {
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

	var attempts []model.ExamAttempt
	for rows.Next() {
		var a model.ExamAttempt
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

func (r *SQLExamRepository) GetExamAttemptsByExamID(examID string) ([]model.ExamAttempt, error) {
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

	var attempts []model.ExamAttempt
	for rows.Next() {
		var a model.ExamAttempt
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

func (r *SQLExamRepository) GetAllExamAttempts() ([]model.ExamAttempt, error) {
	query := `
		SELECT id, user_id, exam_id, answers, total, correct, wrong, negative, final_score, passed, warning_count, security_message, created_at
		FROM exam_attempts
		ORDER BY created_at DESC`

	rows, err := r.db.Query(query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var attempts []model.ExamAttempt
	for rows.Next() {
		var a model.ExamAttempt
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

func (r *SQLExamRepository) GetExamAttemptByID(id int) (*model.ExamAttempt, error) {
	query := `
		SELECT id, user_id, exam_id, answers, total, correct, wrong, negative, final_score, passed, warning_count, security_message, created_at
		FROM exam_attempts
		WHERE id = $1`

	var a model.ExamAttempt
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

func (r *SQLExamRepository) GetPermissions() ([]model.Permission, error) {
	query := `SELECT id, role, module, access FROM permissions ORDER BY id ASC`
	rows, err := r.db.Query(query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var perms []model.Permission
	for rows.Next() {
		var p model.Permission
		if err := rows.Scan(&p.ID, &p.Role, &p.Module, &p.Access); err != nil {
			return nil, err
		}
		perms = append(perms, p)
	}
	return perms, nil
}

func (r *SQLExamRepository) UpdatePermission(id int, access string) error {
	query := `UPDATE permissions SET access = $1 WHERE id = $2`
	_, err := r.db.Exec(query, access, id)
	return err
}

func (r *SQLExamRepository) GetSystemAssets() ([]model.SystemAsset, error) {
	query := `SELECT id, type, value FROM system_assets ORDER BY id ASC`
	rows, err := r.db.Query(query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var assets []model.SystemAsset
	for rows.Next() {
		var a model.SystemAsset
		if err := rows.Scan(&a.ID, &a.Type, &a.Value); err != nil {
			return nil, err
		}
		assets = append(assets, a)
	}
	return assets, nil
}

func (r *SQLExamRepository) CreateSystemAsset(asset *model.SystemAsset) error {
	query := `INSERT INTO system_assets (type, value) VALUES ($1, $2) RETURNING id`
	return r.db.QueryRow(query, asset.Type, asset.Value).Scan(&asset.ID)
}

func (r *SQLExamRepository) DeleteSystemAsset(id int) error {
	_, err := r.db.Exec(`DELETE FROM system_assets WHERE id = $1`, id)
	return err
}

func (r *SQLExamRepository) GetTransactions() ([]model.Transaction, error) {
	query := `SELECT id, type, amount, description, created_at FROM transactions ORDER BY created_at DESC`
	rows, err := r.db.Query(query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var txs []model.Transaction
	for rows.Next() {
		var t model.Transaction
		if err := rows.Scan(&t.ID, &t.Type, &t.Amount, &t.Description, &t.CreatedAt); err != nil {
			return nil, err
		}
		txs = append(txs, t)
	}
	return txs, nil
}

func (r *SQLExamRepository) GetFinancialSummary() (*model.FinancialSummary, error) {
	var totalIncome, totalExpenditure float64

	err := r.db.QueryRow(`SELECT COALESCE(SUM(amount), 0) FROM transactions WHERE type = 'income'`).Scan(&totalIncome)
	if err != nil {
		return nil, err
	}

	err = r.db.QueryRow(`SELECT COALESCE(SUM(amount), 0) FROM transactions WHERE type = 'expenditure'`).Scan(&totalExpenditure)
	if err != nil {
		return nil, err
	}

	return &model.FinancialSummary{
		TotalIncome:      totalIncome,
		TotalExpenditure: totalExpenditure,
		NetIncome:        totalIncome - totalExpenditure,
	}, nil
}

func (r *SQLExamRepository) CreateTransaction(tx *model.Transaction) error {
	query := `INSERT INTO transactions (type, amount, description, created_at) VALUES ($1, $2, $3, $4) RETURNING id`
	if tx.CreatedAt.IsZero() {
		tx.CreatedAt = time.Now()
	}
	return r.db.QueryRow(query, tx.Type, tx.Amount, tx.Description, tx.CreatedAt).Scan(&tx.ID)
}

func (r *SQLExamRepository) GetAnalysisStats() (*model.ExamAnalysisStats, error) {
	var totalExams, totalStudents, totalPacks, totalTeachers int

	err := r.db.QueryRow(`SELECT COUNT(*) FROM exams`).Scan(&totalExams)
	if err != nil {
		return nil, err
	}

	err = r.db.QueryRow(`SELECT COUNT(*) FROM exam_packs`).Scan(&totalPacks)
	if err != nil {
		return nil, err
	}

	err = r.db.QueryRow(`SELECT COUNT(*) FROM users WHERE role = 'student'`).Scan(&totalStudents)
	if err != nil {
		return nil, err
	}

	err = r.db.QueryRow(`SELECT COUNT(*) FROM users WHERE role = 'teacher'`).Scan(&totalTeachers)
	if err != nil {
		return nil, err
	}

	return &model.ExamAnalysisStats{
		TotalExams:    totalExams,
		TotalStudents: totalStudents,
		TotalPacks:    totalPacks,
		TotalTeachers: totalTeachers,
	}, nil
}
