package config

import (
	"database/sql"
	"fmt"
	"log"
	"os"
	"time"

	_ "github.com/lib/pq"
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

	DB.SetMaxOpenConns(25)
	DB.SetMaxIdleConns(10)
	DB.SetConnMaxLifetime(5 * time.Minute)

	// Verify the connection is working
	err = DB.Ping()
	if err != nil {
		log.Fatalf("Failed to ping database: %v", err)
	}

	fmt.Println("Connected to PostgreSQL (Neon) successfully!")

	// Create tables if they do not exist
	createUsersTable()

	// One-time cleanup: drop any legacy/demo rows while keeping user accounts.
	// The app never seeds demo data — this only runs once per database.
	clearLegacyDummyDataOnce()
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

	// Alter users and exams table to add new columns if they do not exist
	alterQueries := []string{
		"ALTER TABLE users ADD COLUMN IF NOT EXISTS subject VARCHAR(100)",
		"ALTER TABLE users ADD COLUMN IF NOT EXISTS designation VARCHAR(100)",
		"ALTER TABLE users ADD COLUMN IF NOT EXISTS admin_tier VARCHAR(100)",
		"ALTER TABLE users ADD COLUMN IF NOT EXISTS admin_dept VARCHAR(100)",
		"ALTER TABLE users ADD COLUMN IF NOT EXISTS admin_base VARCHAR(100)",
		"ALTER TABLE users ADD COLUMN IF NOT EXISTS exam_limit INT DEFAULT 5",
		"ALTER TABLE users ADD COLUMN IF NOT EXISTS exam_pack_limit INT DEFAULT 3",
		"ALTER TABLE exams ADD COLUMN IF NOT EXISTS is_private BOOLEAN DEFAULT false",
		"ALTER TABLE exams ADD COLUMN IF NOT EXISTS passcode VARCHAR(100) DEFAULT ''",
		"ALTER TABLE exams ADD COLUMN IF NOT EXISTS duration_minutes INT DEFAULT 30",
		"ALTER TABLE exams ADD COLUMN IF NOT EXISTS created_by INT REFERENCES users(id) ON DELETE SET NULL",
	}
	for _, aq := range alterQueries {
		if _, err := DB.Exec(aq); err != nil {
			log.Fatalf("Failed to alter users/exams table: %v", err)
		}
	}

	// Create exam_packs table
	_, err = DB.Exec(`
	CREATE TABLE IF NOT EXISTS exam_packs (
		id SERIAL PRIMARY KEY,
		title VARCHAR(255) NOT NULL,
		description TEXT NOT NULL,
		image TEXT NOT NULL,
		category VARCHAR(100) NOT NULL,
		created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
		updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
	);`)
	if err != nil {
		log.Fatalf("Failed to create exam_packs table: %v", err)
	}

	// Pack ownership + per-pack exam creation limit
	packAlterQueries := []string{
		"ALTER TABLE exam_packs ADD COLUMN IF NOT EXISTS created_by INT REFERENCES users(id) ON DELETE SET NULL",
		"ALTER TABLE exam_packs ADD COLUMN IF NOT EXISTS exam_limit INT DEFAULT 6",
	}
	for _, aq := range packAlterQueries {
		if _, err := DB.Exec(aq); err != nil {
			log.Fatalf("Failed to alter exam_packs table: %v", err)
		}
	}

	// Create exams table
	_, err = DB.Exec(`
	CREATE TABLE IF NOT EXISTS exams (
		id VARCHAR(50) PRIMARY KEY,
		exam_pack_id INT NOT NULL REFERENCES exam_packs(id) ON DELETE CASCADE,
		name VARCHAR(255) NOT NULL,
		start_date TIMESTAMP NOT NULL,
		end_date TIMESTAMP NOT NULL,
		level VARCHAR(50),
		batch VARCHAR(50),
		total_marks INT DEFAULT 10,
		passing_marks INT DEFAULT 5,
		per_question_marks INT DEFAULT 1,
		negative_marks NUMERIC(4, 2) DEFAULT -0.5,
		created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
		updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
	);`)
	if err != nil {
		log.Fatalf("Failed to create exams table: %v", err)
	}

	// Create questions table
	_, err = DB.Exec(`
	CREATE TABLE IF NOT EXISTS questions (
		id SERIAL PRIMARY KEY,
		exam_id VARCHAR(50) NOT NULL REFERENCES exams(id) ON DELETE CASCADE,
		type VARCHAR(50) NOT NULL,
		question_text TEXT NOT NULL,
		options TEXT[] NOT NULL,
		correct_answer TEXT NOT NULL,
		passage TEXT,
		picture_url TEXT,
		created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
	);`)
	if err != nil {
		log.Fatalf("Failed to create questions table: %v", err)
	}

	// Create exam_attempts table
	_, err = DB.Exec(`
	CREATE TABLE IF NOT EXISTS exam_attempts (
		id SERIAL PRIMARY KEY,
		user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
		exam_id VARCHAR(50) NOT NULL REFERENCES exams(id) ON DELETE CASCADE,
		answers JSONB NOT NULL,
		total INT NOT NULL,
		correct INT NOT NULL,
		wrong INT NOT NULL,
		negative NUMERIC(6, 2) NOT NULL,
		final_score NUMERIC(6, 2) NOT NULL,
		passed BOOLEAN NOT NULL,
		warning_count INT DEFAULT 0,
		security_message TEXT,
		created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
	);`)
	if err != nil {
		log.Fatalf("Failed to create exam_attempts table: %v", err)
	}

	createPermissionsTable()
	createAssetsTable()
	createTransactionsTable()
	createExamRequestsTable()
	createAppMetaTable()

	fmt.Println("Database tables verified/created successfully!")
}

