package services

import (
	"net/http"
	"github.com/gin-gonic/gin"
)

// hello
func GetServicefunc(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{
		"message": "Hello from Golang Backend!",
	})
}

// function logic login
func PostLoginFunc(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{
		"message": "User logged in successfully!",
	})
}

// function logic register
func PostRegisterFunc(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{
		"message": "User registered successfully!",
	})
}