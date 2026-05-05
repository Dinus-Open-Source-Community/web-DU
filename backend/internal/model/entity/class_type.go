package entity

import (
	"time"

	"backend/internal/utils"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

// ClassType stores dynamic class type options for courses.
type ClassType struct {
	Uid         uuid.UUID `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"uid"`
	Name        string    `gorm:"type:varchar(120);unique;not null" json:"name"`
	Description string    `gorm:"type:text" json:"description"`
	IsActive    bool      `gorm:"default:true" json:"is_active"`
	CreatedAt   time.Time `gorm:"autoCreateTime" json:"created_at"`
	UpdatedAt   time.Time `gorm:"autoUpdateTime" json:"updated_at"`

	// Relations
	Courses []Course `gorm:"foreignKey:ClassTypeUid" json:"-"`
}

// AfterFind otomatis mendekripsi description. Field name tidak dienkripsi karena
// memiliki UNIQUE constraint dan dipakai sebagai filter LIKE pada listing.
func (c *ClassType) AfterFind(_ *gorm.DB) error {
	utils.DecryptFields(&c.Description)
	return nil
}

// BeforeSave otomatis mengenkripsi description (idempotent). Name dibiarkan
// plaintext karena UNIQUE & searchable.
func (c *ClassType) BeforeSave(_ *gorm.DB) error {
	return utils.EncryptFieldsIfNeeded(&c.Description)
}

// AfterSave mengembalikan field model ke plaintext setelah simpan.
func (c *ClassType) AfterSave(_ *gorm.DB) error {
	utils.DecryptFields(&c.Description)
	return nil
}
