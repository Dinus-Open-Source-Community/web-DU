package entity

import "time"

// Model Course Migrations
type Course struct {
	ID           uint      `gorm:"primaryKey" json:"id"`
	EventID      *uint     `json:"event_id"`
	MentorID     *uint     `json:"mentor_id"`
	Title        string    `gorm:"type:varchar(200);not null" json:"title"`
	Slug         string    `gorm:"type:varchar(255);unique;not null" json:"slug"`
	Description  string    `gorm:"type:text" json:"description"`
	ThumbnailURL string    `gorm:"type:varchar(255)" json:"thumbnail_url"`
	Price        float64   `gorm:"type:decimal(10,2)" json:"price"`
	IsPremium    bool      `gorm:"default:false" json:"is_premium"`
	IsPublished  bool      `gorm:"default:false" json:"is_published"`
	CreatedAt    time.Time `gorm:"autoCreateTime" json:"created_at"`
	UpdatedAt    time.Time `gorm:"autoUpdateTime" json:"updated_at"`

	// Relations
	Event         *Event               `json:"event"`
	Mentor        *User                `json:"mentor"`
	Modules       []Module             `json:"modules"`
	Enrollments   []Enrollment         `json:"enrollments"`
	Reviews       []CourseReview       `json:"course_reviews"`
	Announcements []CourseAnnouncement `json:"course_announcements"`
}
