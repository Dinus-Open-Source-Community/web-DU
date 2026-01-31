package dto

// UpdateUserRoleRequest merepresentasikan request untuk update role user
type UpdateUserRoleRequest struct {
	Role string `json:"role" binding:"required" example:"admin"`
}
