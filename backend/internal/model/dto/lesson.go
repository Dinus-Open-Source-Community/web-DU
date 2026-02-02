package dto

// LessonCreateRequest represents payload for creating a lesson.
type LessonCreateRequest struct {
	ModuleID   uint        `json:"module_id" binding:"required"`
	Title      string      `json:"title" binding:"required"`
	Content    interface{} `json:"content"` // accepts any JSON value
	VideoURL   string      `json:"video_url"`
	StartTime  string      `json:"start_time"` // RFC3339 format
	EndTime    string      `json:"end_time"`   // RFC3339 format
	OrderIndex int         `json:"order_index"`
}

// LessonUpdateRequest represents payload for updating a lesson.
type LessonUpdateRequest struct {
	ModuleID   uint        `json:"module_id"`
	Title      string      `json:"title"`
	Content    interface{} `json:"content"` // accepts any JSON value
	VideoURL   string      `json:"video_url"`
	StartTime  string      `json:"start_time"` // RFC3339 format
	EndTime    string      `json:"end_time"`   // RFC3339 format
	OrderIndex int         `json:"order_index"`
}
