package entity

import "time"

// Model CourseReview Migrations
type CourseReview struct {
	ID        uint      `gorm:"primaryKey" json:"id"`
	UserID    uint      `gorm:"not null" json:"user_id"`
	CourseID  uint      `gorm:"not null" json:"course_id"`
	Rating    int       `gorm:"check:rating >= 1 AND rating <= 5" json:"rating"`
	Comment   string    `gorm:"type:text" json:"comment"`
	CreatedAt time.Time `gorm:"autoCreateTime" json:"created_at"`

	User   *User `json:"user"`
	Course *Course `json:"course"`
}
