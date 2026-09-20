package oauth

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"net/http"
	"os"
	"strings"

	"golang.org/x/oauth2"
	"golang.org/x/oauth2/github"
	"golang.org/x/oauth2/google"

	"github.com/selftest/backend/internal/domain/user"
)

type OAuthService struct {
	googleConfig *oauth2.Config
	githubConfig *oauth2.Config
	frontendURL  string
}

func NewOAuthService() *OAuthService {
	backendURL := os.Getenv("BACKEND_URL")
	if backendURL == "" {
		port := os.Getenv("PORT")
		if port == "" {
			port = "8080"
		}
		backendURL = fmt.Sprintf("http://localhost:%s", port)
	}

	frontendURL := os.Getenv("FRONTEND_URL")
	if frontendURL == "" {
		frontendURL = "http://localhost:3000"
	}

	googleClientID := os.Getenv("GOOGLE_CLIENT_ID")
	if googleClientID == "" {
		googleClientID = os.Getenv("AUTH_GOOGLE_ID")
	}
	googleClientSecret := os.Getenv("GOOGLE_CLIENT_SECRET")
	if googleClientSecret == "" {
		googleClientSecret = os.Getenv("AUTH_GOOGLE_SECRET")
	}
	googleRedirectURL := os.Getenv("GOOGLE_REDIRECT_URI")
	if googleRedirectURL == "" {
		googleRedirectURL = fmt.Sprintf("%s/api/auth/oauth/google/callback", backendURL)
	}

	githubClientID := os.Getenv("GITHUB_CLIENT_ID")
	if githubClientID == "" {
		githubClientID = os.Getenv("AUTH_GITHUB_ID")
	}
	githubClientSecret := os.Getenv("GITHUB_CLIENT_SECRET")
	if githubClientSecret == "" {
		githubClientSecret = os.Getenv("AUTH_GITHUB_SECRET")
	}
	githubRedirectURL := os.Getenv("GITHUB_REDIRECT_URI")
	if githubRedirectURL == "" {
		githubRedirectURL = fmt.Sprintf("%s/api/auth/oauth/github/callback", backendURL)
	}

	googleConfig := &oauth2.Config{
		ClientID:     googleClientID,
		ClientSecret: googleClientSecret,
		RedirectURL:  googleRedirectURL,
		Scopes: []string{
			"openid",
			"https://www.googleapis.com/auth/userinfo.email",
			"https://www.googleapis.com/auth/userinfo.profile",
		},
		Endpoint: google.Endpoint,
	}

	githubConfig := &oauth2.Config{
		ClientID:     githubClientID,
		ClientSecret: githubClientSecret,
		RedirectURL:  githubRedirectURL,
		Scopes:       []string{"read:user", "user:email"},
		Endpoint:     github.Endpoint,
	}

	return &OAuthService{
		googleConfig: googleConfig,
		githubConfig: githubConfig,
		frontendURL:  frontendURL,
	}
}

func (s *OAuthService) GetFrontendURL() string {
	return s.frontendURL
}

func (s *OAuthService) GetAuthURL(provider, state string) (string, error) {
	switch strings.ToLower(provider) {
	case "google":
		if s.googleConfig.ClientID == "" {
			return "", errors.New("google OAuth client id not configured")
		}
		return s.googleConfig.AuthCodeURL(state, oauth2.AccessTypeOffline), nil
	case "github":
		if s.githubConfig.ClientID == "" {
			return "", errors.New("github OAuth client id not configured")
		}
		return s.githubConfig.AuthCodeURL(state), nil
	default:
		return "", fmt.Errorf("unsupported oauth provider: %s", provider)
	}
}

func (s *OAuthService) ExchangeAndFetchUser(ctx context.Context, provider, code string) (*user.SocialLoginRequest, error) {
	switch strings.ToLower(provider) {
	case "google":
		return s.fetchGoogleUser(ctx, code)
	case "github":
		return s.fetchGitHubUser(ctx, code)
	default:
		return nil, fmt.Errorf("unsupported oauth provider: %s", provider)
	}
}

