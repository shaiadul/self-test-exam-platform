package main

import (
	"fmt"
	"log"
	"net/http"
	"os"

	"github.com/joho/godotenv"
	"github.com/selftest/backend/config"
	delivery "github.com/selftest/backend/internal/delivery/http"
	"github.com/selftest/backend/internal/infrastructure/persistence"
	"github.com/selftest/backend/internal/infrastructure/storage"
	"github.com/selftest/backend/internal/service"
)

func main() {
	// Load environment variables
	if err := godotenv.Load(); err != nil {
		fmt.Println("Warning: No .env file found, relying on system environment variables")
	}

	// Initialize Database connection
	config.InitDB()
	defer config.DB.Close()

	// 1. Initialize Infrastructure Repositories & Storage
	userRepo := persistence.NewPostgresUserRepository(config.DB)
	packRepo := persistence.NewPostgresExamPackRepository(config.DB)
	examRepo := persistence.NewPostgresExamRepository(config.DB)
	attemptRepo := persistence.NewPostgresAttemptRepository(config.DB)
	reportRepo := persistence.NewPostgresReportRepository(config.DB)
	systemRepo := persistence.NewPostgresSystemRepository(config.DB)

	s3Storage, err := storage.NewS3Storage()
	if err != nil {
		fmt.Printf("Warning: Failed to initialize S3 storage: %v\n", err)
	}

	// 2. Initialize Domain / Application Services
	userService := service.NewUserService(userRepo)
	packService := service.NewExamPackService(packRepo)
	examService := service.NewExamService(examRepo)
	attemptService := service.NewAttemptService(attemptRepo, examRepo, packRepo, userRepo)
	reportService := service.NewReportService(userRepo, examRepo, packRepo, attemptRepo, reportRepo)
	systemService := service.NewSystemService(systemRepo)
	uploadService := service.NewUploadService(s3Storage)

	// 3. Initialize Delivery HTTP Handlers
	authHandler := delivery.NewAuthHandler(userService)
	packHandler := delivery.NewExamPackHandler(packService, examService)
	examHandler := delivery.NewExamHandler(examService, attemptService)
	attemptHandler := delivery.NewAttemptHandler(attemptService)
	reportHandler := delivery.NewReportHandler(reportService)
	systemHandler := delivery.NewSystemHandler(systemService)
	uploadHandler := delivery.NewUploadHandler(uploadService)

	// 4. Build Router with Middlewares
	router := delivery.NewRouter(delivery.Handlers{
		AuthHandler:     authHandler,
		ExamPackHandler: packHandler,
		ExamHandler:     examHandler,
		AttemptHandler:  attemptHandler,
		ReportHandler:   reportHandler,
		SystemHandler:   systemHandler,
		UploadHandler:   uploadHandler,
	})

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	fmt.Printf("Go server started on port %s...\n", port)
	log.Fatal(http.ListenAndServe(":"+port, router))
}
