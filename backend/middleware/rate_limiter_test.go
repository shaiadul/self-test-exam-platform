package middleware

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"net/http"
	"net/http/httptest"
	"sync"
	"sync/atomic"
	"testing"
	"time"

	"github.com/redis/go-redis/v9"
	"github.com/selftest/backend/config"
)

// mockScripter is a mock implementation of redis.Scripter for testing RedisRateLimitStore.
type mockScripter struct {
	evalShaFn func(ctx context.Context, sha1 string, keys []string, args ...interface{}) *redis.Cmd
	evalFn    func(ctx context.Context, script string, keys []string, args ...interface{}) *redis.Cmd
}

func (m *mockScripter) Eval(ctx context.Context, script string, keys []string, args ...interface{}) *redis.Cmd {
	if m.evalFn != nil {
		return m.evalFn(ctx, script, keys, args...)
	}
	cmd := redis.NewCmd(ctx)
	cmd.SetErr(errors.New("mock not implemented"))
	return cmd
}

func (m *mockScripter) EvalSha(ctx context.Context, sha1 string, keys []string, args ...interface{}) *redis.Cmd {
	if m.evalShaFn != nil {
		return m.evalShaFn(ctx, sha1, keys, args...)
	}
	if m.evalFn != nil {
		return m.evalFn(ctx, "", keys, args...)
	}
	cmd := redis.NewCmd(ctx)
	cmd.SetErr(errors.New("mock not implemented"))
	return cmd
}

func (m *mockScripter) EvalRO(ctx context.Context, script string, keys []string, args ...interface{}) *redis.Cmd {
	return m.Eval(ctx, script, keys, args...)
}

func (m *mockScripter) EvalShaRO(ctx context.Context, sha1 string, keys []string, args ...interface{}) *redis.Cmd {
	return m.EvalSha(ctx, sha1, keys, args...)
}

func (m *mockScripter) ScriptExists(ctx context.Context, hashes ...string) *redis.BoolSliceCmd {
	cmd := redis.NewBoolSliceCmd(ctx)
	cmd.SetVal([]bool{true})
	return cmd
}

func (m *mockScripter) ScriptLoad(ctx context.Context, script string) *redis.StringCmd {
	cmd := redis.NewStringCmd(ctx)
	cmd.SetVal("mocksha1")
	return cmd
}

// errorStore simulates a failing store (e.g. Redis connection failure).
type errorStore struct {
	err error
}

func (s *errorStore) Allow(ctx context.Context, key string, limit int, window time.Duration) (RateLimitResult, error) {
	return RateLimitResult{}, s.err
}

func okHandler() http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
		w.Write([]byte(`{"status":"ok"}`))
	})
}

// 1. Normal requests within limits
func TestRateLimiter_NormalRequestsWithinLimit(t *testing.T) {
	cfg := config.RateLimitConfig{
		Enabled:       true,
		FailOpen:      true,
		KeyPrefix:     "test",
		AuthLimit:     5,
		AuthWindow:    1 * time.Minute,
		GeneralLimit:  10,
		GeneralWindow: 1 * time.Minute,
	}

	store := NewMemoryRateLimitStore()
	limiter := NewRateLimiter(cfg, store)
	handler := limiter.Middleware(okHandler())

	for i := 1; i <= 3; i++ {
		req := httptest.NewRequest("GET", "/api/exams", nil)
		req.RemoteAddr = "192.168.1.10:1234"
		rec := httptest.NewRecorder()

		handler.ServeHTTP(rec, req)

		if rec.Code != http.StatusOK {
			t.Fatalf("request %d: expected status 200, got %d", i, rec.Code)
		}

		limitHeader := rec.Header().Get("X-RateLimit-Limit")
		if limitHeader != "10" {
			t.Errorf("expected limit header '10', got '%s'", limitHeader)
		}

		remainingHeader := rec.Header().Get("X-RateLimit-Remaining")
		expectedRemaining := fmt.Sprintf("%d", 10-i)
		if remainingHeader != expectedRemaining {
			t.Errorf("request %d: expected remaining '%s', got '%s'", i, expectedRemaining, remainingHeader)
		}
	}
}

