package services

import (
	"backend/internal/database"
	"backend/internal/handler/middleware"
	"backend/internal/model"
	"backend/internal/utils"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
)

func PostLoginFunc(c *gin.Context) {
	var req model.LoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "Invalid request data",
			"data":    nil,
			"error":   err.Error(),
		})
		return
	}

	var userData model.User
	database.DB.Where("email = ?", req.Email).First(&userData)
	
	validPassword := utils.CheckPassword(userData.Password, req.Password)
	if !validPassword {
		c.JSON(http.StatusUnauthorized, gin.H{
			"success": false,
			"message": "Invalid credentials",
			"data":    nil,
			"error":   "Authentication failed",
		})
		return
	}

	// Generate JWT token
	expiration := time.Now().Add(24 * time.Hour) // Token valid for 24 hours
	token, err := middleware.GenerateJWT(userData.Name, userData.Email, expiration)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "Failed to generate token",
			"data":    nil,
			"error":   err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "User logged in successfully!",
		"data": gin.H{
			"token": token,
			"expires_at": expiration.Format(time.RFC3339),
		},
		"error": nil,
	})
}
