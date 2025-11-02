package model

// LoginRequest merepresentasikan struktur JSON untuk permintaan login user
type LoginRequest struct {
	Email    string `json:"email" binding:"required,email" example:"user@example.com"`
	Password string `json:"password" binding:"required" example:"StrongPassword123"`
}