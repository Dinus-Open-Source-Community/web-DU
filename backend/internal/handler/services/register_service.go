package services

import (
	"backend/internal/database"
	"backend/internal/model"
	"backend/internal/utils"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/jackc/pgx/v5/pgconn"
)

// PostRegisterFunc merupakan handler untuk endpoint registrasi user baru.
// Fungsi ini menerima data JSON dari client (nama, email, password),
// melakukan validasi, hashing password, menyimpan data user ke database,
// serta mengembalikan response dalam format JSON.
func PostRegisterFunc(c *gin.Context) {
	var req model.RegisterRequest

	// Parsing (binding) JSON body ke struct RegisterRequest
	// Jika format JSON tidak valid, kirim response 400 (Bad Request)
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "Invalid request data",
			"data":    nil,
			"error":   err.Error(),
		})
		return
	}

	// Hash password sebelum disimpan ke database untuk alasan keamanan
	hashedPassword, err := utils.HashPassword(req.Password)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "Internal server error",
			"data":    nil,
			"error":   err.Error(),
		})
		return
	}

	// Buat instance user baru berdasarkan data yang diterima
	newUser := model.User{
		Name:     req.Name,
		Email:    req.Email,
		Password: hashedPassword,
		Role:     model.StudentRole, // Default role: Student
	}

	// Simpan user ke database menggunakan GORM
	err = database.DB.Create(&newUser).Error
	if err != nil {
		// 5️⃣ Tangani error jika email sudah terdaftar
		if pgErr, ok := err.(*pgconn.PgError); ok && pgErr.Code == "23505" {
			c.JSON(http.StatusConflict, gin.H{
				"success": false,
				"message": "Email already registered",
				"data":    nil,
				"error":   nil,
			})
			return
		}

		// Tangani error umum lainnya
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "Failed to register user",
			"data":    nil,
			"error":   err.Error(),
		})
		return
	}

	// Jika berhasil, kirim response sukses
	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "User registered successfully!",
		"data":    nil,
		"error":   nil,
	})
}
