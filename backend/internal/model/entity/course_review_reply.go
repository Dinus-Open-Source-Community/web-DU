package entity

import (
	"time"

	"backend/internal/utils"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type CourseReviewReply struct {
	Uid             uuid.UUID `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"uid"`
	CourseReviewUid uuid.UUID `gorm:"type:uuid;not null;index" json:"course_review_uid"`
	ReplierUid      uuid.UUID `gorm:"type:uuid;not null;index" json:"replier_uid"`
	Comment         string    `gorm:"type:text;not null" json:"comment"`
	CreatedAt       time.Time `gorm:"autoCreateTime" json:"created_at"`

	CourseReview *CourseReview `gorm:"foreignKey:CourseReviewUid" json:"course_review,omitempty"`
	Replier      *User         `gorm:"foreignKey:ReplierUid" json:"replier,omitempty"`
}

// AfterFind otomatis mendekripsi komentar balasan review.
func (r *CourseReviewReply) AfterFind(_ *gorm.DB) error {
	utils.DecryptFields(&r.Comment)
	return nil
}

// BeforeSave otomatis mengenkripsi komentar balasan review (idempotent).
func (r *CourseReviewReply) BeforeSave(_ *gorm.DB) error {
	return utils.EncryptFieldsIfNeeded(&r.Comment)
}

// AfterSave mengembalikan field model ke plaintext setelah simpan.
func (r *CourseReviewReply) AfterSave(_ *gorm.DB) error {
	utils.DecryptFields(&r.Comment)
	return nil
}