func (s *OAuthService) fetchGoogleUser(ctx context.Context, code string) (*user.SocialLoginRequest, error) {
	token, err := s.googleConfig.Exchange(ctx, code)
	if err != nil {
		return nil, fmt.Errorf("failed to exchange google auth code: %w", err)
	}

	client := s.googleConfig.Client(ctx, token)
	resp, err := client.Get("https://www.googleapis.com/oauth2/v3/userinfo")
	if err != nil {
		return nil, fmt.Errorf("failed to fetch google user info: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		body, _ := io.ReadAll(resp.Body)
		return nil, fmt.Errorf("google userinfo returned %d: %s", resp.StatusCode, string(body))
	}

	var data struct {
		Sub     string `json:"sub"`
		Name    string `json:"name"`
		Email   string `json:"email"`
		Picture string `json:"picture"`
	}

	if err := json.NewDecoder(resp.Body).Decode(&data); err != nil {
		return nil, fmt.Errorf("failed to decode google user info: %w", err)
	}

	if data.Sub == "" || data.Email == "" {
		return nil, errors.New("incomplete profile information received from Google")
	}

	var imgPtr *string
	if data.Picture != "" {
		imgPtr = &data.Picture
	}
	tokStr := token.AccessToken

	return &user.SocialLoginRequest{
		Provider:    "google",
		ProviderID:  data.Sub,
		Email:       data.Email,
		Name:        data.Name,
		Image:       imgPtr,
		AccessToken: &tokStr,
	}, nil
}

func (s *OAuthService) fetchGitHubUser(ctx context.Context, code string) (*user.SocialLoginRequest, error) {
	token, err := s.githubConfig.Exchange(ctx, code)
	if err != nil {
		return nil, fmt.Errorf("failed to exchange github auth code: %w", err)
	}

	client := s.githubConfig.Client(ctx, token)

	// Fetch user profile
	resp, err := client.Get("https://api.github.com/user")
	if err != nil {
		return nil, fmt.Errorf("failed to fetch github user info: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		body, _ := io.ReadAll(resp.Body)
		return nil, fmt.Errorf("github user api returned %d: %s", resp.StatusCode, string(body))
	}

	var data struct {
		ID        int64  `json:"id"`
		Login     string `json:"login"`
		Name      string `json:"name"`
		Email     string `json:"email"`
		AvatarURL string `json:"avatar_url"`
	}

	if err := json.NewDecoder(resp.Body).Decode(&data); err != nil {
		return nil, fmt.Errorf("failed to decode github user info: %w", err)
	}

	if data.ID == 0 {
		return nil, errors.New("incomplete profile information received from GitHub")
	}

	// GitHub may not return email if it's private; fetch from emails endpoint
	email := data.Email
	if email == "" {
		email = s.fetchGitHubPrimaryEmail(ctx, client)
	}
	if email == "" {
		email = fmt.Sprintf("gh_%d@github.user", data.ID)
	}

	name := data.Name
	if name == "" {
		name = data.Login
	}

	var imgPtr *string
	if data.AvatarURL != "" {
		imgPtr = &data.AvatarURL
	}
	tokStr := token.AccessToken

	providerID := fmt.Sprintf("%d", data.ID)

	return &user.SocialLoginRequest{
		Provider:    "github",
		ProviderID:  providerID,
		Email:       email,
		Name:        name,
		Image:       imgPtr,
		AccessToken: &tokStr,
	}, nil
}

// fetchGitHubPrimaryEmail fetches the user's primary verified email from GitHub
func (s *OAuthService) fetchGitHubPrimaryEmail(ctx context.Context, client *http.Client) string {
	resp, err := client.Get("https://api.github.com/user/emails")
	if err != nil {
		return ""
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return ""
	}

	var emails []struct {
		Email    string `json:"email"`
		Primary  bool   `json:"primary"`
		Verified bool   `json:"verified"`
	}

	if err := json.NewDecoder(resp.Body).Decode(&emails); err != nil {
		return ""
	}

	// Prefer primary + verified email
	for _, e := range emails {
		if e.Primary && e.Verified {
			return e.Email
		}
	}
	// Fallback to any verified email
	for _, e := range emails {
		if e.Verified {
			return e.Email
		}
	}

	return ""
}
