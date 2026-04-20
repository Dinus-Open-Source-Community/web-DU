package entity

import (
	"encoding/json"
	"time"

	"github.com/google/uuid"
)

type LessonAssignmentTaskType string

type LessonAssignmentStatus string

const (
	LessonAssignmentTaskTypeText LessonAssignmentTaskType = "text"
	LessonAssignmentTaskTypeQuiz LessonAssignmentTaskType = "quiz"
)

const (
	LessonAssignmentStatusDraft   LessonAssignmentStatus = "DRAFT"
	LessonAssignmentStatusTerbit  LessonAssignmentStatus = "TERBIT"
	LessonAssignmentStatusDitutup LessonAssignmentStatus = "DITUTUP"
)

// LessonAssignment stores assignment configuration for a lesson.
type LessonAssignment struct {
	Uid                      uuid.UUID                `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"uid"`
	LessonUid                uuid.UUID                `gorm:"type:uuid;not null;uniqueIndex" json:"lesson_uid"`
	Title                    string                   `gorm:"type:varchar(200);not null" json:"title"`
	TaskType                 LessonAssignmentTaskType `gorm:"type:varchar(20);default:'text';not null" json:"task_type"`
	TaskDescription          json.RawMessage          `gorm:"type:jsonb" json:"task_description"`
	QuizPayload              json.RawMessage          `gorm:"type:jsonb" json:"quiz_payload"`
	AllowFileSubmission      bool                     `gorm:"default:true" json:"allow_file_submission"`
	AllowPlainTextSubmission bool                     `gorm:"default:false" json:"allow_plain_text_submission"`
	AllowRichTextSubmission  bool                     `gorm:"default:true" json:"allow_rich_text_submission"`
	RequireFileDescription   bool                     `gorm:"default:false" json:"require_file_description"`
	InstructionAttachments   json.RawMessage          `gorm:"type:jsonb" json:"instruction_attachments"`
	DeadlineAt               time.Time                `json:"deadline_at"`
	Status                   LessonAssignmentStatus   `gorm:"type:varchar(20);default:'DRAFT';not null" json:"status"`
	AutoCloseAfterDeadline   bool                     `gorm:"default:true" json:"auto_close_after_deadline"`
	AllowResubmit            bool                     `gorm:"default:false" json:"allow_resubmit"`
	MaxResubmitCount         *int                     `json:"max_resubmit_count"`
	CreatedAt                time.Time                `gorm:"autoCreateTime" json:"created_at"`
	UpdatedAt                time.Time                `gorm:"autoUpdateTime" json:"updated_at"`

	Lesson *Lesson `gorm:"foreignKey:LessonUid" json:"lesson,omitempty"`
}

func (LessonAssignment) TableName() string {
	return "lesson_assignments"
}
