package service

import (
	"backend/internal/database"
	"backend/internal/handler/middleware"
	"backend/internal/model/entity"
	"net/http"
	"path/filepath"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

func PostAdminCourseFunc(c *gin.Context) {
	userID, _ := c.Get(middleware.IDCK)

	var userData entity.User
	if err := database.DB.First(&userData, userID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"success": false,
			"message": "User not found",
			"data":    nil,
			"error":   err.Error(),
		})
		return
	}

	if userData.Role != entity.AdminRole {
		c.JSON(http.StatusForbidden, gin.H{
			"success": false,
			"message": "Create Course Access denied: Admins only",
			"data":    nil,
			"error":   nil,
		})
		return
	}

	priceStr := c.PostForm("price")
	priceInt := 0
	if priceStr != "" {
		if p, err := strconv.Atoi(priceStr); err == nil {
			priceInt = p
		}
	}

	var thumbnailURL string
	file, err := c.FormFile("thumbnail")
	if err == nil && file != nil {
		extension := filepath.Ext(file.Filename)
		uniqueFilename := uuid.New().String() + extension
		uploadDir := "./public/uploads/courses"
		savePath := filepath.Join(uploadDir, uniqueFilename)

		if err := c.SaveUploadedFile(file, savePath); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{
				"success": false, "message": "Failed to save avatar file", "data": nil, "error": err.Error(),
			})
			return
		}
		thumbnailURL = "/uploads/courses/" + uniqueFilename
	}

	course := entity.Course{
		Title:        c.PostForm("title"),
		Slug:         c.PostForm("slug"),
		Description:  c.PostForm("description"),
		ThumbnailURL: thumbnailURL,
		Price:        float64(priceInt),
		IsPremium:    c.PostForm("is_premium") == "true",
		IsPublished:  c.PostForm("is_published") == "true",
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

	if err := database.DB.First(&course, course.ID).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "Failed to retrieve created course",
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

	var userData entity.User
	if err := database.DB.First(&userData, userID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"success": false,
			"message": "User not found",
			"data":    nil,
			"error":   err.Error(),
		})
		return
	}

	if userData.Role != entity.AdminRole {
		c.JSON(http.StatusForbidden, gin.H{
			"success": false,
			"message": "Get All Courses Access denied: Admins only",
			"data":    nil,
			"error":   nil,
		})
		return
	}

	var courses []entity.Course
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

	var course entity.Course
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
