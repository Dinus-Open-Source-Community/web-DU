package entity

import (
	"time"

	"github.com/google/uuid"
)

type RedeemCode struct {
	Uid          uuid.UUID  `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"uid"`
	Code         string     `gorm:"type:varchar(64);uniqueIndex;not null" json:"code"`
	CourseUid    uuid.UUID  `gorm:"type:uuid;not null;index" json:"course_uid"`
	TargetEmail  string     `gorm:"type:varchar(150);index" json:"target_email,omitempty"`
	MaxUses      int        `gorm:"default:1;not null" json:"max_uses"`
	UsedCount    int        `gorm:"default:0;not null" json:"used_count"`
	IsActive     bool       `gorm:"default:true;not null" json:"is_active"`
	ExpiresAt    *time.Time `json:"expires_at,omitempty"`
	CreatedByUid *uuid.UUID `gorm:"type:uuid" json:"created_by_uid,omitempty"`
	CreatedAt    time.Time  `gorm:"autoCreateTime" json:"created_at"`
	UpdatedAt    time.Time  `gorm:"autoUpdateTime" json:"updated_at"`

	// Relations
	Course *Course `gorm:"foreignKey:CourseUid" json:"course,omitempty"`
}

type RedeemCodeUsage struct {
	Uid           uuid.UUID `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"uid"`
	RedeemCodeUid uuid.UUID `gorm:"type:uuid;not null;index" json:"redeem_code_uid"`
	UserUid       uuid.UUID `gorm:"type:uuid;not null;index" json:"user_uid"`
	CourseUid     uuid.UUID `gorm:"type:uuid;not null;index" json:"course_uid"`
	RedeemedAt    time.Time `gorm:"autoCreateTime" json:"redeemed_at"`

	// Relations
	RedeemCode *RedeemCode `gorm:"foreignKey:RedeemCodeUid" json:"redeem_code,omitempty"`
	User       *User       `gorm:"foreignKey:UserUid" json:"user,omitempty"`
	Course     *Course     `gorm:"foreignKey:CourseUid" json:"course,omitempty"`
}
