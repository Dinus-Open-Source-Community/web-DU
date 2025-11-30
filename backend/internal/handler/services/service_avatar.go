// Example penggunaan token JWT dengan middleware AuthMiddleware

package services

import (
	"backend/internal/database"
	"backend/internal/handler/middleware"
	"backend/internal/model"
	"net/http"
	"path/filepath"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

// PostAvatarFunc merupakan contoh handler (endpoint) yang hanya bisa diakses
// jika user sudah terautentikasi menggunakan JWT token yang valid.
//
// Fungsi ini menggunakan middleware `AuthMiddleware` untuk memverifikasi token JWT.
// Setelah token terverifikasi, data klaim seperti `Name` dan `Email` disimpan
// ke dalam context (c.Set) dan dapat diambil kembali di handler ini.
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

	avatar := model.User{
		AvatarURL: avatarURL,
	}

	err = database.DB.Model(&model.User{}).Where("id = ?", userID).Updates(avatar).Error
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
