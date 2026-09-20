package service

import (
	"errors"
	"os"
	"strings"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"golang.org/x/crypto/bcrypt"

	"github.com/selftest/backend/internal/domain/user"
)

var (
	ErrEmailExists     = errors.New("email is already registered")
	ErrInvalidCreds    = errors.New("invalid email or password")
	ErrUserNotFound    = errors.New("user not found")
	ErrMissingFields   = errors.New("name, email, and password are required")
	ErrInternal        = errors.New("internal server error")
)

type UserService struct {
	userRepo user.UserRepository
}

func NewUserService(userRepo user.UserRepository) *UserService {
	return &UserService{userRepo: userRepo}
}

func (s *UserService) Register(req user.RegisterRequest) (*user.LoginResponse, error) {
	if req.Email == "" || req.Password == "" || req.Name == "" {
		return nil, ErrMissingFields
	}

	existing, err := s.userRepo.GetByEmail(req.Email)
	if err != nil {
		return nil, err
	}
	if existing != nil {
		return nil, ErrEmailExists
	}

	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		return nil, err
	}

	role := "student"
	if req.Email == os.Getenv("NEXT_PUBLIC_ADMIN_EMAIL") || req.Email == "admin@test.com" {
		role = "admin"
	} else if req.Email == os.Getenv("NEXT_PUBLIC_TEACHER_EMAIL") || req.Email == "teacher@test.com" {
		role = "teacher"
	}

	pwdStr := string(hashedPassword)
	defaultProvider := "email"

	u := &user.User{
		Name:     req.Name,
		Email:    req.Email,
		Password: &pwdStr,
		Role:     role,
		Provider: &defaultProvider,
	}

	if err := s.userRepo.Create(u); err != nil {
		return nil, err
	}

	tokenString, err := s.generateToken(u)
	if err != nil {
		return nil, err
	}

	return &user.LoginResponse{
		Token: tokenString,
		User:  *u,
	}, nil
}

func (s *UserService) Login(req user.LoginRequest) (*user.LoginResponse, error) {
	u, err := s.userRepo.GetByEmail(req.Email)
	if err != nil {
		return nil, err
	}
	if u == nil {
		return nil, ErrInvalidCreds
	}

	if u.Password == nil || *u.Password == "" {
		return nil, errors.New("this account was registered using social login (Google/GitHub). Please sign in using your social account")
	}

	if err := bcrypt.CompareHashAndPassword([]byte(*u.Password), []byte(req.Password)); err != nil {
		return nil, ErrInvalidCreds
	}

	tokenString, err := s.generateToken(u)
	if err != nil {
		return nil, err
	}

	return &user.LoginResponse{
		Token: tokenString,
		User:  *u,
	}, nil
}

func (s *UserService) SocialLogin(req user.SocialLoginRequest) (*user.LoginResponse, error) {
	provider := strings.ToLower(strings.TrimSpace(req.Provider))
	providerID := strings.TrimSpace(req.ProviderID)
	email := strings.ToLower(strings.TrimSpace(req.Email))
	name := strings.TrimSpace(req.Name)

	if provider != "google" && provider != "github" {
		return nil, errors.New("unsupported social provider: must be google or github")
	}
	if providerID == "" || email == "" {
		return nil, errors.New("providerId and email are required for social login")
	}
	if name == "" {
		name = strings.Split(email, "@")[0]
	}

	// 1. Check if user exists by provider and providerId
	u, err := s.userRepo.GetByProviderAndID(provider, providerID)
	if err != nil {
		return nil, err
	}

	if u != nil {
		if req.Image != nil && *req.Image != "" && (u.Image == nil || *u.Image == "") {
			_ = s.userRepo.LinkSocialAccount(u.ID, provider, providerID, req.Image)
			u.Image = req.Image
		}
		tokenString, err := s.generateToken(u)
		if err != nil {
			return nil, err
		}
		return &user.LoginResponse{
			Token: tokenString,
			User:  *u,
		}, nil
	}

	// 2. If not found by provider+id, check if existing user has this email
	existingByEmail, err := s.userRepo.GetByEmail(email)
	if err != nil {
		return nil, err
	}

	if existingByEmail != nil {
		if err := s.userRepo.LinkSocialAccount(existingByEmail.ID, provider, providerID, req.Image); err != nil {
			return nil, err
		}
		existingByEmail.Provider = &provider
		existingByEmail.ProviderID = &providerID
		if req.Image != nil && *req.Image != "" && (existingByEmail.Image == nil || *existingByEmail.Image == "") {
			existingByEmail.Image = req.Image
		}

		tokenString, err := s.generateToken(existingByEmail)
		if err != nil {
			return nil, err
		}
		return &user.LoginResponse{
			Token: tokenString,
			User:  *existingByEmail,
		}, nil
	}

	// 3. User does not exist, create new account
	role := "student"
	if email == os.Getenv("NEXT_PUBLIC_ADMIN_EMAIL") || email == "admin@test.com" {
		role = "admin"
	} else if email == os.Getenv("NEXT_PUBLIC_TEACHER_EMAIL") || email == "teacher@test.com" {
		role = "teacher"
	}

	defaultExamLimit := 5
	defaultExamPackLimit := 3

	newUser := &user.User{
		Name:          name,
		Email:         email,
		Role:          role,
		Provider:      &provider,
		ProviderID:    &providerID,
		Image:         req.Image,
		ExamLimit:     &defaultExamLimit,
		ExamPackLimit: &defaultExamPackLimit,
	}

	if err := s.userRepo.Create(newUser); err != nil {
		return nil, err
	}

	tokenString, err := s.generateToken(newUser)
	if err != nil {
		return nil, err
	}

	return &user.LoginResponse{
		Token: tokenString,
		User:  *newUser,
	}, nil
}

