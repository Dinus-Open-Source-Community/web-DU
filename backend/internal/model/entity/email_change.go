package entity

import (
	"time"

	"github.com/google/uuid"
)

// EmailChangeRequest merepresentasikan permintaan pergantian alamat email yang
// membutuhkan konfirmasi melalui tautan yang dikirim ke email lama pengguna.
type EmailChangeRequest struct {
	ID           uint       `gorm:"primaryKey" json:"id"`
	UserUID      uuid.UUID  `gorm:"type:uuid;index;not null" json:"user_uid"`
	OldEmailHash string     `gorm:"type:varchar(150);not null;index" json:"-"`
	NewEmail     string     `gorm:"type:varchar(255);not null" json:"-"`
	NewEmailHash string     `gorm:"type:varchar(150);not null;index" json:"-"`
	TokenHash    string     `gorm:"type:varchar(255);uniqueIndex;not null" json:"-"`
	ExpiresAt    time.Time  `gorm:"not null;index" json:"expires_at"`
	UsedAt       *time.Time `json:"used_at"`
	CreatedAt    time.Time  `gorm:"autoCreateTime" json:"created_at"`
}
