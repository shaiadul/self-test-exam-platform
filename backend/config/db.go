package config

import (
	"database/sql"
	"fmt"
	"log"
	"os"
	"time"

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

	// Alter users table to add new columns if they do not exist
	alterQueries := []string{
		"ALTER TABLE users ADD COLUMN IF NOT EXISTS subject VARCHAR(100)",
		"ALTER TABLE users ADD COLUMN IF NOT EXISTS designation VARCHAR(100)",
		"ALTER TABLE users ADD COLUMN IF NOT EXISTS admin_tier VARCHAR(100)",
		"ALTER TABLE users ADD COLUMN IF NOT EXISTS admin_dept VARCHAR(100)",
		"ALTER TABLE users ADD COLUMN IF NOT EXISTS admin_base VARCHAR(100)",
	}
	for _, aq := range alterQueries {
		if _, err := DB.Exec(aq); err != nil {
			log.Fatalf("Failed to alter users table: %v", err)
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

	fmt.Println("Database tables verified/created successfully!")
	seedDemoExams()
}

func seedDemoExams() {
	var count int
	err := DB.QueryRow("SELECT COUNT(*) FROM exam_packs").Scan(&count)
	if err != nil {
		log.Printf("Failed to count exam packs: %v", err)
		return
	}
	if count > 0 {
		return // Already seeded
	}

	// Seed packs
	packs := []struct {
		Title, Description, Category, Image string
	}{
		{"Math Beginner Pack", "Covers algebra, geometry, and basic arithmetic concepts for beginners.", "Math", "/global/test.png"},
		{"Science Explorer Pack", "Includes physics, chemistry, and biology practice exams for learners.", "Science", "/global/test.png"},
		{"English Grammar Pack", "Grammar, vocabulary, and comprehension practice questions in English.", "English", "/global/test.png"},
		{"Geography Explorer Pack", "Covers maps, continents, countries, and geographical features.", "Geography", "/global/no-picture.jpg"},
	}

	for _, p := range packs {
		var packID int
		err := DB.QueryRow(`
			INSERT INTO exam_packs (title, description, category, image)
			VALUES ($1, $2, $3, $4)
			RETURNING id`, p.Title, p.Description, p.Category, p.Image).Scan(&packID)
		if err != nil {
			log.Printf("Failed to seed exam pack %s: %v", p.Title, err)
			continue
		}

		if p.Title == "Science Explorer Pack" {
			// Seed exams inside Science Explorer Pack
			exams := []struct {
				ID, Name string
				Start, End time.Time
				Level, Batch string
			}{
				{"HSC2341", "Algebra Basics", time.Now().Add(-2 * time.Hour), time.Now().Add(24 * time.Hour), "HSC", "2019-2020"},
				{"SSC2341", "Physics Fundamentals", time.Now().Add(-48 * time.Hour), time.Now().Add(-24 * time.Hour), "SSC", "2018-2019"},
				{"BCSS2341", "Chemistry Lab", time.Now().Add(-12 * time.Hour), time.Now().Add(-10 * time.Hour), "BCS", "2020"},
				{"HSC2342", "Biology Concepts", time.Now().Add(-1 * time.Hour), time.Now().Add(12 * time.Hour), "HSC", "2019-2020"},
			}

			for _, e := range exams {
				_, err := DB.Exec(`
					INSERT INTO exams (id, exam_pack_id, name, start_date, end_date, level, batch, total_marks, passing_marks, per_question_marks, negative_marks)
					VALUES ($1, $2, $3, $4, $5, $6, $7, 10, 5, 2, -0.5)`,
					e.ID, packID, e.Name, e.Start, e.End, e.Level, e.Batch)
				if err != nil {
					log.Printf("Failed to seed exam %s: %v", e.Name, err)
					continue
				}

				// Seed questions
				questions := []struct {
					Type, Text, CorrectAnswer string
					Options []string
					Passage, Picture *string
				}{
					{
						"mcq", "What is the capital of France?", "Paris",
						[]string{"Paris", "London", "Berlin", "Madrid"}, nil, nil,
					},
					{
						"passage", "According to the passage, which is true?", "Sun rises in east",
						[]string{"Sun rises in west", "Sun rises in east", "Sun rises in north", "Sun rises in south"},
						strPtr("The sun rises in the east and sets in the west."), nil,
					},
					{
						"picture", "Identify this animal in the picture.", "Dog",
						[]string{"Cat", "Dog", "Elephant", "Tiger"},
						nil, strPtr("/global/drought.jpg"),
					},
					{
						"passage", "According to the passage, which is true?", "Sun rises in east",
						[]string{"Sun rises in west", "Sun rises in east", "Sun rises in north", "Sun rises in south"},
						strPtr("The sun rises in the east and sets in the west."), nil,
					},
					{
						"picture", "Identify this animal in the picture.", "Dog",
						[]string{"Cat", "Dog", "Elephant", "Tiger"},
						nil, strPtr("/global/drought.jpg"),
					},
				}

				for _, q := range questions {
					_, err := DB.Exec(`
						INSERT INTO questions (exam_id, type, question_text, options, correct_answer, passage, picture_url)
						VALUES ($1, $2, $3, $4, $5, $6, $7)`,
						e.ID, q.Type, q.Text, q.Options, q.CorrectAnswer, q.Passage, q.Picture)
					if err != nil {
						log.Printf("Failed to seed question: %v", err)
					}
				}
			}
		}
	}
	fmt.Println("Demo exams and questions seeded successfully!")
}

func strPtr(s string) *string {
	return &s
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

	// Seed permissions if empty
	var count int
	err = DB.QueryRow("SELECT COUNT(*) FROM permissions").Scan(&count)
	if err == nil && count == 0 {
		perms := []struct {
			Role, Module, Access string
		}{
			{"Admin", "User Management", "Full"},
			{"Teacher", "Exam Analysis", "Read"},
			{"Student", "Financial Report", "None"},
		}
		for _, p := range perms {
			_, err = DB.Exec("INSERT INTO permissions (role, module, access) VALUES ($1, $2, $3)", p.Role, p.Module, p.Access)
			if err != nil {
				log.Printf("Failed to seed permission %s: %v", p.Role, err)
			}
		}
		fmt.Println("Seeded permissions table!")
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

	// Seed default assets if empty
	var count int
	err = DB.QueryRow("SELECT COUNT(*) FROM system_assets").Scan(&count)
	if err == nil && count == 0 {
		assets := []struct {
			Type, Value string
		}{
			{"level", "HSC"},
			{"level", "SSC"},
			{"level", "Primary"},
			{"board", "Dhaka"},
			{"board", "Chattogram"},
			{"board", "Rajshahi"},
			{"board", "Sylhet"},
			{"batch", "2018-2019"},
			{"batch", "2019-2020"},
			{"batch", "2020-2021"},
		}
		for _, a := range assets {
			_, err = DB.Exec("INSERT INTO system_assets (type, value) VALUES ($1, $2) ON CONFLICT DO NOTHING", a.Type, a.Value)
			if err != nil {
				log.Printf("Failed to seed asset %s - %s: %v", a.Type, a.Value, err)
			}
		}
		fmt.Println("Seeded system_assets table!")
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

	// Seed default transactions if empty
	var count int
	err = DB.QueryRow("SELECT COUNT(*) FROM transactions").Scan(&count)
	if err == nil && count == 0 {
		txs := []struct {
			Type        string
			Amount      float64
			Description string
		}{
			{"income", 12000.00, "Student registration and mock exam pack fees"},
			{"expenditure", 4500.00, "Cloud database server hosting and infrastructure"},
			{"income", 1500.00, "Premium PDF study guides and worksheets downloads"},
			{"expenditure", 1200.00, "Teacher content contributions and review fees"},
		}
		for _, t := range txs {
			_, err = DB.Exec("INSERT INTO transactions (type, amount, description) VALUES ($1, $2, $3)", t.Type, t.Amount, t.Description)
			if err != nil {
				log.Printf("Failed to seed transaction: %v", err)
			}
		}
		fmt.Println("Seeded transactions table!")
	}
}
