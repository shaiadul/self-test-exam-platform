package email

import (
	"fmt"
	"os"

	"github.com/resend/resend-go/v4"
)

// EmailOptions holds the parameters for sending a generic email.
type EmailOptions struct {
	To      []string
	Subject string
	HTML    string
	Text    string
	From    string // Optional sender override; defaults to RESEND_FROM_EMAIL
}

// EmailService defines the interface for sending emails.
// Other services can depend on this interface for sending any kind of email.
type EmailService interface {
	Send(opts EmailOptions) (string, error)
	SendPasswordResetOTP(toEmail, otp string) error
}

// ResendEmailService implements EmailService using the Resend API.
type ResendEmailService struct {
	client    *resend.Client
	fromEmail string
}

// NewResendEmailService creates a new email service backed by Resend.
// It reads RESEND_API_KEY and RESEND_FROM_EMAIL from environment variables.
func NewResendEmailService() *ResendEmailService {
	apiKey := os.Getenv("RESEND_API_KEY")
	fromEmail := os.Getenv("RESEND_FROM_EMAIL")
	if fromEmail == "" {
		fromEmail = "SelfTest <onboarding@resend.dev>"
	}

	client := resend.NewClient(apiKey)
	return &ResendEmailService{
		client:    client,
		fromEmail: fromEmail,
	}
}

// Send dispatches a generic email and returns the Resend message ID.
func (s *ResendEmailService) Send(opts EmailOptions) (string, error) {
	from := s.fromEmail
	if opts.From != "" {
		from = opts.From
	}

	params := &resend.SendEmailRequest{
		From:    from,
		To:      opts.To,
		Subject: opts.Subject,
		Html:    opts.HTML,
		Text:    opts.Text,
	}

	sent, err := s.client.Emails.Send(params)
	if err != nil {
		return "", fmt.Errorf("failed to send email: %w", err)
	}
	return sent.Id, nil
}

// SendPasswordResetOTP sends a branded password reset OTP email.
func (s *ResendEmailService) SendPasswordResetOTP(toEmail, otp string) error {
	html := buildPasswordResetHTML(otp)
	_, err := s.Send(EmailOptions{
		To:      []string{toEmail},
		Subject: fmt.Sprintf("Your Password Reset Code: %s", otp),
		HTML:    html,
	})
	return err
}

// buildPasswordResetHTML generates a branded, responsive HTML email for the OTP.
func buildPasswordResetHTML(otp string) string {
	return fmt.Sprintf(`<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#f4f4f7;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  <table role="presentation" width="100%%" cellpadding="0" cellspacing="0" style="background:#f4f4f7;padding:40px 20px;">
    <tr><td align="center">
      <table role="presentation" width="100%%" style="max-width:480px;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.06);">
        <!-- Header -->
        <tr><td style="background:linear-gradient(135deg,#6366f1,#8b5cf6);padding:32px 32px 24px;text-align:center;">
          <h1 style="margin:0;color:#ffffff;font-size:22px;font-weight:700;letter-spacing:-0.3px;">Password Reset</h1>
          <p style="margin:8px 0 0;color:rgba(255,255,255,0.85);font-size:13px;font-weight:500;">SelfTest Exam Platform</p>
        </td></tr>
        <!-- Body -->
        <tr><td style="padding:32px;">
          <p style="margin:0 0 16px;color:#374151;font-size:14px;line-height:1.6;">
            We received a request to reset your password. Use the verification code below to proceed:
          </p>
          <div style="background:#f8f7ff;border:2px dashed #c4b5fd;border-radius:10px;padding:20px;text-align:center;margin:24px 0;">
            <span style="font-family:'Courier New',monospace;font-size:36px;font-weight:800;letter-spacing:8px;color:#6366f1;">%s</span>
          </div>
          <p style="margin:0 0 8px;color:#6b7280;font-size:12px;line-height:1.5;text-align:center;">
            ⏱ This code expires in <strong>10 minutes</strong>.
          </p>
          <hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0;">
          <p style="margin:0;color:#9ca3af;font-size:11px;line-height:1.5;">
            If you didn't request a password reset, you can safely ignore this email. Your password will remain unchanged. Never share this code with anyone.
          </p>
        </td></tr>
        <!-- Footer -->
        <tr><td style="background:#f9fafb;padding:16px 32px;text-align:center;border-top:1px solid #f3f4f6;">
          <p style="margin:0;color:#9ca3af;font-size:11px;">&copy; SelfTest Exam Platform</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`, otp)
}
