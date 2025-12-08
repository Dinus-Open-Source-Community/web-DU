package model

import "time"

// Model Module Migrations
type Module struct {
	ID         uint      `gorm:"primaryKey" json:"id"`
	CourseID   uint      `gorm:"not null" json:"course_id"`
	Title      string    `gorm:"type:varchar(200);not null" json:"title"`
	OrderIndex int       `json:"order_index"`
	CreatedAt  time.Time `gorm:"autoCreateTime" json:"created_at"`

	// Relations
	Course  *Course
	Lessons []Lesson
}
