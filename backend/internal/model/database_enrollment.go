package model

import "time"

type EnrollmentStatus string

const (
	EnrollmentActive    EnrollmentStatus = "active"
	EnrollmentCompleted EnrollmentStatus = "completed"
	EnrollmentCancelled EnrollmentStatus = "cancelled"
)

type Enrollment struct {
	ID         uint              `gorm:"primaryKey" json:"id"`
	UserID     uint              `gorm:"not null" json:"user_id"`
	CourseID   uint              `gorm:"not null" json:"course_id"`
	EnrolledAt time.Time         `gorm:"autoCreateTime" json:"enrolled_at"`
	Progress   float64           `gorm:"type:decimal(5,2);default:0" json:"progress"`
	Status     EnrollmentStatus  `gorm:"type:enrollment_status;default:'active'" json:"status"`

	// Relations
	User    *User
	Course  *Course
	Payment []Payment `gorm:"foreignKey:EnrollmentID"`
}
