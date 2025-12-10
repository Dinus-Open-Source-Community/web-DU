package entity

import (
	"time"
)

// Model Lesson Migrations
type Lesson struct {
	ID         uint      `gorm:"primaryKey" json:"id"`
	ModuleID   uint      `gorm:"not null" json:"module_id"`
	Title      string    `gorm:"type:varchar(200);not null" json:"title"`
	Content    string    `gorm:"type:jsonb" json:"content"` // optional JSONB
	VideoURL   string    `gorm:"type:varchar(255)" json:"video_url"`
	OrderIndex int       `json:"order_index"`
	CreatedAt  time.Time `gorm:"autoCreateTime" json:"created_at"`
	UpdatedAt  time.Time `gorm:"autoUpdateTime" json:"updated_at"`

	// Relations
	Module *Module
}
