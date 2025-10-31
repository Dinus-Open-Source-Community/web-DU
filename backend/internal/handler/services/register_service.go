package services

import (
	"backend/internal/database"
	"backend/internal/model"
	"backend/internal/utils"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/jackc/pgx/v5/pgconn"
)

func PostRegisterFunc(c *gin.Context) {
	var req model.RegisterRequest

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "Invalid request data",
			"data":    nil,
			"error":   err.Error(),
		})
		return
	}

	hashedPassword, err := utils.HashPassword(req.Password)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "Internal server error",
			"data":    nil,
			"error":   err.Error(),
		})
		return
	}

	newUser := model.User{
		Name:     req.Name,
		Email:    req.Email,
		Password: hashedPassword,
		Role:     model.StudentRole,
	}

	err = database.DB.Create(&newUser).Error
	if err != nil {
		if pgErr, ok := err.(*pgconn.PgError); ok && pgErr.Code == "23505" {
			c.JSON(http.StatusConflict, gin.H{
				"success": false,
				"message": "Email already registered",
				"data":    nil,
				"error":   nil,
			})
			return
		}

		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "Failed to register user",
			"data":    nil,
			"error":   err.Error(),
		})
		return
		
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "User registered successfully!",
		"data":    nil,
		"error":   nil,
	})
}
