package middleware

import (
	"log"
	"net/http"
	"strings"
	"time"
)

// ANSI color escape codes for terminal log readability
const (
	colorReset  = "\033[0m"
	colorRed    = "\033[31;1m"
	colorGreen  = "\033[32;1m"
	colorYellow = "\033[33;1m"
	colorBlue   = "\033[34;1m"
	colorCyan   = "\033[36;1m"
	colorGray   = "\033[90m"
)

// responseWriter is a wrapper around http.ResponseWriter to capture status code and bytes written
type loggingResponseWriter struct {
	http.ResponseWriter
	statusCode   int
	bytesWritten int64
}

func newLoggingResponseWriter(w http.ResponseWriter) *loggingResponseWriter {
	return &loggingResponseWriter{
		ResponseWriter: w,
		statusCode:     http.StatusOK, // Default to 200 if WriteHeader is not explicitly called
	}
}

func (lrw *loggingResponseWriter) WriteHeader(code int) {
	lrw.statusCode = code
	lrw.ResponseWriter.WriteHeader(code)
}

func (lrw *loggingResponseWriter) Write(b []byte) (int, error) {
	n, err := lrw.ResponseWriter.Write(b)
	lrw.bytesWritten += int64(n)
	return n, err
}

// LoggerMiddleware logs detailed info for every incoming HTTP request:
// timestamp, method, path, status code, latency duration, client IP, and response payload size.
func LoggerMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		start := time.Now()

		// Capture client IP
		clientIP := r.Header.Get("X-Forwarded-For")
		if clientIP == "" {
			clientIP = r.Header.Get("X-Real-IP")
		}
		if clientIP == "" {
			clientIP = r.RemoteAddr
			// Strip port from RemoteAddr if present
			if colonIdx := strings.LastIndex(clientIP, ":"); colonIdx != -1 {
				clientIP = clientIP[:colonIdx]
			}
		}

		// Wrap response writer
		lrw := newLoggingResponseWriter(w)

		// Execute request through downstream handlers
		next.ServeHTTP(lrw, r)

		// Compute request duration
		duration := time.Since(start)

		// Pick color according to HTTP status code
		var statusColor string
		switch {
		case lrw.statusCode >= 200 && lrw.statusCode < 300:
			statusColor = colorGreen
		case lrw.statusCode >= 300 && lrw.statusCode < 400:
			statusColor = colorCyan
		case lrw.statusCode >= 400 && lrw.statusCode < 500:
			statusColor = colorYellow
		default:
			statusColor = colorRed
		}

		// Pick method color
		var methodColor string
		switch r.Method {
		case http.MethodGet:
			methodColor = colorBlue
		case http.MethodPost:
			methodColor = colorGreen
		case http.MethodPut:
			methodColor = colorYellow
		case http.MethodDelete:
			methodColor = colorRed
		case http.MethodOptions:
			methodColor = colorGray
		default:
			methodColor = colorCyan
		}

		// Format output log
		formattedTime := start.Format("2006/01/02 15:04:05")
		statusText := http.StatusText(lrw.statusCode)
		if statusText == "" {
			statusText = "Unknown"
		}

		log.Printf(
			"%s[API]%s %s | %s%3d %-12s%s | %10v | %-15s | %s%-7s%s %s (%d bytes)\n",
			colorGray,
			colorReset,
			formattedTime,
			statusColor,
			lrw.statusCode,
			statusText,
			colorReset,
			duration.Round(time.Microsecond),
			clientIP,
			methodColor,
			r.Method,
			colorReset,
			r.URL.RequestURI(),
			lrw.bytesWritten,
		)
	})
}
