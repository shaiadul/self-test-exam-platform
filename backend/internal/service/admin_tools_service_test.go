package service_test

import (
	"context"
	"testing"
	"time"

	"github.com/redis/go-redis/v9"
	"github.com/selftest/backend/internal/domain/examrequest"
	"github.com/selftest/backend/internal/domain/system"
	"github.com/selftest/backend/internal/domain/user"
	"github.com/selftest/backend/internal/service"
)

type mockToolsCache struct {
	cleared bool
}

func (m *mockToolsCache) Get(ctx context.Context, key string, dest interface{}) (bool, error) {
	return false, nil
}
func (m *mockToolsCache) Set(ctx context.Context, key string, value interface{}, ttl time.Duration) error {
	return nil
}
func (m *mockToolsCache) Delete(ctx context.Context, keys ...string) error {
	return nil
}
func (m *mockToolsCache) DeleteByPattern(ctx context.Context, pattern string) error {
	return nil
}
func (m *mockToolsCache) Client() *redis.Client {
	return nil
}
func (m *mockToolsCache) ClearAll(ctx context.Context) error {
	m.cleared = true
	return nil
}

type mockToolsRequestRepo struct {
	stats map[string]int64
	clearedType string
	clearedScope string
	deletedCount int64
}

func (m *mockToolsRequestRepo) Create(req *examrequest.ExamRequest) error { return nil }
func (m *mockToolsRequestRepo) GetByID(id int) (*examrequest.ExamRequest, error) { return nil, nil }
func (m *mockToolsRequestRepo) GetByTeacher(teacherID int) ([]examrequest.ExamRequest, error) { return nil, nil }
func (m *mockToolsRequestRepo) GetAll() ([]examrequest.ExamRequest, error) { return nil, nil }
func (m *mockToolsRequestRepo) UpdateStatus(id int, status string, adminNote *string) error { return nil }
func (m *mockToolsRequestRepo) GetStats() (map[string]int64, error) {
	return m.stats, nil
}
func (m *mockToolsRequestRepo) ClearRequests(reqType string, status string) (int64, error) {
	m.clearedType = reqType
	m.clearedScope = status
	return m.deletedCount, nil
}

type mockToolsSystemRepo struct {
	instStats map[string]int64
	clearedScope string
	deletedCount int64
}

func (m *mockToolsSystemRepo) GetPermissions() ([]system.Permission, error) { return nil, nil }
func (m *mockToolsSystemRepo) UpdatePermission(id int, access string) error { return nil }
func (m *mockToolsSystemRepo) GetSystemAssets() ([]system.SystemAsset, error) { return nil, nil }
func (m *mockToolsSystemRepo) CreateSystemAsset(asset *system.SystemAsset) error { return nil }
func (m *mockToolsSystemRepo) UpdateSystemAsset(id int, value string) error { return nil }
func (m *mockToolsSystemRepo) DeleteSystemAsset(id int) error { return nil }
func (m *mockToolsSystemRepo) GetTransactions() ([]system.Transaction, error) { return nil, nil }
func (m *mockToolsSystemRepo) GetFinancialSummary() (*system.FinancialSummary, error) { return nil, nil }
func (m *mockToolsSystemRepo) CreateTransaction(tx *system.Transaction) error { return nil }
func (m *mockToolsSystemRepo) CreateInstitutionSuggestion(s *system.InstitutionSuggestion) error { return nil }
func (m *mockToolsSystemRepo) GetInstitutionSuggestions(status string) ([]system.InstitutionSuggestion, error) { return nil, nil }
func (m *mockToolsSystemRepo) UpdateInstitutionSuggestion(id int, value string) (*system.InstitutionSuggestion, error) { return nil, nil }
func (m *mockToolsSystemRepo) ApproveInstitutionSuggestion(id int, optionalValue string) (*system.InstitutionSuggestion, error) { return nil, nil }
func (m *mockToolsSystemRepo) RejectInstitutionSuggestion(id int) error { return nil }
func (m *mockToolsSystemRepo) GetInstitutionSuggestionStats() (map[string]int64, error) {
	return m.instStats, nil
}
func (m *mockToolsSystemRepo) ClearInstitutionSuggestions(status string) (int64, error) {
	m.clearedScope = status
	return m.deletedCount, nil
}

type mockToolsUserRepo struct {
	roles map[int]string
}

