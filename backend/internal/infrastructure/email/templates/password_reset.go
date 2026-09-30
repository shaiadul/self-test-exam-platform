package templates

import (
	"fmt"
)

// PasswordResetData encapsulates parameters for rendering the OTP verification email.
type PasswordResetData struct {
	OTP          string
	ExpiresIn    string // Defaults to "10 minutes"
	SupportEmail string // Defaults to "support@selftest.dev"
}

// RenderPasswordReset generates a professional, high-end password reset OTP email
// following the frontend design theme and color palette.
func RenderPasswordReset(data PasswordResetData) string {
	expiresIn := data.ExpiresIn
	if expiresIn == "" {
		expiresIn = "10 minutes"
	}

	bodyContent := fmt.Sprintf(`
    <div style="text-align: center; margin-bottom: 20px;">
      <div style="display: inline-block; width: 48px; height: 48px; border-radius: 12px; background: %s; text-align: center; line-height: 48px; box-shadow: 0 4px 10px rgba(249, 122, 0, 0.15);">
        <span style="font-size: 24px; line-height: 48px; display: block;">🔐</span>
      </div>
      <h1 style="margin: 16px 0 6px; font-size: 22px; font-weight: 800; color: %s; letter-spacing: -0.5px;">Password Reset Request</h1>
      <p style="margin: 0; font-size: 14px; line-height: 1.5; color: %s;">
        Use the 6-digit verification code below to verify your account and set a new password.
      </p>
    </div>

    <!-- OTP Code Display Card -->
    <div style="background-color: %s; border: 1.5px dashed %s; border-radius: 12px; padding: 22px 16px; text-align: center; margin: 24px 0 16px;">
      <div style="font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px; color: %s; margin-bottom: 8px;">
        YOUR VERIFICATION CODE
      </div>
      <div class="otp-code" style="font-family: 'JetBrains Mono', Consolas, Monaco, 'Courier New', monospace; font-size: 36px; font-weight: 800; letter-spacing: 8px; color: %s; line-height: 1; padding: 4px 0;">
        %s
      </div>
    </div>

    <!-- Expiration Pill -->
    <div style="text-align: center; margin-bottom: 24px;">
      <span style="display: inline-block; background-color: #f1f5f9; color: %s; font-size: 12px; font-weight: 600; padding: 4px 14px; border-radius: 9999px;">
        ⏱ Expires in %s
      </span>
    </div>

    <hr style="border: none; border-top: 1px solid %s; margin: 24px 0;" />

    <!-- Security Warning Card -->
    <div style="background-color: #f8fafc; border: 1px solid %s; border-radius: 10px; padding: 14px 16px;">
      <p style="margin: 0; font-size: 12px; line-height: 1.6; color: %s;">
        <strong style="color: %s;">Security Notice:</strong> If you did not request a password reset, you can safely ignore this email. Your password will remain unchanged. Never share this one-time code with anyone.
      </p>
    </div>
`,
		ColorPrimarySoft,
		ColorTextHeading,
		ColorTextMuted,
		ColorPrimarySoft, ColorPrimaryBorder,
		ColorPrimaryDark,
		ColorPrimaryDark,
		data.OTP,
		ColorTextMuted,
		expiresIn,
		ColorBorder,
		ColorBorder,
		ColorTextMuted,
		ColorTextHeading,
	)

	return RenderBaseLayout(BaseLayoutData{
		Title:       "Your Password Reset Code",
		Preheader:   fmt.Sprintf("Your SelfTest verification code is %s (expires in %s)", data.OTP, expiresIn),
		BodyContent: bodyContent,
		AppName:     "SelfTest",
	})
}
