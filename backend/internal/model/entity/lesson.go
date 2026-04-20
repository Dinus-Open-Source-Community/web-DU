package entity

import (
	"database/sql/driver"
	"encoding/json"
	"time"

	"github.com/google/uuid"
)

// Model Lesson Migrations
type Lesson struct {
	Uid        uuid.UUID       `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"uid"`
	ModuleUid  uuid.UUID       `gorm:"type:uuid;not null;index" json:"module_uid"`
	Title      string          `gorm:"type:varchar(200);not null" json:"title"`
	Content    json.RawMessage `gorm:"type:jsonb" json:"content"` // JSONB stored as json.RawMessage
	VideoURL   string          `gorm:"type:varchar(255)" json:"video_url"`
	StartTime  time.Time       `json:"start_time"`
	EndTime    time.Time       `json:"end_time"`
	OrderIndex int             `json:"order_index"`
	CreatedAt  time.Time       `gorm:"autoCreateTime" json:"created_at"`
	UpdatedAt  time.Time       `gorm:"autoUpdateTime" json:"updated_at"`

	// Relations
	Module *Module `gorm:"foreignKey:ModuleUid" json:"module"`
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
