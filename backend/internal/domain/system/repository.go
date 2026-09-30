package system

type SystemRepository interface {
	GetPermissions() ([]Permission, error)
	UpdatePermission(id int, access string) error

	GetSystemAssets() ([]SystemAsset, error)
	CreateSystemAsset(asset *SystemAsset) error
	UpdateSystemAsset(id int, value string) error
	DeleteSystemAsset(id int) error

	GetTransactions() ([]Transaction, error)
	GetFinancialSummary() (*FinancialSummary, error)
	CreateTransaction(tx *Transaction) error

	// Institution suggestions
	CreateInstitutionSuggestion(s *InstitutionSuggestion) error
	GetInstitutionSuggestions(status string) ([]InstitutionSuggestion, error)
	UpdateInstitutionSuggestion(id int, value string) (*InstitutionSuggestion, error)
	ApproveInstitutionSuggestion(id int, optionalValue string) (*InstitutionSuggestion, error)
	RejectInstitutionSuggestion(id int) error
}

