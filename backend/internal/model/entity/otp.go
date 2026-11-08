package entity

import (
	"time"

	"github.com/google/uuid"
)

const (
	PurposeVerifyAccount = "verify_account"
)

// OTP merepresentasikan token One-Time Password yang dikirim ke email user.
type OTP struct {
	ID          uint       `gorm:"primaryKey" json:"id"`
	UserUID     uuid.UUID  `gorm:"type:uuid;index;not null" json:"user_uid"`
	EmailHash   string     `gorm:"type:varchar(150);not null;index" json:"-"`
	CodeHash    string     `gorm:"type:varchar(255);not null" json:"-"`
	Purpose     string     `gorm:"type:varchar(50);not null;default:'verify_account'" json:"purpose"`
	Attempts    int        `gorm:"not null;default:0" json:"-"`
	MaxAttempts int        `gorm:"not null;default:5" json:"-"`
	ExpiresAt   time.Time  `gorm:"not null;index" json:"expires_at"`
	UsedAt      *time.Time `json:"used_at"`
	CreatedAt   time.Time  `gorm:"autoCreateTime" json:"created_at"`
}