func (m *mockToolsUserRepo) Create(user *user.User) error { return nil }
func (m *mockToolsUserRepo) GetByEmail(email string) (*user.User, error) { return nil, nil }
func (m *mockToolsUserRepo) GetByID(id int) (*user.User, error) { return nil, nil }
func (m *mockToolsUserRepo) GetByProviderAndID(provider, providerID string) (*user.User, error) { return nil, nil }
func (m *mockToolsUserRepo) LinkSocialAccount(userID int, provider, providerID string, image *string) error { return nil }
func (m *mockToolsUserRepo) GetRoleByID(id int) (string, error) {
	if r, ok := m.roles[id]; ok {
		return r, nil
	}
	return "student", nil
}
func (m *mockToolsUserRepo) GetSummaryByID(id int) (*user.UserSummary, error) { return nil, nil }
func (m *mockToolsUserRepo) GetSummariesByIDs(ids []int) (map[int]user.UserSummary, error) { return nil, nil }
func (m *mockToolsUserRepo) Update(user *user.User) error { return nil }
func (m *mockToolsUserRepo) GetAll() ([]user.User, error) { return nil, nil }
func (m *mockToolsUserRepo) UpdateRole(id int, role string) error { return nil }
func (m *mockToolsUserRepo) UpdateRoleAndLimit(id int, role *string, examLimit *int) error { return nil }
func (m *mockToolsUserRepo) UpdateExamPackLimit(id int, limit int) error { return nil }
func (m *mockToolsUserRepo) Delete(id int) error { return nil }
func (m *mockToolsUserRepo) GetUserCountByRole(role string) (int, error) { return 0, nil }
func (m *mockToolsUserRepo) CountIncompleteTeachers() (int, error) { return 0, nil }
func (m *mockToolsUserRepo) GetStudentRank(userID int) (int, error) { return 0, nil }
func (m *mockToolsUserRepo) GetStudentInstitutionRank(userID int, institution string) (int, error) { return 0, nil }

func TestAdminToolsService(t *testing.T) {
	cacheMock := &mockToolsCache{}
	reqMock := &mockToolsRequestRepo{
		stats: map[string]int64{
			"total": 5, "pending": 2, "approved": 2, "rejected": 1, "pack": 3, "limit": 2,
		},
		deletedCount: 4,
	}
	sysMock := &mockToolsSystemRepo{
		instStats: map[string]int64{
			"total": 3, "pending": 1, "approved": 2, "rejected": 0,
		},
		deletedCount: 2,
	}
	userMock := &mockToolsUserRepo{
		roles: map[int]string{
			1: "admin",
			2: "teacher",
			3: "student",
		},
	}

	svc := service.NewAdminToolsService(cacheMock, reqMock, sysMock, userMock)

	// 1. Verify admin role check
	if err := svc.VerifyAdmin(1); err != nil {
		t.Fatalf("expected admin check to pass for user 1, got %v", err)
	}
	if err := svc.VerifyAdmin(2); err != service.ErrAdminRequired {
		t.Fatalf("expected ErrAdminRequired for teacher user 2, got %v", err)
	}

	// 2. Clear cache
	if err := svc.ClearCache(context.Background()); err != nil {
		t.Fatalf("failed to clear cache: %v", err)
	}
	if !cacheMock.cleared {
		t.Fatalf("expected cacheMock to be cleared")
	}

	// 3. Overview
	ov, err := svc.GetOverview(context.Background())
	if err != nil {
		t.Fatalf("failed to get overview: %v", err)
	}
	if ov.Requests.TotalRequests != 8 {
		t.Fatalf("expected total requests 8 (5 quota + 3 institution), got %d", ov.Requests.TotalRequests)
	}
	if ov.Requests.TotalPending != 3 {
		t.Fatalf("expected total pending 3 (2 quota + 1 institution), got %d", ov.Requests.TotalPending)
	}

	// 4. Clear request approval data: quota only
	resQuota, err := svc.ClearRequestApprovalData(context.Background(), "quota", "all")
	if err != nil {
		t.Fatalf("failed to clear quota requests: %v", err)
	}
	if resQuota.TotalDeleted != 4 {
		t.Fatalf("expected 4 deleted quota requests, got %d", resQuota.TotalDeleted)
	}
	if reqMock.clearedScope != "all" {
		t.Fatalf("expected clearedScope 'all', got '%s'", reqMock.clearedScope)
	}

	// 5. Clear request approval data: all categories
	resAll, err := svc.ClearRequestApprovalData(context.Background(), "all", "resolved")
	if err != nil {
		t.Fatalf("failed to clear all requests: %v", err)
	}
	if resAll.TotalDeleted != 6 { // 4 quota + 2 institution
		t.Fatalf("expected 6 total deleted records, got %d", resAll.TotalDeleted)
	}
}
