package middleware

import (
	"fmt"
	"net/http"
	"os"
	"time"

	"github.com/gin-gonic/gin"
)

/*
 * 		Middleware kanggo loggin yoo ati-ati
 */

func LogginForMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		startTime := time.Now()

		c.Next() // lanjut reng middleware sak teruse yo

		latency := time.Since(startTime)
		statusCode := c.Writer.Status()
		method := c.Request.Method
		path := c.FullPath()
		fmt.Printf("[%d] %s %s | %v\n", statusCode, method, path, latency)
	}
}

/*
* iki kanggo auth ya nk kurang srek angger di ubah rapopo, sans
 */

func AuthForMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		// jipok token soko .env yo 
		accesToken := os.Getenv("AUTH_TOKEN")
		token := c.GetHeader("Authorization")

		if token != accesToken {
			// iki aku karo net/http
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"message": "Unauthorize"})
			return
		}
		c.Next()
	}
}

/*
* iki kanggo error handling, iki angger tak kei code 500
* karo tak kei message, nk ape karo
 */

func ErrorHandlerMiddleware() gin.HandlerFunc {
	return func(ctx *gin.Context) {
		defer func() {
			if err := recover(); err != nil {
				ctx.JSON(500, gin.H{"message": "Internal Server Error"})
			}
		}()
		ctx.Next()
	}
}
