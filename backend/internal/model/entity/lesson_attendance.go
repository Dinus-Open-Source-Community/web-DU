package entity

import "time"

type AttendanceStatus string

const (
	AttendancePresent AttendanceStatus = "present"
	AttendanceLate    AttendanceStatus = "late"
	AttendanceAbsent  AttendanceStatus = "absent"
	AttendanceExcused AttendanceStatus = "excused"
)

type LessonAttendance struct {
	ID           uint             `gorm:"primaryKey" json:"id"`
	LessonID     uint             `gorm:"not null;index" json:"lesson_id"`
	EnrollmentID uint             `gorm:"not null;index" json:"enrollment_id"`
	CheckedInAt  time.Time        `gorm:"autoCreateTime" json:"checked_in_at"`
	Status       AttendanceStatus `gorm:"type:attendance_status;default:'present'" json:"status"`
	Note         string           `gorm:"type:text" json:"note"`
	CreatedAt    time.Time        `gorm:"autoCreateTime" json:"created_at"`
	UpdatedAt    time.Time        `gorm:"autoUpdateTime" json:"updated_at"`

	Lesson     *Lesson     `gorm:"foreignKey:LessonID" json:"lesson,omitempty"`
	Enrollment *Enrollment `gorm:"foreignKey:EnrollmentID" json:"enrollment,omitempty"`
}

func (LessonAttendance) TableName() string {
	return "lesson_attendances"
}
