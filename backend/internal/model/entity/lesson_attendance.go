package entity

import (
	"time"

	"github.com/google/uuid"
)

type AttendanceStatus string

const (
	AttendancePresent AttendanceStatus = "present"
	AttendanceLate    AttendanceStatus = "late"
	AttendanceAbsent  AttendanceStatus = "absent"
	AttendanceExcused AttendanceStatus = "excused"
)

type LessonAttendance struct {
	Uid           uuid.UUID        `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"uid"`
	LessonUid     uuid.UUID        `gorm:"type:uuid;not null;index" json:"lesson_uid"`
	EnrollmentUid uuid.UUID        `gorm:"type:uuid;not null;index" json:"enrollment_uid"`
	CheckedInAt   time.Time        `gorm:"autoCreateTime" json:"checked_in_at"`
	Status        AttendanceStatus `gorm:"type:attendance_status;default:'present'" json:"status"`
	Note          string           `gorm:"type:text" json:"note"`
	CreatedAt     time.Time        `gorm:"autoCreateTime" json:"created_at"`
	UpdatedAt     time.Time        `gorm:"autoUpdateTime" json:"updated_at"`

	Lesson     *Lesson     `gorm:"foreignKey:LessonUid" json:"lesson,omitempty"`
	Enrollment *Enrollment `gorm:"foreignKey:EnrollmentUid" json:"enrollment,omitempty"`
}

func (LessonAttendance) TableName() string {
	return "lesson_attendances"
}
