package entity

import (
	"time"

	"github.com/google/uuid"
)

type CourseReviewReply struct {
	Uid          uuid.UUID `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"uid"`
	CourseReviewUid uuid.UUID `gorm:"type:uuid;not null;index" json:"course_review_uid"`
	ReplierUid   uuid.UUID `gorm:"type:uuid;not null;index" json:"replier_uid"`
	Comment      string    `gorm:"type:text;not null" json:"comment"`
	CreatedAt    time.Time `gorm:"autoCreateTime" json:"created_at"`

	CourseReview *CourseReview `gorm:"foreignKey:CourseReviewUid" json:"course_review,omitempty"`
	Replier      *User         `gorm:"foreignKey:ReplierUid" json:"replier,omitempty"`
}
