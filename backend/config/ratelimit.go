package config

import (
	"os"
	"strconv"
	"strings"
	"time"
)

// RateLimitConfig holds all configuration parameters for the application rate limiter.
type RateLimitConfig struct {
	// Enabled toggles whether the rate limiter middleware is active.
	Enabled bool `json:"enabled"`

	// FailOpen determines behavior when Redis is unavailable or returns an error.
	// When true, requests are allowed through (recommended for high availability).
	// When false, requests are blocked with HTTP 503 (recommended for strict security).
	FailOpen bool `json:"fail_open"`

	// KeyPrefix is the prefix used for all Redis keys created by the rate limiter.
	KeyPrefix string `json:"key_prefix"`

	// AuthLimit is the maximum number of requests allowed for auth endpoints within AuthWindow.
	AuthLimit int `json:"auth_limit"`

	// AuthWindow is the sliding window duration for authentication endpoints.
	AuthWindow time.Duration `json:"auth_window"`

	// GeneralLimit is the maximum number of requests allowed for other endpoints within GeneralWindow.
	GeneralLimit int `json:"general_limit"`

	// GeneralWindow is the sliding window duration for general endpoints.
	GeneralWindow time.Duration `json:"general_window"`
}

// LoadRateLimitConfig loads the rate limiting configuration from environment variables,
// falling back to sensible production defaults if not set.
func LoadRateLimitConfig() RateLimitConfig {
	return RateLimitConfig{
		Enabled:       getEnvBool("RATE_LIMIT_ENABLED", true),
		FailOpen:      getEnvBool("RATE_LIMIT_FAIL_OPEN", true),
		KeyPrefix:     getEnvString("RATE_LIMIT_KEY_PREFIX", "ratelimit"),
		AuthLimit:     getEnvInt("RATE_LIMIT_AUTH_LIMIT", 10),
		AuthWindow:    getEnvDuration("RATE_LIMIT_AUTH_WINDOW", 1*time.Minute),
		GeneralLimit:  getEnvInt("RATE_LIMIT_GENERAL_LIMIT", 100),
		GeneralWindow: getEnvDuration("RATE_LIMIT_GENERAL_WINDOW", 1*time.Minute),
	}
}

func getEnvString(key, fallback string) string {
	if val := strings.TrimSpace(os.Getenv(key)); val != "" {
		return val
	}
	return fallback
}

func getEnvInt(key string, fallback int) int {
	val := strings.TrimSpace(os.Getenv(key))
	if val == "" {
		return fallback
	}
	n, err := strconv.Atoi(val)
	if err != nil || n <= 0 {
		return fallback
	}
	return n
}

func getEnvBool(key string, fallback bool) bool {
	val := strings.TrimSpace(strings.ToLower(os.Getenv(key)))
	if val == "" {
		return fallback
	}
	if val == "false" || val == "0" || val == "no" || val == "off" {
		return false
	}
	if val == "true" || val == "1" || val == "yes" || val == "on" {
		return true
	}
	return fallback
}

func getEnvDuration(key string, fallback time.Duration) time.Duration {
	val := strings.TrimSpace(os.Getenv(key))
	if val == "" {
		return fallback
	}

	// Try parsing standard duration strings (e.g., "1m", "60s", "500ms")
	if d, err := time.ParseDuration(val); err == nil && d > 0 {
		return d
	}

	// Try parsing raw integer as seconds (e.g., "60" -> 60s)
	if secs, err := strconv.Atoi(val); err == nil && secs > 0 {
		return time.Duration(secs) * time.Second
	}

	return fallback
}
