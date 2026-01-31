package entity

import (
	"database/sql/driver"
	"encoding/json"
	"time"
)

// Model Lesson Migrations
type Lesson struct {
	ID         uint            `gorm:"primaryKey" json:"id"`
	ModuleID   uint            `gorm:"not null" json:"module_id"`
	Title      string          `gorm:"type:varchar(200);not null" json:"title"`
	Content    json.RawMessage `gorm:"type:jsonb" json:"content"` // JSONB stored as json.RawMessage
	VideoURL   string          `gorm:"type:varchar(255)" json:"video_url"`
	OrderIndex int             `json:"order_index"`
	CreatedAt  time.Time       `gorm:"autoCreateTime" json:"created_at"`
	UpdatedAt  time.Time       `gorm:"autoUpdateTime" json:"updated_at"`

	// Relations
	Module *Module `json:"module"`
}

// Scan implements the sql.Scanner interface for JSONB
func (l *Lesson) Scan(value interface{}) error {
	bytes, _ := value.([]byte)
	return json.Unmarshal(bytes, &l.Content)
}

// Value implements the driver.Valuer interface for JSONB
func (l Lesson) Value() (driver.Value, error) {
	return l.Content, nil
}
