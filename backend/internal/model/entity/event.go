package entity

import (
	"time"

	"backend/internal/utils"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

// Model Event Migrations
type Event struct {
	Uid              uuid.UUID  `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"uid"`
	Name             string     `gorm:"type:varchar(150);not null" json:"name"`
	Description      string     `gorm:"type:text" json:"description"`
	StartDate        *time.Time `json:"start_date"`
	EndDate          *time.Time `json:"end_date"`
	Location         string     `gorm:"type:varchar(150)" json:"location"`
	IsActive         bool       `gorm:"default:false" json:"is_active"`
	RegistrationOpen bool       `gorm:"default:false" json:"registration_open"`
	CreatedAt        time.Time  `gorm:"autoCreateTime" json:"created_at"`
	UpdatedAt        time.Time  `gorm:"autoUpdateTime" json:"updated_at"`

	// Relations
	Courses []Course `gorm:"foreignKey:EventUid" json:"courses"`
}

// AfterFind otomatis mendekripsi nama, deskripsi, dan lokasi event. Tanggal,
// boolean, uid, dan timestamps tidak dienkripsi.
func (e *Event) AfterFind(_ *gorm.DB) error {
	utils.DecryptFields(&e.Name, &e.Description, &e.Location)
	return nil
}

// BeforeSave otomatis mengenkripsi nama, deskripsi, dan lokasi event (idempotent).
func (e *Event) BeforeSave(_ *gorm.DB) error {
	return utils.EncryptFieldsIfNeeded(&e.Name, &e.Description, &e.Location)
}

// AfterSave mengembalikan field model ke plaintext setelah simpan.
func (e *Event) AfterSave(_ *gorm.DB) error {
	utils.DecryptFields(&e.Name, &e.Description, &e.Location)
	return nil
}
