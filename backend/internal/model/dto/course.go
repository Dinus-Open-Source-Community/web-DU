package dto

type AdminCourseRequest struct {
	Title        string `form:"title" binding:"required" example:"Introduction to Go"`
	Slug         string `form:"slug" binding:"required" example:"introduction-to-go"`
	Description  string `form:"description" binding:"required" example:"A comprehensive course on Go programming language."`
	ThumbnailUrl string `form:"thumbnail_url" binding:"required" example:"https://thumbnail.jpg"`
	Price        uint   `form:"price" binding:"required" example:"100"`
	IsPremium    bool   `form:"is_premium" binding:"required" example:"true"`
	IsPublished  bool   `form:"is_published" binding:"required" example:"false"`
	MentorID     uint   `form:"mentor_id" binding:"required" example:"1"`
	EventID      uint   `form:"event_id" binding:"required" example:"1"`
}
