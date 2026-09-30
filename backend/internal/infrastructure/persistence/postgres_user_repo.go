package persistence

import (
	"errors"

	"gorm.io/gorm"

	"github.com/selftest/backend/internal/domain/user"
)

type PostgresUserRepository struct {
	db *gorm.DB
}

func NewPostgresUserRepository(db *gorm.DB) *PostgresUserRepository {
	return &PostgresUserRepository{db: db}
}

func (r *PostgresUserRepository) Create(u *user.User) error {
	if u.Role == "" {
		u.Role = "student"
	}
	return r.db.Create(u).Error
}

func (r *PostgresUserRepository) GetByEmail(email string) (*user.User, error) {
	var u user.User
	err := r.db.Where("email = ?", email).First(&u).Error
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, nil // Not found, no error
		}
		return nil, err
	}
	return &u, nil
}

func (r *PostgresUserRepository) GetByID(id int) (*user.User, error) {
	var u user.User
	err := r.db.First(&u, id).Error
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, nil // Not found
		}
		return nil, err
	}
	return &u, nil
}

func (r *PostgresUserRepository) GetByProviderAndID(provider, providerID string) (*user.User, error) {
	var u user.User
	err := r.db.Where("provider = ? AND provider_id = ?", provider, providerID).First(&u).Error
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, nil
		}
		return nil, err
	}
	return &u, nil
}

func (r *PostgresUserRepository) LinkSocialAccount(userID int, provider, providerID string, image *string) error {
	updates := map[string]interface{}{
		"provider":    provider,
		"provider_id": providerID,
	}
	if image != nil && *image != "" {
		updates["image"] = *image
	}
	return r.db.Model(&user.User{}).Where("id = ?", userID).Updates(updates).Error
}

func (r *PostgresUserRepository) GetRoleByID(id int) (string, error) {
	var role string
	err := r.db.Model(&user.User{}).Where("id = ?", id).Pluck("role", &role).Error
	if err != nil {
		return "", err
	}
	return role, nil
}

func (r *PostgresUserRepository) GetSummaryByID(id int) (*user.UserSummary, error) {
	var s user.UserSummary
	res := r.db.Model(&user.User{}).
		Select("id, name, role, institution, exam_limit, exam_pack_limit").
		Where("id = ?", id).
		Scan(&s)
	if res.Error != nil {
		return nil, res.Error
	}
	if res.RowsAffected == 0 {
		return nil, nil
	}
	return &s, nil
}

func (r *PostgresUserRepository) GetSummariesByIDs(ids []int) (map[int]user.UserSummary, error) {
	result := map[int]user.UserSummary{}
	if len(ids) == 0 {
		return result, nil
	}

	var summaries []user.UserSummary
	if err := r.db.Model(&user.User{}).
		Select("id, name, role, institution, exam_limit, exam_pack_limit").
		Where("id IN ?", ids).
		Scan(&summaries).Error; err != nil {
		return nil, err
	}

	for _, s := range summaries {
		result[s.ID] = s
	}
	return result, nil
}

func (r *PostgresUserRepository) Update(u *user.User) error {
	return r.db.Model(&user.User{}).
		Where("id = ?", u.ID).
		Select(
			"name", "image", "phone", "level", "batch", "board",
			"institution", "address", "subject", "designation",
			"admin_tier", "admin_dept", "admin_base", "updated_at",
		).
		Updates(u).Error
}

func (r *PostgresUserRepository) GetAll() ([]user.User, error) {
	var users []user.User

	err := r.db.Table("users AS u").
		Select(`
			u.id, u.name, u.email, u.role, u.image, u.phone, u.level, u.batch, u.board,
			u.institution, u.address, u.subject, u.designation, u.admin_tier, u.admin_dept,
			u.admin_base, u.exam_limit, u.exam_pack_limit,
			COALESCE(COUNT(e.id), 0)::int AS created_exams_count,
			(SELECT COUNT(*) FROM exam_packs p WHERE p.created_by = u.id)::int AS created_packs_count,
			u.created_at, u.updated_at`).
		Joins("LEFT JOIN exams e ON e.created_by = u.id").
		Group("u.id").
		Order("u.id ASC").
		Scan(&users).Error
	if err != nil {
		return nil, err
	}

	return users, nil
}

