package dto

type AvatarRequest struct {
	Avatar string `form:"avatar" binding:"required" example:"file.jpg"`
}
