package http

import (
	"crypto/rand"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"net/http"
	"net/url"
	"strconv"
	"strings"
	"time"

	"github.com/selftest/backend/internal/domain/user"
	"github.com/selftest/backend/internal/infrastructure/oauth"
	"github.com/selftest/backend/internal/service"
	"github.com/selftest/backend/middleware"
	"github.com/selftest/backend/pkg/pagination"
)

type AuthHandler struct {
	userService  *service.UserService
	oauthService *oauth.OAuthService
}

func NewAuthHandler(userService *service.UserService, oauthService *oauth.OAuthService) *AuthHandler {
	return &AuthHandler{
		userService:  userService,
		oauthService: oauthService,
	}
}

func (h *AuthHandler) Register(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, `{"error": "Method not allowed"}`, http.StatusMethodNotAllowed)
		return
	}

	var req user.RegisterRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, `{"error": "Invalid request body"}`, http.StatusBadRequest)
		return
	}

	res, err := h.userService.Register(req)
	if err != nil {
		switch err {
		case service.ErrMissingFields:
			http.Error(w, `{"error": "Name, email, and password are required"}`, http.StatusBadRequest)
		case service.ErrEmailExists:
			http.Error(w, `{"error": "Email is already registered"}`, http.StatusConflict)
		default:
			http.Error(w, fmt.Sprintf(`{"error": "%v"}`, err), http.StatusInternalServerError)
		}
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(res)
}

func (h *AuthHandler) Login(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, `{"error": "Method not allowed"}`, http.StatusMethodNotAllowed)
		return
	}

	var req user.LoginRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, `{"error": "Invalid request body"}`, http.StatusBadRequest)
		return
	}

	res, err := h.userService.Login(req)
	if err != nil {
		if err == service.ErrInvalidCreds {
			http.Error(w, `{"error": "Invalid email or password"}`, http.StatusUnauthorized)
			return
		}
		http.Error(w, fmt.Sprintf(`{"error": "%v"}`, err), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(res)
}

func (h *AuthHandler) GetProfile(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, `{"error": "Method not allowed"}`, http.StatusMethodNotAllowed)
		return
	}

	userID, err := middleware.GetUserIDFromContext(r.Context())
	if err != nil {
		http.Error(w, `{"error": "Unauthorized context"}`, http.StatusUnauthorized)
		return
	}

	u, err := h.userService.GetProfile(userID)
	if err != nil {
		if err == service.ErrUserNotFound {
			http.Error(w, `{"error": "User not found"}`, http.StatusNotFound)
			return
		}
		http.Error(w, fmt.Sprintf(`{"error": "%v"}`, err), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(u)
}

func (h *AuthHandler) CompleteProfile(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost && r.Method != http.MethodPut {
		http.Error(w, `{"error": "Method not allowed"}`, http.StatusMethodNotAllowed)
		return
	}

	userID, err := middleware.GetUserIDFromContext(r.Context())
	if err != nil {
		http.Error(w, `{"error": "Unauthorized context"}`, http.StatusUnauthorized)
		return
	}

	var req user.CompleteProfileRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, `{"error": "Invalid request body"}`, http.StatusBadRequest)
		return
	}

	u, err := h.userService.CompleteProfile(userID, req)
	if err != nil {
		if err == service.ErrUserNotFound {
			http.Error(w, `{"error": "User not found"}`, http.StatusNotFound)
			return
		}
		http.Error(w, fmt.Sprintf(`{"error": "%v"}`, err), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(u)
}

func (h *AuthHandler) HandleAdminUsers(w http.ResponseWriter, r *http.Request) {
	path := r.URL.Path
	if path == "/api/admin/users" || path == "/api/admin/users/" {
		if r.Method == http.MethodGet {
			users, err := h.userService.ListUsers()
			if err != nil {
				http.Error(w, fmt.Sprintf(`{"error": "Failed to fetch users: %v"}`, err), http.StatusInternalServerError)
				return
			}

			params := pagination.Parse(r)
			if params.Search != "" {
				lowerSearch := strings.ToLower(params.Search)
				filtered := make([]user.User, 0)
				for _, u := range users {
					if strings.Contains(strings.ToLower(u.Name), lowerSearch) ||
						strings.Contains(strings.ToLower(u.Email), lowerSearch) ||
						strings.Contains(strings.ToLower(u.Role), lowerSearch) {
						filtered = append(filtered, u)
					}
				}
				users = filtered
			}

			resp := pagination.PaginateSlice(users, params)
			w.Header().Set("Content-Type", "application/json")
			json.NewEncoder(w).Encode(resp)
		} else {
			http.Error(w, `{"error": "Method not allowed"}`, http.StatusMethodNotAllowed)
		}
		return
	}

	idStr := strings.TrimPrefix(path, "/api/admin/users/")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		http.Error(w, `{"error": "Invalid ID parameter"}`, http.StatusBadRequest)
		return
	}

	switch r.Method {
	case http.MethodPut:
		var req struct {
			Role          *string `json:"role"`
			ExamLimit     *int    `json:"examLimit"`
			ExamPackLimit *int    `json:"examPackLimit"`
		}
		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			http.Error(w, `{"error": "Invalid request body"}`, http.StatusBadRequest)
			return
		}
		if err := h.userService.UpdateUserRoleAndLimit(id, req.Role, req.ExamLimit); err != nil {
			http.Error(w, fmt.Sprintf(`{"error": "Failed to update user: %v"}`, err), http.StatusInternalServerError)
			return
		}
		if err := h.userService.UpdateUserPackLimit(id, req.ExamPackLimit); err != nil {
			http.Error(w, fmt.Sprintf(`{"error": "Failed to update user: %v"}`, err), http.StatusInternalServerError)
			return
		}
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusOK)
		w.Write([]byte(`{"success": true}`))

	case http.MethodDelete:
		if err := h.userService.DeleteUser(id); err != nil {
			http.Error(w, fmt.Sprintf(`{"error": "Failed to delete user: %v"}`, err), http.StatusInternalServerError)
			return
		}
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusOK)
		w.Write([]byte(`{"success": true}`))

	default:
		http.Error(w, `{"error": "Method not allowed"}`, http.StatusMethodNotAllowed)
	}
}

