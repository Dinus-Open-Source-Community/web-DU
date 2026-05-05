package entity

import (
	"time"

	"backend/internal/utils"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

// Model CourseReview Migrations
type CourseReview struct {
	Uid       uuid.UUID `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"uid"`
	UserUid   uuid.UUID `gorm:"type:uuid;not null;index" json:"user_uid"`
	CourseUid uuid.UUID `gorm:"type:uuid;not null;index" json:"course_uid"`
	Rating    int       `gorm:"check:rating >= 1 AND rating <= 5" json:"rating"`
	Comment   string    `gorm:"type:text" json:"comment"`
	CreatedAt time.Time `gorm:"autoCreateTime" json:"created_at"`

	User    *User               `gorm:"foreignKey:UserUid" json:"user"`
	Course  *Course             `gorm:"foreignKey:CourseUid" json:"course"`
	Replies []CourseReviewReply `gorm:"foreignKey:CourseReviewUid" json:"replies,omitempty"`
}

// AfterFind otomatis mendekripsi komentar review. Rating, uid, foreign keys,
// dan timestamps tidak dienkripsi karena numerik atau identifier.
func (r *CourseReview) AfterFind(_ *gorm.DB) error {
	utils.DecryptFields(&r.Comment)
	return nil
}

// BeforeSave otomatis mengenkripsi komentar review (idempotent).
func (r *CourseReview) BeforeSave(_ *gorm.DB) error {
	return utils.EncryptFieldsIfNeeded(&r.Comment)
}

// AfterSave mengembalikan field model ke plaintext setelah simpan.
func (r *CourseReview) AfterSave(_ *gorm.DB) error {
	utils.DecryptFields(&r.Comment)
	return nil
}
