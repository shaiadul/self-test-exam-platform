package persistence

import (
	"database/sql"
	"errors"
	"time"

	"github.com/selftest/backend/internal/domain/exampack"
)

type PostgresExamPackRepository struct {
	db *sql.DB
}

func NewPostgresExamPackRepository(db *sql.DB) *PostgresExamPackRepository {
	return &PostgresExamPackRepository{db: db}
}

func (r *PostgresExamPackRepository) GetExamPacks() ([]exampack.ExamPack, error) {
	query := `
		SELECT id, title, description, category, image, created_at, updated_at
		FROM exam_packs
		ORDER BY created_at DESC`

	rows, err := r.db.Query(query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var packs []exampack.ExamPack
	for rows.Next() {
		var p exampack.ExamPack
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

func (r *PostgresExamPackRepository) GetExamPackByID(id int) (*exampack.ExamPack, error) {
	query := `
		SELECT id, title, description, category, image, created_at, updated_at
		FROM exam_packs
		WHERE id = $1`

	var p exampack.ExamPack
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

	r.db.QueryRow("SELECT COUNT(*) FROM exams WHERE exam_pack_id = $1", p.ID).Scan(&p.TotalExams)

	return &p, nil
}

func (r *PostgresExamPackRepository) CreateExamPack(pack *exampack.ExamPack) error {
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

func (r *PostgresExamPackRepository) UpdateExamPack(pack *exampack.ExamPack) error {
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

func (r *PostgresExamPackRepository) DeleteExamPack(id int) error {
	_, err := r.db.Exec("DELETE FROM exam_packs WHERE id = $1", id)
	return err
}
