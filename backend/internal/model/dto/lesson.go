package dto

// LessonCreateRequest represents payload for creating a lesson.
//
// ModuleUid menerima full UUID maupun 8-char prefix; service akan menyelesaikan
// nilai tersebut ke full uuid via database.ResolveUID.
type LessonCreateRequest struct {
	ModuleUid   string      `json:"module_uid" binding:"required"`
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
	ModuleUid   string      `json:"module_uid"`
	Title       string      `json:"title"`
	ContentType string      `json:"content_type"`
	Content     interface{} `json:"content"` // accepts any JSON value
	VideoURL    string      `json:"video_url"`
	StartTime   string      `json:"start_time"` // RFC3339 format
	EndTime     string      `json:"end_time"`   // RFC3339 format
	OrderIndex  int         `json:"order_index"`
}
