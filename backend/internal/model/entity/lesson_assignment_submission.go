package entity

import (
	"encoding/json"
	"time"

	"backend/internal/utils"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

// LessonAssignmentSubmission stores one student's submission per lesson assignment (unique pair assignment + user).
type LessonAssignmentSubmission struct {
	Uid                    uuid.UUID       `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"uid"`
	LessonAssignmentUid    uuid.UUID       `gorm:"type:uuid;not null;uniqueIndex:uq_lesson_assignment_submission_user,priority:1;index" json:"lesson_assignment_uid"`
	UserUid                uuid.UUID       `gorm:"type:uuid;not null;uniqueIndex:uq_lesson_assignment_submission_user,priority:2;index" json:"user_uid"`
	PlainText              string          `gorm:"type:text" json:"plain_text,omitempty"`
	RichText               json.RawMessage `gorm:"type:jsonb" json:"rich_text,omitempty"`
	FileURL                string          `gorm:"type:varchar(1024)" json:"file_url,omitempty"`
	FileOriginalFilename   string          `gorm:"type:varchar(512)" json:"file_original_filename,omitempty"`
	FileDescription        string          `gorm:"type:text" json:"file_description,omitempty"`
	QuizAnswers            json.RawMessage `gorm:"type:jsonb" json:"quiz_answers,omitempty"`
	ScorePercent           *float64        `gorm:"type:decimal(6,3)" json:"score_percent,omitempty"`
	Passed                 *bool           `json:"passed,omitempty"`
	QuizCorrectCount       *int            `json:"quiz_correct_count,omitempty"`
	QuizQuestionCount      *int            `json:"quiz_question_count,omitempty"`
	Feedback               string          `gorm:"type:text" json:"feedback,omitempty"`
	GradedAt               *time.Time      `json:"graded_at,omitempty"`
	GradedByUid            *uuid.UUID      `gorm:"type:uuid" json:"graded_by_uid,omitempty"`
	IsAutoGraded           bool            `gorm:"default:false" json:"is_auto_graded"`
	AttemptCount           int             `gorm:"not null;default:1" json:"attempt_count"`
	CreatedAt              time.Time       `gorm:"autoCreateTime" json:"created_at"`
	UpdatedAt              time.Time       `gorm:"autoUpdateTime" json:"updated_at"`

	LessonAssignment *LessonAssignment `gorm:"foreignKey:LessonAssignmentUid" json:"lesson_assignment,omitempty"`
	User             *User             `gorm:"foreignKey:UserUid" json:"user,omitempty"`
	GradedBy         *User             `gorm:"foreignKey:GradedByUid" json:"graded_by,omitempty"`
}

func (LessonAssignmentSubmission) TableName() string {
	return "lesson_assignment_submissions"
}

// AfterFind otomatis mendekripsi konten submission yang sensitif. Field jsonb
// (rich_text, quiz_answers), file_url, score, uid, dan timestamps tidak
// dienkripsi karena bukan teks sensitif atau dibutuhkan apa adanya untuk
// download/scoring.
func (s *LessonAssignmentSubmission) AfterFind(_ *gorm.DB) error {
	utils.DecryptFields(
		&s.PlainText,
		&s.FileOriginalFilename,
		&s.FileDescription,
		&s.Feedback,
	)
	return nil
}

// BeforeSave otomatis mengenkripsi konten submission yang sensitif (idempotent).
func (s *LessonAssignmentSubmission) BeforeSave(_ *gorm.DB) error {
	return utils.EncryptFieldsIfNeeded(
		&s.PlainText,
		&s.FileOriginalFilename,
		&s.FileDescription,
		&s.Feedback,
	)
}

// AfterSave mengembalikan field model ke plaintext setelah simpan.
func (s *LessonAssignmentSubmission) AfterSave(_ *gorm.DB) error {
	utils.DecryptFields(
		&s.PlainText,
		&s.FileOriginalFilename,
		&s.FileDescription,
		&s.Feedback,
	)
	return nil
}
