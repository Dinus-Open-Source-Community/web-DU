package entity

import (
	"time"

	"backend/internal/utils"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

// Model CourseAnnouncement Migrations
type CourseAnnouncement struct {
	Uid       uuid.UUID `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"uid"`
	CourseUid uuid.UUID `gorm:"type:uuid;not null;index" json:"course_uid"`
	Title     string    `gorm:"type:varchar(150)" json:"title"`
	Message   string    `gorm:"type:text" json:"message"`
	CreatedAt time.Time `gorm:"autoCreateTime" json:"created_at"`

	Course *Course `gorm:"foreignKey:CourseUid" json:"course"`
}

// AfterFind otomatis mendekripsi judul dan pesan pengumuman.
func (a *CourseAnnouncement) AfterFind(_ *gorm.DB) error {
	utils.DecryptFields(&a.Title, &a.Message)
	return nil
}

// BeforeSave otomatis mengenkripsi judul dan pesan pengumuman (idempotent).
func (a *CourseAnnouncement) BeforeSave(_ *gorm.DB) error {
	return utils.EncryptFieldsIfNeeded(&a.Title, &a.Message)
}

// AfterSave mengembalikan field model ke plaintext setelah simpan.
func (a *CourseAnnouncement) AfterSave(_ *gorm.DB) error {
	utils.DecryptFields(&a.Title, &a.Message)
	return nil
}
