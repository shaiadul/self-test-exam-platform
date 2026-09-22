package email

import (
	"fmt"
	"os"

	"github.com/resend/resend-go/v4"
	"github.com/selftest/backend/internal/infrastructure/email/templates"
)

// EmailOptions holds the parameters for sending a generic email.
type EmailOptions struct {
	To      []string
	Subject string
	HTML    string
	Text    string
	From    string // Optional sender override; defaults to RESEND_FROM_EMAIL
}

type EmailService interface {
	Send(opts EmailOptions) (string, error)
	SendPasswordResetOTP(toEmail, otp string) error
}


type ResendEmailService struct {
	client    *resend.Client
	fromEmail string
}

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


func (s *ResendEmailService) SendPasswordResetOTP(toEmail, otp string) error {
	html := templates.RenderPasswordReset(templates.PasswordResetData{
		OTP:       otp,
		ExpiresIn: "10 minutes",
	})

	_, err := s.Send(EmailOptions{
		To:      []string{toEmail},
		Subject: fmt.Sprintf("Your Password Reset Code: %s", otp),
		HTML:    html,
	})
	return err
}

