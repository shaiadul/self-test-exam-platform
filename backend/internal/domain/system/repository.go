package system

type SystemRepository interface {
	GetPermissions() ([]Permission, error)
	UpdatePermission(id int, access string) error

	GetSystemAssets() ([]SystemAsset, error)
	CreateSystemAsset(asset *SystemAsset) error
	DeleteSystemAsset(id int) error

	GetTransactions() ([]Transaction, error)
	GetFinancialSummary() (*FinancialSummary, error)
	CreateTransaction(tx *Transaction) error
}
