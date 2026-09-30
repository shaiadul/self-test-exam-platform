package persistence

import (
	"errors"

	"gorm.io/gorm"

	"github.com/selftest/backend/internal/domain/exampack"
)

type PostgresExamPackRepository struct {
	db *gorm.DB
}

func NewPostgresExamPackRepository(db *gorm.DB) *PostgresExamPackRepository {
	return &PostgresExamPackRepository{db: db}
}

const packColumns = `id, title, description, category, image, COALESCE(exam_limit, 6) AS exam_limit, created_by, created_at, updated_at, (SELECT COUNT(*) FROM exams e WHERE e.exam_pack_id = exam_packs.id) AS total_exams`

func (r *PostgresExamPackRepository) queryPacks(creatorID *int) ([]exampack.ExamPack, error) {
	packs := []exampack.ExamPack{}

	q := r.db.Table("exam_packs").Select(packColumns).Order("created_at DESC")
	if creatorID != nil {
		q = q.Where("created_by = ?", *creatorID)
	}

	if err := q.Scan(&packs).Error; err != nil {
		return nil, err
	}
	return packs, nil
}

func (r *PostgresExamPackRepository) GetExamPacks() ([]exampack.ExamPack, error) {
	return r.queryPacks(nil)
}

func (r *PostgresExamPackRepository) GetExamPacksByCreator(creatorID int) ([]exampack.ExamPack, error) {
	return r.queryPacks(&creatorID)
}

func (r *PostgresExamPackRepository) GetExamPackByID(id int) (*exampack.ExamPack, error) {
	var p exampack.ExamPack
	err := r.db.Table("exam_packs").
		Select(packColumns).
		Where("id = ?", id).
		First(&p).Error
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, nil
		}
		return nil, err
	}
	return &p, nil
}

func (r *PostgresExamPackRepository) GetExamPacksByIDs(ids []int) (map[int]exampack.ExamPack, error) {
	result := map[int]exampack.ExamPack{}
	if len(ids) == 0 {
		return result, nil
	}

	var packs []exampack.ExamPack
	if err := r.db.Table("exam_packs").
		Select(packColumns).
		Where("id IN ?", ids).
		Scan(&packs).Error; err != nil {
		return nil, err
	}

	for _, p := range packs {
		result[p.ID] = p
	}
	return result, nil
}

func (r *PostgresExamPackRepository) CountExamPacksByCreator(creatorID int) (int, error) {
	var count int64
	err := r.db.Model(&exampack.ExamPack{}).Where("created_by = ?", creatorID).Count(&count).Error
	return int(count), err
}

func (r *PostgresExamPackRepository) CreateExamPack(pack *exampack.ExamPack) error {
	if pack.ExamLimit <= 0 {
		pack.ExamLimit = exampack.DefaultExamLimit
	}
	return r.db.Create(pack).Error
}

func (r *PostgresExamPackRepository) CreateExamPackWithinLimit(pack *exampack.ExamPack, creatorID int, limit int) (bool, error) {
	created := false

	err := r.db.Transaction(func(tx *gorm.DB) error {
		// Serialize pack creation for this creator so concurrent requests cannot
		// both pass the quota check and overshoot the limit.
		if err := tx.Exec("SELECT pg_advisory_xact_lock(?)", int64(creatorID)).Error; err != nil {
			return err
		}

		if limit >= 0 {
			var count int64
			if err := tx.Model(&exampack.ExamPack{}).Where("created_by = ?", creatorID).Count(&count).Error; err != nil {
				return err
			}
			if count >= int64(limit) {
				return nil
			}
		}

		if pack.ExamLimit <= 0 {
			pack.ExamLimit = exampack.DefaultExamLimit
		}
		if err := tx.Create(pack).Error; err != nil {
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

func (r *PostgresExamPackRepository) UpdateExamPack(pack *exampack.ExamPack) error {
	return r.db.Model(&exampack.ExamPack{}).
		Where("id = ?", pack.ID).
		Select("title", "description", "category", "image", "updated_at").
		Updates(pack).Error
}

func (r *PostgresExamPackRepository) UpdateExamPackLimit(id int, limit int) error {
	return r.db.Model(&exampack.ExamPack{}).Where("id = ?", id).Update("exam_limit", limit).Error
}

func (r *PostgresExamPackRepository) DeleteExamPack(id int) error {
	return r.db.Delete(&exampack.ExamPack{}, id).Error
}
