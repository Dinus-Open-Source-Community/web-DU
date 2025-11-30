package model

type AdminCourseRequest struct {
	Title        string `json:"title" binding:"required" example:"Introduction to Go"`
	Slug         string `json:"slug" binding:"required" example:"introduction-to-go"`
	Description  string `json:"description" binding:"required" example:"A comprehensive course on Go programming language."`
	ThumbnailUrl string `json:"thumbnail_url" binding:"required" example:"https://thumbnail.jpg"`
	Price        uint   `json:"price" binding:"required" example:"100"`
	IsPremium    bool   `json:"is_premium" binding:"required" example:"true"`
	IsPublished  bool   `json:"is_published" binding:"required" example:"false"`
	MentorID     uint   `json:"mentor_id" binding:"required" example:"1"`
	EventID      uint   `json:"event_id" binding:"required" example:"1"`
}
