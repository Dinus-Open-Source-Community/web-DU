package entity

import (
	"time"

	"github.com/google/uuid"
)

// ClassType stores dynamic class type options for courses.
type ClassType struct {
	Uid         uuid.UUID `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"uid"`
	Name        string    `gorm:"type:varchar(120);unique;not null" json:"name"`
	Description string    `gorm:"type:text" json:"description"`
	IsActive    bool      `gorm:"default:true" json:"is_active"`
	CreatedAt   time.Time `gorm:"autoCreateTime" json:"created_at"`
	UpdatedAt   time.Time `gorm:"autoUpdateTime" json:"updated_at"`

	// Relations
	Courses []Course `gorm:"foreignKey:ClassTypeUid" json:"-"`
}
