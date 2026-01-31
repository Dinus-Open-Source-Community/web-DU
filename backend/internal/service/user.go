package service

import (
	"fmt"
	"net/http"
	"sort"
	"strconv"
	"strings"

	"backend/internal/database"
	"backend/internal/handler/middleware"
	"backend/internal/model/dto"
	"backend/internal/model/entity"
	"backend/internal/utils"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

// @Summary      Get authenticated user profile
// @Description  Retrieve current authenticated user's complete profile including personal data and enrolled courses
// @Tags         User
// @Accept       json
// @Produce      json
// @Security     BearerAuth
// @Success      200  {object}  map[string]any  "User data retrieved successfully"
// @Failure      401  {object}  map[string]any  "Unauthorized - Invalid or missing JWT token"
// @Failure      404  {object}  map[string]any  "User not found in database"
// @Failure      500  {object}  map[string]any  "Internal server error"
// @Router       /user/data [get]
func GetUserDataService(c *gin.Context) {
	userID, _ := c.Get(middleware.IDCK)

	var userData entity.User
	err := database.DB.Preload("Enrollments", func(db *gorm.DB) *gorm.DB {
		return db.Order("enrolled_at DESC")
	}).Preload("Enrollments.Course").First(&userData, userID).Error
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "Failed to retrieve user data",
			"data":    nil,
			"error":   err.Error(),
		})
		return
	}

	nameDecrypted, _ := utils.Decrypt(userData.Name)
	emailDecrypted, _ := utils.Decrypt(userData.Email)

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "User data retrieved successfully",
		"data": gin.H{
			"id":          userData.ID,
			"name":        nameDecrypted,
			"email":       emailDecrypted,
			"avatar_url":  userData.AvatarURL,
			"role":        userData.Role,
			"is_verified": userData.IsVerified,
			"enrollments": userData.Enrollments,
			"created_at":  userData.CreatedAt,
			"updated_at":  userData.UpdatedAt,
		},
		"error": nil,
	})
}

// @Summary      Update user role (Admin only)
// @Description  Update a specific user's role. Only administrators can perform this action. Valid roles are: admin, mentor, student.
// @Tags         User Management
// @Accept       json
// @Produce      json
// @Security     BearerAuth
// @Param        id    path      int                              true  "User ID to update"
// @Param        body  body      dto.UpdateUserRoleRequest        true  "Role assignment (admin/mentor/student)"
// @Success      200   {object}  map[string]any                   "User role updated successfully"
// @Failure      400   {object}  map[string]any                   "Invalid role value"
// @Failure      401   {object}  map[string]any                   "Unauthorized - Invalid or missing JWT token"
// @Failure      403   {object}  map[string]any                   "Forbidden - Only admins can update roles"
// @Failure      404   {object}  map[string]any                   "User not found"
// @Failure      500   {object}  map[string]any                   "Internal server error"
// @Router       /user/manage/{id} [patch]
func UpdateUserRoleService(c *gin.Context) {
	// Check if requester is admin
	adminID, _ := c.Get(middleware.IDCK)

	var adminData entity.User
	if err := database.DB.First(&adminData, adminID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"success": false,
			"message": "Admin user not found",
			"data":    nil,
			"error":   err.Error(),
		})
		return
	}

	if adminData.Role != entity.AdminRole {
		c.JSON(http.StatusForbidden, gin.H{
			"success": false,
			"message": "Access denied: Admins only",
			"data":    nil,
			"error":   nil,
		})
		return
	}

	// Parse target user ID from URL parameter
	userIDStr := c.Param("id")
	var targetUserID uint
	if _, err := fmt.Sscanf(userIDStr, "%d", &targetUserID); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "Invalid user ID",
			"data":    nil,
			"error":   err.Error(),
		})
		return
	}

	// Parse request body
	var req dto.UpdateUserRoleRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "Invalid request",
			"data":    nil,
			"error":   err.Error(),
		})
		return
	}

	// Validate role
	validRoles := map[string]entity.UserRole{
		"admin":   entity.AdminRole,
		"mentor":  entity.MentorRole,
		"student": entity.StudentRole,
	}

	newRole, exists := validRoles[strings.ToLower(req.Role)]
	if !exists {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "Invalid role. Must be one of: admin, mentor, student",
			"data":    nil,
			"error":   nil,
		})
		return
	}

	// Get target user
	var targetUser entity.User
	if err := database.DB.First(&targetUser, targetUserID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"success": false,
			"message": "Target user not found",
			"data":    nil,
			"error":   err.Error(),
		})
		return
	}

	// Prevent admin from removing their own admin role (optional security check)
	if targetUserID == adminID && newRole != entity.AdminRole {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "Cannot remove your own admin role",
			"data":    nil,
			"error":   nil,
		})
		return
	}

	// Update role
	if err := database.DB.Model(&targetUser).Update("role", newRole).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "Failed to update user role",
			"data":    nil,
			"error":   err.Error(),
		})
		return
	}

	// Decrypt user data for response
	nameDecrypted, _ := utils.Decrypt(targetUser.Name)
	emailDecrypted, _ := utils.Decrypt(targetUser.Email)

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "User role updated successfully",
		"data": gin.H{
			"id":          targetUser.ID,
			"name":        nameDecrypted,
			"email":       emailDecrypted,
			"avatar_url":  targetUser.AvatarURL,
			"role":        newRole,
			"is_verified": targetUser.IsVerified,
			"created_at":  targetUser.CreatedAt,
			"updated_at":  targetUser.UpdatedAt,
		},
		"error": nil,
	})
}

