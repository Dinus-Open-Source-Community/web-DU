package dto

import "encoding/json"

// UpdateUserRoleRequest is the body for PATCH /user/role/{id}. Allowed JSON role values: admin (callers must be super_admin), mentor, student. super_admin cannot be assigned via this route.
type UpdateUserRoleRequest struct {
	Role string `json:"role" binding:"required" example:"mentor"`
}

// BatchUpdateUserRoleRequest is the body for PATCH /user/role/batch.
type BatchUpdateUserRoleRequest struct {
	UserUids []string `json:"user_uids" binding:"required,min=1"`
	Role     string   `json:"role" binding:"required" example:"mentor"`
}

// UpdateUserProfileRequest represents profile update payload
type UpdateUserProfileRequest struct {
	Name        *string         `json:"name"`
	Email       *string         `json:"email"`
	SocialLinks json.RawMessage `json:"social_links"`
}

// ChangePasswordRequest represents change password payload
type ChangePasswordRequest struct {
	OldPassword string `json:"old_password" binding:"required"`
	NewPassword string `json:"new_password" binding:"required"`
}

// RequestEmailChangeRequest represents payload to request an email change confirmation link sent to the old email
type RequestEmailChangeRequest struct {
	NewEmail string `json:"new_email"`
	Email    string `json:"email"`
	Password string `json:"password" binding:"required"`
}

// ConfirmEmailChangeRequest represents payload to confirm an email change via token
type ConfirmEmailChangeRequest struct {
	Token string `json:"token" binding:"required"`
}
