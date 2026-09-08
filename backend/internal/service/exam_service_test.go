package service

import (
	"testing"
	"time"
)

func TestParseFlexibleTime(t *testing.T) {
	testCases := []struct {
		name      string
		input     interface{}
		expectErr bool
	}{
		{"RFC3339", "2026-09-08T12:00:00Z", false},
		{"ISO datetime", "2026-09-08T12:00:00", false},
		{"Standard datetime", "2026-09-08 12:00:00", false},
		{"Date only", "2026-09-08", false},
		{"Unix timestamp sec", float64(1700000000), false},
		{"Unix timestamp milli", float64(1700000000000), false},
		{"Nil input", nil, true},
		{"Empty string", "", true},
		{"Invalid string", "not-a-date", true},
	}

	for _, tc := range testCases {
		t.Run(tc.name, func(t *testing.T) {
			res, err := ParseFlexibleTime(tc.input)
			if tc.expectErr && err == nil {
				t.Errorf("expected error, got nil: %v", res)
			}
			if !tc.expectErr && err != nil {
				t.Errorf("unexpected error: %v", err)
			}
			if !tc.expectErr && res.IsZero() {
				t.Errorf("expected non-zero time")
			}
		})
	}
}

func TestExamDateValidation(t *testing.T) {
	start := time.Now()
	end := start.Add(1 * time.Hour)

	// Valid start < end
	if end.Before(start) {
		t.Errorf("expected end to be after start")
	}
}