func (r *PostgresUserRepository) UpdateRole(id int, role string) error {
	return r.db.Model(&user.User{}).Where("id = ?", id).Update("role", role).Error
}

func (r *PostgresUserRepository) UpdateRoleAndLimit(id int, role *string, examLimit *int) error {
	switch {
	case role != nil && examLimit != nil:
		return r.db.Model(&user.User{}).Where("id = ?", id).
			Updates(map[string]interface{}{"role": *role, "exam_limit": *examLimit}).Error
	case role != nil:
		return r.UpdateRole(id, *role)
	case examLimit != nil:
		return r.db.Model(&user.User{}).Where("id = ?", id).Update("exam_limit", *examLimit).Error
	}
	return nil
}

func (r *PostgresUserRepository) UpdateExamPackLimit(id int, limit int) error {
	return r.db.Model(&user.User{}).Where("id = ?", id).Update("exam_pack_limit", limit).Error
}

func (r *PostgresUserRepository) Delete(id int) error {
	return r.db.Delete(&user.User{}, id).Error
}

func (r *PostgresUserRepository) GetUserCountByRole(role string) (int, error) {
	var count int64
	err := r.db.Model(&user.User{}).Where("role = ?", role).Count(&count).Error
	return int(count), err
}

func (r *PostgresUserRepository) CountIncompleteTeachers() (int, error) {
	var count int64
	err := r.db.Model(&user.User{}).
		Where("role = 'teacher' AND (subject IS NULL OR subject = '')").
		Count(&count).Error
	return int(count), err
}

func (r *PostgresUserRepository) GetStudentRank(userID int) (int, error) {
	// If the student has no completed attempts, they are unranked (rank = 0)
	var attemptCount int64
	if err := r.db.Table("exam_attempts").Where("user_id = ?", userID).Count(&attemptCount).Error; err != nil {
		return 0, err
	}
	if attemptCount == 0 {
		return 0, nil
	}

	// Rank = number of students with a higher average final_score + 1
	query := `
		SELECT COUNT(DISTINCT ea2.user_id) + 1
		FROM (
			SELECT user_id, AVG(final_score) AS avg_score
			FROM exam_attempts
			GROUP BY user_id
		) ea2
		WHERE ea2.avg_score > (
			SELECT AVG(final_score)
			FROM exam_attempts
			WHERE user_id = $1
		)`

	var rank int
	if err := r.db.Raw(query, userID).Scan(&rank).Error; err != nil {
		return 0, err
	}
	return rank, nil
}

func (r *PostgresUserRepository) GetStudentInstitutionRank(userID int, institution string) (int, error) {
	if institution == "" {
		return 0, nil
	}

	var attemptCount int64
	if err := r.db.Table("exam_attempts").Where("user_id = ?", userID).Count(&attemptCount).Error; err != nil {
		return 0, err
	}
	if attemptCount == 0 {
		return 0, nil
	}

	// Institution Rank = number of students within same institution with a higher average final_score + 1
	query := `
		SELECT COUNT(DISTINCT ea2.user_id) + 1
		FROM (
			SELECT ea.user_id, AVG(ea.final_score) AS avg_score
			FROM exam_attempts ea
			JOIN users u ON u.id = ea.user_id
			WHERE LOWER(TRIM(u.institution)) = LOWER(TRIM($2))
			GROUP BY ea.user_id
		) ea2
		WHERE ea2.avg_score > (
			SELECT AVG(final_score)
			FROM exam_attempts
			WHERE user_id = $1
		)`

	var rank int
	if err := r.db.Raw(query, userID, institution).Scan(&rank).Error; err != nil {
		return 0, err
	}
	return rank, nil
}
