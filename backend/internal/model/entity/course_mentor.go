package entity

import (
	"time"

	"github.com/google/uuid"
)

type CourseMentorStatus string

const (
	CourseMentorSelected CourseMentorStatus = "selected"
	CourseMentorJoined   CourseMentorStatus = "joined"
)

// CourseMentor stores mentor assignments made by admin for a course.
type CourseMentor struct {
	Uid           uuid.UUID          `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"uid"`
	CourseUid     uuid.UUID          `gorm:"type:uuid;not null;index;uniqueIndex:idx_course_mentor" json:"course_uid"`
	MentorUid     uuid.UUID          `gorm:"type:uuid;not null;index;uniqueIndex:idx_course_mentor" json:"mentor_uid"`
	AssignedByUid uuid.UUID          `gorm:"type:uuid;not null;index" json:"assigned_by_uid"`
	Status        CourseMentorStatus `gorm:"type:varchar(20);default:'selected';not null" json:"status"`
	JoinedAt      *time.Time         `json:"joined_at"`
	CreatedAt     time.Time          `gorm:"autoCreateTime" json:"created_at"`
	UpdatedAt     time.Time          `gorm:"autoUpdateTime" json:"updated_at"`

	// Relations
	Course     *Course `gorm:"foreignKey:CourseUid" json:"course,omitempty"`
	Mentor     *User   `gorm:"foreignKey:MentorUid" json:"mentor,omitempty"`
	AssignedBy *User   `gorm:"foreignKey:AssignedByUid" json:"assigned_by,omitempty"`
}
