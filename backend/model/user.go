package model

import "time"

type User struct {
	ID          int        `json:"id" db:"id"`
	Name        string     `json:"name" db:"name"`
	Email       string     `json:"email" db:"email"`
	Password    string     `json:"-" db:"password"`
	Role        string     `json:"role" db:"role"`
	Image       *string    `json:"image" db:"image"`
	Phone       *string    `json:"phone" db:"phone"`
	Level       *string    `json:"level" db:"level"`
	Batch       *string    `json:"batch" db:"batch"`
	Board       *string    `json:"board" db:"board"`
	Institution *string    `json:"institution" db:"institution"`
	Address     *string    `json:"address" db:"address"`
	CreatedAt   time.Time  `json:"created_at" db:"created_at"`
	UpdatedAt   time.Time  `json:"updated_at" db:"updated_at"`
}

type RegisterRequest struct {
	Name     string `json:"name"`
	Email    string `json:"email"`
	Password string `json:"password"`
}

type LoginRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

type LoginResponse struct {
	Token string `json:"token"`
	User  User   `json:"user"`
}

type CompleteProfileRequest struct {
	Image       string `json:"image"`
	Name        string `json:"name"`
	Phone       string `json:"phone"`
	Level       string `json:"level"`
	Batch       string `json:"batch"`
	Board       string `json:"board"`
	Institution string `json:"institution"`
	Address     string `json:"address"`
}
