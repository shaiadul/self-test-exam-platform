package main

import (
	"fmt"
	"log"
	"net/http"
	"os"

	"github.com/joho/godotenv"
	
	"github.com/selftest/backend/config"
	"github.com/selftest/backend/handler"
	"github.com/selftest/backend/middleware"
	"github.com/selftest/backend/repository"
)

// corsMiddleware adds standard headers to handle requests from next.js frontend
func corsMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*") // For development; can restrict to localhost:3000 later
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")

		if r.Method == http.MethodOptions {
			w.WriteHeader(http.StatusOK)
			return
		}

		next.ServeHTTP(w, r)
	})
}

func main() {
	// Load environment variables
	if err := godotenv.Load(); err != nil {
		fmt.Println("Warning: No .env file found, relying on system environment variables")
	}

	// Initialize Database connection
	config.InitDB()
	defer config.DB.Close()

	// Initialize repository and handler
	userRepo := repository.NewSQLUserRepository(config.DB)
	authHandler := handler.NewAuthHandler(userRepo)
	
	examRepo := repository.NewSQLExamRepository(config.DB)
	examHandler := handler.NewExamHandler(examRepo, userRepo)

	// Routing setup
	mux := http.NewServeMux()

	// Public routes
	mux.HandleFunc("/api/auth/register", authHandler.Register)
	mux.HandleFunc("/api/auth/login", authHandler.Login)

	// Protected routes using auth middleware
	mux.Handle("/api/auth/profile", middleware.AuthMiddleware(http.HandlerFunc(authHandler.GetProfile)))
	mux.Handle("/api/auth/complete-profile", middleware.AuthMiddleware(http.HandlerFunc(authHandler.CompleteProfile)))
	
	// Exam routes
	mux.Handle("/api/exam-packs", middleware.AuthMiddleware(http.HandlerFunc(examHandler.HandleExamPacks)))
	mux.Handle("/api/exam-packs/", middleware.AuthMiddleware(http.HandlerFunc(examHandler.HandleExamPacks)))
	mux.Handle("/api/exams/", middleware.AuthMiddleware(http.HandlerFunc(examHandler.HandleExams)))
	mux.Handle("/api/dashboard/stats", middleware.AuthMiddleware(http.HandlerFunc(examHandler.GetDashboardStats)))

	// Attempts & Reporting routes
	mux.Handle("/api/attempts", middleware.AuthMiddleware(http.HandlerFunc(examHandler.HandleAttempts)))
	mux.Handle("/api/attempts/", middleware.AuthMiddleware(http.HandlerFunc(examHandler.HandleAttempts)))
	mux.Handle("/api/teacher/reports", middleware.AuthMiddleware(http.HandlerFunc(examHandler.HandleTeacherReports)))
	mux.Handle("/api/teacher/reports/", middleware.AuthMiddleware(http.HandlerFunc(examHandler.HandleTeacherReports)))

	// Admin Settings routes
	mux.Handle("/api/admin/users", middleware.AuthMiddleware(http.HandlerFunc(authHandler.HandleAdminUsers)))
	mux.Handle("/api/admin/users/", middleware.AuthMiddleware(http.HandlerFunc(authHandler.HandleAdminUsers)))
	mux.Handle("/api/admin/permissions", middleware.AuthMiddleware(http.HandlerFunc(examHandler.HandlePermissions)))
	mux.Handle("/api/admin/permissions/", middleware.AuthMiddleware(http.HandlerFunc(examHandler.HandlePermissions)))

	// Assets, Transactions, and Analysis routes
	mux.Handle("/api/admin/analysis", middleware.AuthMiddleware(http.HandlerFunc(examHandler.GetExamAnalysisStats)))
	mux.Handle("/api/assets", middleware.AuthMiddleware(http.HandlerFunc(examHandler.HandleSystemAssets)))
	mux.Handle("/api/assets/", middleware.AuthMiddleware(http.HandlerFunc(examHandler.HandleSystemAssets)))
	mux.Handle("/api/transactions", middleware.AuthMiddleware(http.HandlerFunc(examHandler.HandleTransactions)))
	mux.Handle("/api/transactions/", middleware.AuthMiddleware(http.HandlerFunc(examHandler.HandleTransactions)))

	// Apply CORS
	handlerWithCORS := corsMiddleware(mux)

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	fmt.Printf("Go server started on port %s...\n", port)
	log.Fatal(http.ListenAndServe(":"+port, handlerWithCORS))
}
