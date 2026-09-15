package persistence

import (
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
