package entity

import (
	"time"

	"backend/internal/utils"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

// Model Module Migrations
type Module struct {
	Uid        uuid.UUID `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"uid"`
	CourseUid  uuid.UUID `gorm:"type:uuid;not null;index" json:"course_uid"`
	Title      string    `gorm:"type:varchar(200);not null" json:"title"`
	OrderIndex int       `json:"order_index"`
	CreatedAt  time.Time `gorm:"autoCreateTime" json:"created_at"`

	// Relations
	Course  *Course  `gorm:"foreignKey:CourseUid" json:"-"`
	Lessons []Lesson `gorm:"foreignKey:ModuleUid" json:"lessons"`
}

// AfterFind otomatis mendekripsi judul modul. Field uid, course_uid, order_index,
// dan timestamps tidak dienkripsi.
func (m *Module) AfterFind(_ *gorm.DB) error {
	utils.DecryptFields(&m.Title)
	return nil
}

// BeforeSave otomatis mengenkripsi judul modul (idempotent).
func (m *Module) BeforeSave(_ *gorm.DB) error {
	return utils.EncryptFieldsIfNeeded(&m.Title)
}

// AfterSave mengembalikan field model ke plaintext setelah simpan.
func (m *Module) AfterSave(_ *gorm.DB) error {
	utils.DecryptFields(&m.Title)
	return nil
}
