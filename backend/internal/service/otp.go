package service

import (
	"crypto/rand"
	"crypto/sha256"
	"crypto/subtle"
	"encoding/hex"
	"fmt"
	"log"
	"math/big"
	"net/http"
	"time"

	"backend/internal/database"
	"backend/internal/handler/middleware"
	"backend/internal/mailer"
	"backend/internal/model/dto"
	"backend/internal/model/entity"
	"backend/internal/utils"

	"github.com/gin-gonic/gin"
)

// GenerateAndSendOTP membuat kode OTP 6-digit acak, menyimpannya di DB (dalam bentuk hash),
// dan mengirimkan email dengan template HTML Gmail.
func GenerateAndSendOTP(user *entity.User, purpose string) error {
	// 1. Cek cooldown 60 detik dari pengiriman OTP terakhir
	var lastOTP entity.OTP
	err := database.DB.Where("user_uid = ? AND purpose = ?", user.Uid, purpose).
		Order("created_at desc").First(&lastOTP).Error
	if err == nil && time.Since(lastOTP.CreatedAt) < 60*time.Second {
		remaining := int(60 - time.Since(lastOTP.CreatedAt).Seconds())
		return fmt.Errorf("Harap tunggu %d detik sebelum meminta kode baru", remaining)
	}

	// 2. Generate 6 digit angka acak menggunakan crypto/rand
	max := big.NewInt(1000000)
	n, err := rand.Int(rand.Reader, max)
	if err != nil {
		return fmt.Errorf("Gagal membuat kode OTP: %w", err)
	}
	code := fmt.Sprintf("%06d", n.Int64())

	// 3. Hash kode dengan SHA-256
	hashBytes := sha256.Sum256([]byte(code))
	codeHash := hex.EncodeToString(hashBytes[:])

	// 4. Simpan ke database
	newOTP := entity.OTP{
		UserUID:     user.Uid,
		EmailHash:   user.EmailHash,
		CodeHash:    codeHash,
		Purpose:     purpose,
		Attempts:    0,
		MaxAttempts: 5,
		ExpiresAt:   time.Now().Add(10 * time.Minute),
	}
	if err := database.DB.Create(&newOTP).Error; err != nil {
		return fmt.Errorf("Gagal menyimpan OTP: %w", err)
	}

	// 5. Kirim email via SMTP
	// Pastikan user.Email dan user.Name plaintext (sudah didekripsi oleh hook AfterFind atau passed plaintext)
	email := user.Email
	name := user.Name
	if email == "" || name == "" {
		// Fallback jika belum didekripsi
		var tempUser entity.User
		if err := database.DB.Where("uid = ?", user.Uid).First(&tempUser).Error; err == nil {
			email = tempUser.Email
			name = tempUser.Name
		}
	}

	m := mailer.GetMailer()
	if err := m.SendOTP(email, name, code, 10); err != nil {
		log.Printf("[otp] Gagal mengirim email OTP ke %s: %v", email, err)
		return fmt.Errorf("Gagal mengirim email OTP: %w", err)
	}

	return nil
}

