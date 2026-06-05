package dto

import (
	"backend/internal/model/entity"
	"encoding/json"
	"time"

	"github.com/google/uuid"
)

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

// LessonResponse wraps a Lesson entity and appends the per-user reading flag.
// IsReading is true when the authenticated user (via their enrollment) has
// already opened/read the lesson; false otherwise (or for admin/mentor roles
// who have no enrollment record).
//
// All existing Lesson fields are preserved so the JSON shape is backward-
// compatible — only `is_reading` is added on top.
type LessonResponse struct {
	Uid         uuid.UUID               `json:"uid"`
	ModuleUid   uuid.UUID               `json:"module_uid"`
	Title       string                  `json:"title"`
	ContentType entity.LessonContentType `json:"content_type"`
	Content     json.RawMessage         `json:"content"`
	VideoURL    string                  `json:"video_url"`
	StartTime   time.Time               `json:"start_time"`
	EndTime     time.Time               `json:"end_time"`
	OrderIndex  int                     `json:"order_index"`
	CreatedAt   time.Time               `json:"created_at"`
	UpdatedAt   time.Time               `json:"updated_at"`
	Assignment  *entity.LessonAssignment `json:"assignment,omitempty"`

	// Reading status — injected at query time, never stored on the entity.
	IsReading bool `json:"is_reading"`
}

// NewLessonResponse converts an entity.Lesson into a LessonResponse with the
// provided reading status.
func NewLessonResponse(l entity.Lesson, isReading bool) LessonResponse {
	return LessonResponse{
		Uid:         l.Uid,
		ModuleUid:   l.ModuleUid,
		Title:       l.Title,
		ContentType: l.ContentType,
		Content:     l.Content,
		VideoURL:    l.VideoURL,
		StartTime:   l.StartTime,
		EndTime:     l.EndTime,
		OrderIndex:  l.OrderIndex,
		CreatedAt:   l.CreatedAt,
		UpdatedAt:   l.UpdatedAt,
		Assignment:  l.Assignment,
		IsReading:   isReading,
	}
}
