package model

import "time"

// Model CourseAnnouncement Migrations
type CourseAnnouncement struct {
	ID        uint      `gorm:"primaryKey" json:"id"`
	CourseID  uint      `gorm:"not null" json:"course_id"`
	Title     string    `gorm:"type:varchar(150)" json:"title"`
	Message   string    `gorm:"type:text" json:"message"`
	CreatedAt time.Time `gorm:"autoCreateTime" json:"created_at"`

	Course *Course
}