// 2. Exceeded limits return HTTP 429 and Retry-After
func TestRateLimiter_ExceededLimit(t *testing.T) {
	limit := 3
	cfg := config.RateLimitConfig{
		Enabled:       true,
		FailOpen:      true,
		KeyPrefix:     "test",
		AuthLimit:     limit,
		AuthWindow:    10 * time.Second,
		GeneralLimit:  limit,
		GeneralWindow: 10 * time.Second,
	}

	store := NewMemoryRateLimitStore()
	limiter := NewRateLimiter(cfg, store)
	handler := limiter.Middleware(okHandler())

	clientIP := "10.0.0.1:5000"

	// Exhaust the limit
	for i := 0; i < limit; i++ {
		req := httptest.NewRequest("GET", "/api/exams", nil)
		req.RemoteAddr = clientIP
		rec := httptest.NewRecorder()
		handler.ServeHTTP(rec, req)
		if rec.Code != http.StatusOK {
			t.Fatalf("expected request %d to succeed, got %d", i+1, rec.Code)
		}
	}

	// Next request must be blocked with 429
	req := httptest.NewRequest("GET", "/api/exams", nil)
	req.RemoteAddr = clientIP
	rec := httptest.NewRecorder()
	handler.ServeHTTP(rec, req)

	if rec.Code != http.StatusTooManyRequests {
		t.Fatalf("expected status 429 Too Many Requests, got %d", rec.Code)
	}

	retryAfter := rec.Header().Get("Retry-After")
	if retryAfter == "" || retryAfter == "0" {
		t.Errorf("expected non-empty Retry-After header, got '%s'", retryAfter)
	}

	remaining := rec.Header().Get("X-RateLimit-Remaining")
	if remaining != "0" {
		t.Errorf("expected remaining '0', got '%s'", remaining)
	}

	var resp RateLimitErrorResponse
	if err := json.NewDecoder(rec.Body).Decode(&resp); err != nil {
		t.Fatalf("failed to decode 429 response body: %v", err)
	}

	if resp.Error == "" {
		t.Errorf("expected error message in response body")
	}
	if resp.RetryAfter <= 0 {
		t.Errorf("expected retry_after > 0, got %d", resp.RetryAfter)
	}
}

// 3. Different limits for Auth vs General APIs
func TestRateLimiter_DifferentLimitsForAuthAndGeneral(t *testing.T) {
	cfg := config.RateLimitConfig{
		Enabled:       true,
		FailOpen:      true,
		KeyPrefix:     "test",
		AuthLimit:     2, // stricter auth limit
		AuthWindow:    1 * time.Minute,
		GeneralLimit:  5, // higher general limit
		GeneralWindow: 1 * time.Minute,
	}

	store := NewMemoryRateLimitStore()
	limiter := NewRateLimiter(cfg, store)
	handler := limiter.Middleware(okHandler())

	clientIP := "172.16.0.5:8080"

	// 1. Consume 2 auth requests
	for i := 0; i < 2; i++ {
		req := httptest.NewRequest("POST", "/api/auth/login", nil)
		req.RemoteAddr = clientIP
		rec := httptest.NewRecorder()
		handler.ServeHTTP(rec, req)
		if rec.Code != http.StatusOK {
			t.Fatalf("auth request %d failed: %d", i+1, rec.Code)
		}
	}

	// 2. 3rd auth request should be blocked (exceeded AuthLimit of 2)
	reqAuthBlocked := httptest.NewRequest("POST", "/api/auth/login", nil)
	reqAuthBlocked.RemoteAddr = clientIP
	recAuthBlocked := httptest.NewRecorder()
	handler.ServeHTTP(recAuthBlocked, reqAuthBlocked)
	if recAuthBlocked.Code != http.StatusTooManyRequests {
		t.Fatalf("expected 3rd auth request to return 429, got %d", recAuthBlocked.Code)
	}

	// 3. General endpoint from SAME IP should STILL be allowed because it has its own limit (5)
	for i := 0; i < 5; i++ {
		reqGeneral := httptest.NewRequest("GET", "/api/exam-packs", nil)
		reqGeneral.RemoteAddr = clientIP
		recGeneral := httptest.NewRecorder()
		handler.ServeHTTP(recGeneral, reqGeneral)
		if recGeneral.Code != http.StatusOK {
			t.Fatalf("general request %d should be allowed, got status %d", i+1, recGeneral.Code)
		}
	}

	// 4. 6th general request is blocked
	reqGeneralBlocked := httptest.NewRequest("GET", "/api/exam-packs", nil)
	reqGeneralBlocked.RemoteAddr = clientIP
	recGeneralBlocked := httptest.NewRecorder()
	handler.ServeHTTP(recGeneralBlocked, reqGeneralBlocked)
	if recGeneralBlocked.Code != http.StatusTooManyRequests {
		t.Fatalf("expected 6th general request to return 429, got %d", recGeneralBlocked.Code)
	}
}

