package entity

import (
	"time"

	"github.com/google/uuid"
)

// Model Module Migrations
type Module struct {
	Uid        uuid.UUID `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"uid"`
	CourseUid  uuid.UUID `gorm:"type:uuid;not null;index" json:"course_uid"`
	Title      string    `gorm:"type:varchar(200);not null" json:"title"`
	OrderIndex int       `json:"order_index"`
	CreatedAt  time.Time `gorm:"autoCreateTime" json:"created_at"`

	// Relations
	Course  *Course  `gorm:"foreignKey:CourseUid" json:"course"`
	Lessons []Lesson `gorm:"foreignKey:ModuleUid" json:"lessons"`
}
