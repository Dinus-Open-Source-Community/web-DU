package dto

import "time"

// LessonAttendanceCreateRequest represents payload for creating lesson attendance
type LessonAttendanceCreateRequest struct {
	LessonID     uint   `json:"lesson_id" binding:"required"`
	EnrollmentID uint   `json:"enrollment_id" binding:"required"`
	Status       string `json:"status" binding:"oneof=present late absent excused"`
	Note         string `json:"note"`
}

// LessonAttendanceUpdateRequest represents payload for updating lesson attendance
type LessonAttendanceUpdateRequest struct {
	Status string `json:"status" binding:"oneof=present late absent excused"`
	Note   string `json:"note"`
}

// LessonAttendanceResponse represents the response payload for lesson attendance
type LessonAttendanceResponse struct {
	ID           uint      `json:"id"`
	LessonID     uint      `json:"lesson_id"`
	EnrollmentID uint      `json:"enrollment_id"`
	CheckedInAt  time.Time `json:"checked_in_at"`
	Status       string    `json:"status"`
	Note         string    `json:"note"`
	CreatedAt    time.Time `json:"created_at"`
	UpdatedAt    time.Time `json:"updated_at"`
}
