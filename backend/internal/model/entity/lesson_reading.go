package entity

import (
	"time"

	"github.com/google/uuid"
)

// LessonReading mencatat bahwa seorang user (melalui enrollment-nya) telah
// membaca / membuka suatu lesson. Satu user hanya boleh punya satu record
// per lesson (unique constraint pada lesson_uid + enrollment_uid).
type LessonReading struct {
	Uid           uuid.UUID `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"uid"`
	LessonUid     uuid.UUID `gorm:"type:uuid;not null;index"                        json:"lesson_uid"`
	EnrollmentUid uuid.UUID `gorm:"type:uuid;not null;index"                        json:"enrollment_uid"`
	ReadAt        time.Time `gorm:"autoCreateTime"                                  json:"read_at"`
	CreatedAt     time.Time `gorm:"autoCreateTime"                                  json:"created_at"`
	UpdatedAt     time.Time `gorm:"autoUpdateTime"                                  json:"updated_at"`

	// Relations
	Lesson     *Lesson     `gorm:"foreignKey:LessonUid"     json:"lesson,omitempty"`
	Enrollment *Enrollment `gorm:"foreignKey:EnrollmentUid" json:"enrollment,omitempty"`
}

func (LessonReading) TableName() string {
	return "lesson_readings"
}
