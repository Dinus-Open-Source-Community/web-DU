package service

import (
	"backend/internal/database"
	"backend/internal/handler/middleware"
	"backend/internal/model/dto"
	"backend/internal/model/entity"
	"backend/internal/utils"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/jackc/pgx/v5/pgconn"
)

func PostRegisterFunc(c *gin.Context) {
	var req dto.RegisterRequest // <-- KITA GUNAKAN MODEL YANG SUDAH DIPERBAIKI

	// 1. Ambil dan validasi data JSON (name, email, password)
	// Gin akan otomatis memvalidasi JSON berdasarkan tag 'binding'
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "Invalid request data",
			"data":    nil,
			"error":   err.Error(),
		})
		return
	}

	// 2. Proses hashing password dan enkripsi data sensitif
	// (Kita sekarang menggunakan data dari 'req' yang sudah divalidasi)
	hashedPassword, err := utils.HashPassword(req.Password)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false, "message": "Internal server error (hashing failed)", "data": nil, "error": err.Error(),
		})
		return
	}

	nameEncrypted, _ := utils.Encrypt(req.Name)
	emailEncrypted, _ := utils.Encrypt(req.Email)
	emailHash := utils.GenerateBlindIndex(req.Email)

	// 3. Buat instance user baru
	newUser := entity.User{
		Name:      nameEncrypted,
		Email:     emailEncrypted,
		EmailHash: emailHash,
		Password:  hashedPassword,
		Role:      entity.StudentRole,
	}

	// 4. Simpan user ke database
	err = database.DB.Create(&newUser).Error
	if err != nil {
		if pgErr, ok := err.(*pgconn.PgError); ok && pgErr.Code == "23505" {
			c.JSON(http.StatusConflict, gin.H{
				"success": false, "message": "Email already registered", "data": nil, "error": nil,
			})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false, "message": "Failed to register user", "data": nil, "error": err.Error(),
		})
		return
	}
	// Generate token JWT untuk user yang berhasil login
	// Token akan berlaku selama 24 jam sejak waktu register
	expiration := time.Now().Add(24 * time.Hour)
	token, err := middleware.GenerateJWT(newUser.EmailHash, expiration)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false, "message": "Failed to generate token", "data": nil, "error": err.Error(),
		})
		return
	}

	// 5. Jika berhasil, kirim response sukses
	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "User registered successfully!",
		"data": gin.H{
			"token":      token,
			"expires_at": expiration.Format(time.RFC3339),
		},
		"error": nil,
	})
}
