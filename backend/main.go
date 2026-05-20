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

	// Routing setup
	mux := http.NewServeMux()

	// Public routes
	mux.HandleFunc("/api/auth/register", authHandler.Register)
	mux.HandleFunc("/api/auth/login", authHandler.Login)

	// Protected routes using auth middleware
	mux.Handle("/api/auth/profile", middleware.AuthMiddleware(http.HandlerFunc(authHandler.GetProfile)))
	mux.Handle("/api/auth/complete-profile", middleware.AuthMiddleware(http.HandlerFunc(authHandler.CompleteProfile)))

	// Apply CORS
	handlerWithCORS := corsMiddleware(mux)

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	fmt.Printf("Go server started on port %s...\n", port)
	log.Fatal(http.ListenAndServe(":"+port, handlerWithCORS))
}
