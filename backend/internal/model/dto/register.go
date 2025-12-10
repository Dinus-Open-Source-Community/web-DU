package dto

// RegisterRequest merepresentasikan struktur FORM untuk permintaan registrasi user
type RegisterRequest struct {
	Name     string `json:"name" binding:"required" example:"User DU"`
	Email    string `json:"email" binding:"required,email" example:"user@example.com"`
	Password string `json:"password" binding:"required" example:"StrongPassword123"`
	// AvatarURL dihapus karena kita akan menangani file "avatar" secara terpisah
}
