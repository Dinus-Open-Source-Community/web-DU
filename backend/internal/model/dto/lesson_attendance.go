package dto

import (
	"time"

	"github.com/google/uuid"
)

// LessonAttendanceCreateRequest represents payload for creating lesson attendance.
// LessonUid & EnrollmentUid menerima full UUID maupun 8-char prefix; service akan
// menyelesaikan nilai tersebut ke full uuid via database.ResolveUID.
type LessonAttendanceCreateRequest struct {
	LessonUid     string `json:"lesson_uid" binding:"required"`
	EnrollmentUid string `json:"enrollment_uid" binding:"required"`
	Status        string `json:"status" binding:"oneof=present late absent excused"`
	Note          string `json:"note"`
}

// LessonAttendanceUpdateRequest represents payload for updating lesson attendance
type LessonAttendanceUpdateRequest struct {
	Status string `json:"status" binding:"oneof=present late absent excused"`
	Note   string `json:"note"`
}

// LessonAttendanceResponse represents the response payload for lesson attendance
type LessonAttendanceResponse struct {
	Uid           uuid.UUID `json:"uid"`
	LessonUid     uuid.UUID `json:"lesson_uid"`
	EnrollmentUid uuid.UUID `json:"enrollment_uid"`
	CheckedInAt   time.Time `json:"checked_in_at"`
	Status        string    `json:"status"`
	Note          string    `json:"note"`
	CreatedAt     time.Time `json:"created_at"`
	UpdatedAt     time.Time `json:"updated_at"`
}
