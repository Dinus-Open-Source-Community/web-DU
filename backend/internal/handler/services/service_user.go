package services

import (
	"backend/internal/database"
	"backend/internal/handler/middleware"
	"backend/internal/model"
	"backend/internal/utils"
	"net/http"

	"github.com/gin-gonic/gin"
)

func GetUserService(c *gin.Context) {
	userID, _ := c.Get(middleware.IDCK)

	var userData model.User
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
