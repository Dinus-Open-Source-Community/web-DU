package service

import (
	"backend/internal/cache"
	"crypto/rand"
	"crypto/sha256"
	"encoding/base64"
	"encoding/hex"
	"errors"
	"fmt"
	"log"
	"net/http"
	"net/mail"
	"net/url"
	"os"
	"strings"
	"time"

	"backend/internal/database"
	"backend/internal/handler/middleware"
	"backend/internal/mailer"
	"backend/internal/model/dto"
	"backend/internal/model/entity"
	"backend/internal/utils"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

const emailChangeTokenExpiryMinutes = 30

func resolveFrontendBaseURL(c *gin.Context) string {
	for _, envKey := range []string{"FRONTEND_BASE_URL", "FRONTEND_URL", "APP_FRONTEND_URL", "CLIENT_URL"} {
		if val := strings.TrimSpace(os.Getenv(envKey)); val != "" {
			return strings.TrimRight(val, "/")
		}
	}

	if origin := strings.TrimSpace(c.GetHeader("Origin")); origin != "" {
		if parsed, err := url.Parse(origin); err == nil && parsed.Scheme != "" && parsed.Host != "" {
			return fmt.Sprintf("%s://%s", parsed.Scheme, parsed.Host)
		}
	}

	if referer := strings.TrimSpace(c.GetHeader("Referer")); referer != "" {
		if parsed, err := url.Parse(referer); err == nil && parsed.Scheme != "" && parsed.Host != "" {
			return fmt.Sprintf("%s://%s", parsed.Scheme, parsed.Host)
		}
	}

	return "http://localhost:3000"
}

func generateEmailChangeToken() (rawToken string, tokenHash string, err error) {
	buf := make([]byte, 32)
	if _, err := rand.Read(buf); err != nil {
		return "", "", err
	}
	rawToken = base64.RawURLEncoding.EncodeToString(buf)
	sum := sha256.Sum256([]byte(rawToken))
	tokenHash = hex.EncodeToString(sum[:])
	return rawToken, tokenHash, nil
}

// RequestEmailChangeService menangani POST /user/email/change-request.
// Memvalidasi password saat ini dan mengirim tautan konfirmasi ke alamat email LAMA pengguna.
func RequestEmailChangeService(c *gin.Context) {
	userID, _ := c.Get(middleware.UIDCK)

	var req dto.RequestEmailChangeRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "Data permintaan perubahan email tidak valid",
			"data":    nil,
			"error":   err.Error(),
		})
		return
	}

	rawNewEmail := strings.TrimSpace(req.NewEmail)
	if rawNewEmail == "" {
		rawNewEmail = strings.TrimSpace(req.Email)
	}
	newEmail := strings.ToLower(rawNewEmail)

	if newEmail == "" || strings.TrimSpace(req.Password) == "" {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "Alamat email baru dan password saat ini wajib diisi",
			"data":    nil,
			"error":   nil,
		})
		return
	}

	if _, err := mail.ParseAddress(newEmail); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "Format alamat email baru tidak valid",
			"data":    nil,
			"error":   nil,
		})
		return
	}

	var user entity.User
	if err := database.DB.First(&user, userID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"success": false,
			"message": "Pengguna tidak ditemukan",
			"data":    nil,
			"error":   err.Error(),
		})
		return
	}

	if !utils.CheckPassword(user.Password, req.Password) {
		c.JSON(http.StatusUnauthorized, gin.H{
			"success": false,
			"message": "Password saat ini tidak sesuai",
			"data":    nil,
			"error":   "Invalid current password",
		})
		return
	}

	oldEmail := strings.ToLower(strings.TrimSpace(user.Email))
	if oldEmail == "" {
		decrypted, _ := utils.Decrypt(user.Email)
		oldEmail = strings.ToLower(strings.TrimSpace(decrypted))
	}
	namePlain := strings.TrimSpace(user.Name)
	if namePlain == "" {
		decryptedName, _ := utils.Decrypt(user.Name)
		namePlain = strings.TrimSpace(decryptedName)
	}

	if newEmail == oldEmail {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "Alamat email baru tidak boleh sama dengan alamat email lama",
			"data":    nil,
			"error":   nil,
		})
		return
	}

	newEmailHash := utils.GenerateBlindIndex(newEmail)
	var existing entity.User
	if err := database.DB.Where("email_hash = ? AND uid <> ?", newEmailHash, user.Uid).First(&existing).Error; err == nil {
		c.JSON(http.StatusConflict, gin.H{
			"success": false,
			"message": "Alamat email baru sudah terdaftar pada akun lain",
			"data":    nil,
			"error":   nil,
		})
		return
	} else if !errors.Is(err, gorm.ErrRecordNotFound) {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "Gagal memeriksa ketersediaan alamat email",
			"data":    nil,
			"error":   err.Error(),
		})
		return
	}

	// Cek cooldown 60 detik dari permintaan terakhir
	var lastReq entity.EmailChangeRequest
	if err := database.DB.Where("user_uid = ? AND used_at IS NULL", user.Uid).
		Order("created_at desc").First(&lastReq).Error; err == nil {
		if time.Since(lastReq.CreatedAt) < 60*time.Second {
			remaining := int(60 - time.Since(lastReq.CreatedAt).Seconds())
			c.JSON(http.StatusTooManyRequests, gin.H{
				"success": false,
				"message": fmt.Sprintf("Harap tunggu %d detik sebelum mengajukan perubahan email kembali", remaining),
				"data":    nil,
				"error":   "Cooldown active",
			})
			return
		}
	}

	rawToken, tokenHash, err := generateEmailChangeToken()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "Gagal membuat token konfirmasi",
			"data":    nil,
			"error":   err.Error(),
		})
		return
	}

	encNewEmail, err := utils.Encrypt(newEmail)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "Gagal mengenkripsi alamat email baru",
			"data":    nil,
			"error":   err.Error(),
		})
		return
	}

	record := entity.EmailChangeRequest{
		UserUID:      user.Uid,
		OldEmailHash: user.EmailHash,
		NewEmail:     encNewEmail,
		NewEmailHash: newEmailHash,
		TokenHash:    tokenHash,
		ExpiresAt:    time.Now().Add(emailChangeTokenExpiryMinutes * time.Minute),
	}

	if err := database.DB.Create(&record).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "Gagal menyimpan permintaan perubahan email",
			"data":    nil,
			"error":   err.Error(),
		})
		return
	}

	confirmURL := fmt.Sprintf("%s/settings?confirm_email_token=%s", resolveFrontendBaseURL(c), url.QueryEscape(rawToken))
	m := mailer.GetMailer()
	if err := m.SendEmailChangeConfirmation(oldEmail, namePlain, newEmail, confirmURL, emailChangeTokenExpiryMinutes); err != nil {
		log.Printf("[email-change] Gagal mengirim email konfirmasi ke %s: %v", oldEmail, err)
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "Gagal mengirim email konfirmasi ke alamat email lama Anda",
			"data":    nil,
			"error":   err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": fmt.Sprintf("Tautan konfirmasi telah dikirim ke inbox email lama Anda (%s).", oldEmail),
		"data": gin.H{
			"old_email":          oldEmail,
			"new_email":          newEmail,
			"expires_in_minutes": emailChangeTokenExpiryMinutes,
		},
		"error": nil,
	})
}

