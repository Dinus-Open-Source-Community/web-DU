package entity

import (
	"encoding/json"
	"time"

	"backend/internal/utils"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

// LessonAssignmentSubmissionAttempt stores one historical answer snapshot per submit/resubmit.
type LessonAssignmentSubmissionAttempt struct {
	Uid                           uuid.UUID       `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"uid"`
	LessonAssignmentSubmissionUid uuid.UUID       `gorm:"type:uuid;not null;uniqueIndex:uq_lesson_assignment_submission_attempt,priority:1;index" json:"lesson_assignment_submission_uid"`
	AttemptNumber                 int             `gorm:"not null;uniqueIndex:uq_lesson_assignment_submission_attempt,priority:2" json:"attempt_number"`
	PlainText                     string          `gorm:"type:text" json:"plain_text,omitempty"`
	RichText                      json.RawMessage `gorm:"type:jsonb" json:"rich_text,omitempty"`
	FileURL                       string          `gorm:"type:varchar(1024)" json:"file_url,omitempty"`
	FileOriginalFilename          string          `gorm:"type:varchar(512)" json:"file_original_filename,omitempty"`
	FileDescription               string          `gorm:"type:text" json:"file_description,omitempty"`
	QuizAnswers                   json.RawMessage `gorm:"type:jsonb" json:"quiz_answers,omitempty"`
	ScorePercent                  *float64        `gorm:"type:decimal(6,3)" json:"score_percent,omitempty"`
	Passed                        *bool           `json:"passed,omitempty"`
	QuizCorrectCount              *int            `json:"quiz_correct_count,omitempty"`
	QuizQuestionCount             *int            `json:"quiz_question_count,omitempty"`
	Feedback                      string          `gorm:"type:text" json:"feedback,omitempty"`
	GradedAt                      *time.Time      `json:"graded_at,omitempty"`
	IsAutoGraded                  bool            `gorm:"default:false" json:"is_auto_graded"`
	CreatedAt                     time.Time       `gorm:"autoCreateTime" json:"created_at"`

	Submission *LessonAssignmentSubmission `gorm:"foreignKey:LessonAssignmentSubmissionUid" json:"submission,omitempty"`
}

func (LessonAssignmentSubmissionAttempt) TableName() string {
	return "lesson_assignment_submission_attempts"
}

func (a *LessonAssignmentSubmissionAttempt) AfterFind(_ *gorm.DB) error {
	utils.DecryptFields(
		&a.PlainText,
		&a.FileOriginalFilename,
		&a.FileDescription,
		&a.Feedback,
	)
	return nil
}

func (a *LessonAssignmentSubmissionAttempt) BeforeSave(_ *gorm.DB) error {
	return utils.EncryptFieldsIfNeeded(
		&a.PlainText,
		&a.FileOriginalFilename,
		&a.FileDescription,
		&a.Feedback,
	)
}

func (a *LessonAssignmentSubmissionAttempt) AfterSave(_ *gorm.DB) error {
	utils.DecryptFields(
		&a.PlainText,
		&a.FileOriginalFilename,
		&a.FileDescription,
		&a.Feedback,
	)
	return nil
}
