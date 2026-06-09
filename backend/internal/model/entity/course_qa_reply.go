package entity

import (
	"time"

	"backend/internal/utils"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type CourseQaReply struct {
	Uid       uuid.UUID `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"uid"`
	ThreadUid uuid.UUID `gorm:"type:uuid;not null;index" json:"thread_uid"`
	AuthorUid uuid.UUID `gorm:"type:uuid;not null;index" json:"author_uid"`
	Body      string    `gorm:"type:text;not null" json:"body"`
	CreatedAt time.Time `gorm:"autoCreateTime" json:"created_at"`

	Thread *CourseQaThread `gorm:"foreignKey:ThreadUid" json:"thread,omitempty"`
	Author *User           `gorm:"foreignKey:AuthorUid" json:"author,omitempty"`
}

func (CourseQaReply) TableName() string {
	return "course_qa_replies"
}

func (r *CourseQaReply) AfterFind(_ *gorm.DB) error {
	utils.DecryptFields(&r.Body)
	return nil
}

func (r *CourseQaReply) BeforeSave(_ *gorm.DB) error {
	return utils.EncryptFieldsIfNeeded(&r.Body)
}

func (r *CourseQaReply) AfterSave(_ *gorm.DB) error {
	utils.DecryptFields(&r.Body)
	return nil
}
