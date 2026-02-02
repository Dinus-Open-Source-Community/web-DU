// Example penggunaan token JWT dengan middleware AuthMiddleware

package service

import (
	"backend/internal/database"
	"backend/internal/handler/middleware"
	"backend/internal/model/entity"
	"net/http"
	"path/filepath"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

// @Summary      Update user avatar (All Roles)
// @Description  Upload and update authenticated user's avatar image. Only authenticated users can access this endpoint.
// @Tags         User
// @Accept       multipart/form-data
// @Produce      json
// @Security     BearerAuth
// @Param        avatar  formData  file  true  "Avatar image file (max 5MB, supported: JPG, PNG, GIF)"
// @Success      200  {object}  map[string]any  "Avatar updated successfully"
// @Failure      400  {object}  map[string]any  "Failed to process avatar file"
// @Failure      401  {object}  map[string]any  "Unauthorized"
// @Failure      413  {object}  map[string]any  "File size exceeds 5MB limit"
// @Failure      404  {object}  map[string]any  "User not found"
// @Failure      500  {object}  map[string]any  "Internal server error"
// @Router       /avatar [post]
func PostAvatarFunc(c *gin.Context) {
	// Ambil data userID dari context yang sudah diset oleh middleware
	userID, _ := c.Get(middleware.IDCK)

	var avatarURL string
	file, err := c.FormFile("avatar")

	if err != nil && err != http.ErrMissingFile {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "Failed to process avatar file",
			"data":    nil,
			"error":   err.Error(),
		})
		return
	}

	if file != nil {
		const maxSize = 5 * 1024 * 1024 // 5MB
		if file.Size > maxSize {
			c.JSON(http.StatusRequestEntityTooLarge, gin.H{
				"success": false,
				"message": "Avatar file size exceeds 5MB limit",
				"data":    nil,
				"error":   nil,
			})
			return
		}
	}

	if file != nil {
		extension := filepath.Ext(file.Filename)
		uniqueFilename := uuid.New().String() + extension
		uploadDir := "./public/uploads/avatars"
		savePath := filepath.Join(uploadDir, uniqueFilename)

		if err := c.SaveUploadedFile(file, savePath); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{
				"success": false, "message": "Failed to save avatar file", "data": nil, "error": err.Error(),
			})
			return
		}
		avatarURL = "/uploads/avatars/" + uniqueFilename
	}

	avatar := entity.User{
		AvatarURL: avatarURL,
	}

	err = database.DB.Model(&entity.User{}).Where("id = ?", userID).Updates(avatar).Error
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "Failed to update avatar URL",
			"data":    nil,
			"error":   err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Updated avatar successfully!",
		"data":    gin.H{"avatar_url": avatarURL},
		"error":   nil,
	})
}
