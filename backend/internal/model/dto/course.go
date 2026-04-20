package dto

import "github.com/google/uuid"

type AdminCourseRequest struct {
	Title        string    `form:"title" binding:"required" example:"Introduction to Go"`
	Subtitle     string    `form:"subtitle" example:"Belajar dari dasar hingga implementasi"`
	Slug         string    `form:"slug" example:"introduction-to-go"`
	CategoryUid  uuid.UUID `form:"category_uid" binding:"required"`
	ClassTypeUid uuid.UUID `form:"class_type_uid" binding:"required"`
	Level        string    `form:"level" binding:"required" example:"PEMULA"`
	Description  string    `form:"description" binding:"required" example:"A comprehensive course on Go programming language."`
	Price        float64   `form:"price" binding:"required" example:"100000"`
	PriceStrike  float64   `form:"price_strike" example:"150000"`
	WhatYouLearn []string  `form:"what_you_learn" binding:"required" swaggertype:"array,string" example:"Dasar Go,Pointer,Concurrency"`
	Slot         int       `form:"slot" example:"30"`
	IsPremium    bool      `form:"is_premium" example:"true"`
	IsPublished  bool      `form:"is_published" example:"false"`
	MentorUid    uuid.UUID `form:"mentor_uid"`
	EventUid     uuid.UUID `form:"event_uid"`
}