// HandleSocialLogin handles direct token/profile verification from Next.js Auth.js (POST /api/auth/oauth/social)
func (h *AuthHandler) HandleSocialLogin(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, `{"error": "Method not allowed"}`, http.StatusMethodNotAllowed)
		return
	}

	var req user.SocialLoginRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, `{"error": "Invalid request body"}`, http.StatusBadRequest)
		return
	}

	res, err := h.userService.SocialLogin(req)
	if err != nil {
		http.Error(w, fmt.Sprintf(`{"error": "%s"}`, err.Error()), http.StatusBadRequest)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(res)
}

// HandleOAuthRedirect initiates Go OAuth2 flow (GET /api/auth/oauth/{provider})
func (h *AuthHandler) HandleOAuthRedirect(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, `{"error": "Method not allowed"}`, http.StatusMethodNotAllowed)
		return
	}

	path := strings.Trim(r.URL.Path, "/")
	parts := strings.Split(path, "/")
	if len(parts) < 4 {
		http.Error(w, `{"error": "Invalid oauth provider"}`, http.StatusBadRequest)
		return
	}
	provider := parts[3]

	// Generate CSRF state
	stateBytes := make([]byte, 16)
	if _, err := rand.Read(stateBytes); err != nil {
		http.Error(w, `{"error": "Failed to generate oauth state"}`, http.StatusInternalServerError)
		return
	}
	state := hex.EncodeToString(stateBytes)

	// Set state cookie
	http.SetCookie(w, &http.Cookie{
		Name:     "oauth_state",
		Value:    state,
		Path:     "/",
		Expires:  time.Now().Add(10 * time.Minute),
		HttpOnly: true,
		SameSite: http.SameSiteLaxMode,
		Secure:   r.TLS != nil || r.Header.Get("X-Forwarded-Proto") == "https",
	})

	authURL, err := h.oauthService.GetAuthURL(provider, state)
	if err != nil {
		http.Error(w, fmt.Sprintf(`{"error": "%s"}`, err.Error()), http.StatusBadRequest)
		return
	}

	http.Redirect(w, r, authURL, http.StatusTemporaryRedirect)
}

