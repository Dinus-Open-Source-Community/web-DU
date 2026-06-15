package middleware

import (
	"github.com/gin-gonic/gin"
	"net/http"
	"os"
	"strings"
)

// CORSMiddleware membatasi akses lintas-origin ke daftar origin yang diizinkan.
func CORSMiddleware() gin.HandlerFunc {
	allowedOrigins := []string{
		"http://localhost:3000",
		"http://127.0.0.1:3000",
		"http://localhost:3001",
		"http://localhost:4173",
		"http://127.0.0.1:4173",
		"http://localhost:5173",
		"https://3gg4ww8n-5173.asse.devtunnels.ms",
		"http://3gg4ww8n-5173.asse.devtunnels.ms",
		"http://127.0.0.1:5173",
		"http://localhost:5174",
		"http://127.0.0.1:5174",
	}

	if rawOrigins := strings.TrimSpace(os.Getenv("CORS_ALLOWED_ORIGINS")); rawOrigins != "" {
		parsedOrigins := make([]string, 0)
		for _, origin := range strings.Split(rawOrigins, ",") {
			origin = strings.TrimSpace(origin)
			if origin != "" {
				parsedOrigins = append(parsedOrigins, origin)
			}
		}

		if len(parsedOrigins) > 0 {
			allowedOrigins = parsedOrigins
		}
	}

	originSet := make(map[string]struct{}, len(allowedOrigins))
	for _, origin := range allowedOrigins {
		originSet[origin] = struct{}{}
	}

	return func(c *gin.Context) {
		requestOrigin := c.GetHeader("Origin")
		if requestOrigin != "" {
			if _, ok := originSet[requestOrigin]; ok {
				c.Header("Access-Control-Allow-Origin", requestOrigin)
				c.Header("Vary", "Origin")
				c.Header("Access-Control-Allow-Credentials", "true")
				c.Header("Access-Control-Allow-Methods", "GET,POST,PUT,PATCH,DELETE,OPTIONS")
				c.Header("Access-Control-Allow-Headers", "Origin,Content-Type,Accept,Authorization,X-Requested-With")
				c.Header("Access-Control-Expose-Headers", "Content-Length,Content-Type")
			}
		}

		if c.Request.Method == http.MethodOptions {
			if requestOrigin == "" {
				c.AbortWithStatus(http.StatusNoContent)
				return
			}

			if _, ok := originSet[requestOrigin]; !ok {
				c.AbortWithStatus(http.StatusForbidden)
				return
			}

			c.AbortWithStatus(http.StatusNoContent)
			return
		}

		c.Next()
	}
}
