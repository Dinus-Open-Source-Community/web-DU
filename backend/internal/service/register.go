package service

import (
	"backend/internal/database"
	"backend/internal/model/dto"
	"backend/internal/model/entity"
	"backend/internal/utils"
	"log"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/jackc/pgx/v5/pgconn"
)

// @Summary      Register new user (Public)
// @Description  Register a new user with name, email, and password. Requires OTP verification before login.
// @Tags         Auth
// @Accept       json
// @Produce      json
// @Param        request  body  dto.RegisterRequest  true  "Register payload"
// @Success      200  {object}  map[string]any  "User registered successfully, OTP sent"
// @Failure      400  {object}  map[string]any  "Invalid request data"
// @Failure      409  {object}  map[string]any  "Email already registered"
// @Failure      500  {object}  map[string]any  "Internal server error"
// @Router       /register [post]
func PostRegisterFunc(c *gin.Context) {
	var req dto.RegisterRequest

	// 1. Ambil dan validasi data JSON (name, email, password)
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

	// Cek apakah akun dengan email ini sudah ada di database
	var existingUser entity.User
	if err := database.DB.Where("email_hash = ?", emailHash).First(&existingUser).Error; err == nil {
		if existingUser.IsVerified {
			c.JSON(http.StatusConflict, gin.H{
				"success": false, "message": "Email already registered", "data": nil, "error": nil,
			})
			return
		}

		// Jika akun sudah ada namun belum diverifikasi, perbarui password dan nama lalu kirim ulang OTP
		existingUser.Name = nameEncrypted
		existingUser.Password = hashedPassword
		database.DB.Save(&existingUser)

		userForMail := existingUser
		userForMail.Email = req.Email
		userForMail.Name = req.Name
		if err := GenerateAndSendOTP(&userForMail, entity.PurposeVerifyAccount); err != nil {
			log.Printf("[register] Gagal mengirim OTP: %v", err)
		}

		c.JSON(http.StatusOK, gin.H{
			"success": true,
			"message": "Akun kamu belum diverifikasi. Kode OTP verifikasi baru telah dikirim ke email kamu.",
			"data": gin.H{
				"email":                 req.Email,
				"requires_verification": true,
			},
			"error": nil,
		})
		return
	}

	// 3. Buat instance user baru (is_verified = false)
	newUser := entity.User{
		Name:       nameEncrypted,
		Email:      emailEncrypted,
		EmailHash:  emailHash,
		Password:   hashedPassword,
		Role:       entity.StudentRole,
		IsVerified: false,
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

	// 5. Kirim OTP verifikasi ke email user
	userForMail := newUser
	userForMail.Email = req.Email
	userForMail.Name = req.Name
	if err := GenerateAndSendOTP(&userForMail, entity.PurposeVerifyAccount); err != nil {
		log.Printf("[register] Gagal mengirim OTP ke %s: %v", req.Email, err)
	}

	// 6. Kembalikan response sukses yang mengharuskan verifikasi OTP
	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Pendaftaran berhasil! Kode verifikasi OTP telah dikirim ke email kamu.",
		"data": gin.H{
			"email":                 req.Email,
			"requires_verification": true,
		},
		"error": nil,
	})
}