// HandleOAuthCallback handles provider callback in Go OAuth2 flow (GET /api/auth/oauth/{provider}/callback)
func (h *AuthHandler) HandleOAuthCallback(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, `{"error": "Method not allowed"}`, http.StatusMethodNotAllowed)
		return
	}

	path := strings.Trim(r.URL.Path, "/")
	parts := strings.Split(path, "/")
	if len(parts) < 4 {
		http.Error(w, `{"error": "Invalid oauth callback"}`, http.StatusBadRequest)
		return
	}
	provider := parts[3]

	// Check for provider error query params
	if errParam := r.URL.Query().Get("error"); errParam != "" {
		errDesc := r.URL.Query().Get("error_description")
		if errDesc == "" {
			errDesc = errParam
		}
		target := fmt.Sprintf("%s/auth/login?error=%s", h.oauthService.GetFrontendURL(), url.QueryEscape(errDesc))
		http.Redirect(w, r, target, http.StatusTemporaryRedirect)
		return
	}

	code := r.URL.Query().Get("code")
	if code == "" {
		target := fmt.Sprintf("%s/auth/login?error=missing_oauth_code", h.oauthService.GetFrontendURL())
		http.Redirect(w, r, target, http.StatusTemporaryRedirect)
		return
	}

	// Validate state
	state := r.URL.Query().Get("state")
	if stateCookie, err := r.Cookie("oauth_state"); err == nil && stateCookie.Value != "" {
		if stateCookie.Value != state {
			target := fmt.Sprintf("%s/auth/login?error=invalid_oauth_state", h.oauthService.GetFrontendURL())
			http.Redirect(w, r, target, http.StatusTemporaryRedirect)
			return
		}
	}

	// Exchange code for user details
	socialReq, err := h.oauthService.ExchangeAndFetchUser(r.Context(), provider, code)
	if err != nil {
		target := fmt.Sprintf("%s/auth/login?error=%s", h.oauthService.GetFrontendURL(), url.QueryEscape(err.Error()))
		http.Redirect(w, r, target, http.StatusTemporaryRedirect)
		return
	}

	// Upsert / login in user service
	res, err := h.userService.SocialLogin(*socialReq)
	if err != nil {
		target := fmt.Sprintf("%s/auth/login?error=%s", h.oauthService.GetFrontendURL(), url.QueryEscape(err.Error()))
		http.Redirect(w, r, target, http.StatusTemporaryRedirect)
		return
	}

	// Set auth cookie
	http.SetCookie(w, &http.Cookie{
		Name:     "token",
		Value:    res.Token,
		Path:     "/",
		Expires:  time.Now().Add(24 * time.Hour),
		HttpOnly: false,
		SameSite: http.SameSiteLaxMode,
	})

	// Redirect to frontend callback page to finalize session
	imgStr := ""
	if res.User.Image != nil {
		imgStr = *res.User.Image
	}
	target := fmt.Sprintf("%s/auth/callback?token=%s&role=%s&name=%s&id=%d&email=%s&image=%s",
		h.oauthService.GetFrontendURL(),
		url.QueryEscape(res.Token),
		url.QueryEscape(res.User.Role),
		url.QueryEscape(res.User.Name),
		res.User.ID,
		url.QueryEscape(res.User.Email),
		url.QueryEscape(imgStr),
	)

	http.Redirect(w, r, target, http.StatusTemporaryRedirect)
}

