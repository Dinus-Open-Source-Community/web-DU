package middleware

import (
	"backend/internal/database"
	"backend/internal/model/entity"
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
)

// Konstanta context key yang digunakan untuk menyimpan data user (Name dan Email)
// di dalam context Gin agar bisa diakses pada handler selanjutnya.
const (
	IDCK = "id"
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

		var userData entity.User
		_ = database.DB.Model(&entity.User{}).Where("email_hash = ?", claims.Key).First(&userData).Error

		// Simpan data Name dan Email dari claims ke context.
		// Data ini bisa diambil di handler menggunakan c.Get(NameCK) atau c.Get(EmailCK).
		c.Set(IDCK, userData.ID)

		// Lanjutkan ke handler berikutnya jika token valid.
		c.Next()
	}
}
