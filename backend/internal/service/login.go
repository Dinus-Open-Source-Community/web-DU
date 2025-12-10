package service

import (
	"backend/internal/database"
	"backend/internal/handler/middleware"
	"backend/internal/model/entity"
	"backend/internal/model/dto"
	"backend/internal/utils"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
)

// PostLoginFunc merupakan handler untuk proses login user.
// Fungsi ini menerima input email dan password dari client (dalam format JSON),
// memverifikasi data tersebut dengan database, dan jika valid — akan
// menghasilkan token JWT yang dikirim kembali ke client.
func PostLoginFunc(c *gin.Context) {
	var req dto.LoginRequest

	// Parsing JSON body ke struct LoginRequest
	// Jika format JSON tidak valid, kembalikan error 400 (Bad Request)
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "Invalid request data",
			"data":    nil,
			"error":   err.Error(),
		})
		return
	}

	// Ambil data user dari database berdasarkan email
	var userData entity.User
	emailHash := utils.GenerateBlindIndex(req.Email)
	database.DB.Where("email_hash = ?", emailHash).First(&userData)

	// Verifikasi password yang dimasukkan user
	// utils.CheckPassword akan membandingkan antara password asli dan hash yang tersimpan
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

	// Generate token JWT untuk user yang berhasil login
	// Token akan berlaku selama 24 jam sejak waktu login
	expiration := time.Now().Add(24 * time.Hour)
	token, err := middleware.GenerateJWT(userData.EmailHash, expiration)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "Failed to generate token",
			"data":    nil,
			"error":   err.Error(),
		})
		return
	}

	// Kirimkan response sukses berisi token dan waktu kedaluwarsa
	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "User logged in successfully!",
		"data": gin.H{
			"token":       token,
			"expires_at":  expiration.Format(time.RFC3339),
		},
		"error": nil,
	})
}
