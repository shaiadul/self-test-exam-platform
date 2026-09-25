package middleware

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"log"
	"math"
	"net"
	"net/http"
	"strconv"
	"strings"
	"sync"
	"sync/atomic"
	"time"

	"github.com/redis/go-redis/v9"
	"github.com/selftest/backend/config"
)

// ErrRedisNil is returned when the Redis client is uninitialized.
var ErrRedisNil = errors.New("rate limiter: redis client is nil")

var (
	// uniqueReqCounter generates distinct member identifiers for requests
	// occurring in the same millisecond.
	uniqueReqCounter uint64

	// slidingWindowScript is the atomic Lua script executed in Redis.
	// It uses a sorted set (ZSET) to implement a sliding window log:
	// - Prunes timestamps outside the rolling window [now - window, now].
	// - Counts requests currently in the window.
	// - If under limit, records the request with timestamp score and sets key TTL.
	// - If limit reached, calculates retry-after based on the earliest timestamp.
	slidingWindowScript = redis.NewScript(`
local key = KEYS[1]
local now = tonumber(ARGV[1])
local window = tonumber(ARGV[2])
local limit = tonumber(ARGV[3])
local memberId = ARGV[4]
local clearBefore = now - window

-- 1. Remove all entries older than the current sliding window
redis.call('ZREMRANGEBYSCORE', key, '-inf', clearBefore)

-- 2. Count active requests in current window
local currentRequests = redis.call('ZCARD', key)

if currentRequests < limit then
    -- Under limit: add current request
    redis.call('ZADD', key, now, now .. '-' .. memberId)
    -- Set/refresh TTL to window duration + 2s buffer so Redis cleans up automatically
    local ttlSeconds = math.ceil(window / 1000) + 2
    redis.call('EXPIRE', key, ttlSeconds)
    local remaining = limit - currentRequests - 1
    return {1, remaining, 0}
else
    -- Over limit: find oldest request to calculate exact retry-after
    local oldest = redis.call('ZRANGE', key, 0, 0, 'WITHSCORES')
    local retryAfter = 0
    if #oldest >= 2 then
        local oldestTime = tonumber(oldest[2])
        retryAfter = math.ceil((oldestTime + window - now) / 1000)
        if retryAfter < 1 then
            retryAfter = 1
        end
    else
        retryAfter = math.ceil(window / 1000)
    end
    -- Refresh TTL so blocked key does not expire prematurely
    local ttlSeconds = math.ceil(window / 1000) + 2
    redis.call('EXPIRE', key, ttlSeconds)
    return {0, 0, retryAfter}
end
`)
)

// APIType represents the tier/classification of an API endpoint.
type APIType string

const (
	APITypeAuth    APIType = "auth"
	APITypeGeneral APIType = "general"
)

// RateLimitResult contains the outcome of a rate limit check.
type RateLimitResult struct {
	Allowed    bool
	Remaining  int
	RetryAfter time.Duration
	Limit      int
}

// RateLimitErrorResponse is the JSON payload returned when rate limit is exceeded (HTTP 429).
type RateLimitErrorResponse struct {
	Error      string `json:"error"`
	RetryAfter int    `json:"retry_after"`
}

// RateLimitStore is the storage abstraction for rate limiting state.
type RateLimitStore interface {
	Allow(ctx context.Context, key string, limit int, window time.Duration) (RateLimitResult, error)
}

// RedisRateLimitStore implements RateLimitStore backed by Redis using atomic Lua scripts.
type RedisRateLimitStore struct {
	client redis.Scripter
}

// NewRedisRateLimitStore creates a new RedisRateLimitStore using the provided Redis scripter/client.
func NewRedisRateLimitStore(client redis.Scripter) *RedisRateLimitStore {
	return &RedisRateLimitStore{client: client}
}

