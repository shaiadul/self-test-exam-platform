package persistence

import (
	"context"
	"fmt"

	"github.com/selftest/backend/internal/domain/user"
	"github.com/selftest/backend/internal/infrastructure/cache"
)

type CachedUserRepository struct {
	repo  user.UserRepository
	cache cache.CacheService
}

func NewCachedUserRepository(repo user.UserRepository, cache cache.CacheService) *CachedUserRepository {
	return &CachedUserRepository{
		repo:  repo,
		cache: cache,
	}
}

func (r *CachedUserRepository) invalidateUser(id int) {
	ctx := context.Background()
	_ = r.cache.Delete(ctx,
		fmt.Sprintf("user:id:%d", id),
		fmt.Sprintf("user:role:%d", id),
		fmt.Sprintf("user:summary:%d", id),
	)
}

func (r *CachedUserRepository) Create(u *user.User) error {
	return r.repo.Create(u)
}

func (r *CachedUserRepository) GetByEmail(email string) (*user.User, error) {
	return r.repo.GetByEmail(email)
}

func (r *CachedUserRepository) GetByID(id int) (*user.User, error) {
	ctx := context.Background()
	key := fmt.Sprintf("user:id:%d", id)

	var u user.User
	hit, _ := r.cache.Get(ctx, key, &u)
	if hit && u.ID != 0 {
		return &u, nil
	}

	freshUser, err := r.repo.GetByID(id)
	if err != nil {
		return nil, err
	}
	if freshUser == nil {
		return nil, nil
	}

	_ = r.cache.Set(ctx, key, freshUser, cache.DefaultUserTTL)
	return freshUser, nil
}

func (r *CachedUserRepository) GetByProviderAndID(provider, providerID string) (*user.User, error) {
	return r.repo.GetByProviderAndID(provider, providerID)
}

func (r *CachedUserRepository) LinkSocialAccount(userID int, provider, providerID string, image *string) error {
	err := r.repo.LinkSocialAccount(userID, provider, providerID, image)
	if err == nil {
		r.invalidateUser(userID)
	}
	return err
}

func (r *CachedUserRepository) GetRoleByID(id int) (string, error) {
	ctx := context.Background()
	key := fmt.Sprintf("user:role:%d", id)

	var role string
	hit, _ := r.cache.Get(ctx, key, &role)
	if hit && role != "" {
		return role, nil
	}

	freshRole, err := r.repo.GetRoleByID(id)
	if err != nil {
		return "", err
	}

	if freshRole != "" {
		_ = r.cache.Set(ctx, key, freshRole, cache.DefaultRoleTTL)
	}
	return freshRole, nil
}

func (r *CachedUserRepository) GetSummaryByID(id int) (*user.UserSummary, error) {
	ctx := context.Background()
	key := fmt.Sprintf("user:summary:%d", id)

	var s user.UserSummary
	hit, _ := r.cache.Get(ctx, key, &s)
	if hit && s.ID != 0 {
		return &s, nil
	}

	freshSummary, err := r.repo.GetSummaryByID(id)
	if err != nil {
		return nil, err
	}
	if freshSummary == nil {
		return nil, nil
	}

	_ = r.cache.Set(ctx, key, freshSummary, cache.DefaultUserTTL)
	return freshSummary, nil
}

func (r *CachedUserRepository) GetSummariesByIDs(ids []int) (map[int]user.UserSummary, error) {
	return r.repo.GetSummariesByIDs(ids)
}

func (r *CachedUserRepository) Update(u *user.User) error {
	err := r.repo.Update(u)
	if err == nil {
		r.invalidateUser(u.ID)
	}
	return err
}

func (r *CachedUserRepository) GetAll() ([]user.User, error) {
	return r.repo.GetAll()
}

func (r *CachedUserRepository) UpdateRole(id int, role string) error {
	err := r.repo.UpdateRole(id, role)
	if err == nil {
		r.invalidateUser(id)
	}
	return err
}

func (r *CachedUserRepository) UpdateRoleAndLimit(id int, role *string, examLimit *int) error {
	err := r.repo.UpdateRoleAndLimit(id, role, examLimit)
	if err == nil {
		r.invalidateUser(id)
	}
	return err
}

func (r *CachedUserRepository) UpdateExamPackLimit(id int, limit int) error {
	err := r.repo.UpdateExamPackLimit(id, limit)
	if err == nil {
		r.invalidateUser(id)
	}
	return err
}

func (r *CachedUserRepository) Delete(id int) error {
	err := r.repo.Delete(id)
	if err == nil {
		r.invalidateUser(id)
	}
	return err
}

func (r *CachedUserRepository) GetUserCountByRole(role string) (int, error) {
	return r.repo.GetUserCountByRole(role)
}

func (r *CachedUserRepository) CountIncompleteTeachers() (int, error) {
	return r.repo.CountIncompleteTeachers()
}

func (r *CachedUserRepository) GetStudentRank(userID int) (int, error) {
	return r.repo.GetStudentRank(userID)
}

func (r *CachedUserRepository) GetStudentInstitutionRank(userID int, institution string) (int, error) {
	return r.repo.GetStudentInstitutionRank(userID, institution)
}
