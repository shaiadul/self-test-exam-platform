package persistence

import (
	"database/sql"
	"errors"
	"time"

	"github.com/lib/pq"
	"github.com/selftest/backend/internal/domain/exampack"
)

type PostgresExamPackRepository struct {
	db *sql.DB
}

func NewPostgresExamPackRepository(db *sql.DB) *PostgresExamPackRepository {
	return &PostgresExamPackRepository{db: db}
}

const packColumns = `id, title, description, category, image, COALESCE(exam_limit, 6), created_by, created_at, updated_at`

func scanPack(row interface {
	Scan(dest ...interface{}) error
}) (*exampack.ExamPack, error) {
	var p exampack.ExamPack
	err := row.Scan(
		&p.ID,
		&p.Title,
		&p.Description,
		&p.Category,
		&p.Image,
		&p.ExamLimit,
		&p.CreatedBy,
		&p.CreatedAt,
		&p.UpdatedAt,
		&p.TotalExams,
	)
	if err != nil {
		return nil, err
	}
	return &p, nil
}

func (r *PostgresExamPackRepository) queryPacks(where string, args ...interface{}) ([]exampack.ExamPack, error) {
	query := `SELECT ` + packColumns + `, (SELECT COUNT(*) FROM exams e WHERE e.exam_pack_id = exam_packs.id) FROM exam_packs ` + where + ` ORDER BY created_at DESC`

	rows, err := r.db.Query(query, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	packs := []exampack.ExamPack{}
	for rows.Next() {
		p, err := scanPack(rows)
		if err != nil {
			return nil, err
		}
		packs = append(packs, *p)
	}

	return packs, rows.Err()
}

func (r *PostgresExamPackRepository) GetExamPacks() ([]exampack.ExamPack, error) {
	return r.queryPacks("")
}

func (r *PostgresExamPackRepository) GetExamPacksByCreator(creatorID int) ([]exampack.ExamPack, error) {
	return r.queryPacks("WHERE created_by = $1", creatorID)
}

func (r *PostgresExamPackRepository) GetExamPackByID(id int) (*exampack.ExamPack, error) {
	query := `SELECT ` + packColumns + `, (SELECT COUNT(*) FROM exams e WHERE e.exam_pack_id = exam_packs.id) FROM exam_packs WHERE id = $1`

	p, err := scanPack(r.db.QueryRow(query, id))
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, nil
		}
		return nil, err
	}

	return p, nil
}

func (r *PostgresExamPackRepository) GetExamPacksByIDs(ids []int) (map[int]exampack.ExamPack, error) {
	result := map[int]exampack.ExamPack{}
	if len(ids) == 0 {
		return result, nil
	}

	query := `SELECT ` + packColumns + `, (SELECT COUNT(*) FROM exams e WHERE e.exam_pack_id = exam_packs.id) FROM exam_packs WHERE id = ANY($1)`
	rows, err := r.db.Query(query, pq.Array(ids))
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	for rows.Next() {
		p, err := scanPack(rows)
		if err != nil {
			return nil, err
		}
		result[p.ID] = *p
	}
	return result, rows.Err()
}

func (r *PostgresExamPackRepository) CountExamPacksByCreator(creatorID int) (int, error) {
	var count int
	err := r.db.QueryRow("SELECT COUNT(*) FROM exam_packs WHERE created_by = $1", creatorID).Scan(&count)
	return count, err
}

func (r *PostgresExamPackRepository) CreateExamPack(pack *exampack.ExamPack) error {
	query := `
		INSERT INTO exam_packs (title, description, category, image, exam_limit, created_by, created_at, updated_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
		RETURNING id`

	now := time.Now()
	pack.CreatedAt = now
	pack.UpdatedAt = now
	if pack.ExamLimit <= 0 {
		pack.ExamLimit = exampack.DefaultExamLimit
	}

	return r.db.QueryRow(
		query,
		pack.Title,
		pack.Description,
		pack.Category,
		pack.Image,
		pack.ExamLimit,
		pack.CreatedBy,
		pack.CreatedAt,
		pack.UpdatedAt,
	).Scan(&pack.ID)
}

func (r *PostgresExamPackRepository) CreateExamPackWithinLimit(pack *exampack.ExamPack, creatorID int, limit int) (bool, error) {
	tx, err := r.db.Begin()
	if err != nil {
		return false, err
	}
	defer tx.Rollback()

	// Serialize pack creation for this creator so concurrent requests cannot
	// both pass the quota check and overshoot the limit.
	if _, err := tx.Exec("SELECT pg_advisory_xact_lock($1)", int64(creatorID)); err != nil {
		return false, err
	}

	if limit >= 0 {
		var count int
		if err := tx.QueryRow("SELECT COUNT(*) FROM exam_packs WHERE created_by = $1", creatorID).Scan(&count); err != nil {
			return false, err
		}
		if count >= limit {
			return false, nil
		}
	}

	now := time.Now()
	pack.CreatedAt = now
	pack.UpdatedAt = now
	if pack.ExamLimit <= 0 {
		pack.ExamLimit = exampack.DefaultExamLimit
	}

	err = tx.QueryRow(
		`INSERT INTO exam_packs (title, description, category, image, exam_limit, created_by, created_at, updated_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
		RETURNING id`,
		pack.Title,
		pack.Description,
		pack.Category,
		pack.Image,
		pack.ExamLimit,
		pack.CreatedBy,
		pack.CreatedAt,
		pack.UpdatedAt,
	).Scan(&pack.ID)
	if err != nil {
		return false, err
	}

	if err := tx.Commit(); err != nil {
		return false, err
	}

	return true, nil
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

func (r *PostgresExamPackRepository) UpdateExamPackLimit(id int, limit int) error {
	_, err := r.db.Exec("UPDATE exam_packs SET exam_limit = $1, updated_at = $2 WHERE id = $3", limit, time.Now(), id)
	return err
}

func (r *PostgresExamPackRepository) DeleteExamPack(id int) error {
	_, err := r.db.Exec("DELETE FROM exam_packs WHERE id = $1", id)
	return err
}
