package config

import (
	"os"
	"testing"
	"time"
)

func TestLoadRateLimitConfig_Defaults(t *testing.T) {
	// Clear any existing env vars
	os.Unsetenv("RATE_LIMIT_ENABLED")
	os.Unsetenv("RATE_LIMIT_FAIL_OPEN")
	os.Unsetenv("RATE_LIMIT_KEY_PREFIX")
	os.Unsetenv("RATE_LIMIT_AUTH_LIMIT")
	os.Unsetenv("RATE_LIMIT_AUTH_WINDOW")
	os.Unsetenv("RATE_LIMIT_GENERAL_LIMIT")
	os.Unsetenv("RATE_LIMIT_GENERAL_WINDOW")

	cfg := LoadRateLimitConfig()

	if !cfg.Enabled {
		t.Errorf("expected Enabled to be true by default, got %v", cfg.Enabled)
	}
	if !cfg.FailOpen {
		t.Errorf("expected FailOpen to be true by default, got %v", cfg.FailOpen)
	}
	if cfg.KeyPrefix != "ratelimit" {
		t.Errorf("expected KeyPrefix to be 'ratelimit', got '%s'", cfg.KeyPrefix)
	}
	if cfg.AuthLimit != 10 {
		t.Errorf("expected AuthLimit to be 10, got %d", cfg.AuthLimit)
	}
	if cfg.AuthWindow != 1*time.Minute {
		t.Errorf("expected AuthWindow to be 1m, got %v", cfg.AuthWindow)
	}
	if cfg.GeneralLimit != 100 {
		t.Errorf("expected GeneralLimit to be 100, got %d", cfg.GeneralLimit)
	}
	if cfg.GeneralWindow != 1*time.Minute {
		t.Errorf("expected GeneralWindow to be 1m, got %v", cfg.GeneralWindow)
	}
}

func TestLoadRateLimitConfig_CustomEnv(t *testing.T) {
	t.Setenv("RATE_LIMIT_ENABLED", "false")
	t.Setenv("RATE_LIMIT_FAIL_OPEN", "no")
	t.Setenv("RATE_LIMIT_KEY_PREFIX", "custom_limit")
	t.Setenv("RATE_LIMIT_AUTH_LIMIT", "5")
	t.Setenv("RATE_LIMIT_AUTH_WINDOW", "30s")
	t.Setenv("RATE_LIMIT_GENERAL_LIMIT", "50")
	t.Setenv("RATE_LIMIT_GENERAL_WINDOW", "120") // raw seconds

	cfg := LoadRateLimitConfig()

	if cfg.Enabled {
		t.Errorf("expected Enabled to be false, got true")
	}
	if cfg.FailOpen {
		t.Errorf("expected FailOpen to be false, got true")
	}
	if cfg.KeyPrefix != "custom_limit" {
		t.Errorf("expected KeyPrefix to be 'custom_limit', got '%s'", cfg.KeyPrefix)
	}
	if cfg.AuthLimit != 5 {
		t.Errorf("expected AuthLimit to be 5, got %d", cfg.AuthLimit)
	}
	if cfg.AuthWindow != 30*time.Second {
		t.Errorf("expected AuthWindow to be 30s, got %v", cfg.AuthWindow)
	}
	if cfg.GeneralLimit != 50 {
		t.Errorf("expected GeneralLimit to be 50, got %d", cfg.GeneralLimit)
	}
	if cfg.GeneralWindow != 120*time.Second {
		t.Errorf("expected GeneralWindow to be 120s, got %v", cfg.GeneralWindow)
	}
}
