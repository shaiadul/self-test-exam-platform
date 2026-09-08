package http

import (
	"net/http"

	"github.com/selftest/backend/middleware"
)

type Handlers struct {
	AuthHandler    *AuthHandler
	ExamPackHandler *ExamPackHandler
	ExamHandler    *ExamHandler
	AttemptHandler *AttemptHandler
	ReportHandler  *ReportHandler
	SystemHandler  *SystemHandler
}

// CorsMiddleware adds standard headers to handle requests from next.js frontend
func CorsMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")

		if r.Method == http.MethodOptions {
			w.WriteHeader(http.StatusOK)
			return
		}

		next.ServeHTTP(w, r)
	})
}

func NewRouter(h Handlers) http.Handler {
	mux := http.NewServeMux()

	// Public routes
	mux.HandleFunc("/api/auth/register", h.AuthHandler.Register)
	mux.HandleFunc("/api/auth/login", h.AuthHandler.Login)

	// Protected routes using auth middleware
	mux.Handle("/api/auth/profile", middleware.AuthMiddleware(http.HandlerFunc(h.AuthHandler.GetProfile)))
	mux.Handle("/api/auth/complete-profile", middleware.AuthMiddleware(http.HandlerFunc(h.AuthHandler.CompleteProfile)))

	// Exam Pack routes
	mux.Handle("/api/exam-packs", middleware.AuthMiddleware(http.HandlerFunc(h.ExamPackHandler.HandleExamPacks)))
	mux.Handle("/api/exam-packs/", middleware.AuthMiddleware(http.HandlerFunc(h.ExamPackHandler.HandleExamPacks)))

	// Exam routes
	mux.Handle("/api/exams/", middleware.AuthMiddleware(http.HandlerFunc(h.ExamHandler.HandleExams)))

	// Dashboard stats
	mux.Handle("/api/dashboard/stats", middleware.AuthMiddleware(http.HandlerFunc(h.ReportHandler.GetDashboardStats)))

	// Attempts & Reporting routes
	mux.Handle("/api/attempts", middleware.AuthMiddleware(http.HandlerFunc(h.AttemptHandler.HandleAttempts)))
	mux.Handle("/api/attempts/", middleware.AuthMiddleware(http.HandlerFunc(h.AttemptHandler.HandleAttempts)))
	mux.Handle("/api/teacher/reports", middleware.AuthMiddleware(http.HandlerFunc(h.ReportHandler.HandleTeacherReports)))
	mux.Handle("/api/teacher/reports/", middleware.AuthMiddleware(http.HandlerFunc(h.ReportHandler.HandleTeacherReports)))

	// Admin Settings routes
	mux.Handle("/api/admin/users", middleware.AuthMiddleware(http.HandlerFunc(h.AuthHandler.HandleAdminUsers)))
	mux.Handle("/api/admin/users/", middleware.AuthMiddleware(http.HandlerFunc(h.AuthHandler.HandleAdminUsers)))
	mux.Handle("/api/admin/permissions", middleware.AuthMiddleware(http.HandlerFunc(h.SystemHandler.HandlePermissions)))
	mux.Handle("/api/admin/permissions/", middleware.AuthMiddleware(http.HandlerFunc(h.SystemHandler.HandlePermissions)))

	// Assets, Transactions, and Analysis routes
	mux.Handle("/api/admin/analysis", middleware.AuthMiddleware(http.HandlerFunc(h.ReportHandler.GetExamAnalysisStats)))
	mux.Handle("/api/assets", middleware.AuthMiddleware(http.HandlerFunc(h.SystemHandler.HandleSystemAssets)))
	mux.Handle("/api/assets/", middleware.AuthMiddleware(http.HandlerFunc(h.SystemHandler.HandleSystemAssets)))
	mux.Handle("/api/transactions", middleware.AuthMiddleware(http.HandlerFunc(h.SystemHandler.HandleTransactions)))
	mux.Handle("/api/transactions/", middleware.AuthMiddleware(http.HandlerFunc(h.SystemHandler.HandleTransactions)))

	return middleware.LoggerMiddleware(CorsMiddleware(mux))
}