func (h *AuthHandler) Logout(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, `{"error": "Method not allowed"}`, http.StatusMethodNotAllowed)
		return
	}

	// Invalidate any auth cookie set by the server
	http.SetCookie(w, &http.Cookie{
		Name:     "token",
		Value:    "",
		Path:     "/",
		Expires:  time.Unix(0, 0),
		MaxAge:   -1,
		HttpOnly: true,
		SameSite: http.SameSiteLaxMode,
	})

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]interface{}{
		"success": true,
		"message": "Logged out successfully",
	})
}

// HandleForgotPassword triggers the password reset OTP flow (POST /api/auth/forgot-password).
func (h *AuthHandler) HandleForgotPassword(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, `{"error": "Method not allowed"}`, http.StatusMethodNotAllowed)
		return
	}

	var req struct {
		Email string `json:"email"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, `{"error": "Invalid request body"}`, http.StatusBadRequest)
		return
	}

	if err := h.userService.RequestPasswordResetOTP(req.Email); err != nil {
		switch err {
		case service.ErrOTPRateLimit:
			http.Error(w, `{"error": "Please wait before requesting a new OTP"}`, http.StatusTooManyRequests)
		case service.ErrMissingFields:
			http.Error(w, `{"error": "Email is required"}`, http.StatusBadRequest)
		default:
			http.Error(w, fmt.Sprintf(`{"error": "%v"}`, err), http.StatusInternalServerError)
		}
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	w.Write([]byte(`{"success": true, "message": "If this email is registered, a recovery OTP has been sent."}`))
}

// HandleVerifyOTP validates the OTP and returns a short-lived reset token (POST /api/auth/verify-otp).
func (h *AuthHandler) HandleVerifyOTP(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, `{"error": "Method not allowed"}`, http.StatusMethodNotAllowed)
		return
	}

	var req struct {
		Email string `json:"email"`
		OTP   string `json:"otp"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, `{"error": "Invalid request body"}`, http.StatusBadRequest)
		return
	}

	resetToken, err := h.userService.VerifyPasswordResetOTP(req.Email, req.OTP)
	if err != nil {
		switch err {
		case service.ErrOTPExpired:
			http.Error(w, `{"error": "Invalid or expired OTP"}`, http.StatusUnauthorized)
		case service.ErrMissingFields:
			http.Error(w, `{"error": "Email and OTP are required"}`, http.StatusBadRequest)
		default:
			http.Error(w, fmt.Sprintf(`{"error": "%v"}`, err), http.StatusInternalServerError)
		}
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"success":    true,
		"resetToken": resetToken,
	})
}

// HandleResetPassword updates the user's password with a valid reset token (POST /api/auth/reset-password).
func (h *AuthHandler) HandleResetPassword(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, `{"error": "Method not allowed"}`, http.StatusMethodNotAllowed)
		return
	}

	var req struct {
		Token    string `json:"token"`
		Password string `json:"password"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, `{"error": "Invalid request body"}`, http.StatusBadRequest)
		return
	}

	if err := h.userService.ResetPasswordWithToken(req.Token, req.Password); err != nil {
		switch err {
		case service.ErrInvalidResetTkn:
			http.Error(w, `{"error": "Invalid or expired reset token"}`, http.StatusUnauthorized)
		case service.ErrWeakPassword:
			http.Error(w, `{"error": "Password must be at least 6 characters"}`, http.StatusBadRequest)
		case service.ErrUserNotFound:
			http.Error(w, `{"error": "User not found"}`, http.StatusNotFound)
		default:
			http.Error(w, fmt.Sprintf(`{"error": "%v"}`, err), http.StatusInternalServerError)
		}
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	w.Write([]byte(`{"success": true, "message": "Password has been reset successfully."}`))
}
