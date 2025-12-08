package model

import (
	"time"
)

type UserRole string

const (
	AdminRole   UserRole = "admin"
	MentorRole  UserRole = "mentor"
	StudentRole UserRole = "student"
)

// Model User Migrations
type User struct {
	ID         uint      `gorm:"primaryKey" json:"id"`
	Name       string    `gorm:"type:varchar(150);not null" json:"name"`
	Email      string    `gorm:"type:varchar(150);unique;not null" json:"email"`
	EmailHash  string    `gorm:"type:varchar(150);unique;not null" json:"email_hash"`
	Password   string    `gorm:"type:varchar(255);not null" json:"-"`
	Role       UserRole  `gorm:"type:user_role;default:'student';not null" json:"role"`
	IsVerified bool      `gorm:"default:false" json:"is_verified"`
	AvatarURL  string    `gorm:"type:varchar(255)" json:"avatar_url"`
	CreatedAt  time.Time `gorm:"autoCreateTime" json:"created_at"`
	UpdatedAt  time.Time `gorm:"autoUpdateTime" json:"updated_at"`

	// Relations
	Courses     []Course     `gorm:"foreignKey:MentorID"`
	Enrollments []Enrollment `gorm:"foreignKey:UserID"`
	Reviews     []CourseReview
}