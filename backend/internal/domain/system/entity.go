package system

import "time"

type Permission struct {
	ID     int    `json:"id" db:"id" gorm:"primaryKey;autoIncrement"`
	Role   string `json:"role" db:"role" gorm:"not null"`
	Module string `json:"module" db:"module" gorm:"not null"`
	Access string `json:"access" db:"access" gorm:"not null"`
}

type SystemAsset struct {
	ID    int    `json:"id" db:"id" gorm:"primaryKey;autoIncrement"`
	Type  string `json:"type" db:"type" gorm:"not null"`
	Value string `json:"value" db:"value" gorm:"uniqueIndex;not null"`
}

// InstitutionSuggestion holds a user-proposed custom institution name.
// Status: "pending" | "approved" | "rejected"
// When approved, the value is promoted to system_assets (type=institution).
type InstitutionSuggestion struct {
	ID        int       `json:"id" gorm:"primaryKey;autoIncrement"`
	UserID    int       `json:"userId" gorm:"not null;index"`
	UserName  string    `json:"userName" gorm:"-"`
	Value     string    `json:"value" gorm:"not null"`
	Status    string    `json:"status" gorm:"not null;default:'pending'"`
	CreatedAt time.Time `json:"created_at" gorm:"autoCreateTime"`
}

type Transaction struct {
	ID          int       `json:"id" db:"id" gorm:"primaryKey;autoIncrement"`
	Type        string    `json:"type" db:"type" gorm:"not null"`
	Amount      float64   `json:"amount" db:"amount" gorm:"type:numeric(12,2);not null"`
	Description string    `json:"description" db:"description" gorm:"not null"`
	CreatedAt   time.Time `json:"created_at" db:"created_at" gorm:"autoCreateTime"`
}

type FinancialSummary struct {
	TotalIncome      float64 `json:"totalIncome"`
	TotalExpenditure float64 `json:"totalExpenditure"`
	NetIncome        float64 `json:"netIncome"`
}

