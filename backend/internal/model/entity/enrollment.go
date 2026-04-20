package entity

import (
	"time"

	"github.com/google/uuid"
)

type EnrollmentStatus string

const (
	EnrollmentPending   EnrollmentStatus = "pending"
	EnrollmentActive    EnrollmentStatus = "active"
	EnrollmentCompleted EnrollmentStatus = "completed"
	EnrollmentCancelled EnrollmentStatus = "cancelled"
)

type Enrollment struct {
	Uid        uuid.UUID        `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"uid"`
	UserUid    uuid.UUID        `gorm:"type:uuid;not null;index" json:"user_uid"`
	CourseUid  uuid.UUID        `gorm:"type:uuid;not null;index" json:"course_uid"`
	EnrolledAt time.Time        `gorm:"autoCreateTime" json:"enrolled_at"`
	Progress   float64          `gorm:"type:decimal(5,2);default:0" json:"progress"`
	Status     EnrollmentStatus `gorm:"type:enrollment_status;default:'active'" json:"status"`

	// Relations
	User   *User   `gorm:"foreignKey:UserUid" json:"user"`
	Course *Course `gorm:"foreignKey:CourseUid" json:"course"`
}
