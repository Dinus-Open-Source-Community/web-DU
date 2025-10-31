package middleware

import (
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
)

const (
	NameCK = "name"
	EmailCK = "email"
)

func AuthMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		auth := c.GetHeader("Authorization")
		if auth == "" {
			c.JSON(http.StatusUnauthorized, gin.H{
				"success": false,
				"message": "Authorization header missing",
				"data":    nil,
				"error":   nil,
			})
			return
		}

		authSplit := strings.Fields(auth)
		if len(authSplit) != 2 || strings.ToLower(authSplit[0]) != "bearer" {
			c.JSON(http.StatusUnauthorized, gin.H{
				"success": false,
				"message": "Invalid Authorization header format",
				"data":    nil,
				"error":   nil,
			})
			return
		}

		claims, err := ParseToken(authSplit[1])
		if err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{
				"success": false,
				"message": err.Error(),
				"data":    nil,
				"error":   nil,
			})
			return
		}

		c.Set(NameCK, claims.Name)
		c.Set(EmailCK, claims.Email)
		c.Next()
	}
}
