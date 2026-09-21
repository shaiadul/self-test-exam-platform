package service

import (
	"errors"
	"strings"

	"github.com/selftest/backend/internal/domain/system"
)

var (
	ErrAssetTypeAndValueReq = errors.New("type and value are required")
	ErrTransactionRequired  = errors.New("type, positive amount, and description are required")
	ErrSuggestionValueReq   = errors.New("institution value is required")
)

type SystemService struct {
	repo system.SystemRepository
}

func NewSystemService(repo system.SystemRepository) *SystemService {
	return &SystemService{repo: repo}
}

func (s *SystemService) GetPermissions() ([]system.Permission, error) {
	return s.repo.GetPermissions()
}

func (s *SystemService) UpdatePermission(id int, access string) error {
	return s.repo.UpdatePermission(id, access)
}

func (s *SystemService) GetSystemAssets(filterType string) ([]system.SystemAsset, error) {
	assets, err := s.repo.GetSystemAssets()
	if err != nil {
		return nil, err
	}
	if filterType == "" {
		return assets, nil
	}

	var filtered []system.SystemAsset
	for _, a := range assets {
		if strings.EqualFold(a.Type, filterType) {
			filtered = append(filtered, a)
		}
	}
	return filtered, nil
}

func (s *SystemService) CreateSystemAsset(asset *system.SystemAsset) error {
	if strings.TrimSpace(asset.Type) == "" || strings.TrimSpace(asset.Value) == "" {
		return ErrAssetTypeAndValueReq
	}
	return s.repo.CreateSystemAsset(asset)
}

func (s *SystemService) UpdateSystemAsset(id int, value string) error {
	trimmed := strings.TrimSpace(value)
	if trimmed == "" {
		return ErrAssetTypeAndValueReq
	}
	return s.repo.UpdateSystemAsset(id, trimmed)
}

func (s *SystemService) DeleteSystemAsset(id int) error {
	return s.repo.DeleteSystemAsset(id)
}

func (s *SystemService) GetTransactions() ([]system.Transaction, error) {
	return s.repo.GetTransactions()
}

func (s *SystemService) GetFinancialSummary() (*system.FinancialSummary, error) {
	return s.repo.GetFinancialSummary()
}

func (s *SystemService) CreateTransaction(tx *system.Transaction) error {
	if strings.TrimSpace(tx.Type) == "" || tx.Amount <= 0 || strings.TrimSpace(tx.Description) == "" {
		return ErrTransactionRequired
	}
	return s.repo.CreateTransaction(tx)
}

// ---- Institution Suggestions ----

func (s *SystemService) SubmitInstitutionSuggestion(userID int, value string) (*system.InstitutionSuggestion, error) {
	if strings.TrimSpace(value) == "" {
		return nil, ErrSuggestionValueReq
	}
	suggestion := &system.InstitutionSuggestion{
		UserID: userID,
		Value:  strings.TrimSpace(value),
		Status: "pending",
	}
	if err := s.repo.CreateInstitutionSuggestion(suggestion); err != nil {
		return nil, err
	}
	return suggestion, nil
}

func (s *SystemService) GetInstitutionSuggestions(status string) ([]system.InstitutionSuggestion, error) {
	return s.repo.GetInstitutionSuggestions(status)
}

func (s *SystemService) UpdateInstitutionSuggestion(id int, value string) (*system.InstitutionSuggestion, error) {
	trimmed := strings.TrimSpace(value)
	if trimmed == "" {
		return nil, ErrSuggestionValueReq
	}
	return s.repo.UpdateInstitutionSuggestion(id, trimmed)
}

func (s *SystemService) ApproveInstitutionSuggestion(id int, optionalValue string) (*system.InstitutionSuggestion, error) {
	return s.repo.ApproveInstitutionSuggestion(id, strings.TrimSpace(optionalValue))
}

func (s *SystemService) RejectInstitutionSuggestion(id int) error {
	return s.repo.RejectInstitutionSuggestion(id)
}

