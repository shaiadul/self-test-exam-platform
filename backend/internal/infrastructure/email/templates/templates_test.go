package templates_test

import (
	"strings"
	"testing"

	"github.com/selftest/backend/internal/infrastructure/email/templates"
)

func TestRenderPasswordReset(t *testing.T) {
	otp := "849201"
	html := templates.RenderPasswordReset(templates.PasswordResetData{
		OTP:       otp,
		ExpiresIn: "10 minutes",
	})

	if !strings.Contains(html, otp) {
		t.Fatalf("expected rendered HTML to contain OTP %s", otp)
	}

	// Verify primary brand color from frontend is present (#f97a00)
	if !strings.Contains(html, "#f97a00") {
		t.Fatalf("expected rendered HTML to contain frontend brand primary color #f97a00")
	}

	// Verify expiration is present
	if !strings.Contains(html, "10 minutes") {
		t.Fatalf("expected rendered HTML to contain expiration notice")
	}

	// Verify platform branding is present
	if !strings.Contains(html, "SelfTest") {
		t.Fatalf("expected rendered HTML to contain SelfTest branding")
	}
}
