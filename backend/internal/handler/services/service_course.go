package services

import (
	"backend/internal/database"
	"backend/internal/handler/middleware"
	"backend/internal/model"
	"net/http"

	"github.com/gin-gonic/gin"
)

func PostAdminCourseFunc(c *gin.Context) {
	userID, _ := c.Get(middleware.IDCK)

	var userData model.User
	if err := database.DB.First(&userData, userID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"success": false,
			"message": "User not found",
			"data":    nil,
			"error":   err.Error(),
		})
		return
	}

	if userData.Role != model.AdminRole {
		c.JSON(http.StatusForbidden, gin.H{
			"success": false,
			"message": "Create Course Access denied: Admins only",
			"data":    nil,
			"error":   nil,
		})
		return
	}

	var body model.AdminCourseRequest
	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "Invalid request data",
			"data":    nil,
			"error":   err.Error(),
		})
		return
	}

	course := model.Course{
		Title:       body.Title,
		Slug:        body.Slug,
		Description: body.Description,
		Price:       float64(body.Price),
		IsPremium:   body.IsPremium,
		IsPublished: body.IsPublished,
	}

	if err := database.DB.Create(&course).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "Failed to create course",
			"data":    nil,
			"error":   err.Error(),
		})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"success": true,
		"message": "Course created successfully",
		"data":    course,
		"error":   nil,
	})
}

func GetAllCoursesFunc(c *gin.Context) {
	userID, _ := c.Get(middleware.IDCK)

	var userData model.User
	if err := database.DB.First(&userData, userID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"success": false,
			"message": "User not found",
			"data":    nil,
			"error":   err.Error(),
		})
		return
	}

	if userData.Role != model.AdminRole {
		c.JSON(http.StatusForbidden, gin.H{
			"success": false,
			"message": "Get All Courses Access denied: Admins only",
			"data":    nil,
			"error":   nil,
		})
		return
	}

	var courses []model.Course
	if err := database.DB.Find(&courses).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "Failed to retrieve courses",
			"data":    nil,
			"error":   err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Courses retrieved successfully",
		"data":    courses,
		"error":   nil,
	})
}

func GetCourseByIDFunc(c *gin.Context) {
	courseID := c.Param("id")

	var course model.Course
	if err := database.DB.First(&course, courseID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"success": false,
			"message": "Course not found",
			"data":    nil,
			"error":   err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Course retrieved successfully",
		"data":    course,
		"error":   nil,
	})
}