package entity

import "time"

// Model Event Migrations
type Event struct {
	ID               uint      `gorm:"primaryKey" json:"id"`
	Name             string    `gorm:"type:varchar(150);not null" json:"name"`
	Description      string    `gorm:"type:text" json:"description"`
	StartDate        *time.Time `json:"start_date"`
	EndDate          *time.Time `json:"end_date"`
	Location         string    `gorm:"type:varchar(150)" json:"location"`
	IsActive         bool      `gorm:"default:false" json:"is_active"`
	RegistrationOpen bool      `gorm:"default:false" json:"registration_open"`
	CreatedAt        time.Time `gorm:"autoCreateTime" json:"created_at"`
	UpdatedAt        time.Time `gorm:"autoUpdateTime" json:"updated_at"`

	// Relations
	Courses []Course `gorm:"foreignKey:EventID" json:"courses"`
}