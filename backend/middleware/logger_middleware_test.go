package middleware

import (
	"bytes"
	"log"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
)

func TestLoggerMiddleware(t *testing.T) {
	// Capture log output
	var logBuf bytes.Buffer
	log.SetOutput(&logBuf)

	testCases := []struct {
		name           string
		method         string
		path           string
		handlerStatus  int
		handlerBody    string
		expectedStatus int
	}{
		{
			name:           "Successful GET request",
			method:         "GET",
			path:           "/api/test/ok",
			handlerStatus:  http.StatusOK,
			handlerBody:    "success",
			expectedStatus: http.StatusOK,
		},
		{
			name:           "Not Found GET request",
			method:         "GET",
			path:           "/api/test/notfound",
			handlerStatus:  http.StatusNotFound,
			handlerBody:    "not found",
			expectedStatus: http.StatusNotFound,
		},
		{
			name:           "Created POST request",
			method:         "POST",
			path:           "/api/test/create",
			handlerStatus:  http.StatusCreated,
			handlerBody:    `{"id": 1}`,
			expectedStatus: http.StatusCreated,
		},
	}

	for _, tc := range testCases {
		t.Run(tc.name, func(t *testing.T) {
			logBuf.Reset()

			dummyHandler := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
				w.WriteHeader(tc.handlerStatus)
				w.Write([]byte(tc.handlerBody))
			})

			handler := LoggerMiddleware(dummyHandler)

			req := httptest.NewRequest(tc.method, tc.path, nil)
			rec := httptest.NewRecorder()

			handler.ServeHTTP(rec, req)

			if rec.Code != tc.expectedStatus {
				t.Errorf("expected status %d, got %d", tc.expectedStatus, rec.Code)
			}

			output := logBuf.String()
			if !strings.Contains(output, "[API]") {
				t.Errorf("expected log to contain '[API]', got: %s", output)
			}
			if !strings.Contains(output, tc.path) {
				t.Errorf("expected log to contain path '%s', got: %s", tc.path, output)
			}
			if !strings.Contains(output, tc.method) {
				t.Errorf("expected log to contain method '%s', got: %s", tc.method, output)
			}
		})
	}
}