// 4. Concurrent requests (Race condition / atomicity verification)
func TestRateLimiter_ConcurrentRequests(t *testing.T) {
	limit := 20
	totalRequests := 100

	cfg := config.RateLimitConfig{
		Enabled:       true,
		FailOpen:      true,
		KeyPrefix:     "test",
		AuthLimit:     limit,
		AuthWindow:    1 * time.Minute,
		GeneralLimit:  limit,
		GeneralWindow: 1 * time.Minute,
	}

	store := NewMemoryRateLimitStore()
	limiter := NewRateLimiter(cfg, store)
	handler := limiter.Middleware(okHandler())

	var successCount int64
	var blockedCount int64

	var wg sync.WaitGroup
	wg.Add(totalRequests)

	for i := 0; i < totalRequests; i++ {
		go func() {
			defer wg.Done()
			req := httptest.NewRequest("GET", "/api/exams", nil)
			req.RemoteAddr = "192.168.100.50:4000"
			rec := httptest.NewRecorder()

			handler.ServeHTTP(rec, req)

			if rec.Code == http.StatusOK {
				atomic.AddInt64(&successCount, 1)
			} else if rec.Code == http.StatusTooManyRequests {
				atomic.AddInt64(&blockedCount, 1)
			}
		}()
	}

	wg.Wait()

	if successCount != int64(limit) {
		t.Errorf("expected exactly %d successful requests, got %d", limit, successCount)
	}
	if blockedCount != int64(totalRequests-limit) {
		t.Errorf("expected %d blocked requests, got %d", totalRequests-limit, blockedCount)
	}
}

// 5. Redis failure scenarios: Fail-Open vs Fail-Closed
func TestRateLimiter_RedisFailure_FailOpen(t *testing.T) {
	cfg := config.RateLimitConfig{
		Enabled:       true,
		FailOpen:      true, // fail-open enabled
		KeyPrefix:     "test",
		AuthLimit:     5,
		AuthWindow:    1 * time.Minute,
		GeneralLimit:  10,
		GeneralWindow: 1 * time.Minute,
	}

	// Simulating broken Redis connection
	limiter := NewRateLimiter(cfg, &errorStore{err: errors.New("redis connection refused")})
	handler := limiter.Middleware(okHandler())

	req := httptest.NewRequest("GET", "/api/exams", nil)
	rec := httptest.NewRecorder()

	handler.ServeHTTP(rec, req)

	// Under fail-open, request must proceed successfully
	if rec.Code != http.StatusOK {
		t.Errorf("fail-open expected status 200, got %d", rec.Code)
	}

	fallbackHeader := rec.Header().Get("X-RateLimit-Fallback")
	if fallbackHeader != "fail-open" {
		t.Errorf("expected X-RateLimit-Fallback 'fail-open', got '%s'", fallbackHeader)
	}
}

