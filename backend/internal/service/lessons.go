package service

import (
	"backend/internal/database"
	"backend/internal/handler/middleware"
	"backend/internal/model/dto"
	"backend/internal/model/entity"
	"encoding/json"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

// @Summary      Create new lesson
// @Description  Create a new lesson for a module. Admin only. Requires module_id and title. Content and video_url are optional.
// @Tags         Lesson
// @Accept       json
// @Produce      json
// @Security     BearerAuth
// @Param        request  body  dto.LessonCreateRequest  true  "Lesson data with module_id, title, content"
// @Success      201  {object}  map[string]any  "Lesson created successfully"
// @Failure      400  {object}  map[string]any  "Invalid request data"
// @Failure      401  {object}  map[string]any  "Unauthorized"
// @Failure      403  {object}  map[string]any  "Access denied: Admins only"
// @Failure      404  {object}  map[string]any  "User or module not found"
// @Failure      500  {object}  map[string]any  "Failed to create lesson"
// @Router       /lessons [post]
// Example:
//
//	{
//	  "module_id": 1,
//	  "title": "Introduction to Go Programming",
//	  "content": "Learn the basics of Go programming language including syntax, variables, and control flow.",
//	  "video_url": "https://example.com/videos/go-intro.mp4",
//	  "order_index": 1
//	}
func CreateLessonFunc(c *gin.Context) {
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
			"message": "Access denied: Admins only",
			"data":    nil,
			"error":   nil,
		})
		return
	}

	var req dto.LessonCreateRequest

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "Invalid request data",
			"data":    nil,
			"error":   err.Error(),
		})
		return
	}

	var content json.RawMessage
	if req.Content != nil {
		contentBytes, _ := json.Marshal(req.Content)
		content = contentBytes
	}

	lesson := entity.Lesson{
		ModuleID:   req.ModuleID,
		Title:      req.Title,
		Content:    content,
		VideoURL:   req.VideoURL,
		OrderIndex: req.OrderIndex,
	}

	if err := database.DB.Create(&lesson).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "Failed to create lesson",
			"data":    nil,
			"error":   err.Error(),
		})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"success": true,
		"message": "Lesson created successfully",
		"data":    lesson,
		"error":   nil,
	})
}

// GetAllLessonsFunc retrieves all lessons with optional module filter.
//
// @Summary      Get all lessons
// @Description  Retrieve all lessons with optional module_id filter. Admin only.
// @Tags         Lesson
// @Accept       json
// @Produce      json
// @Security     BearerAuth
// @Param        module_id  query  int  false  "Filter by module ID"
// @Success      200  {object}  map[string]any  "Lessons retrieved successfully"
// @Failure      401  {object}  map[string]any  "Unauthorized"
// @Failure      403  {object}  map[string]any  "Access denied: Admins only"
// @Failure      404  {object}  map[string]any  "User not found"
// @Failure      500  {object}  map[string]any  "Failed to retrieve lessons"
// @Router       /lessons [get]
func GetAllLessonsFunc(c *gin.Context) {
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
			"message": "Access denied: Admins only",
			"data":    nil,
			"error":   nil,
		})
		return
	}

	db := database.DB.Model(&entity.Lesson{})

	// Filter by module_id if provided
	moduleIDStr := c.Query("module_id")
	if moduleIDStr != "" {
		moduleID, err := strconv.Atoi(moduleIDStr)
		if err == nil {
			db = db.Where("module_id = ?", moduleID)
		}
	}

	var lessons []entity.Lesson
	if err := db.Order("order_index ASC").Find(&lessons).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "Failed to retrieve lessons",
			"data":    nil,
			"error":   err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Lessons retrieved successfully",
		"data":    lessons,
		"error":   nil,
	})
}

// GetLessonByIDFunc retrieves a single lesson by ID.
//
// @Summary      Get lesson by ID
// @Description  Retrieve detailed information of a specific lesson. Admin only.
// @Tags         Lesson
// @Accept       json
// @Produce      json
// @Security     BearerAuth
// @Param        id  path  int  true  "Lesson ID"
// @Success      200  {object}  map[string]any  "Lesson retrieved successfully"
// @Failure      401  {object}  map[string]any  "Unauthorized"
// @Failure      403  {object}  map[string]any  "Access denied: Admins only"
// @Failure      404  {object}  map[string]any  "Lesson or user not found"
// @Failure      500  {object}  map[string]any  "Failed to retrieve lesson"
// @Router       /lessons/{id} [get]
func GetLessonByIDFunc(c *gin.Context) {
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
			"message": "Access denied: Admins only",
			"data":    nil,
			"error":   nil,
		})
		return
	}

	lessonID := c.Param("id")

	var lesson entity.Lesson
	if err := database.DB.First(&lesson, lessonID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"success": false,
			"message": "Lesson not found",
			"data":    nil,
			"error":   err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Lesson retrieved successfully",
		"data":    lesson,
		"error":   nil,
	})
}

