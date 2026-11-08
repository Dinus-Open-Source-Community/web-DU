package dto

// AdminCourseRequest dipakai sebagai dokumentasi swagger untuk endpoint create
// course (multipart/form). Field UID menerima full UUID maupun 8-char prefix.
type AdminCourseRequest struct {
	Title        string   `form:"title" binding:"required" example:"Introduction to Go"`
	Subtitle     string   `form:"subtitle" example:"Belajar dari dasar hingga implementasi"`
	Slug         string   `form:"slug" example:"introduction-to-go"`
	CategoryUid  string   `form:"category_uid" binding:"required"`
	ClassTypeUid string   `form:"class_type_uid" binding:"required"`
	Level        string   `form:"level" binding:"required" example:"PEMULA"`
	Description  string   `form:"description" binding:"required" example:"A comprehensive course on Go programming language."`
	WhatYouLearn []string `form:"what_you_learn" binding:"required" swaggertype:"array,string" example:"Dasar Go,Pointer,Concurrency"`
	Slot         int      `form:"slot" example:"30"`
	IsPublished  bool     `form:"is_published" example:"false"`
	MentorUid    string   `form:"mentor_uid"`
	EventUid     string   `form:"event_uid"`
}

// AddCourseParticipantsRequest menerima daftar UID siswa untuk didaftarkan ke kursus.
// Mendukung student_uids maupun user_uids (menerima full UUID maupun 8-char prefix).
type AddCourseParticipantsRequest struct {
	StudentUids []string `json:"student_uids" example:"[\"f47ac10b\",\"550e8400-e29b-41d4-a716-446655440000\"]"`
	UserUids    []string `json:"user_uids" example:"[\"f47ac10b\"]"`
}

// AddCourseParticipantsResponse adalah response data setelah penambahan peserta ke kursus.
type AddCourseParticipantsResponse struct {
	CourseUid    string   `json:"course_uid" example:"a1b2c3d4"`
	AddedCount   int      `json:"added_count" example:"2"`
	SkippedCount int      `json:"skipped_count" example:"0"`
	AddedUids    []string `json:"added_uids" example:"[\"f47ac10b\",\"550e8400-e29b-41d4-a716-446655440000\"]"`
}

