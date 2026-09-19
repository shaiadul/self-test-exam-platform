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
	"golang.org/x/oauth2/facebook"
	"golang.org/x/oauth2/google"

	"github.com/selftest/backend/internal/domain/user"
)

type OAuthService struct {
	googleConfig   *oauth2.Config
	facebookConfig *oauth2.Config
	frontendURL    string
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

	facebookClientID := os.Getenv("FACEBOOK_CLIENT_ID")
	if facebookClientID == "" {
		facebookClientID = os.Getenv("AUTH_FACEBOOK_ID")
	}
	facebookClientSecret := os.Getenv("FACEBOOK_CLIENT_SECRET")
	if facebookClientSecret == "" {
		facebookClientSecret = os.Getenv("AUTH_FACEBOOK_SECRET")
	}
	facebookRedirectURL := os.Getenv("FACEBOOK_REDIRECT_URI")
	if facebookRedirectURL == "" {
		facebookRedirectURL = fmt.Sprintf("%s/api/auth/oauth/facebook/callback", backendURL)
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

	fbScopes := []string{"public_profile"}
	if envScope := os.Getenv("FACEBOOK_SCOPE"); envScope != "" {
		parts := strings.Split(envScope, ",")
		var cleaned []string
		for _, p := range parts {
			if s := strings.TrimSpace(p); s != "" {
				cleaned = append(cleaned, s)
			}
		}
		if len(cleaned) > 0 {
			fbScopes = cleaned
		}
	}

	facebookConfig := &oauth2.Config{
		ClientID:     facebookClientID,
		ClientSecret: facebookClientSecret,
		RedirectURL:  facebookRedirectURL,
		Scopes:       fbScopes,
		Endpoint:     facebook.Endpoint,
	}

	return &OAuthService{
		googleConfig:   googleConfig,
		facebookConfig: facebookConfig,
		frontendURL:    frontendURL,
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
	case "facebook":
		if s.facebookConfig.ClientID == "" {
			return "", errors.New("facebook OAuth client id not configured")
		}
		return s.facebookConfig.AuthCodeURL(state), nil
	default:
		return "", fmt.Errorf("unsupported oauth provider: %s", provider)
	}
}

func (s *OAuthService) ExchangeAndFetchUser(ctx context.Context, provider, code string) (*user.SocialLoginRequest, error) {
	switch strings.ToLower(provider) {
	case "google":
		return s.fetchGoogleUser(ctx, code)
	case "facebook":
		return s.fetchFacebookUser(ctx, code)
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

func (s *OAuthService) fetchFacebookUser(ctx context.Context, code string) (*user.SocialLoginRequest, error) {
	token, err := s.facebookConfig.Exchange(ctx, code)
	if err != nil {
		return nil, fmt.Errorf("failed to exchange facebook auth code: %w", err)
	}

	client := s.facebookConfig.Client(ctx, token)
	resp, err := client.Get("https://graph.facebook.com/me?fields=id,name,email,picture.type(large)")
	if err != nil {
		return nil, fmt.Errorf("failed to fetch facebook user info: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		body, _ := io.ReadAll(resp.Body)
		return nil, fmt.Errorf("facebook graph returned %d: %s", resp.StatusCode, string(body))
	}

	var data struct {
		ID      string `json:"id"`
		Name    string `json:"name"`
		Email   string `json:"email"`
		Picture struct {
			Data struct {
				URL string `json:"url"`
			} `json:"data"`
		} `json:"picture"`
	}

	if err := json.NewDecoder(resp.Body).Decode(&data); err != nil {
		return nil, fmt.Errorf("failed to decode facebook user info: %w", err)
	}

	if data.ID == "" {
		return nil, errors.New("incomplete profile information received from Facebook")
	}

	// Facebook occasionally might not return email if unverified or phone registered
	email := data.Email
	if email == "" {
		email = fmt.Sprintf("fb_%s@facebook.user", data.ID)
	}

	var imgPtr *string
	if data.Picture.Data.URL != "" {
		imgPtr = &data.Picture.Data.URL
	}
	tokStr := token.AccessToken

	return &user.SocialLoginRequest{
		Provider:    "facebook",
		ProviderID:  data.ID,
		Email:       email,
		Name:        data.Name,
		Image:       imgPtr,
		AccessToken: &tokStr,
	}, nil
}
