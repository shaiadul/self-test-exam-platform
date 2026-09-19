package user

import "time"

type User struct {
	ID                int       `json:"id" db:"id" gorm:"primaryKey;autoIncrement"`
	Name              string    `json:"name" db:"name" gorm:"not null"`
	Email             string    `json:"email" db:"email" gorm:"uniqueIndex;not null"`
	Password          *string   `json:"-" db:"password" gorm:"column:password"`
	Role              string    `json:"role" db:"role" gorm:"not null;default:student"`
	Provider          *string   `json:"provider" db:"provider" gorm:"column:provider;default:'email'"`
	ProviderID        *string   `json:"providerId" db:"provider_id" gorm:"column:provider_id;index"`
	Image             *string   `json:"image" db:"image"`
	Phone             *string   `json:"phone" db:"phone"`
	Level             *string   `json:"level" db:"level"`
	Batch             *string   `json:"batch" db:"batch"`
	Board             *string   `json:"board" db:"board"`
	Institution       *string   `json:"institution" db:"institution"`
	Address           *string   `json:"address" db:"address"`
	Subject           *string   `json:"subject" db:"subject"`
	Designation       *string   `json:"designation" db:"designation"`
	AdminTier         *string   `json:"adminTier" db:"admin_tier" gorm:"column:admin_tier"`
	AdminDept         *string   `json:"adminDept" db:"admin_dept" gorm:"column:admin_dept"`
	AdminBase         *string   `json:"adminBase" db:"admin_base" gorm:"column:admin_base"`
	ExamLimit         *int      `json:"examLimit,omitempty" db:"exam_limit" gorm:"default:5"`
	ExamPackLimit     *int      `json:"examPackLimit,omitempty" db:"exam_pack_limit" gorm:"default:3"`
	CreatedExamsCount int       `json:"createdExamsCount,omitempty" gorm:"->;-:migration"`
	CreatedPacksCount int       `json:"createdPacksCount,omitempty" gorm:"->;-:migration"`
	CreatedAt         time.Time `json:"created_at" db:"created_at" gorm:"autoCreateTime"`
	UpdatedAt         time.Time `json:"updated_at" db:"updated_at" gorm:"autoUpdateTime"`
}

type UserSummary struct {
	ID            int     `json:"id"`
	Name          string  `json:"name"`
	Role          string  `json:"role"`
	Institution   *string `json:"institution,omitempty"`
	ExamLimit     *int    `json:"examLimit,omitempty"`
	ExamPackLimit *int    `json:"examPackLimit,omitempty"`
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

type SocialLoginRequest struct {
	Provider    string  `json:"provider"`
	ProviderID  string  `json:"providerId"`
	Email       string  `json:"email"`
	Name        string  `json:"name"`
	Image       *string `json:"image,omitempty"`
	AccessToken *string `json:"accessToken,omitempty"`
	IDToken     *string `json:"idToken,omitempty"`
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
	Subject     string `json:"subject"`
	Designation string `json:"designation"`
	AdminTier   string `json:"adminTier"`
	AdminDept   string `json:"adminDept"`
	AdminBase   string `json:"adminBase"`
}
