package model

// RegisterRequest merepresentasikan struktur FORM untuk permintaan registrasi user
type RegisterRequest struct {
	Name     string `form:"name" binding:"required" example:"User DU"`
	Email    string `form:"email" binding:"required,email" example:"user@example.com"`
	Password string `form:"password" binding:"required" example:"StrongPassword123"`
	// AvatarURL dihapus karena kita akan menangani file "avatar" secara terpisah
}