func TestRateLimiter_RedisFailure_FailClosed(t *testing.T) {
	cfg := config.RateLimitConfig{
		Enabled:       true,
		FailOpen:      false, // fail-closed enabled
		KeyPrefix:     "test",
		AuthLimit:     5,
		AuthWindow:    1 * time.Minute,
		GeneralLimit:  10,
		GeneralWindow: 1 * time.Minute,
	}

	limiter := NewRateLimiter(cfg, &errorStore{err: errors.New("redis connection timed out")})
	handler := limiter.Middleware(okHandler())

	req := httptest.NewRequest("GET", "/api/exams", nil)
	rec := httptest.NewRecorder()

	handler.ServeHTTP(rec, req)

	// Under fail-closed, request must be rejected with 503
	if rec.Code != http.StatusServiceUnavailable {
		t.Errorf("fail-closed expected status 503, got %d", rec.Code)
	}
}

// 6. OPTIONS preflight requests bypass rate limiting
func TestRateLimiter_OptionsBypass(t *testing.T) {
	cfg := config.RateLimitConfig{
		Enabled:       true,
		FailOpen:      false,
		KeyPrefix:     "test",
		AuthLimit:     1,
		AuthWindow:    1 * time.Minute,
		GeneralLimit:  1,
		GeneralWindow: 1 * time.Minute,
	}

	store := NewMemoryRateLimitStore()
	limiter := NewRateLimiter(cfg, store)
	handler := limiter.Middleware(okHandler())

	clientIP := "192.168.1.99:9999"

	// Send multiple OPTIONS requests
	for i := 0; i < 5; i++ {
		req := httptest.NewRequest("OPTIONS", "/api/auth/login", nil)
		req.RemoteAddr = clientIP
		rec := httptest.NewRecorder()
		handler.ServeHTTP(rec, req)

		if rec.Code != http.StatusOK {
			t.Errorf("OPTIONS request %d failed: %d", i+1, rec.Code)
		}
	}

	// 1 actual POST request should still succeed because OPTIONS consumed no tokens
	req := httptest.NewRequest("POST", "/api/auth/login", nil)
	req.RemoteAddr = clientIP
	rec := httptest.NewRecorder()
	handler.ServeHTTP(rec, req)

	if rec.Code != http.StatusOK {
		t.Errorf("expected POST request to succeed after OPTIONS, got %d", rec.Code)
	}
}

// 7. Client IP extraction tests
func TestRateLimiter_ClientIPExtraction(t *testing.T) {
	tests := []struct {
		name       string
		headers    map[string]string
		remoteAddr string
		expectedIP string
	}{
		{
			name: "X-Forwarded-For single IP",
			headers: map[string]string{
				"X-Forwarded-For": "203.0.113.195",
			},
			remoteAddr: "10.0.0.1:1234",
			expectedIP: "203.0.113.195",
		},
		{
			name: "X-Forwarded-For multiple IPs (extract first client IP)",
			headers: map[string]string{
				"X-Forwarded-For": "203.0.113.195, 70.41.3.18, 150.172.238.178",
			},
			remoteAddr: "10.0.0.1:1234",
			expectedIP: "203.0.113.195",
		},
		{
			name: "X-Real-IP header",
			headers: map[string]string{
				"X-Real-IP": "198.51.100.12",
			},
			remoteAddr: "10.0.0.1:1234",
			expectedIP: "198.51.100.12",
		},
		{
			name:       "Fallback to RemoteAddr with port",
			headers:    map[string]string{},
			remoteAddr: "192.0.2.1:54321",
			expectedIP: "192.0.2.1",
		},
		{
			name:       "Fallback to RemoteAddr IPv6 with port",
			headers:    map[string]string{},
			remoteAddr: "[2001:db8::1]:8080",
			expectedIP: "2001:db8::1",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			req := httptest.NewRequest("GET", "/api/test", nil)
			req.RemoteAddr = tt.remoteAddr
			for k, v := range tt.headers {
				req.Header.Set(k, v)
			}

			ip := DefaultKeyExtractor(req)
			if ip != tt.expectedIP {
				t.Errorf("expected IP '%s', got '%s'", tt.expectedIP, ip)
			}
		})
	}
}

