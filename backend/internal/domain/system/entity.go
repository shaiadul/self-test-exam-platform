package system

import "time"

type Permission struct {
	ID     int    `json:"id" db:"id"`
	Role   string `json:"role" db:"role"`
	Module string `json:"module" db:"module"`
	Access string `json:"access" db:"access"`
}

type SystemAsset struct {
	ID    int    `json:"id" db:"id"`
	Type  string `json:"type" db:"type"`
	Value string `json:"value" db:"value"`
}

type Transaction struct {
	ID          int       `json:"id" db:"id"`
	Type        string    `json:"type" db:"type"`
	Amount      float64   `json:"amount" db:"amount"`
	Description string    `json:"description" db:"description"`
	CreatedAt   time.Time `json:"created_at" db:"created_at"`
}

type FinancialSummary struct {
	TotalIncome      float64 `json:"totalIncome"`
	TotalExpenditure float64 `json:"totalExpenditure"`
	NetIncome        float64 `json:"netIncome"`
}
