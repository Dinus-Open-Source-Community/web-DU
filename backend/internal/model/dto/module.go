package dto

type CreateModuleRequest struct {
	CourseID   uint   `json:"course_id" binding:"required" example:"1"`
	Title      string `json:"title" binding:"required" example:"Module 1"`
	OrderIndex int    `json:"order_index" binding:"required" example:"1"`
}

type UpdateModuleRequest struct {
	Title      string `json:"title" example:"Updated Module 1"`
	OrderIndex int    `json:"order_index" example:"2"`
}
