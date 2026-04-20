package entity

import (
	"time"

	"github.com/google/uuid"
)

// Model CourseReview Migrations
type CourseReview struct {
	Uid       uuid.UUID `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"uid"`
	UserUid   uuid.UUID `gorm:"type:uuid;not null;index" json:"user_uid"`
	CourseUid uuid.UUID `gorm:"type:uuid;not null;index" json:"course_uid"`
	Rating    int       `gorm:"check:rating >= 1 AND rating <= 5" json:"rating"`
	Comment   string    `gorm:"type:text" json:"comment"`
	CreatedAt time.Time `gorm:"autoCreateTime" json:"created_at"`

	User   *User   `gorm:"foreignKey:UserUid" json:"user"`
	Course *Course `gorm:"foreignKey:CourseUid" json:"course"`
}
