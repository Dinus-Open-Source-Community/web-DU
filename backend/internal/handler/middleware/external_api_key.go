package middleware

import (
	"crypto/subtle"
	"net/http"
	"os"
	"strings"

	"github.com/gin-gonic/gin"
)

func ExternalAPIKeyMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		apiKey := strings.TrimSpace(os.Getenv("REDEEM_CODE_API_KEY"))
		providedKey := c.GetHeader("X-API-Key")
		if apiKey == "" || providedKey == "" || subtle.ConstantTimeCompare([]byte(providedKey), []byte(apiKey)) != 1 {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{
				"success": false,
				"message": "Invalid or missing API key",
				"data":    nil,
				"error":   "Unauthorized",
			})
			return
		}

		c.Next()
	}
}