// UpdateLessonFunc updates an existing lesson (Admin only).
//
// @Summary      Update lesson
// @Description  Update an existing lesson by ID. Admin only. All fields are optional - only provided fields will be updated.
// @Tags         Lesson
// @Accept       json
// @Produce      json
// @Security     BearerAuth
// @Param        id       path  int     true  "Lesson ID to update"
// @Param        request  body  dto.LessonUpdateRequest  true  "Updated lesson data (all fields optional)"
// @Success      200  {object}  map[string]any  "Lesson updated successfully"
// @Failure      400  {object}  map[string]any  "Invalid request data"
// @Failure      401  {object}  map[string]any  "Unauthorized"
// @Failure      403  {object}  map[string]any  "Access denied: Admins only"
// @Failure      404  {object}  map[string]any  "Lesson or user not found"
// @Failure      500  {object}  map[string]any  "Failed to update lesson"
// @Router       /lessons/{id} [put]
// Example:
//
//	{
//	  "title": "Advanced Go Programming",
//	  "content": "Master advanced Go concepts including goroutines, channels, and interfaces.",
//	  "video_url": "https://example.com/videos/go-advanced.mp4",
//	  "order_index": 2
//	}
func UpdateLessonFunc(c *gin.Context) {
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
			"message": "Access denied: Admins only",
			"data":    nil,
			"error":   nil,
		})
		return
	}

	lessonID := c.Param("id")

	var lesson entity.Lesson
	if err := database.DB.First(&lesson, lessonID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"success": false,
			"message": "Lesson not found",
			"data":    nil,
			"error":   err.Error(),
		})
		return
	}

	var req dto.LessonUpdateRequest

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "Invalid request data",
			"data":    nil,
			"error":   err.Error(),
		})
		return
	}

	// Update fields
	if req.ModuleID != 0 {
		lesson.ModuleID = req.ModuleID
	}
	if req.Title != "" {
		lesson.Title = req.Title
	}
	if req.Content != nil {
		contentBytes, _ := json.Marshal(req.Content)
		lesson.Content = contentBytes
	}
	if req.VideoURL != "" {
		lesson.VideoURL = req.VideoURL
	}
	lesson.OrderIndex = req.OrderIndex

	if err := database.DB.Save(&lesson).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "Failed to update lesson",
			"data":    nil,
			"error":   err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Lesson updated successfully",
		"data":    lesson,
		"error":   nil,
	})
}

// DeleteLessonFunc deletes a lesson by ID (Admin only).
//
// @Summary      Delete lesson
// @Description  Delete a lesson by ID (Admin only)
// @Tags         Lesson
// @Accept       json
// @Produce      json
// @Security     BearerAuth
// @Param        id  path  int  true  "Lesson ID"
// @Success      200  {object}  map[string]any  "Lesson deleted successfully"
// @Failure      401  {object}  map[string]any  "Unauthorized"
// @Failure      403  {object}  map[string]any  "Access denied: Admins only"
// @Failure      404  {object}  map[string]any  "Lesson not found"
// @Failure      500  {object}  map[string]any  "Failed to delete lesson"
// @Router       /lessons/{id} [delete]
func DeleteLessonFunc(c *gin.Context) {
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
			"message": "Access denied: Admins only",
			"data":    nil,
			"error":   nil,
		})
		return
	}

	lessonID := c.Param("id")

	var lesson entity.Lesson
	if err := database.DB.First(&lesson, lessonID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"success": false,
			"message": "Lesson not found",
			"data":    nil,
			"error":   err.Error(),
		})
		return
	}

	if err := database.DB.Delete(&lesson).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "Failed to delete lesson",
			"data":    nil,
			"error":   err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Lesson deleted successfully",
		"data":    nil,
		"error":   nil,
	})
}
