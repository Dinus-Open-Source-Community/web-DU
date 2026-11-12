package middleware

import (
	"backend/internal/cache"
	"backend/internal/database"
	"backend/internal/model/entity"
	"context"
	"log"
	"net/http"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

// Konstanta context key untuk menyimpan uid pengguna (UUID) dan role dari JWT.
const (
	UIDCK  = "uid"
	RoleCK = "role"
)

// AuthMiddleware adalah middleware yang digunakan untuk memverifikasi token JWT
// dari header Authorization setiap kali request masuk ke endpoint yang dilindungi.
func AuthMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		// Ambil header Authorization dari request.
		auth := c.GetHeader("Authorization")
		if auth == "" {
			// Jika header tidak ada, kembalikan response error 401 Unauthorized.
			c.JSON(http.StatusUnauthorized, gin.H{
				"success": false,
				"message": "Authorization header missing",
				"data":    nil,
				"error":   nil,
			})
			c.Abort() // hentikan proses middleware selanjutnya
			return
		}

		// Support both formats: "Bearer <token>" atau langsung "<token>"
		var tokenStr string
		authSplit := strings.Fields(auth)

		if len(authSplit) == 2 && strings.ToLower(authSplit[0]) == "bearer" {
			// Format: "Bearer <token>"
			tokenStr = authSplit[1]
		} else if len(authSplit) == 1 {
			// Format: langsung token tanpa "Bearer"
			tokenStr = authSplit[0]
		} else {
			c.JSON(http.StatusUnauthorized, gin.H{
				"success": false,
				"message": "Invalid Authorization header format",
				"data":    nil,
				"error":   nil,
			})
			c.Abort()
			return
		}

		// Verifikasi token JWT menggunakan fungsi ParseToken().
		claims, err := ParseToken(tokenStr)
		if err != nil {
			// Jika token tidak valid atau parsing gagal, kirim response error 401 Unauthorized.
			c.JSON(http.StatusUnauthorized, gin.H{
				"success": false,
				"message": err.Error(),
				"data":    nil,
				"error":   nil,
			})
			c.Abort()
			return
		}

		var userUID uuid.UUID
		var role entity.UserRole
		var isVerified bool
		var session cache.AuthSession
		var authVersion string
		cacheHit := false
		if cache.Default != nil && cache.Default.Available() {
			cacheCtx, cancel := context.WithTimeout(c.Request.Context(), 250*time.Millisecond)
			session, authVersion, cacheHit, err = cache.Default.GetAuthSession(cacheCtx, claims.Key)
			cancel()
			if err != nil {
				log.Printf("redis auth cache lookup failed: %v", err)
				cacheHit = false
			}
		}
		if cacheHit {
			userUID, err = uuid.Parse(session.UserUID)
			if err != nil {
				cacheHit = false
			}
			role = entity.UserRole(session.Role)
			isVerified = session.IsVerified
		}
		if !cacheHit {
			var userData entity.User
			err = database.DB.Model(&entity.User{}).Select("uid", "role", "is_verified").Where("email_hash = ?", claims.Key).First(&userData).Error
			if err == nil {
				userUID, role, isVerified = userData.Uid, userData.Role, userData.IsVerified
				if cache.Default != nil && cache.Default.Available() {
					cacheCtx, cancel := context.WithTimeout(c.Request.Context(), 250*time.Millisecond)
					if cacheErr := cache.Default.SetAuthSession(cacheCtx, claims.Key, authVersion, cache.AuthSession{
						UserUID: userUID.String(), Role: string(role), IsVerified: isVerified,
					}); cacheErr != nil {
						log.Printf("redis auth cache write failed: %v", cacheErr)
					}
					cancel()
				}
			}
		}
		if err != nil || userUID == uuid.Nil || !isVerified {
			c.JSON(http.StatusForbidden, gin.H{
				"success": false,
				"message": "Akun belum diverifikasi. Silakan verifikasi email Anda terlebih dahulu.",
				"data":    nil,
				"error":   "Account not verified",
			})
			c.Abort()
			return
		}

		// Simpan data Uid dan Role ke context.
		c.Set(UIDCK, userUID)
		c.Set(RoleCK, role)

		// Lanjutkan ke handler berikutnya jika token valid.
		c.Next()
	}
}

// RequireRoleMiddleware memvalidasi bahwa pengguna yang telah diautentikasi memiliki salah satu role yang diizinkan.
func RequireRoleMiddleware(allowedRoles ...entity.UserRole) gin.HandlerFunc {
	return func(c *gin.Context) {
		roleVal, exists := c.Get(RoleCK)
		if !exists {
			uidVal, uidExists := c.Get(UIDCK)
			if !uidExists {
				c.JSON(http.StatusUnauthorized, gin.H{
					"success": false,
					"message": "Autentikasi diperlukan",
					"data":    nil,
					"error":   "Unauthorized",
				})
				c.Abort()
				return
			}

			var user entity.User
			if err := database.DB.Select("role").First(&user, uidVal).Error; err != nil {
				c.JSON(http.StatusUnauthorized, gin.H{
					"success": false,
					"message": "Pengguna tidak ditemukan",
					"data":    nil,
					"error":   err.Error(),
				})
				c.Abort()
				return
			}
			roleVal = user.Role
			c.Set(RoleCK, user.Role)
		}

		userRole, ok := roleVal.(entity.UserRole)
		if !ok {
			if strRole, isStr := roleVal.(string); isStr {
				userRole = entity.UserRole(strRole)
			}
		}

		for _, allowed := range allowedRoles {
			if userRole == allowed {
				c.Next()
				return
			}
		}

		c.JSON(http.StatusForbidden, gin.H{
			"success": false,
			"message": "Akses ditolak: fitur ini hanya dapat diakses oleh role yang ditentukan",
			"data":    nil,
			"error":   "Forbidden access",
		})
		c.Abort()
	}
}

// StudentOnlyMiddleware memastikan request hanya dapat diproses oleh pengguna dengan role student.
func StudentOnlyMiddleware() gin.HandlerFunc {
	return RequireRoleMiddleware(entity.StudentRole)
}
