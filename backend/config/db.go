package config

import (
	"database/sql"
	"fmt"
	"log"
	"os"

	_ "github.com/lib/pq"
	"golang.org/x/crypto/bcrypt"
)

var DB *sql.DB

func InitDB() {
	dbURL := os.Getenv("DATABASE_URL")
	if dbURL == "" {
		log.Fatal("DATABASE_URL is not set in environment variables")
	}

	var err error
	DB, err = sql.Open("postgres", dbURL)
	if err != nil {
		log.Fatalf("Failed to open database connection: %v", err)
	}

	// Verify the connection is working
	err = DB.Ping()
	if err != nil {
		log.Fatalf("Failed to ping database: %v", err)
	}

	fmt.Println("Connected to PostgreSQL (Neon) successfully!")

	// Create tables if they do not exist
	createUsersTable()
	
	// Seed demo accounts
	seedDemoUsers()
}

func seedDemoUsers() {
	seedUser("student@test.com", "Md Saidul Basar", "student123", "student")
	seedUser("teacher@test.com", "Prof. Abdus Salam", "teacher@test.com", "teacher")
	seedUser("admin@test.com", "Super Admin", "admin@test.com", "admin")
}

func seedUser(email, name, plainPassword, role string) {
	var count int
	err := DB.QueryRow("SELECT COUNT(*) FROM users WHERE email = $1", email).Scan(&count)
	if err != nil {
		log.Printf("Failed to check if user %s exists: %v", email, err)
		return
	}

	if count > 0 {
		return // Already exists
	}

	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(plainPassword), 10)
	if err != nil {
		log.Printf("Failed to hash password for %s: %v", email, err)
		return
	}

	query := `
		INSERT INTO users (name, email, password, role)
		VALUES ($1, $2, $3, $4)`
	
	_, err = DB.Exec(query, name, email, string(hashedPassword), role)
	if err != nil {
		log.Printf("Failed to seed user %s: %v", email, err)
		return
	}

	fmt.Printf("Seeded demo user: %s (%s)\n", email, role)
}

func createUsersTable() {
	query := `
	CREATE TABLE IF NOT EXISTS users (
		id SERIAL PRIMARY KEY,
		name VARCHAR(255) NOT NULL,
		email VARCHAR(255) UNIQUE NOT NULL,
		password VARCHAR(255) NOT NULL,
		role VARCHAR(50) NOT NULL DEFAULT 'student',
		image TEXT,
		phone VARCHAR(50),
		level VARCHAR(50),
		batch VARCHAR(50),
		board VARCHAR(50),
		institution VARCHAR(255),
		address TEXT,
		created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
		updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
	);`

	_, err := DB.Exec(query)
	if err != nil {
		log.Fatalf("Failed to create users table: %v", err)
	}
	fmt.Println("Database tables verified/created successfully!")
}
