package main

import (
	"fmt"
	"log"

	"github.com/joho/godotenv"
	"golang.org/x/crypto/bcrypt"

	"github.com/selftest/backend/config"
	"github.com/selftest/backend/internal/domain/user"
	"github.com/selftest/backend/internal/infrastructure/persistence"
)

type seedAccount struct {
	Name     string
	Email    string
	Password string
	Role     string
}

func main() {
	if err := godotenv.Load(); err != nil {
		fmt.Println("Warning: No .env file found, relying on system environment variables")
	}

	config.InitDB()
	defer config.CloseDB()

	userRepo := persistence.NewPostgresUserRepository(config.DB)

	accounts := []seedAccount{
		{Name: "Admin", Email: "admin@test.com", Password: "admin123", Role: "admin"},
		{Name: "Teacher", Email: "teacher@test.com", Password: "teacher123", Role: "teacher"},
		{Name: "Student", Email: "student@test.com", Password: "student123", Role: "student"},
	}

	for _, a := range accounts {
		existing, err := userRepo.GetByEmail(a.Email)
		if err != nil {
			log.Fatalf("Failed to look up %s: %v", a.Email, err)
		}
		if existing != nil {
			fmt.Printf("skip    %-20s already exists (id=%d)\n", a.Email, existing.ID)
			continue
		}

		hashed, err := bcrypt.GenerateFromPassword([]byte(a.Password), bcrypt.DefaultCost)
		if err != nil {
			log.Fatalf("Failed to hash password for %s: %v", a.Email, err)
		}

		pwdStr := string(hashed)
		u := &user.User{
			Name:     a.Name,
			Email:    a.Email,
			Password: &pwdStr,
			Role:     a.Role,
		}
		if err := userRepo.Create(u); err != nil {
			log.Fatalf("Failed to create %s: %v", a.Email, err)
		}
		fmt.Printf("created %-20s (id=%d, role=%s, password=%s)\n", a.Email, u.ID, u.Role, a.Password)
	}

	fmt.Println("Seeding complete.")
}