func createPermissionsTable() {
	_, err := DB.Exec(`
	CREATE TABLE IF NOT EXISTS permissions (
		id SERIAL PRIMARY KEY,
		role VARCHAR(100) NOT NULL,
		module VARCHAR(100) NOT NULL,
		access VARCHAR(50) NOT NULL
	);`)
	if err != nil {
		log.Fatalf("Failed to create permissions table: %v", err)
	}
}

func createAssetsTable() {
	_, err := DB.Exec(`
	CREATE TABLE IF NOT EXISTS system_assets (
		id SERIAL PRIMARY KEY,
		type VARCHAR(50) NOT NULL,
		value VARCHAR(100) NOT NULL UNIQUE
	);`)
	if err != nil {
		log.Fatalf("Failed to create system_assets table: %v", err)
	}
}

func createTransactionsTable() {
	_, err := DB.Exec(`
	CREATE TABLE IF NOT EXISTS transactions (
		id SERIAL PRIMARY KEY,
		type VARCHAR(50) NOT NULL,
		amount NUMERIC(12, 2) NOT NULL,
		description TEXT NOT NULL,
		created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
	);`)
	if err != nil {
		log.Fatalf("Failed to create transactions table: %v", err)
	}
}

func createExamRequestsTable() {
	_, err := DB.Exec(`
	CREATE TABLE IF NOT EXISTS exam_requests (
		id SERIAL PRIMARY KEY,
		teacher_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
		type VARCHAR(50) NOT NULL,
		pack_id INT REFERENCES exam_packs(id) ON DELETE CASCADE,
		title VARCHAR(255) NOT NULL,
		description TEXT,
		requested_limit INT NOT NULL DEFAULT 0,
		status VARCHAR(50) NOT NULL DEFAULT 'pending',
		admin_note TEXT,
		created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
		updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
	);`)
	if err != nil {
		log.Fatalf("Failed to create exam_requests table: %v", err)
	}
}

func createAppMetaTable() {
	_, err := DB.Exec(`
	CREATE TABLE IF NOT EXISTS app_meta (
		key VARCHAR(100) PRIMARY KEY,
		value TEXT NOT NULL
	);`)
	if err != nil {
		log.Fatalf("Failed to create app_meta table: %v", err)
	}
}

// clearLegacyDummyDataOnce removes every row from all tables except users,
// exactly once per database. This cleans up data from the old demo seeding
// without touching user accounts, and is guarded by an app_meta flag so it
// never runs again on subsequent starts.
func clearLegacyDummyDataOnce() {
	var cleared bool
	if err := DB.QueryRow(
		"SELECT EXISTS(SELECT 1 FROM app_meta WHERE key = 'legacy_dummy_data_cleared')",
	).Scan(&cleared); err != nil {
		log.Printf("Failed to check legacy-data cleanup flag: %v", err)
		return
	}
	if cleared {
		return
	}

	if _, err := DB.Exec(`
		TRUNCATE TABLE
			exam_attempts,
			questions,
			exams,
			exam_packs,
			exam_requests,
			permissions,
			system_assets,
			transactions
		RESTART IDENTITY CASCADE`); err != nil {
		log.Printf("Failed to clear legacy/dummy data: %v", err)
		return
	}

	if _, err := DB.Exec(
		"INSERT INTO app_meta (key, value) VALUES ('legacy_dummy_data_cleared', 'true') ON CONFLICT (key) DO NOTHING",
	); err != nil {
		log.Printf("Failed to record legacy-data cleanup: %v", err)
		return
	}

	fmt.Println("Cleared all non-user tables (users preserved); demo seeding is disabled.")
}