// Allow checks and records a request atomically in Redis.
func (s *RedisRateLimitStore) Allow(ctx context.Context, key string, limit int, window time.Duration) (RateLimitResult, error) {
	if s.client == nil {
		return RateLimitResult{}, ErrRedisNil
	}

	nowMs := time.Now().UnixMilli()
	windowMs := window.Milliseconds()
	seq := atomic.AddUint64(&uniqueReqCounter, 1)
	memberId := strconv.FormatUint(seq, 10)

	res, err := slidingWindowScript.Run(ctx, s.client, []string{key}, nowMs, windowMs, limit, memberId).Result()
	if err != nil {
		return RateLimitResult{}, err
	}

	slice, ok := res.([]interface{})
	if !ok || len(slice) < 3 {
		return RateLimitResult{}, fmt.Errorf("unexpected script response: %v", res)
	}

	allowedVal, _ := slice[0].(int64)
	remainingVal, _ := slice[1].(int64)
	retryAfterVal, _ := slice[2].(int64)

	return RateLimitResult{
		Allowed:    allowedVal == 1,
		Remaining:  int(remainingVal),
		RetryAfter: time.Duration(retryAfterVal) * time.Second,
		Limit:      limit,
	}, nil
}

// MemoryRateLimitStore is a thread-safe in-memory sliding-window store,
// ideal for testing or local execution without Redis.
type MemoryRateLimitStore struct {
	mu      sync.Mutex
	buckets map[string][]int64 // key -> slice of timestamp ms
}

// NewMemoryRateLimitStore initializes an in-memory rate limit store.
func NewMemoryRateLimitStore() *MemoryRateLimitStore {
	return &MemoryRateLimitStore{
		buckets: make(map[string][]int64),
	}
}

// Allow executes a sliding window check in memory.
func (m *MemoryRateLimitStore) Allow(ctx context.Context, key string, limit int, window time.Duration) (RateLimitResult, error) {
	m.mu.Lock()
	defer m.mu.Unlock()

	now := time.Now().UnixMilli()
	windowMs := window.Milliseconds()
	clearBefore := now - windowMs

	timestamps := m.buckets[key]
	var valid []int64
	for _, ts := range timestamps {
		if ts > clearBefore {
			valid = append(valid, ts)
		}
	}

	if len(valid) < limit {
		valid = append(valid, now)
		m.buckets[key] = valid
		remaining := limit - len(valid)
		return RateLimitResult{
			Allowed:    true,
			Remaining:  remaining,
			RetryAfter: 0,
			Limit:      limit,
		}, nil
	}

	m.buckets[key] = valid
	oldest := valid[0]
	retryAfterSec := int(math.Ceil(float64(oldest+windowMs-now) / 1000.0))
	if retryAfterSec < 1 {
		retryAfterSec = 1
	}

	return RateLimitResult{
		Allowed:    false,
		Remaining:  0,
		RetryAfter: time.Duration(retryAfterSec) * time.Second,
		Limit:      limit,
	}, nil
}

// RouteClassifier determines whether a request is categorized as "auth" or "general".
type RouteClassifier func(r *http.Request) APIType

// DefaultRouteClassifier classifies all endpoints with prefix "/api/auth" as auth APIs,
// and all other endpoints as general APIs.
func DefaultRouteClassifier(r *http.Request) APIType {
	path := r.URL.Path
	if strings.HasPrefix(path, "/api/auth") {
		return APITypeAuth
	}
	return APITypeGeneral
}

// KeyExtractor extracts a unique client identifier (typically the client IP) from an HTTP request.
type KeyExtractor func(r *http.Request) string

// DefaultKeyExtractor extracts the client IP considering X-Forwarded-For, X-Real-IP, and RemoteAddr.
func DefaultKeyExtractor(r *http.Request) string {
	// 1. Check X-Forwarded-For (take the first IP in the chain)
	if xff := r.Header.Get("X-Forwarded-For"); xff != "" {
		ips := strings.Split(xff, ",")
		if len(ips) > 0 {
			ip := strings.TrimSpace(ips[0])
			if ip != "" {
				return ip
			}
		}
	}

	// 2. Check X-Real-IP
	if xrip := strings.TrimSpace(r.Header.Get("X-Real-IP")); xrip != "" {
		return xrip
	}

	// 3. Fallback to RemoteAddr
	host, _, err := net.SplitHostPort(r.RemoteAddr)
	if err == nil && host != "" {
		return host
	}

	if colonIdx := strings.LastIndex(r.RemoteAddr, ":"); colonIdx != -1 {
		return r.RemoteAddr[:colonIdx]
	}

	return r.RemoteAddr
}

