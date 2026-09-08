package persistence

import (
	"database/sql"
	"time"

	"github.com/selftest/backend/internal/domain/system"
)

type PostgresSystemRepository struct {
	db *sql.DB
}

func NewPostgresSystemRepository(db *sql.DB) *PostgresSystemRepository {
	return &PostgresSystemRepository{db: db}
}

func (r *PostgresSystemRepository) GetPermissions() ([]system.Permission, error) {
	query := `SELECT id, role, module, access FROM permissions ORDER BY id ASC`
	rows, err := r.db.Query(query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var perms []system.Permission
	for rows.Next() {
		var p system.Permission
		if err := rows.Scan(&p.ID, &p.Role, &p.Module, &p.Access); err != nil {
			return nil, err
		}
		perms = append(perms, p)
	}
	return perms, nil
}

func (r *PostgresSystemRepository) UpdatePermission(id int, access string) error {
	query := `UPDATE permissions SET access = $1 WHERE id = $2`
	_, err := r.db.Exec(query, access, id)
	return err
}

func (r *PostgresSystemRepository) GetSystemAssets() ([]system.SystemAsset, error) {
	query := `SELECT id, type, value FROM system_assets ORDER BY id ASC`
	rows, err := r.db.Query(query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var assets []system.SystemAsset
	for rows.Next() {
		var a system.SystemAsset
		if err := rows.Scan(&a.ID, &a.Type, &a.Value); err != nil {
			return nil, err
		}
		assets = append(assets, a)
	}
	return assets, nil
}

func (r *PostgresSystemRepository) CreateSystemAsset(asset *system.SystemAsset) error {
	query := `INSERT INTO system_assets (type, value) VALUES ($1, $2) RETURNING id`
	return r.db.QueryRow(query, asset.Type, asset.Value).Scan(&asset.ID)
}

func (r *PostgresSystemRepository) DeleteSystemAsset(id int) error {
	_, err := r.db.Exec(`DELETE FROM system_assets WHERE id = $1`, id)
	return err
}

func (r *PostgresSystemRepository) GetTransactions() ([]system.Transaction, error) {
	query := `SELECT id, type, amount, description, created_at FROM transactions ORDER BY created_at DESC`
	rows, err := r.db.Query(query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var txs []system.Transaction
	for rows.Next() {
		var t system.Transaction
		if err := rows.Scan(&t.ID, &t.Type, &t.Amount, &t.Description, &t.CreatedAt); err != nil {
			return nil, err
		}
		txs = append(txs, t)
	}
	return txs, nil
}

func (r *PostgresSystemRepository) GetFinancialSummary() (*system.FinancialSummary, error) {
	var totalIncome, totalExpenditure float64

	err := r.db.QueryRow(`SELECT COALESCE(SUM(amount), 0) FROM transactions WHERE type = 'income'`).Scan(&totalIncome)
	if err != nil {
		return nil, err
	}

	err = r.db.QueryRow(`SELECT COALESCE(SUM(amount), 0) FROM transactions WHERE type = 'expenditure'`).Scan(&totalExpenditure)
	if err != nil {
		return nil, err
	}

	return &system.FinancialSummary{
		TotalIncome:      totalIncome,
		TotalExpenditure: totalExpenditure,
		NetIncome:        totalIncome - totalExpenditure,
	}, nil
}

func (r *PostgresSystemRepository) CreateTransaction(tx *system.Transaction) error {
	query := `INSERT INTO transactions (type, amount, description, created_at) VALUES ($1, $2, $3, $4) RETURNING id`
	if tx.CreatedAt.IsZero() {
		tx.CreatedAt = time.Now()
	}
	return r.db.QueryRow(query, tx.Type, tx.Amount, tx.Description, tx.CreatedAt).Scan(&tx.ID)
}
