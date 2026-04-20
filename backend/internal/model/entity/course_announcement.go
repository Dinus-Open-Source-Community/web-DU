package entity

import (
	"time"

	"github.com/google/uuid"
)

// Model CourseAnnouncement Migrations
type CourseAnnouncement struct {
	Uid       uuid.UUID `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"uid"`
	CourseUid uuid.UUID `gorm:"type:uuid;not null;index" json:"course_uid"`
	Title     string    `gorm:"type:varchar(150)" json:"title"`
	Message   string    `gorm:"type:text" json:"message"`
	CreatedAt time.Time `gorm:"autoCreateTime" json:"created_at"`

	Course *Course `gorm:"foreignKey:CourseUid" json:"course"`
}