// VerifyOTPFunc menangani endpoint POST /verify-otp
func VerifyOTPFunc(c *gin.Context) {
	var req dto.VerifyOTPRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "Format permintaan tidak valid",
			"data":    nil,
			"error":   err.Error(),
		})
		return
	}

	emailHash := utils.GenerateBlindIndex(req.Email)
	var user entity.User
	if err := database.DB.Where("email_hash = ?", emailHash).First(&user).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"success": false,
			"message": "Akun dengan email ini tidak ditemukan",
			"data":    nil,
			"error":   "User not found",
		})
		return
	}

	if user.IsVerified {
		// Akun sudah diverifikasi sebelumnya, langsung buatkan session token
		expiration := time.Now().Add(24 * time.Hour)
		token, err := middleware.GenerateJWT(user.EmailHash, expiration)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{
				"success": false,
				"message": "Gagal generate token sesi",
				"data":    nil,
				"error":   err.Error(),
			})
			return
		}

		c.JSON(http.StatusOK, gin.H{
			"success": true,
			"message": "Akun sudah terverifikasi sebelumnya.",
			"data": gin.H{
				"token":      token,
				"expires_at": expiration.Format(time.RFC3339),
			},
			"error": nil,
		})
		return
	}

	// Cari OTP terbaru yang belum digunakan untuk verifikasi akun
	var otp entity.OTP
	err := database.DB.Where("user_uid = ? AND purpose = ? AND used_at IS NULL", user.Uid, entity.PurposeVerifyAccount).
		Order("created_at desc").First(&otp).Error
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "Tidak ada kode OTP aktif untuk akun ini. Silakan minta kode baru.",
			"data":    nil,
			"error":   "No active OTP",
		})
		return
	}

	// Cek masa berlaku
	if time.Now().After(otp.ExpiresAt) {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "Kode OTP sudah kedaluwarsa. Silakan kirim ulang kode baru.",
			"data":    nil,
			"error":   "OTP expired",
		})
		return
	}

	// Cek batas percobaan salah
	if otp.Attempts >= otp.MaxAttempts {
		c.JSON(http.StatusTooManyRequests, gin.H{
			"success": false,
			"message": "Batas percobaan OTP telah terlampaui. Silakan kirim ulang kode baru.",
			"data":    nil,
			"error":   "Too many attempts",
		})
		return
	}

	// Bandingkan kode
	hashBytes := sha256.Sum256([]byte(req.OTP))
	givenHash := hex.EncodeToString(hashBytes[:])

	if subtle.ConstantTimeCompare([]byte(givenHash), []byte(otp.CodeHash)) != 1 {
		database.DB.Model(&otp).Update("attempts", otp.Attempts+1)
		remaining := otp.MaxAttempts - (otp.Attempts + 1)
		msg := "Kode OTP salah. Periksa kembali email Anda."
		if remaining > 0 {
			msg = fmt.Sprintf("Kode OTP salah. Sisa percobaan: %d kali.", remaining)
		} else {
			msg = "Kode OTP salah dan batas percobaan habis. Silakan kirim ulang kode baru."
		}

		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": msg,
			"data":    nil,
			"error":   "Invalid OTP",
		})
		return
	}

	// Tandai OTP telah digunakan
	now := time.Now()
	database.DB.Model(&otp).Update("used_at", &now)

	// Tandai akun user terverifikasi
	if err := database.DB.Model(&user).Update("is_verified", true).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "Gagal memperbarui status verifikasi",
			"data":    nil,
			"error":   err.Error(),
		})
		return
	}

	// Generate JWT session token
	expiration := time.Now().Add(24 * time.Hour)
	token, err := middleware.GenerateJWT(user.EmailHash, expiration)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "Gagal generate token sesi",
			"data":    nil,
			"error":   err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Email berhasil diverifikasi! Selamat datang di DOSCOM University.",
		"data": gin.H{
			"token":      token,
			"expires_at": expiration.Format(time.RFC3339),
		},
		"error": nil,
	})
}

// ResendOTPFunc menangani endpoint POST /resend-otp
func ResendOTPFunc(c *gin.Context) {
	var req dto.ResendOTPRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "Format permintaan tidak valid",
			"data":    nil,
			"error":   err.Error(),
		})
		return
	}

	emailHash := utils.GenerateBlindIndex(req.Email)
	var user entity.User
	if err := database.DB.Where("email_hash = ?", emailHash).First(&user).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"success": false,
			"message": "Akun dengan email ini tidak ditemukan",
			"data":    nil,
			"error":   "User not found",
		})
		return
	}

	if user.IsVerified {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "Akun ini sudah terverifikasi. Silakan langsung masuk ke akun Anda.",
			"data":    nil,
			"error":   "Already verified",
		})
		return
	}

	if err := GenerateAndSendOTP(&user, entity.PurposeVerifyAccount); err != nil {
		c.JSON(http.StatusTooManyRequests, gin.H{
			"success": false,
			"message": err.Error(),
			"data":    nil,
			"error":   "Resend failed or cooldown active",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Kode OTP baru telah berhasil dikirim ke email kamu.",
		"data":    nil,
		"error":   nil,
	})
}
