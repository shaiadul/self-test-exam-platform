package http_test

import (
	"bytes"
	"context"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"
	"time"

	"github.com/redis/go-redis/v9"
	delivery "github.com/selftest/backend/internal/delivery/http"
	"github.com/selftest/backend/internal/domain/examrequest"
	"github.com/selftest/backend/internal/domain/system"
	"github.com/selftest/backend/internal/domain/user"
	"github.com/selftest/backend/internal/service"
	"github.com/selftest/backend/middleware"
)

type dummyCache struct {
	flushed bool
}

func (d *dummyCache) Get(ctx context.Context, key string, dest interface{}) (bool, error) {
	return false, nil
}
func (d *dummyCache) Set(ctx context.Context, key string, value interface{}, ttl time.Duration) error {
	return nil
}
func (d *dummyCache) Delete(ctx context.Context, keys ...string) error {
	return nil
}
func (d *dummyCache) DeleteByPattern(ctx context.Context, pattern string) error {
	return nil
}
func (d *dummyCache) Client() *redis.Client {
	return nil
}
func (d *dummyCache) ClearAll(ctx context.Context) error {
	d.flushed = true
	return nil
}

type dummyRequestRepo struct{}

func (d *dummyRequestRepo) Create(req *examrequest.ExamRequest) error { return nil }
func (d *dummyRequestRepo) GetByID(id int) (*examrequest.ExamRequest, error) { return nil, nil }
func (d *dummyRequestRepo) GetByTeacher(teacherID int) ([]examrequest.ExamRequest, error) {
	return nil, nil
}
func (d *dummyRequestRepo) GetAll() ([]examrequest.ExamRequest, error) { return nil, nil }
func (d *dummyRequestRepo) UpdateStatus(id int, status string, adminNote *string) error { return nil }
func (d *dummyRequestRepo) GetStats() (map[string]int64, error) {
	return map[string]int64{"total": 2, "pending": 1, "approved": 1, "rejected": 0}, nil
}
func (d *dummyRequestRepo) ClearRequests(reqType string, status string) (int64, error) {
	return 2, nil
}

type dummySystemRepo struct{}

func (d *dummySystemRepo) GetPermissions() ([]system.Permission, error) { return nil, nil }
func (d *dummySystemRepo) UpdatePermission(id int, access string) error { return nil }
func (d *dummySystemRepo) GetSystemAssets() ([]system.SystemAsset, error) { return nil, nil }
func (d *dummySystemRepo) CreateSystemAsset(asset *system.SystemAsset) error { return nil }
func (d *dummySystemRepo) UpdateSystemAsset(id int, value string) error { return nil }
func (d *dummySystemRepo) DeleteSystemAsset(id int) error { return nil }
func (d *dummySystemRepo) GetTransactions() ([]system.Transaction, error) { return nil, nil }
func (d *dummySystemRepo) GetFinancialSummary() (*system.FinancialSummary, error) { return nil, nil }
func (d *dummySystemRepo) CreateTransaction(tx *system.Transaction) error { return nil }
func (d *dummySystemRepo) CreateInstitutionSuggestion(s *system.InstitutionSuggestion) error { return nil }
func (d *dummySystemRepo) GetInstitutionSuggestions(status string) ([]system.InstitutionSuggestion, error) {
	return nil, nil
}
func (d *dummySystemRepo) UpdateInstitutionSuggestion(id int, value string) (*system.InstitutionSuggestion, error) {
	return nil, nil
}
func (d *dummySystemRepo) ApproveInstitutionSuggestion(id int, optionalValue string) (*system.InstitutionSuggestion, error) {
	return nil, nil
}
func (d *dummySystemRepo) RejectInstitutionSuggestion(id int) error { return nil }
func (d *dummySystemRepo) GetInstitutionSuggestionStats() (map[string]int64, error) {
	return map[string]int64{"total": 1, "pending": 1, "approved": 0, "rejected": 0}, nil
}
func (d *dummySystemRepo) ClearInstitutionSuggestions(status string) (int64, error) {
	return 1, nil
}

type dummyUserRepo struct{}