// ConfirmEmailChangeService menangani POST /user/email/confirm.
// Memverifikasi token konfirmasi yang diklik dari email lama dan memperbarui alamat email pengguna.
func ConfirmEmailChangeService(c *gin.Context) {
	var req dto.ConfirmEmailChangeRequest
	if err := c.ShouldBindJSON(&req); err != nil || strings.TrimSpace(req.Token) == "" {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "Token konfirmasi perubahan email tidak valid",
			"data":    nil,
			"error":   "Invalid token",
		})
		return
	}

	rawToken := strings.TrimSpace(req.Token)
	sum := sha256.Sum256([]byte(rawToken))
	tokenHash := hex.EncodeToString(sum[:])

	var changeReq entity.EmailChangeRequest
	if err := database.DB.Where("token_hash = ?", tokenHash).First(&changeReq).Error; err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "Tautan konfirmasi tidak ditemukan atau tidak valid",
			"data":    nil,
			"error":   "Token not found",
		})
		return
	}

	if changeReq.UsedAt != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "Tautan konfirmasi ini sudah pernah digunakan",
			"data":    nil,
			"error":   "Token already used",
		})
		return
	}

	if time.Now().After(changeReq.ExpiresAt) {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "Tautan konfirmasi sudah kedaluwarsa. Silakan ajukan perubahan email kembali.",
			"data":    nil,
			"error":   "Token expired",
		})
		return
	}

	var user entity.User
	if err := database.DB.First(&user, changeReq.UserUID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"success": false,
			"message": "Pengguna tidak ditemukan",
			"data":    nil,
			"error":   err.Error(),
		})
		return
	}

	if user.EmailHash != changeReq.OldEmailHash {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "Alamat email akun sudah berubah sejak permintaan ini diajukan",
			"data":    nil,
			"error":   "Stale email change request",
		})
		return
	}

	var existing entity.User
	if err := database.DB.Where("email_hash = ? AND uid <> ?", changeReq.NewEmailHash, user.Uid).First(&existing).Error; err == nil {
		c.JSON(http.StatusConflict, gin.H{
			"success": false,
			"message": "Alamat email baru sudah digunakan oleh akun lain",
			"data":    nil,
			"error":   "Email already registered",
		})
		return
	} else if !errors.Is(err, gorm.ErrRecordNotFound) {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "Gagal memeriksa ketersediaan alamat email",
			"data":    nil,
			"error":   err.Error(),
		})
		return
	}

	newEmailPlain, err := utils.Decrypt(changeReq.NewEmail)
	if err != nil || strings.TrimSpace(newEmailPlain) == "" {
		newEmailPlain = changeReq.NewEmail
	}
	newEmailPlain = strings.ToLower(strings.TrimSpace(newEmailPlain))

	encEmail, err := utils.Encrypt(newEmailPlain)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "Gagal mengenkripsi alamat email baru",
			"data":    nil,
			"error":   err.Error(),
		})
		return
	}

	now := time.Now()
	if err := database.DB.Transaction(func(tx *gorm.DB) error {
		if err := tx.Model(&user).Updates(map[string]any{
			"email":      encEmail,
			"email_hash": changeReq.NewEmailHash,
		}).Error; err != nil {
			return err
		}
		if err := tx.Model(&changeReq).Update("used_at", &now).Error; err != nil {
			return err
		}
		return nil
	}); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "Gagal memperbarui alamat email",
			"data":    nil,
			"error":   err.Error(),
		})
		return
	}
	cache.InvalidateAuthSession(changeReq.OldEmailHash)

	nameDecrypted, _ := utils.Decrypt(user.Name)

	expiration := time.Now().Add(24 * time.Hour)
	token, err := middleware.GenerateJWT(changeReq.NewEmailHash, expiration)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "Alamat email diperbarui tetapi gagal membuat token sesi baru",
			"data":    nil,
			"error":   err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Alamat email berhasil diperbarui!",
		"data": gin.H{
			"uid":        user.Uid,
			"name":       nameDecrypted,
			"email":      newEmailPlain,
			"avatar_url": user.AvatarURL,
			"role":       user.Role,
			"token":      token,
			"expires_at": expiration.Format(time.RFC3339),
		},
		"error": nil,
	})
}
