package dto

// UpdateUserRoleRequest merepresentasikan request untuk update role user
type UpdateUserRoleRequest struct {
	Role string `json:"role" binding:"required" example:"admin"`
}

// UpdateUserProfileRequest represents profile update payload
type UpdateUserProfileRequest struct {
	Name        *string `json:"name"`
	Email       *string `json:"email"`
	Description *string `json:"description"`
}

// ChangePasswordRequest represents change password payload
type ChangePasswordRequest struct {
	OldPassword string `json:"old_password" binding:"required"`
	NewPassword string `json:"new_password" binding:"required"`
}
