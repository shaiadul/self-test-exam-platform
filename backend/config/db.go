package config

import (
	"context"
	"database/sql"
	"fmt"
	"log"
	"os"
	"time"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"

	"github.com/selftest/backend/internal/domain/attempt"
	"github.com/selftest/backend/internal/domain/exam"
	"github.com/selftest/backend/internal/domain/exampack"
	"github.com/selftest/backend/internal/domain/examrequest"
	"github.com/selftest/backend/internal/domain/system"
	"github.com/selftest/backend/internal/domain/user"
)

// DB is the shared GORM database handle used by every repository.
var DB *gorm.DB

// sqlDB holds the underlying *sql.DB so we can tune the connection pool and
// keep the serverless (Supabase/Neon) compute warm.
var sqlDB *sql.DB

// models lists every domain entity that maps to a database table. Used by
// AutoMigrate to create/update the schema.
func models() []interface{} {
	return []interface{}{
		&user.User{},
		&exampack.ExamPack{},
		&exam.Exam{},
		&exam.Question{},
		&attempt.ExamAttempt{},
		&system.Permission{},
		&system.SystemAsset{},
		&system.Transaction{},
		&examrequest.ExamRequest{},
	}
}

// InitDB opens a pooled GORM connection to Supabase (PostgreSQL), verifies it
// and synchronises the schema.
func InitDB() {
	dbURL := os.Getenv("DATABASE_URL")
	if dbURL == "" {
		log.Fatal("DATABASE_URL is not set in environment variables")
	}

	var err error
	DB, err = gorm.Open(postgres.Open(dbURL), &gorm.Config{
		Logger: logger.Default.LogMode(logger.Warn),
	})
	if err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}

	sqlDB, err = DB.DB()
	if err != nil {
		log.Fatalf("Failed to access underlying database handle: %v", err)
	}

	// Pool tuning for a serverless (Supabase/Neon) database: keep a warm set of
	// connections, recycle them before they go stale, and avoid the default
	// short idle timeout tearing down connections between requests.
	sqlDB.SetMaxOpenConns(25)
	sqlDB.SetMaxIdleConns(25)
	sqlDB.SetConnMaxLifetime(30 * time.Minute)
	sqlDB.SetConnMaxIdleTime(5 * time.Minute)

	// Verify the connection is working
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()
	if err := sqlDB.PingContext(ctx); err != nil {
		log.Fatalf("Failed to ping database: %v", err)
	}

	// Keep Supabase's compute from suspending between bursts of traffic so the
	// first request after an idle period does not pay a cold-start handshake.
	startDBKeepAlive()

	fmt.Println("Connected to PostgreSQL (Supabase) via GORM successfully!")

	// Synchronise the schema from the domain models.
	migrate()

	// Tables that are not backed by a domain entity.
	createAppMetaTable()

	// One-time cleanup: drop any legacy/demo rows while keeping user accounts.
	// The app never seeds demo data — this only runs once per database.
	clearLegacyDummyDataOnce()
}

// CloseDB closes the underlying connection pool.
func CloseDB() {
	if sqlDB != nil {
		_ = sqlDB.Close()
	}
}

// startDBKeepAlive periodically pings the database in the background.
func startDBKeepAlive() {
	go func() {
		ticker := time.NewTicker(2 * time.Minute)
		defer ticker.Stop()
		for range ticker.C {
			ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
			if err := sqlDB.PingContext(ctx); err != nil {
				log.Printf("database keepalive ping failed: %v", err)
			}
			cancel()
		}
	}()
}

// migrate runs GORM AutoMigrate for every domain model, then creates the
// indexes that GORM cannot express (e.g. descending order indexes).
func migrate() {
	if err := DB.AutoMigrate(models()...); err != nil {
		log.Fatalf("Failed to auto-migrate database schema: %v", err)
	}

	createIndexes()

	fmt.Println("Database tables verified/created successfully!")
}

// createIndexes adds missing indexes on foreign-key and filter columns.
// PostgreSQL does not index foreign keys automatically, so without these every
// lookup degrades into a sequential scan as the tables grow.
func createIndexes() {
	indexQueries := []string{
		"CREATE INDEX IF NOT EXISTS idx_exam_attempts_user_id ON exam_attempts(user_id)",
		"CREATE INDEX IF NOT EXISTS idx_exam_attempts_exam_id ON exam_attempts(exam_id)",
		"CREATE INDEX IF NOT EXISTS idx_exam_attempts_created_at ON exam_attempts(created_at DESC)",
		"CREATE INDEX IF NOT EXISTS idx_exams_exam_pack_id ON exams(exam_pack_id)",
		"CREATE INDEX IF NOT EXISTS idx_exams_created_by ON exams(created_by)",
		"CREATE INDEX IF NOT EXISTS idx_questions_exam_id ON questions(exam_id)",
		"CREATE INDEX IF NOT EXISTS idx_questions_created_by ON questions(created_by)",
		"CREATE INDEX IF NOT EXISTS idx_exam_packs_created_by ON exam_packs(created_by)",
		"CREATE INDEX IF NOT EXISTS idx_exam_requests_teacher_id ON exam_requests(teacher_id)",
		"CREATE INDEX IF NOT EXISTS idx_exam_requests_pack_id ON exam_requests(pack_id)",
		"CREATE INDEX IF NOT EXISTS idx_users_role ON users(role)",
	}
	for _, q := range indexQueries {
		if err := DB.Exec(q).Error; err != nil {
			log.Printf("Failed to create index (%s): %v", q, err)
		}
	}
}

func createAppMetaTable() {
	query := `
	CREATE TABLE IF NOT EXISTS app_meta (
		key VARCHAR(100) PRIMARY KEY,
		value TEXT NOT NULL
	);`
	if err := DB.Exec(query).Error; err != nil {
		log.Fatalf("Failed to create app_meta table: %v", err)
	}
}

// clearLegacyDummyDataOnce removes every row from all tables except users,
// exactly once per database. This cleans up data from the old demo seeding
// without touching user accounts, and is guarded by an app_meta flag so it
// never runs again on subsequent starts.
func clearLegacyDummyDataOnce() {
	var cleared bool
	if err := DB.Raw(
		"SELECT EXISTS(SELECT 1 FROM app_meta WHERE key = 'legacy_dummy_data_cleared')",
	).Scan(&cleared).Error; err != nil {
		log.Printf("Failed to check legacy-data cleanup flag: %v", err)
		return
	}
	if cleared {
		return
	}

	err := DB.Exec(`
		TRUNCATE TABLE
			exam_attempts,
			questions,
			exams,
			exam_packs,
			exam_requests,
			permissions,
			system_assets,
			transactions
		RESTART IDENTITY CASCADE`).Error
	if err != nil {
		log.Printf("Failed to clear legacy/dummy data: %v", err)
		return
	}

	if err := DB.Exec(
		"INSERT INTO app_meta (key, value) VALUES ('legacy_dummy_data_cleared', 'true') ON CONFLICT (key) DO NOTHING",
	).Error; err != nil {
		log.Printf("Failed to record legacy-data cleanup: %v", err)
		return
	}

	fmt.Println("Cleared all non-user tables (users preserved); demo seeding is disabled.")
}
