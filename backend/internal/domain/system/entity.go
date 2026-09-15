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
