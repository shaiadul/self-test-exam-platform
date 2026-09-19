package service

import (
	"errors"
	"testing"

	"github.com/selftest/backend/internal/domain/user"
)

type mockUserRepo struct {
	usersByID       map[int]*user.User
	usersByEmail    map[string]*user.User
	usersByProvider map[string]*user.User // key: provider:providerID
	lastID          int
}

func newMockUserRepo() *mockUserRepo {
	return &mockUserRepo{
		usersByID:       make(map[int]*user.User),
		usersByEmail:    make(map[string]*user.User),
		usersByProvider: make(map[string]*user.User),
	}
}

func (m *mockUserRepo) Create(u *user.User) error {
	m.lastID++
	u.ID = m.lastID
	m.usersByID[u.ID] = u
	m.usersByEmail[u.Email] = u
	if u.Provider != nil && u.ProviderID != nil {
		m.usersByProvider[*u.Provider+":"+*u.ProviderID] = u
	}
	return nil
}

func (m *mockUserRepo) GetByEmail(email string) (*user.User, error) {
	u := m.usersByEmail[email]
	return u, nil
}

func (m *mockUserRepo) GetByID(id int) (*user.User, error) {
	return m.usersByID[id], nil
}

func (m *mockUserRepo) GetByProviderAndID(provider, providerID string) (*user.User, error) {
	return m.usersByProvider[provider+":"+providerID], nil
}

func (m *mockUserRepo) LinkSocialAccount(userID int, provider, providerID string, image *string) error {
	u, ok := m.usersByID[userID]
	if !ok {
		return errors.New("user not found")
	}
	u.Provider = &provider
	u.ProviderID = &providerID
	if image != nil {
		u.Image = image
	}
	m.usersByProvider[provider+":"+providerID] = u
	return nil
}

func (m *mockUserRepo) GetRoleByID(id int) (string, error) {
	if u, ok := m.usersByID[id]; ok {
		return u.Role, nil
	}
	return "", errors.New("not found")
}

func (m *mockUserRepo) GetSummaryByID(id int) (*user.UserSummary, error) { return nil, nil }
func (m *mockUserRepo) GetSummariesByIDs(ids []int) (map[int]user.UserSummary, error) {
	return nil, nil
}
func (m *mockUserRepo) Update(u *user.User) error                                  { return nil }
func (m *mockUserRepo) GetAll() ([]user.User, error)                              { return nil, nil }
func (m *mockUserRepo) UpdateRole(id int, role string) error                      { return nil }
func (m *mockUserRepo) UpdateRoleAndLimit(id int, role *string, limit *int) error { return nil }
func (m *mockUserRepo) UpdateExamPackLimit(id int, limit int) error               { return nil }
func (m *mockUserRepo) Delete(id int) error                                       { return nil }
func (m *mockUserRepo) GetUserCountByRole(role string) (int, error)               { return 0, nil }
func (m *mockUserRepo) CountIncompleteTeachers() (int, error)                     { return 0, nil }
func (m *mockUserRepo) GetStudentRank(userID int) (int, error)                    { return 1, nil }

func TestSocialLogin_NewUser(t *testing.T) {
	repo := newMockUserRepo()
	svc := NewUserService(repo)

	img := "https://example.com/avatar.jpg"
	req := user.SocialLoginRequest{
		Provider:   "google",
		ProviderID: "google-12345",
		Email:      "newstudent@gmail.com",
		Name:       "New Student",
		Image:      &img,
	}

	res, err := svc.SocialLogin(req)
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}

	if res.Token == "" {
		t.Errorf("expected non-empty JWT token")
	}
	if res.User.Email != "newstudent@gmail.com" {
		t.Errorf("expected email newstudent@gmail.com, got %s", res.User.Email)
	}
	if res.User.Role != "student" {
		t.Errorf("expected role student, got %s", res.User.Role)
	}
	if res.User.Provider == nil || *res.User.Provider != "google" {
		t.Errorf("expected provider google")
	}
}

func TestSocialLogin_AccountLinking(t *testing.T) {
	repo := newMockUserRepo()
	svc := NewUserService(repo)

	// User registered previously via email
	regRes, err := svc.Register(user.RegisterRequest{
		Name:     "Existing User",
		Email:    "existing@gmail.com",
		Password: "password123",
	})
	if err != nil {
		t.Fatalf("failed to register initial user: %v", err)
	}

	// Now logs in with Facebook with same email
	fbImg := "https://graph.facebook.com/123/picture"
	fbReq := user.SocialLoginRequest{
		Provider:   "facebook",
		ProviderID: "fb-998877",
		Email:      "existing@gmail.com",
		Name:       "Existing User",
		Image:      &fbImg,
	}

	socialRes, err := svc.SocialLogin(fbReq)
	if err != nil {
		t.Fatalf("unexpected error during social link: %v", err)
	}

	if socialRes.User.ID != regRes.User.ID {
		t.Errorf("expected linked user ID %d, got %d", regRes.User.ID, socialRes.User.ID)
	}
	if socialRes.User.Provider == nil || *socialRes.User.Provider != "facebook" {
		t.Errorf("expected provider facebook after link")
	}
}

func TestSocialLogin_UnsupportedProvider(t *testing.T) {
	repo := newMockUserRepo()
	svc := NewUserService(repo)

	req := user.SocialLoginRequest{
		Provider:   "github",
		ProviderID: "gh-1",
		Email:      "dev@github.com",
		Name:       "Dev",
	}

	_, err := svc.SocialLogin(req)
	if err == nil {
		t.Fatalf("expected error for unsupported provider, got nil")
	}
}
