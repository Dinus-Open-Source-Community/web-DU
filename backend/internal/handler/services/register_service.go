package services

import (
	"backend/internal/database"
	"backend/internal/model"
	"backend/internal/utils"
	"net/http"
	"os"
	"path/filepath" // Diperlukan untuk ekstensi file

	"github.com/gin-gonic/gin"
	"github.com/google/uuid" // Diperlukan untuk nama file unik
	"github.com/jackc/pgx/v5/pgconn"
)

// @Summary      Register route initialization
// @Description  Group of routes used for user registration
// @Tags         Auth
// @Accept       multipart/form-data
// @Produce      json
// @Param        name      formData  string  true   "User's name"
// @Param        email     formData  string  true   "User's email"
// @Param        password  formData  string  true   "User's password"
// @Param        avatar    formData  file    false  "User's avatar image (opsional)"
// @Success      200  {object}  map[string]any  "User registered successfully!"
// @Failure      400  {object}  map[string]any  "Invalid request data"
// @Failure      409  {object}  map[string]any  "Email already registered"
// @Failure      500  {object}  map[string]any  "Internal server error"
// @Router       /register [post]
func PostRegisterFunc(c *gin.Context) {
	var req model.RegisterRequest // <-- KITA GUNAKAN MODEL YANG SUDAH DIPERBAIKI

	// 1. Ambil dan validasi data form (name, email, password)
	// Gin akan otomatis memvalidasi form data berdasarkan tag 'binding'
	if err := c.ShouldBind(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "Invalid request data",
			"data":    nil,
			"error":   err.Error(),
		})
		return
	}

	// 2. Proses file avatar (opsional)
	// (Logika ini tetap sama, sudah benar)
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

		if err := os.MkdirAll(uploadDir, 0755); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{
				"success": false, "message": "Failed to create upload directory", "data": nil, "error": err.Error(),
			})
			return
		}

		if err := c.SaveUploadedFile(file, savePath); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{
				"success": false, "message": "Failed to save avatar file", "data": nil, "error": err.Error(),
			})
			return
		}
		avatarURL = "/uploads/avatars/" + uniqueFilename
	}

	// 3. Hash password
	// (Kita sekarang menggunakan data dari 'req' yang sudah divalidasi)
	hashedPassword, err := utils.HashPassword(req.Password)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false, "message": "Internal server error (hashing failed)", "data": nil, "error": err.Error(),
		})
		return
	}

	// 4. Buat instance user baru
	newUser := model.User{
		Name:      req.Name,  // <-- Gunakan req.Name
		Email:     req.Email, // <-- Gunakan req.Email
		Password:  hashedPassword,
		Role:      model.StudentRole,
		AvatarURL: avatarURL,
	}

	// 5. Simpan user ke database
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

	// 6. Jika berhasil, kirim response sukses
	c.JSON(http.StatusOK, gin.H{
		"success": true, "message": "User registered successfully!", "data": nil, "error": nil,
	})
}