func (s *UserService) GetProfile(userID int) (*user.User, error) {
	u, err := s.userRepo.GetByID(userID)
	if err != nil {
		return nil, err
	}
	if u == nil {
		return nil, ErrUserNotFound
	}
	return u, nil
}

func (s *UserService) CompleteProfile(userID int, req user.CompleteProfileRequest) (*user.User, error) {
	u, err := s.userRepo.GetByID(userID)
	if err != nil {
		return nil, err
	}
	if u == nil {
		return nil, ErrUserNotFound
	}

	if req.Name != "" {
		u.Name = req.Name
	}
	if req.Image != "" {
		u.Image = &req.Image
	}
	if req.Phone != "" {
		u.Phone = &req.Phone
	}
	if req.Level != "" {
		u.Level = &req.Level
	}
	if req.Batch != "" {
		u.Batch = &req.Batch
	}
	if req.Board != "" {
		u.Board = &req.Board
	}
	if req.Institution != "" {
		u.Institution = &req.Institution
	}
	if req.Address != "" {
		u.Address = &req.Address
	}
	if req.Subject != "" {
		u.Subject = &req.Subject
	}
	if req.Designation != "" {
		u.Designation = &req.Designation
	}
	if req.AdminTier != "" {
		u.AdminTier = &req.AdminTier
	}
	if req.AdminDept != "" {
		u.AdminDept = &req.AdminDept
	}
	if req.AdminBase != "" {
		u.AdminBase = &req.AdminBase
	}

	if err := s.userRepo.Update(u); err != nil {
		return nil, err
	}

	return u, nil
}

func (s *UserService) ListUsers() ([]user.User, error) {
	users, err := s.userRepo.GetAll()
	if err != nil {
		return nil, err
	}
	// Sanitize output (don't send passwords)
	for i := range users {
		users[i].Password = nil
	}
	return users, nil
}

func (s *UserService) UpdateUserRole(id int, role string) error {
	return s.userRepo.UpdateRole(id, role)
}

func (s *UserService) UpdateUserRoleAndLimit(id int, role *string, examLimit *int) error {
	// Normalize invalid negative limits to -1 (unlimited). A teacher is only
	// allowed unlimited (-1) or a non-negative count.
	if examLimit != nil && *examLimit < -1 {
		v := -1
		examLimit = &v
	}
	if role != nil && strings.ToLower(*role) != "teacher" {
		examLimit = nil
	}
	return s.userRepo.UpdateRoleAndLimit(id, role, examLimit)
}

func (s *UserService) UpdateUserPackLimit(id int, packLimit *int) error {
	if packLimit == nil {
		return nil
	}
	v := *packLimit
	if v < -1 {
		v = -1 // unlimited
	}
	return s.userRepo.UpdateExamPackLimit(id, v)
}

func (s *UserService) DeleteUser(id int) error {
	return s.userRepo.Delete(id)
}

func (s *UserService) generateToken(u *user.User) (string, error) {
	jwtSecret := os.Getenv("JWT_SECRET")
	if jwtSecret == "" {
		jwtSecret = "default_secret"
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"sub":   u.ID,
		"role":  u.Role,
		"email": u.Email,
		"exp":   time.Now().Add(24 * time.Hour).Unix(),
	})

	return token.SignedString([]byte(jwtSecret))
}
