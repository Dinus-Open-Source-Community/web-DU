package model

// RegisterRequest merepresentasikan struktur JSON untuk permintaan registrasi user
type RegisterRequest struct {
	Name     string `json:"name" binding:"required" example:"User DU"`
	Email    string `json:"email" binding:"required,email" example:"user@example.com"`
	Password string `json:"password" binding:"required" example:"StrongPassword123"`
}