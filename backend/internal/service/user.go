package service

import (
	"net/http"
	"sort"
	"strconv"
	"strings"

	"backend/internal/database"
	"backend/internal/handler/middleware"
	"backend/internal/model/entity"
	"backend/internal/utils"

	"github.com/gin-gonic/gin"
)

// GetUserDataService returns the authenticated user's data.
func GetUserDataService(c *gin.Context) {
	userID, _ := c.Get(middleware.IDCK)

	var userData entity.User
	err := database.DB.First(&userData, userID).Error
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
			"created_at":  userData.CreatedAt,
			"updated_at":  userData.UpdatedAt,
		},
		"error": nil,
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
// Notes:
// - Because name/email are stored encrypted, text search is implemented by decrypting and filtering in-memory.
//   If you expect very large user counts, consider adding a deterministic hash field to support DB-level searching.
func GetAllUsersService(c *gin.Context) {
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
		if err := db.Order(sortField + " " + order).Limit(perPage).Offset(offset).Find(&users).Error; err != nil {
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
					"total":       total,
					"per_page":    perPage,
					"current_page": page,
					"total_pages": totalPages,
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
	if err := db.Find(&users).Error; err != nil {
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