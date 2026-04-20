package dto

import "github.com/google/uuid"

type CreateModuleRequest struct {
	CourseUid  uuid.UUID `json:"course_uid" binding:"required" example:"550e8400-e29b-41d4-a716-446655440000"`
	Title      string    `json:"title" binding:"required" example:"Module 1"`
	OrderIndex int       `json:"order_index" binding:"required" example:"1"`
}

type UpdateModuleRequest struct {
	Title      string `json:"title" example:"Updated Module 1"`
	OrderIndex int    `json:"order_index" example:"2"`
}