// DeleteUserService deletes a user. Only admin can use this endpoint.
//
// @Summary      Delete user account (Admin only)
// @Description  Delete a user account permanently. Only administrators can perform this action. Admins cannot delete their own account.
// @Tags         User Management
// @Accept       json
// @Produce      json
// @Security     BearerAuth
// @Param        id  path      int  true  "User ID to delete"
// @Success      200  {object}  map[string]any  "User deleted successfully"
// @Failure      401  {object}  map[string]any  "Unauthorized - Invalid or missing JWT token"
// @Failure      403  {object}  map[string]any  "Forbidden - Only admins can delete users"
// @Failure      404  {object}  map[string]any  "User not found"
// @Failure      500  {object}  map[string]any  "Internal server error"
// @Router       /user/manage/{id} [delete]
func DeleteUserService(c *gin.Context) {
	// Check if requester is admin
	adminID, _ := c.Get(middleware.IDCK)

	var adminData entity.User
	if err := database.DB.First(&adminData, adminID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"success": false,
			"message": "Admin user not found",
			"data":    nil,
			"error":   err.Error(),
		})
		return
	}

	if adminData.Role != entity.AdminRole {
		c.JSON(http.StatusForbidden, gin.H{
			"success": false,
			"message": "Access denied: Admins only",
			"data":    nil,
			"error":   nil,
		})
		return
	}

	// Parse target user ID from URL parameter
	userIDStr := c.Param("id")
	var targetUserID uint
	if _, err := fmt.Sscanf(userIDStr, "%d", &targetUserID); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "Invalid user ID",
			"data":    nil,
			"error":   err.Error(),
		})
		return
	}

	// Prevent admin from deleting themselves
	if targetUserID == adminID {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "Cannot delete your own account",
			"data":    nil,
			"error":   nil,
		})
		return
	}

	// Get target user
	var targetUser entity.User
	if err := database.DB.First(&targetUser, targetUserID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"success": false,
			"message": "User not found",
			"data":    nil,
			"error":   err.Error(),
		})
		return
	}

	// Delete user
	if err := database.DB.Delete(&targetUser).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "Failed to delete user",
			"data":    nil,
			"error":   err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "User deleted successfully",
		"data":    nil,
		"error":   nil,
	})
}