func (d *dummyUserRepo) Create(user *user.User) error { return nil }
func (d *dummyUserRepo) GetByEmail(email string) (*user.User, error) { return nil, nil }
func (d *dummyUserRepo) GetByID(id int) (*user.User, error) { return nil, nil }
func (d *dummyUserRepo) GetByProviderAndID(provider, providerID string) (*user.User, error) { return nil, nil }
func (d *dummyUserRepo) LinkSocialAccount(userID int, provider, providerID string, image *string) error { return nil }
func (d *dummyUserRepo) GetRoleByID(id int) (string, error) {
	if id == 1 {
		return "admin", nil
	}
	return "student", nil
}
func (d *dummyUserRepo) GetSummaryByID(id int) (*user.UserSummary, error) { return nil, nil }
func (d *dummyUserRepo) GetSummariesByIDs(ids []int) (map[int]user.UserSummary, error) { return nil, nil }
func (d *dummyUserRepo) Update(user *user.User) error { return nil }
func (d *dummyUserRepo) GetAll() ([]user.User, error) { return nil, nil }
func (d *dummyUserRepo) UpdateRole(id int, role string) error { return nil }
func (d *dummyUserRepo) UpdateRoleAndLimit(id int, role *string, examLimit *int) error { return nil }
func (d *dummyUserRepo) UpdateExamPackLimit(id int, limit int) error { return nil }
func (d *dummyUserRepo) Delete(id int) error { return nil }
func (d *dummyUserRepo) GetUserCountByRole(role string) (int, error) { return 0, nil }
func (d *dummyUserRepo) CountIncompleteTeachers() (int, error) { return 0, nil }
func (d *dummyUserRepo) GetStudentRank(userID int) (int, error) { return 0, nil }
func (d *dummyUserRepo) GetStudentInstitutionRank(userID int, institution string) (int, error) { return 0, nil }

func TestAdminToolsEndpoints(t *testing.T) {
	cMock := &dummyCache{}
	reqMock := &dummyRequestRepo{}
	sysMock := &dummySystemRepo{}
	usrMock := &dummyUserRepo{}

	toolsSvc := service.NewAdminToolsService(cMock, reqMock, sysMock, usrMock)
	toolsHdlr := delivery.NewAdminToolsHandler(toolsSvc)

	// 1. Test Overview as admin (user ID 1)
	req := httptest.NewRequest("GET", "/api/admin/tools/overview", nil)
	ctx := context.WithValue(req.Context(), middleware.UserIDKey, 1)
	ctx = context.WithValue(ctx, middleware.UserRoleKey, "admin")
	req = req.WithContext(ctx)

	rec := httptest.NewRecorder()
	toolsHdlr.HandleTools(rec, req)

	if rec.Code != http.StatusOK {
		t.Fatalf("expected 200 OK, got %d: %s", rec.Code, rec.Body.String())
	}

	var ov service.ToolsOverviewResponse
	if err := json.Unmarshal(rec.Body.Bytes(), &ov); err != nil {
		t.Fatalf("failed to decode response: %v", err)
	}
	if ov.Requests.TotalRequests != 3 {
		t.Fatalf("expected 3 total requests, got %d", ov.Requests.TotalRequests)
	}

	// 2. Test Clear Cache as admin
	clearReq := httptest.NewRequest("POST", "/api/admin/tools/cache/clear", nil)
	clearReq = clearReq.WithContext(ctx)
	clearRec := httptest.NewRecorder()
	toolsHdlr.HandleTools(clearRec, clearReq)

	if clearRec.Code != http.StatusOK {
		t.Fatalf("expected 200 OK for clear cache, got %d", clearRec.Code)
	}
	if !cMock.flushed {
		t.Fatalf("expected cache to be flushed")
	}

	// 3. Test Clear Requests as admin
	body := `{"target":"quota","scope":"all"}`
	delReq := httptest.NewRequest("POST", "/api/admin/tools/requests/clear", bytes.NewBufferString(body))
	delReq = delReq.WithContext(ctx)
	delRec := httptest.NewRecorder()
	toolsHdlr.HandleTools(delRec, delReq)

	if delRec.Code != http.StatusOK {
		t.Fatalf("expected 200 OK for clear requests, got %d: %s", delRec.Code, delRec.Body.String())
	}

	var res service.ClearRequestResult
	if err := json.Unmarshal(delRec.Body.Bytes(), &res); err != nil {
		t.Fatalf("failed to parse result: %v", err)
	}
	if res.TotalDeleted != 2 {
		t.Fatalf("expected 2 deleted records, got %d", res.TotalDeleted)
	}

	// 4. Test non-admin access (user ID 2) returns 403 Forbidden
	nonAdminReq := httptest.NewRequest("GET", "/api/admin/tools/overview", nil)
	nonAdminCtx := context.WithValue(nonAdminReq.Context(), middleware.UserIDKey, 2)
	nonAdminReq = nonAdminReq.WithContext(nonAdminCtx)
	nonAdminRec := httptest.NewRecorder()
	toolsHdlr.HandleTools(nonAdminRec, nonAdminReq)

	if nonAdminRec.Code != http.StatusForbidden {
		t.Fatalf("expected 403 Forbidden for non-admin, got %d", nonAdminRec.Code)
	}
}