// RateLimiter coordinates rate-limiting checks and provides an HTTP middleware.
type RateLimiter struct {
	config     config.RateLimitConfig
	store      RateLimitStore
	classifier RouteClassifier
	keyExtract KeyExtractor
}

// NewRateLimiter creates a RateLimiter with the given configuration and storage backend.
func NewRateLimiter(cfg config.RateLimitConfig, store RateLimitStore) *RateLimiter {
	return &RateLimiter{
		config:     cfg,
		store:      store,
		classifier: DefaultRouteClassifier,
		keyExtract: DefaultKeyExtractor,
	}
}

// SetClassifier allows overriding the route classification function.
func (rl *RateLimiter) SetClassifier(classifier RouteClassifier) {
	if classifier != nil {
		rl.classifier = classifier
	}
}

// SetKeyExtractor allows overriding the client key extraction function.
func (rl *RateLimiter) SetKeyExtractor(extractor KeyExtractor) {
	if extractor != nil {
		rl.keyExtract = extractor
	}
}

// getLimitAndWindow returns the configured limit and window for the given API type.
func (rl *RateLimiter) getLimitAndWindow(apiType APIType) (int, time.Duration) {
	if apiType == APITypeAuth {
		return rl.config.AuthLimit, rl.config.AuthWindow
	}
	return rl.config.GeneralLimit, rl.config.GeneralWindow
}

// Middleware creates a standard HTTP middleware that applies rate limiting globally.
func (rl *RateLimiter) Middleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		// If rate limiting is globally disabled, pass through immediately
		if !rl.config.Enabled {
			next.ServeHTTP(w, r)
			return
		}

		// CORS preflight requests (OPTIONS) should not consume rate limit tokens
		if r.Method == http.MethodOptions {
			next.ServeHTTP(w, r)
			return
		}

		apiType := rl.classifier(r)
		limit, window := rl.getLimitAndWindow(apiType)
		clientKey := rl.keyExtract(r)
		if clientKey == "" {
			clientKey = "unknown"
		}

		redisKey := fmt.Sprintf("%s:%s:%s", rl.config.KeyPrefix, apiType, clientKey)

		result, err := rl.store.Allow(r.Context(), redisKey, limit, window)
		if err != nil {
			// Handle Redis failure with configured fail-open or fail-closed strategy
			if rl.config.FailOpen {
				log.Printf("[RateLimiter] Store warning for key %s: %v (failing open)", redisKey, err)
				w.Header().Set("X-RateLimit-Fallback", "fail-open")
				next.ServeHTTP(w, r)
				return
			}

			log.Printf("[RateLimiter] Store error for key %s: %v (failing closed)", redisKey, err)
			w.Header().Set("Content-Type", "application/json")
			w.WriteHeader(http.StatusServiceUnavailable)
			json.NewEncoder(w).Encode(map[string]string{
				"error": "Rate limit service temporarily unavailable",
			})
			return
		}

		// Set rate limit headers
		w.Header().Set("X-RateLimit-Limit", strconv.Itoa(result.Limit))
		w.Header().Set("X-RateLimit-Remaining", strconv.Itoa(result.Remaining))

		if !result.Allowed {
			retryAfterSec := int(math.Ceil(result.RetryAfter.Seconds()))
			if retryAfterSec < 1 {
				retryAfterSec = 1
			}

			w.Header().Set("Retry-After", strconv.Itoa(retryAfterSec))
			w.Header().Set("X-RateLimit-Reset", strconv.Itoa(retryAfterSec))
			w.Header().Set("Content-Type", "application/json")
			w.WriteHeader(http.StatusTooManyRequests)

			json.NewEncoder(w).Encode(RateLimitErrorResponse{
				Error:      "Too many requests. Please try again later.",
				RetryAfter: retryAfterSec,
			})
			return
		}

		next.ServeHTTP(w, r)
	})
}
