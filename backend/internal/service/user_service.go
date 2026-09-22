package service

import (
	"context"
	cryptorand "crypto/rand"
	"errors"
	"fmt"
	"math/big"
	"os"
	"strings"
	"sync"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"golang.org/x/crypto/bcrypt"

	"github.com/selftest/backend/internal/domain/user"
	"github.com/selftest/backend/internal/infrastructure/cache"
	"github.com/selftest/backend/internal/infrastructure/email"
)

var (
	ErrEmailExists     = errors.New("email is already registered")
	ErrInvalidCreds    = errors.New("invalid email or password")
	ErrUserNotFound    = errors.New("user not found")
	ErrMissingFields   = errors.New("name, email, and password are required")
	ErrInternal        = errors.New("internal server error")
	ErrOTPExpired      = errors.New("OTP has expired or is invalid")
	ErrOTPRateLimit    = errors.New("please wait before requesting a new OTP")
	ErrInvalidResetTkn = errors.New("invalid or expired reset token")
	ErrWeakPassword    = errors.New("password must be at least 6 characters")
)

// otpEntry is used as in-memory fallback when Redis is unavailable.
type otpEntry struct {
	Code      string
	ExpiresAt time.Time
}

type UserService struct {
	userRepo     user.UserRepository
	emailService email.EmailService
	cacheService cache.CacheService

	// In-memory OTP fallback when Redis is unavailable
	otpMu    sync.Mutex
	otpStore map[string]otpEntry
}

func NewUserService(userRepo user.UserRepository, opts ...interface{}) *UserService {
	svc := &UserService{
		userRepo: userRepo,
		otpStore: make(map[string]otpEntry),
	}
	for _, opt := range opts {
		switch v := opt.(type) {
		case email.EmailService:
			svc.emailService = v
		case cache.CacheService:
			svc.cacheService = v
		}
	}
	return svc
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

// ---------------------------------------------------------------------------
// Password Reset OTP Flow
// ---------------------------------------------------------------------------

const (
	otpTTL      = 10 * time.Minute
	otpCooldown = 60 * time.Second
	resetTknTTL = 15 * time.Minute
)

func otpKey(emailAddr string) string   { return fmt.Sprintf("auth:otp:reset:%s", emailAddr) }
func otpCDKey(emailAddr string) string { return fmt.Sprintf("auth:otp:cooldown:%s", emailAddr) }

// generateOTP produces a cryptographically random 6-digit numeric string.
func generateOTP() (string, error) {
	n, err := cryptorand.Int(cryptorand.Reader, big.NewInt(1000000))
	if err != nil {
		return "", err
	}
	return fmt.Sprintf("%06d", n.Int64()), nil
}

// RequestPasswordResetOTP generates an OTP and sends it to the given email.
func (s *UserService) RequestPasswordResetOTP(emailAddr string) error {
	emailAddr = strings.TrimSpace(strings.ToLower(emailAddr))
	if emailAddr == "" {
		return ErrMissingFields
	}

	u, err := s.userRepo.GetByEmail(emailAddr)
	if err != nil {
		return err
	}
	if u == nil {
		// Don't reveal whether the email exists
		return nil
	}

	ctx := context.Background()

	// Rate-limit: check cooldown
	if s.cacheService != nil {
		var dummy string
		hit, _ := s.cacheService.Get(ctx, otpCDKey(emailAddr), &dummy)
		if hit {
			return ErrOTPRateLimit
		}
	}

	otp, err := generateOTP()
	if err != nil {
		return fmt.Errorf("failed to generate OTP: %w", err)
	}

	// Store OTP
	if s.cacheService != nil {
		_ = s.cacheService.Set(ctx, otpKey(emailAddr), otp, otpTTL)
		_ = s.cacheService.Set(ctx, otpCDKey(emailAddr), "1", otpCooldown)
	} else {
		// In-memory fallback
		s.otpMu.Lock()
		s.otpStore[emailAddr] = otpEntry{Code: otp, ExpiresAt: time.Now().Add(otpTTL)}
		s.otpMu.Unlock()
	}

	// Send email
	if s.emailService != nil {
		if err := s.emailService.SendPasswordResetOTP(emailAddr, otp); err != nil {
			return fmt.Errorf("failed to send reset email: %w", err)
		}
	}

	return nil
}

// VerifyPasswordResetOTP validates the OTP and returns a short-lived reset token.
func (s *UserService) VerifyPasswordResetOTP(emailAddr, otp string) (string, error) {
	emailAddr = strings.TrimSpace(strings.ToLower(emailAddr))
	otp = strings.TrimSpace(otp)
	if emailAddr == "" || otp == "" {
		return "", ErrMissingFields
	}

	ctx := context.Background()
	var storedOTP string

	if s.cacheService != nil {
		hit, _ := s.cacheService.Get(ctx, otpKey(emailAddr), &storedOTP)
		if !hit || storedOTP == "" {
			return "", ErrOTPExpired
		}
	} else {
		s.otpMu.Lock()
		entry, ok := s.otpStore[emailAddr]
		s.otpMu.Unlock()
		if !ok || time.Now().After(entry.ExpiresAt) {
			return "", ErrOTPExpired
		}
		storedOTP = entry.Code
	}

	if storedOTP != otp {
		return "", ErrOTPExpired
	}

	// Invalidate OTP to prevent replay
	if s.cacheService != nil {
		_ = s.cacheService.Delete(ctx, otpKey(emailAddr))
	} else {
		s.otpMu.Lock()
		delete(s.otpStore, emailAddr)
		s.otpMu.Unlock()
	}

	// Issue short-lived reset token
	jwtSecret := os.Getenv("JWT_SECRET")
	if jwtSecret == "" {
		jwtSecret = "default_secret"
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"email":   emailAddr,
		"purpose": "password_reset",
		"exp":     time.Now().Add(resetTknTTL).Unix(),
	})

	tokenStr, err := token.SignedString([]byte(jwtSecret))
	if err != nil {
		return "", err
	}

	return tokenStr, nil
}

// ResetPasswordWithToken validates the reset token and updates the user's password.
func (s *UserService) ResetPasswordWithToken(tokenStr, newPassword string) error {
	if len(newPassword) < 6 {
		return ErrWeakPassword
	}

	jwtSecret := os.Getenv("JWT_SECRET")
	if jwtSecret == "" {
		jwtSecret = "default_secret"
	}

	parsed, err := jwt.Parse(tokenStr, func(t *jwt.Token) (interface{}, error) {
		if _, ok := t.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, fmt.Errorf("unexpected signing method: %v", t.Header["alg"])
		}
		return []byte(jwtSecret), nil
	})
	if err != nil || !parsed.Valid {
		return ErrInvalidResetTkn
	}

	claims, ok := parsed.Claims.(jwt.MapClaims)
	if !ok {
		return ErrInvalidResetTkn
	}

	purpose, _ := claims["purpose"].(string)
	if purpose != "password_reset" {
		return ErrInvalidResetTkn
	}

	emailAddr, _ := claims["email"].(string)
	if emailAddr == "" {
		return ErrInvalidResetTkn
	}

	u, err := s.userRepo.GetByEmail(emailAddr)
	if err != nil {
		return err
	}
	if u == nil {
		return ErrUserNotFound
	}

	hashed, err := bcrypt.GenerateFromPassword([]byte(newPassword), bcrypt.DefaultCost)
	if err != nil {
		return err
	}

	pwd := string(hashed)
	u.Password = &pwd

	return s.userRepo.Update(u)
}
