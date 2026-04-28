package dto

import "github.com/google/uuid"

// LessonCreateRequest represents payload for creating a lesson.
type LessonCreateRequest struct {
	ModuleUid   uuid.UUID   `json:"module_uid" binding:"required" swaggertype:"string" format:"uuid"`
	Title       string      `json:"title" binding:"required"`
	ContentType string      `json:"content_type"`
	Content     interface{} `json:"content"` // accepts any JSON value
	VideoURL    string      `json:"video_url"`
	StartTime   string      `json:"start_time"` // RFC3339 format
	EndTime     string      `json:"end_time"`   // RFC3339 format
	OrderIndex  int         `json:"order_index"`
}

// LessonUpdateRequest represents payload for updating a lesson.
type LessonUpdateRequest struct {
	ModuleUid   uuid.UUID   `json:"module_uid" swaggertype:"string" format:"uuid"`
	Title       string      `json:"title"`
	ContentType string      `json:"content_type"`
	Content     interface{} `json:"content"` // accepts any JSON value
	VideoURL    string      `json:"video_url"`
	StartTime   string      `json:"start_time"` // RFC3339 format
	EndTime     string      `json:"end_time"`   // RFC3339 format
	OrderIndex  int         `json:"order_index"`
}
