package entity

import (
	"encoding/json"
	"time"

	"github.com/google/uuid"
)

type CourseLevel string
type CourseStatus string

const (
	CourseLevelPemula   CourseLevel = "PEMULA"
	CourseLevelMenengah CourseLevel = "MENENGAH"
	CourseLevelLanjutan CourseLevel = "LANJUTAN"
)

const (
	CourseStatusDraft       CourseStatus = "DRAFT"
	CourseStatusActive      CourseStatus = "ACTIVE"
	CourseStatusTidakActive CourseStatus = "TIDAK ACTIVE"
)

// Model Course Migrations
type Course struct {
	Uid          uuid.UUID  `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"uid"`
	EventUid     *uuid.UUID `gorm:"type:uuid;index" json:"event_uid,omitempty"`
	MentorUid    *uuid.UUID `gorm:"type:uuid;index" json:"mentor_uid,omitempty"`
	CategoryUid  *uuid.UUID `gorm:"type:uuid;index" json:"category_uid,omitempty"`
	ClassTypeUid *uuid.UUID `gorm:"type:uuid;index" json:"course_type_uid,omitempty"`
	Title        string     `gorm:"type:varchar(200);not null" json:"title"`
	Subtitle     string     `gorm:"type:varchar(255)" json:"subtitle"`

	Slot int `gorm:"default:0" json:"slot"`

	Slug         string          `gorm:"type:varchar(255);unique;not null" json:"slug"`
	Description  string          `gorm:"type:text" json:"description"`
	CoverURL     string          `gorm:"type:varchar(255)" json:"cover_url"`
	ThumbnailURL string          `gorm:"type:varchar(255)" json:"thumbnail_url"`
	Level        CourseLevel     `gorm:"type:course_level;default:'PEMULA';not null" json:"level"`
	Status       CourseStatus    `gorm:"type:course_status;default:'DRAFT';not null" json:"status"`
	Price        float64         `gorm:"type:decimal(10,2)" json:"price"`
	PriceStrike  float64         `gorm:"type:decimal(10,2);default:0" json:"price_strike"`
	WhatYouLearn json.RawMessage `gorm:"type:jsonb" json:"what_you_learn"`
	IsPremium    bool            `gorm:"default:false" json:"is_premium"`
	IsPublished  bool            `gorm:"default:false" json:"is_published"`
	CreatedAt    time.Time       `gorm:"autoCreateTime" json:"created_at"`
	UpdatedAt    time.Time       `gorm:"autoUpdateTime" json:"updated_at"`

	// Relations
	Event         *Event               `gorm:"foreignKey:EventUid" json:"event,omitempty"`
	Mentor        *User                `gorm:"foreignKey:MentorUid" json:"mentor,omitempty"`
	Mentors       []User               `gorm:"many2many:course_mentors;joinForeignKey:CourseUid;joinReferences:MentorUid" json:"mentors,omitempty"`
	CourseMentors []CourseMentor       `gorm:"foreignKey:CourseUid" json:"course_mentors,omitempty"`
	Category      *CourseCategory      `gorm:"foreignKey:CategoryUid" json:"category,omitempty"`
	ClassType     *ClassType           `gorm:"foreignKey:ClassTypeUid" json:"course_type,omitempty"`
	Modules       []Module             `gorm:"foreignKey:CourseUid" json:"modules,omitempty"`
	Enrollments   []Enrollment         `gorm:"foreignKey:CourseUid" json:"enrollments,omitempty"`
	Reviews       []CourseReview       `gorm:"foreignKey:CourseUid" json:"course_reviews,omitempty"`
	Announcements []CourseAnnouncement `gorm:"foreignKey:CourseUid" json:"course_announcements,omitempty"`
}
