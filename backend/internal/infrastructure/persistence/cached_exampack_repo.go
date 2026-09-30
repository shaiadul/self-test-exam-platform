package persistence

import (
	"context"
	"fmt"

	"github.com/selftest/backend/internal/domain/exampack"
	"github.com/selftest/backend/internal/infrastructure/cache"
)

type CachedExamPackRepository struct {
	repo  exampack.ExamPackRepository
	cache cache.CacheService
}

func NewCachedExamPackRepository(repo exampack.ExamPackRepository, cache cache.CacheService) *CachedExamPackRepository {
	return &CachedExamPackRepository{
		repo:  repo,
		cache: cache,
	}
}

func (r *CachedExamPackRepository) invalidatePacks(creatorID *int) {
	ctx := context.Background()
	_ = r.cache.Delete(ctx, "exampack:all")
	if creatorID != nil && *creatorID > 0 {
		_ = r.cache.Delete(ctx, fmt.Sprintf("exampack:creator:%d", *creatorID))
	} else {
		_ = r.cache.DeleteByPattern(ctx, "exampack:creator:*")
	}
	_ = r.cache.DeleteByPattern(ctx, "reports:stats:*")
}

func (r *CachedExamPackRepository) GetExamPacks() ([]exampack.ExamPack, error) {
	ctx := context.Background()
	const key = "exampack:all"

	var packs []exampack.ExamPack
	hit, _ := r.cache.Get(ctx, key, &packs)
	if hit {
		return packs, nil
	}

	freshPacks, err := r.repo.GetExamPacks()
	if err != nil {
		return nil, err
	}

	_ = r.cache.Set(ctx, key, freshPacks, cache.DefaultPackTTL)
	return freshPacks, nil
}

func (r *CachedExamPackRepository) GetExamPacksByCreator(creatorID int) ([]exampack.ExamPack, error) {
	ctx := context.Background()
	key := fmt.Sprintf("exampack:creator:%d", creatorID)

	var packs []exampack.ExamPack
	hit, _ := r.cache.Get(ctx, key, &packs)
	if hit {
		return packs, nil
	}

	freshPacks, err := r.repo.GetExamPacksByCreator(creatorID)
	if err != nil {
		return nil, err
	}

	_ = r.cache.Set(ctx, key, freshPacks, cache.DefaultPackTTL)
	return freshPacks, nil
}

func (r *CachedExamPackRepository) GetExamPackByID(id int) (*exampack.ExamPack, error) {
	ctx := context.Background()
	key := fmt.Sprintf("exampack:id:%d", id)

	var pack exampack.ExamPack
	hit, _ := r.cache.Get(ctx, key, &pack)
	if hit && pack.ID != 0 {
		return &pack, nil
	}

	freshPack, err := r.repo.GetExamPackByID(id)
	if err != nil {
		return nil, err
	}
	if freshPack == nil {
		return nil, nil
	}

	_ = r.cache.Set(ctx, key, freshPack, cache.DefaultPackTTL)
	return freshPack, nil
}

func (r *CachedExamPackRepository) GetExamPacksByIDs(ids []int) (map[int]exampack.ExamPack, error) {
	return r.repo.GetExamPacksByIDs(ids)
}

func (r *CachedExamPackRepository) CountExamPacksByCreator(creatorID int) (int, error) {
	return r.repo.CountExamPacksByCreator(creatorID)
}

func (r *CachedExamPackRepository) CreateExamPack(pack *exampack.ExamPack) error {
	err := r.repo.CreateExamPack(pack)
	if err == nil {
		r.invalidatePacks(pack.CreatedBy)
	}
	return err
}

func (r *CachedExamPackRepository) CreateExamPackWithinLimit(pack *exampack.ExamPack, creatorID int, limit int) (bool, error) {
	created, err := r.repo.CreateExamPackWithinLimit(pack, creatorID, limit)
	if err == nil && created {
		r.invalidatePacks(&creatorID)
	}
	return created, err
}

func (r *CachedExamPackRepository) UpdateExamPack(pack *exampack.ExamPack) error {
	err := r.repo.UpdateExamPack(pack)
	if err == nil {
		ctx := context.Background()
		_ = r.cache.Delete(ctx, fmt.Sprintf("exampack:id:%d", pack.ID))
		r.invalidatePacks(pack.CreatedBy)
	}
	return err
}

func (r *CachedExamPackRepository) UpdateExamPackLimit(id int, limit int) error {
	err := r.repo.UpdateExamPackLimit(id, limit)
	if err == nil {
		ctx := context.Background()
		_ = r.cache.Delete(ctx, fmt.Sprintf("exampack:id:%d", id))
		r.invalidatePacks(nil)
	}
	return err
}

func (r *CachedExamPackRepository) DeleteExamPack(id int) error {
	err := r.repo.DeleteExamPack(id)
	if err == nil {
		ctx := context.Background()
		_ = r.cache.Delete(ctx,
			fmt.Sprintf("exampack:id:%d", id),
			fmt.Sprintf("exam:pack:%d", id),
		)
		r.invalidatePacks(nil)
	}
	return err
}
