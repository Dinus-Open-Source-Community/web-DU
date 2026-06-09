package entity

import (
	"time"

	"backend/internal/utils"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type CourseQaThread struct {
	Uid       uuid.UUID `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"uid"`
	CourseUid uuid.UUID `gorm:"type:uuid;not null;index" json:"course_uid"`
	AuthorUid uuid.UUID `gorm:"type:uuid;not null;index" json:"author_uid"`
	Title     string    `gorm:"type:varchar(255);not null" json:"title"`
	Body      string    `gorm:"type:text;not null" json:"body"`
	CreatedAt time.Time `gorm:"autoCreateTime" json:"created_at"`
	UpdatedAt time.Time `gorm:"autoUpdateTime" json:"updated_at"`

	Course  *Course         `gorm:"foreignKey:CourseUid" json:"course,omitempty"`
	Author  *User           `gorm:"foreignKey:AuthorUid" json:"author,omitempty"`
	Replies []CourseQaReply `gorm:"foreignKey:ThreadUid" json:"replies,omitempty"`
}

func (CourseQaThread) TableName() string {
	return "course_qa_threads"
}

func (t *CourseQaThread) AfterFind(_ *gorm.DB) error {
	utils.DecryptFields(&t.Title, &t.Body)
	return nil
}

func (t *CourseQaThread) BeforeSave(_ *gorm.DB) error {
	return utils.EncryptFieldsIfNeeded(&t.Title, &t.Body)
}

func (t *CourseQaThread) AfterSave(_ *gorm.DB) error {
	utils.DecryptFields(&t.Title, &t.Body)
	return nil
}