// GetAllUsersService returns a paginated list of users with optional filters and sorting.
//
// Query parameters (all optional):
// - page (int, default 1)
// - per_page (int, default 10, max 100)
// - role (string)         -> filter by role (admin/mentor/student)
// - search (string)       -> search in decrypted name and email (performed in-memory; may be expensive)
// - sort (string)         -> "created_at" (default) or "name"
// - order (string)        -> "asc" or "desc" (default "desc")
//
// @Summary      Get all users with pagination (Admin only)
// @Description  Retrieve paginated list of all users with optional filtering by role and search. Supports sorting by created_at or name. Admin only.
// @Tags         User Management
// @Accept       json
// @Produce      json
// @Security     BearerAuth
// @Param        page      query  int     false  "Page number (default: 1, minimum: 1)"
// @Param        per_page  query  int     false  "Items per page (default: 5, max: 100)"
// @Param        role      query  string  false  "Filter by role (admin/mentor/student)"
// @Param        search    query  string  false  "Search by name or email (case-insensitive)"
// @Param        sort      query  string  false  "Sort field: created_at (default) or name"
// @Param        order     query  string  false  "Sort order: asc or desc (default: desc)"
// @Success      200  {object}  map[string]any  "Users retrieved successfully with pagination metadata"
// @Failure      401  {object}  map[string]any  "Unauthorized - Invalid or missing JWT token"
// @Failure      403  {object}  map[string]any  "Forbidden - Only admins can access this endpoint"
// @Failure      500  {object}  map[string]any  "Internal server error"
// @Router       /user/manage/all [get]
func GetAllUsersService(c *gin.Context) {
	userID, _ := c.Get(middleware.IDCK)

	var userData entity.User
	if err := database.DB.First(&userData, userID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"success": false,
			"message": "User not found",
			"data":    nil,
			"error":   err.Error(),
		})
		return
	}

	if userData.Role != entity.AdminRole {
		c.JSON(http.StatusForbidden, gin.H{
			"success": false,
			"message": "Access denied: Admins only",
			"data":    nil,
			"error":   nil,
		})
		return
	}

	// Parse query params
	pageStr := c.DefaultQuery("page", "1")
	perPageStr := c.DefaultQuery("per_page", "5")
	roleFilter := c.Query("role")
	search := strings.TrimSpace(c.Query("search"))
	sortBy := c.DefaultQuery("sort", "created_at")
	order := strings.ToLower(c.DefaultQuery("order", "desc"))

	page, err := strconv.Atoi(pageStr)
	if err != nil || page < 1 {
		page = 1
	}
	perPage, err := strconv.Atoi(perPageStr)
	if err != nil || perPage < 1 {
		perPage = 5
	}
	const maxPerPage = 100
	if perPage > maxPerPage {
		perPage = maxPerPage
	}

	// If no search query provided, do DB-level pagination and filtering by role.
	if search == "" {
		db := database.DB.Model(&entity.User{})
		if roleFilter != "" {
			db = db.Where("role = ?", roleFilter)
		}

		var total int64
		if err := db.Count(&total).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{
				"success": false,
				"message": "Failed to count users",
				"data":    nil,
				"error":   err.Error(),
			})
			return
		}

		// apply sorting
		sortField := "created_at"
		if sortBy == "name" {
			// name is encrypted in DB, sorting by name at DB level is not meaningful.
			// fallback to created_at when sortBy == "name" and no search is requested.
			sortField = "created_at"
		}
		if order != "asc" && order != "desc" {
			order = "desc"
		}

		offset := (page - 1) * perPage
		var users []entity.User
		if err := db.Preload("Enrollments", func(db *gorm.DB) *gorm.DB {
			return db.Order("enrolled_at DESC")
		}).Preload("Enrollments.Course").Order(sortField + " " + order).Limit(perPage).Offset(offset).Find(&users).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{
				"success": false,
				"message": "Failed to retrieve users",
				"data":    nil,
				"error":   err.Error(),
			})
			return
		}

		// decrypt and build result
		result := make([]gin.H, 0, len(users))
		for _, u := range users {
			nameDecrypted, _ := utils.Decrypt(u.Name)
			emailDecrypted, _ := utils.Decrypt(u.Email)
			result = append(result, gin.H{
				"id":          u.ID,
				"name":        nameDecrypted,
				"email":       emailDecrypted,
				"avatar_url":  u.AvatarURL,
				"role":        u.Role,
				"is_verified": u.IsVerified,
				"enrollments": u.Enrollments,
				"created_at":  u.CreatedAt,
				"updated_at":  u.UpdatedAt,
			})
		}

		totalPages := int((total + int64(perPage) - 1) / int64(perPage))

		c.JSON(http.StatusOK, gin.H{
			"success": true,
			"message": "Users retrieved successfully",
			"data": gin.H{
				"users": result,
				"meta": gin.H{
					"total":        total,
					"per_page":     perPage,
					"current_page": page,
					"total_pages":  totalPages,
				},
			},
			"error": nil,
		})
		return
	}

	// If search is provided -> need to decrypt and filter in-memory.
	db := database.DB.Model(&entity.User{})
	if roleFilter != "" {
		db = db.Where("role = ?", roleFilter)
	}

	var users []entity.User
	if err := db.Preload("Enrollments", func(db *gorm.DB) *gorm.DB {
		return db.Order("enrolled_at DESC")
	}).Preload("Enrollments.Course").Find(&users).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "Failed to retrieve users for search",
			"data":    nil,
			"error":   err.Error(),
		})
		return
	}

	type userWithDecrypted struct {
		User  entity.User
		Name  string
		Email string
	}

	searchLower := strings.ToLower(search)
	filtered := make([]userWithDecrypted, 0, len(users))
	for _, u := range users {
		nameDecrypted, _ := utils.Decrypt(u.Name)
		emailDecrypted, _ := utils.Decrypt(u.Email)

		if strings.Contains(strings.ToLower(nameDecrypted), searchLower) || strings.Contains(strings.ToLower(emailDecrypted), searchLower) {
			filtered = append(filtered, userWithDecrypted{
				User:  u,
				Name:  nameDecrypted,
				Email: emailDecrypted,
			})
		}
	}

	// Sorting in-memory
	if sortBy == "name" {
		if order == "asc" {
			sort.Slice(filtered, func(i, j int) bool { return filtered[i].Name < filtered[j].Name })
		} else {
			sort.Slice(filtered, func(i, j int) bool { return filtered[i].Name > filtered[j].Name })
		}
	} else {
		// default sort by created_at
		if order == "asc" {
			sort.Slice(filtered, func(i, j int) bool { return filtered[i].User.CreatedAt.Before(filtered[j].User.CreatedAt) })
		} else {
			sort.Slice(filtered, func(i, j int) bool { return filtered[i].User.CreatedAt.After(filtered[j].User.CreatedAt) })
		}
	}

	total := len(filtered)
	start := (page - 1) * perPage
	if start > total {
		start = total
	}
	end := start + perPage
	if end > total {
		end = total
	}

	paginated := filtered[start:end]
	result := make([]gin.H, 0, len(paginated))
	for _, item := range paginated {
		u := item.User
		result = append(result, gin.H{
			"id":          u.ID,
			"name":        item.Name,
			"email":       item.Email,
			"avatar_url":  u.AvatarURL,
			"role":        u.Role,
			"is_verified": u.IsVerified,
			"enrollments": u.Enrollments,
			"created_at":  u.CreatedAt,
			"updated_at":  u.UpdatedAt,
		})
	}

	totalPages := (total + perPage - 1) / perPage

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Users retrieved successfully",
		"data": gin.H{
			"users": result,
			"meta": gin.H{
				"total":        total,
				"per_page":     perPage,
				"current_page": page,
				"total_pages":  totalPages,
			},
		},
		"error": nil,
	})
}
