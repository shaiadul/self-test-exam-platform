package persistence

import (
	"errors"
	"strings"

	"gorm.io/gorm"

	"github.com/selftest/backend/internal/domain/system"
)

type PostgresSystemRepository struct {
	db *gorm.DB
}

func NewPostgresSystemRepository(db *gorm.DB) *PostgresSystemRepository {
	return &PostgresSystemRepository{db: db}
}

func (r *PostgresSystemRepository) GetPermissions() ([]system.Permission, error) {
	perms := []system.Permission{}
	err := r.db.Model(&system.Permission{}).Order("id ASC").Find(&perms).Error
	if err != nil {
		return nil, err
	}
	return perms, nil
}

func (r *PostgresSystemRepository) UpdatePermission(id int, access string) error {
	return r.db.Model(&system.Permission{}).Where("id = ?", id).Update("access", access).Error
}

func (r *PostgresSystemRepository) GetSystemAssets() ([]system.SystemAsset, error) {
	assets := []system.SystemAsset{}
	err := r.db.Model(&system.SystemAsset{}).Order("id ASC").Find(&assets).Error
	if err != nil {
		return nil, err
	}
	return assets, nil
}

func (r *PostgresSystemRepository) CreateSystemAsset(asset *system.SystemAsset) error {
	return r.db.Create(asset).Error
}

func (r *PostgresSystemRepository) UpdateSystemAsset(id int, value string) error {
	return r.db.Model(&system.SystemAsset{}).Where("id = ?", id).Update("value", value).Error
}

func (r *PostgresSystemRepository) DeleteSystemAsset(id int) error {
	return r.db.Delete(&system.SystemAsset{}, id).Error
}

func (r *PostgresSystemRepository) GetTransactions() ([]system.Transaction, error) {
	txs := []system.Transaction{}
	err := r.db.Model(&system.Transaction{}).Order("created_at DESC").Find(&txs).Error
	if err != nil {
		return nil, err
	}
	return txs, nil
}

func (r *PostgresSystemRepository) GetFinancialSummary() (*system.FinancialSummary, error) {
	var summary struct {
		TotalIncome      float64
		TotalExpenditure float64
	}

	err := r.db.Model(&system.Transaction{}).
		Select(`
			COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END), 0) AS total_income,
			COALESCE(SUM(CASE WHEN type = 'expenditure' THEN amount ELSE 0 END), 0) AS total_expenditure`).
		Scan(&summary).Error
	if err != nil {
		return nil, err
	}

	return &system.FinancialSummary{
		TotalIncome:      summary.TotalIncome,
		TotalExpenditure: summary.TotalExpenditure,
		NetIncome:        summary.TotalIncome - summary.TotalExpenditure,
	}, nil
}

func (r *PostgresSystemRepository) CreateTransaction(tx *system.Transaction) error {
	return r.db.Create(tx).Error
}

// ---- Institution Suggestions ----

func (r *PostgresSystemRepository) CreateInstitutionSuggestion(s *system.InstitutionSuggestion) error {
	return r.db.Create(s).Error
}

func (r *PostgresSystemRepository) GetInstitutionSuggestions(status string) ([]system.InstitutionSuggestion, error) {
	var suggestions []system.InstitutionSuggestion
	q := r.db.Table("institution_suggestions").
		Select("institution_suggestions.*, users.name AS user_name").
		Joins("LEFT JOIN users ON users.id = institution_suggestions.user_id").
		Order("institution_suggestions.created_at DESC")
	if status != "" {
		q = q.Where("institution_suggestions.status = ?", status)
	}
	if err := q.Scan(&suggestions).Error; err != nil {
		return nil, err
	}
	return suggestions, nil
}

func (r *PostgresSystemRepository) UpdateInstitutionSuggestion(id int, value string) (*system.InstitutionSuggestion, error) {
	var s system.InstitutionSuggestion
	if err := r.db.First(&s, id).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("suggestion not found")
		}
		return nil, err
	}
	cleanValue := strings.TrimSpace(value)
	if err := r.db.Model(&s).Update("value", cleanValue).Error; err != nil {
		return nil, err
	}
	s.Value = cleanValue
	return &s, nil
}

func (r *PostgresSystemRepository) ApproveInstitutionSuggestion(id int, optionalValue string) (*system.InstitutionSuggestion, error) {
	var s system.InstitutionSuggestion
	if err := r.db.First(&s, id).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("suggestion not found")
		}
		return nil, err
	}

	if strings.TrimSpace(optionalValue) != "" {
		s.Value = strings.TrimSpace(optionalValue)
		if err := r.db.Model(&s).Update("value", s.Value).Error; err != nil {
			return nil, err
		}
	}

	// Promote to system_assets (ignore duplicate if already promoted)
	asset := &system.SystemAsset{Type: "institution", Value: s.Value}
	r.db.Where("type = ? AND value = ?", "institution", s.Value).FirstOrCreate(asset)

	// Mark as approved
	if err := r.db.Model(&s).Update("status", "approved").Error; err != nil {
		return nil, err
	}
	return &s, nil
}

func (r *PostgresSystemRepository) RejectInstitutionSuggestion(id int) error {
	return r.db.Model(&system.InstitutionSuggestion{}).
		Where("id = ?", id).
		Update("status", "rejected").Error
}

