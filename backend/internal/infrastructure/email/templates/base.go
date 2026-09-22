package templates

import (
	"fmt"
	"time"
)

// Brand Color Palette matching frontend/src/app/globals.css
const (
	ColorPrimary      = "#f97a00" // Vibrant Orange
	ColorPrimaryDark  = "#dd6b01" // Deep Orange
	ColorPrimaryLight = "#fb923c" // Light Accent Orange
	ColorPrimarySoft  = "#fff7ed" // Warm Orange Tint Background
	ColorPrimaryBorder= "#fed7aa" // Soft Orange Border
	ColorBackground   = "#f8fafc" // App background
	ColorCard         = "#ffffff" // Card surface
	ColorTextHeading  = "#0f172a" // Deep slate
	ColorTextBody     = "#334155" // Slate 700
	ColorTextMuted    = "#64748b" // Slate 500
	ColorBorder       = "#e2e8f0" // Slate 200
)

// BaseLayoutData defines the context passed to the global email wrapper.
type BaseLayoutData struct {
	Title       string // HTML title & preheader heading
	Preheader   string // Inbox preview snippet
	BodyContent string // Inner HTML of the card
	AppName     string // Defaults to "SelfTest"
	Year        int    // Defaults to current year
}

// RenderBaseLayout wraps any email content within a responsive, high-end branded email shell.
func RenderBaseLayout(data BaseLayoutData) string {
	appName := data.AppName
	if appName == "" {
		appName = "SelfTest"
	}
	year := data.Year
	if year == 0 {
		year = time.Now().Year()
	}

	return fmt.Sprintf(`<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>%s</title>
  <!--[if mso]>
  <style>
    table, td, p, a, h1, h2, span { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif !important; }
  </style>
  <![endif]-->
  <style>
    @media only screen and (max-width: 600px) {
      .email-container { width: 100%% !important; padding: 16px !important; }
      .email-card { border-radius: 12px !important; padding: 24px 18px !important; }
      .otp-code { font-size: 30px !important; letter-spacing: 6px !important; }
    }
  </style>
</head>
<body style="margin: 0; padding: 0; width: 100%%; background-color: %s; -webkit-text-size-adjust: 100%%; -ms-text-size-adjust: 100%%; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
  <!-- Hidden Preheader Preview Text -->
  <div style="display: none; font-size: 1px; color: %s; line-height: 1px; max-height: 0px; max-width: 0px; opacity: 0; overflow: hidden;">
    %s
  </div>

  <table role="presentation" width="100%%" border="0" cellspacing="0" cellpadding="0" style="background-color: %s; width: 100%%;">
    <tr>
      <td align="center" style="padding: 40px 16px;">
        <table role="presentation" border="0" cellspacing="0" cellpadding="0" class="email-container" style="max-width: 520px; width: 100%%; margin: 0 auto;">
          
          <!-- Top Brand Header -->
          <tr>
            <td align="center" style="padding-bottom: 24px;">
              <table role="presentation" border="0" cellspacing="0" cellpadding="0">
                <tr>
                  <td align="center" style="vertical-align: middle;">
                    <div style="display: inline-block; background: linear-gradient(135deg, %s 0%%, %s 100%%); width: 38px; height: 38px; border-radius: 10px; text-align: center; line-height: 38px; box-shadow: 0 4px 12px rgba(249, 122, 0, 0.25);">
                      <span style="font-size: 20px; color: #ffffff; font-weight: bold; line-height: 38px; display: block;">⚡</span>
                    </div>
                  </td>
                  <td style="padding-left: 12px; vertical-align: middle;">
                    <span style="font-size: 20px; font-weight: 800; color: %s; letter-spacing: -0.5px;">Self<span style="color: %s;">Test</span></span>
                    <span style="display: block; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; color: %s;">Exam Platform</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Main Content Card -->
          <tr>
            <td>
              <table role="presentation" border="0" cellspacing="0" cellpadding="0" width="100%%" style="background-color: %s; border-radius: 16px; border: 1px solid %s; box-shadow: 0 10px 25px -5px rgba(15, 23, 42, 0.05), 0 8px 10px -6px rgba(15, 23, 42, 0.03); overflow: hidden;">
                <!-- Top Accent Line -->
                <tr>
                  <td style="height: 4px; background: linear-gradient(90deg, %s 0%%, %s 50%%, %s 100%%); font-size: 0; line-height: 0;">&nbsp;</td>
                </tr>
                <!-- Card Inner Content -->
                <tr>
                  <td class="email-card" style="padding: 36px 32px 32px 32px;">
                    %s
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td align="center" style="padding-top: 28px; padding-bottom: 20px;">
              <p style="margin: 0 0 8px; font-size: 12px; color: %s; font-weight: 500;">
                Secure Exam & Assessment Platform
              </p>
              <p style="margin: 0 0 12px; font-size: 11px; color: %s;">
                &copy; %d %s Platform. All rights reserved.
              </p>
              <table role="presentation" border="0" cellspacing="0" cellpadding="0">
                <tr>
                  <td style="font-size: 11px; color: %s;">
                    <span>Security &amp; Privacy Guaranteed</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`,
		data.Title,
		ColorBackground,
		ColorBackground,
		data.Preheader,
		ColorBackground,
		ColorPrimary, ColorPrimaryDark,
		ColorTextHeading, ColorPrimary,
		ColorTextMuted,
		ColorCard, ColorBorder,
		ColorPrimaryDark, ColorPrimary, ColorPrimaryLight,
		data.BodyContent,
		ColorTextMuted,
		ColorTextMuted,
		year, appName,
		ColorTextMuted,
	)
}
