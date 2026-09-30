package http_test

import (
	"net/http"
	"net/http/httptest"
	"testing"
	"time"

	"github.com/selftest/backend/config"
	delivery "github.com/selftest/backend/internal/delivery/http"
	"github.com/selftest/backend/middleware"
)

func TestRouter_RateLimiterIntegration(t *testing.T) {
	cfg := config.RateLimitConfig{
		Enabled:       true,
		FailOpen:      true,
		KeyPrefix:     "router_test",
		AuthLimit:     2,
		AuthWindow:    1 * time.Minute,
		GeneralLimit:  4,
		GeneralWindow: 1 * time.Minute,
	}

	memStore := middleware.NewMemoryRateLimitStore()
	limiter := middleware.NewRateLimiter(cfg, memStore)

	// Build router with dummy handlers
	handlers := delivery.Handlers{
		RateLimiter: limiter,
	}

	router := delivery.NewRouter(handlers)

	clientIP := "198.51.100.25:12345"

	// 1. OPTIONS request should pass CORS and not be affected by rate limiter
	optionsReq := httptest.NewRequest("OPTIONS", "/api/auth/login", nil)
	optionsReq.RemoteAddr = clientIP
	optionsRec := httptest.NewRecorder()
	router.ServeHTTP(optionsRec, optionsReq)

	if optionsRec.Code != http.StatusOK {
		t.Fatalf("expected OPTIONS to return 200, got %d", optionsRec.Code)
	}

	// 2. Auth endpoint rate limit: 2 allowed, 3rd blocked with 429
	for i := 1; i <= 2; i++ {
		req := httptest.NewRequest("POST", "/api/auth/login", nil)
		req.RemoteAddr = clientIP
		rec := httptest.NewRecorder()
		router.ServeHTTP(rec, req)

		// Could be 400 or 500 or 200 depending on nil authHandler, but definitely NOT 429
		if rec.Code == http.StatusTooManyRequests {
			t.Fatalf("auth request %d was unexpectedly rate limited (429)", i)
		}
	}

	// 3rd auth request must be 429
	reqAuth3 := httptest.NewRequest("POST", "/api/auth/login", nil)
	reqAuth3.RemoteAddr = clientIP
	recAuth3 := httptest.NewRecorder()
	router.ServeHTTP(recAuth3, reqAuth3)

	if recAuth3.Code != http.StatusTooManyRequests {
		t.Fatalf("expected 3rd auth request to return 429, got %d", recAuth3.Code)
	}

	if recAuth3.Header().Get("Retry-After") == "" {
		t.Errorf("expected Retry-After header on 429 response")
	}

	// 3. General endpoint from the same client is NOT blocked by auth quota
	reqGen1 := httptest.NewRequest("GET", "/api/exam-packs", nil)
	reqGen1.RemoteAddr = clientIP
	recGen1 := httptest.NewRecorder()
	router.ServeHTTP(recGen1, reqGen1)

	if recGen1.Code == http.StatusTooManyRequests {
		t.Fatalf("general request was unexpectedly rate limited due to auth quota")
	}
}
