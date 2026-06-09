package dto

type CreateCourseQaThreadRequest struct {
	Title string `json:"title" binding:"required"`
	Body  string `json:"body" binding:"required"`
}

type CreateCourseQaReplyRequest struct {
	Body string `json:"body" binding:"required"`
}