// 8. Rate limiter globally disabled
func TestRateLimiter_Disabled(t *testing.T) {
	cfg := config.RateLimitConfig{
		Enabled:       false, // Disabled
		FailOpen:      false,
		KeyPrefix:     "test",
		AuthLimit:     1,
		AuthWindow:    1 * time.Minute,
		GeneralLimit:  1,
		GeneralWindow: 1 * time.Minute,
	}

	store := NewMemoryRateLimitStore()
	limiter := NewRateLimiter(cfg, store)
	handler := limiter.Middleware(okHandler())

	// Send 10 requests even though limit is 1
	for i := 0; i < 10; i++ {
		req := httptest.NewRequest("GET", "/api/exams", nil)
		rec := httptest.NewRecorder()
		handler.ServeHTTP(rec, req)

		if rec.Code != http.StatusOK {
			t.Errorf("disabled limiter: request %d failed with status %d", i+1, rec.Code)
		}
	}
}

// 9. RedisRateLimitStore with Mock Scripter and Nil Client
func TestRedisRateLimitStore_NilClient(t *testing.T) {
	store := NewRedisRateLimitStore(nil)
	_, err := store.Allow(context.Background(), "test:key", 10, time.Minute)
	if !errors.Is(err, ErrRedisNil) {
		t.Errorf("expected ErrRedisNil, got %v", err)
	}
}

func TestRedisRateLimitStore_MockAllowed(t *testing.T) {
	mock := &mockScripter{
		evalShaFn: func(ctx context.Context, sha1 string, keys []string, args ...interface{}) *redis.Cmd {
			cmd := redis.NewCmd(ctx)
			// Return {allowed=1, remaining=9, retryAfter=0}
			cmd.SetVal([]interface{}{int64(1), int64(9), int64(0)})
			return cmd
		},
	}

	store := NewRedisRateLimitStore(mock)
	res, err := store.Allow(context.Background(), "ratelimit:general:1.2.3.4", 10, time.Minute)
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}

	if !res.Allowed {
		t.Errorf("expected allowed to be true")
	}
	if res.Remaining != 9 {
		t.Errorf("expected remaining 9, got %d", res.Remaining)
	}
	if res.RetryAfter != 0 {
		t.Errorf("expected retry after 0, got %v", res.RetryAfter)
	}
}

func TestRedisRateLimitStore_MockBlocked(t *testing.T) {
	mock := &mockScripter{
		evalShaFn: func(ctx context.Context, sha1 string, keys []string, args ...interface{}) *redis.Cmd {
			cmd := redis.NewCmd(ctx)
			// Return {allowed=0, remaining=0, retryAfter=15}
			cmd.SetVal([]interface{}{int64(0), int64(0), int64(15)})
			return cmd
		},
	}

	store := NewRedisRateLimitStore(mock)
	res, err := store.Allow(context.Background(), "ratelimit:auth:1.2.3.4", 5, time.Minute)
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}

	if res.Allowed {
		t.Errorf("expected allowed to be false")
	}
	if res.Remaining != 0 {
		t.Errorf("expected remaining 0, got %d", res.Remaining)
	}
	if res.RetryAfter != 15*time.Second {
		t.Errorf("expected retry after 15s, got %v", res.RetryAfter)
	}
}
