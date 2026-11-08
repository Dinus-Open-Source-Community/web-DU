package entity

import (
	"time"

	"github.com/google/uuid"
)

// Gallery menyimpan foto dokumentasi kegiatan DOSCOM untuk beranda dan halaman galeri publik.
type Gallery struct {
	Uid          uuid.UUID  `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"uid"`
	ImageURL     string     `gorm:"type:text;not null" json:"image_url"`
	Caption      string     `gorm:"type:text;not null" json:"caption"`
	Variant      *int       `gorm:"type:smallint" json:"variant"`
	CreatedByUid *uuid.UUID `gorm:"type:uuid" json:"created_by_uid,omitempty"`
	CreatedAt    time.Time  `gorm:"autoCreateTime" json:"created_at"`
	UpdatedAt    time.Time  `gorm:"autoUpdateTime" json:"updated_at"`
}
