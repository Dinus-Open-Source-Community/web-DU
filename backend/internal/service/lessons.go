package service

import (
	"backend/internal/database"
	"backend/internal/model/dto"
	"backend/internal/model/entity"
	"encoding/json"
	"errors"
	"net/http"
	"regexp"
	"strconv"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

// @Summary      Create new lesson (Admin/Mentor)
// @Description  Create a new lesson for a module. Accessible by admin or assigned mentor.
// @Tags         Lesson
// @Accept       json
// @Produce      json
// @Security     BearerAuth
// @Param        request  body  dto.LessonCreateRequest  true  "Lesson data with module_id, title, content"
// @Success      201  {object}  map[string]any  "Lesson created successfully"
// @Failure      400  {object}  map[string]any  "Invalid request data"
// @Failure      401  {object}  map[string]any  "Unauthorized"
// @Failure      403  {object}  map[string]any  "Access denied"
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
	userData, ok := getAuthenticatedUser(c)
	if !ok {
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

	var module entity.Module
	if err := database.DB.First(&module, req.ModuleUid).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"success": false,
			"message": "Module not found",
			"data":    nil,
			"error":   err.Error(),
		})
		return
	}

	allowed, err := canManageCourseByRole(userData, module.CourseUid)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "message": "Failed to validate access", "data": nil, "error": err.Error()})
		return
	}
	if !allowed {
		c.JSON(http.StatusForbidden, gin.H{"success": false, "message": "Access denied: Admin or assigned mentor only", "data": nil, "error": nil})
		return
	}

	contentType, err := resolveCreateLessonContentType(req.ContentType, req.VideoURL)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": "Invalid lesson content_type", "data": nil, "error": err.Error()})
		return
	}

	if err := validateLessonPayload(contentType, req.Content, req.VideoURL); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": "Invalid lesson payload", "data": nil, "error": err.Error()})
		return
	}

	var content json.RawMessage
	if req.Content != nil {
		contentBytes, _ := json.Marshal(req.Content)
		content = contentBytes
	}

	// Parse StartTime and EndTime
	var startTime, endTime time.Time
	if req.StartTime != "" {
		if parsed, err := time.Parse(time.RFC3339, req.StartTime); err == nil {
			startTime = parsed
		}
	}
	if req.EndTime != "" {
		if parsed, err := time.Parse(time.RFC3339, req.EndTime); err == nil {
			endTime = parsed
		}
	}

	lesson := entity.Lesson{
		ModuleUid:   req.ModuleUid,
		Title:       req.Title,
		ContentType: contentType,
		Content:     content,
		VideoURL:    req.VideoURL,
		StartTime:   startTime,
		EndTime:     endTime,
		OrderIndex:  req.OrderIndex,
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

// GetAllLessonsFunc retrieves all lessons with pagination and optional module filter.
//
// Query parameters (all optional):
// - page (int, default 1)
// - per_page (int, default 10, max 100)
// - module_id (int) -> filter by module ID
//
// @Summary      Get all lessons with pagination (Admin/Mentor)
// @Description  Retrieve paginated list of all lessons with optional module_id filter.
// @Tags         Lesson
// @Accept       json
// @Produce      json
// @Security     BearerAuth
// @Param        page       query  int  false  "Page number (default: 1, minimum: 1)"
// @Param        per_page   query  int  false  "Items per page (default: 10, max: 100)"
// @Param        module_id  query  int  false  "Filter by module ID"
// @Success      200  {object}  map[string]any  "Lessons retrieved successfully with pagination metadata"
// @Failure      401  {object}  map[string]any  "Unauthorized"
// @Failure      403  {object}  map[string]any  "Access denied"
// @Failure      404  {object}  map[string]any  "User not found"
// @Failure      500  {object}  map[string]any  "Failed to retrieve lessons"
// @Router       /lessons [get]
func GetAllLessonsFunc(c *gin.Context) {
	userData, ok := getAuthenticatedUser(c)
	if !ok {
		return
	}

	// Parse query params
	pageStr := c.DefaultQuery("page", "1")
	perPageStr := c.DefaultQuery("per_page", "10")
	moduleIDStr := c.Query("module_id")

	page, err := strconv.Atoi(pageStr)
	if err != nil || page < 1 {
		page = 1
	}
	perPage, err := strconv.Atoi(perPageStr)
	if err != nil || perPage < 1 {
		perPage = 10
	}
	const maxPerPage = 100
	if perPage > maxPerPage {
		perPage = maxPerPage
	}

	db := database.DB.Model(&entity.Lesson{})

	if moduleIDStr != "" {
		if moduleUid, err := uuid.Parse(moduleIDStr); err == nil {
			if userData.Role == entity.MentorRole {
				var module entity.Module
				if err := database.DB.First(&module, moduleUid).Error; err != nil {
					c.JSON(http.StatusNotFound, gin.H{"success": false, "message": "Module not found", "data": nil, "error": err.Error()})
					return
				}

				allowed, err := canManageCourseByRole(userData, module.CourseUid)
				if err != nil {
					c.JSON(http.StatusInternalServerError, gin.H{"success": false, "message": "Failed to validate access", "data": nil, "error": err.Error()})
					return
				}
				if !allowed {
					c.JSON(http.StatusForbidden, gin.H{"success": false, "message": "Access denied: Admin or assigned mentor only", "data": nil, "error": nil})
					return
				}
			}
			db = db.Where("module_uid = ?", moduleUid)
		}
	}

	if userData.Role == entity.MentorRole && moduleIDStr == "" {
		db = db.Where("module_uid IN (?)",
			database.DB.Table("modules m").
				Select("m.uid").
				Joins("JOIN courses c ON c.uid = m.course_uid").
				Joins("LEFT JOIN course_mentors cm ON cm.course_uid = c.uid AND cm.mentor_uid = ?", userData.Uid).
				Where("c.mentor_uid = ? OR cm.status IN ?", userData.Uid, []entity.CourseMentorStatus{entity.CourseMentorSelected, entity.CourseMentorJoined}),
		)
	}

	// Count total records
	var total int64
	if err := db.Count(&total).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "Failed to count lessons",
			"data":    nil,
			"error":   err.Error(),
		})
		return
	}

	// Apply pagination
	offset := (page - 1) * perPage
	var lessons []entity.Lesson
	if err := db.Order("order_index ASC").Limit(perPage).Offset(offset).Find(&lessons).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "Failed to retrieve lessons",
			"data":    nil,
			"error":   err.Error(),
		})
		return
	}

	totalPages := int((total + int64(perPage) - 1) / int64(perPage))

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Lessons retrieved successfully",
		"data": gin.H{
			"lessons": lessons,
			"meta": gin.H{
				"total":        total,
				"per_page":     perPage,
				"current_page": page,
				"total_pages":  totalPages,
			},
		},
		"error": nil,
	})
}

// GetLessonByIDFunc retrieves a single lesson by ID.
//
// @Summary      Get lesson by ID (Admin/Mentor)
// @Description  Retrieve detailed information of a specific lesson.
// @Tags         Lesson
// @Accept       json
// @Produce      json
// @Security     BearerAuth
// @Param        id  path  int  true  "Lesson ID"
// @Success      200  {object}  map[string]any  "Lesson retrieved successfully"
// @Failure      401  {object}  map[string]any  "Unauthorized"
// @Failure      403  {object}  map[string]any  "Access denied"
// @Failure      404  {object}  map[string]any  "Lesson or user not found"
// @Failure      500  {object}  map[string]any  "Failed to retrieve lesson"
// @Router       /lessons/{id} [get]
func GetLessonByIDFunc(c *gin.Context) {
	userData, ok := getAuthenticatedUser(c)
	if !ok {
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

	if userData.Role == entity.MentorRole {
		var module entity.Module
		if err := database.DB.First(&module, lesson.ModuleUid).Error; err != nil {
			c.JSON(http.StatusNotFound, gin.H{"success": false, "message": "Module not found", "data": nil, "error": err.Error()})
			return
		}

		allowed, err := canManageCourseByRole(userData, module.CourseUid)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"success": false, "message": "Failed to validate access", "data": nil, "error": err.Error()})
			return
		}
		if !allowed {
			c.JSON(http.StatusForbidden, gin.H{"success": false, "message": "Access denied: Admin or assigned mentor only", "data": nil, "error": nil})
			return
		}
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Lesson retrieved successfully",
		"data":    lesson,
		"error":   nil,
	})
}

// UpdateLessonFunc updates an existing lesson (Admin/Mentor).
//
// @Summary      Update lesson (Admin/Mentor)
// @Description  Update an existing lesson by ID. All fields are optional - only provided fields will be updated.
// @Tags         Lesson
// @Accept       json
// @Produce      json
// @Security     BearerAuth
// @Param        id       path  int     true  "Lesson ID to update"
// @Param        request  body  dto.LessonUpdateRequest  true  "Updated lesson data (all fields optional)"
// @Success      200  {object}  map[string]any  "Lesson updated successfully"
// @Failure      400  {object}  map[string]any  "Invalid request data"
// @Failure      401  {object}  map[string]any  "Unauthorized"
// @Failure      403  {object}  map[string]any  "Access denied"
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
	userData, ok := getAuthenticatedUser(c)
	if !ok {
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

	var currentModule entity.Module
	if err := database.DB.First(&currentModule, lesson.ModuleUid).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"success": false, "message": "Module not found", "data": nil, "error": err.Error()})
		return
	}

	allowed, err := canManageCourseByRole(userData, currentModule.CourseUid)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "message": "Failed to validate access", "data": nil, "error": err.Error()})
		return
	}
	if !allowed {
		c.JSON(http.StatusForbidden, gin.H{"success": false, "message": "Access denied: Admin or assigned mentor only", "data": nil, "error": nil})
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

	if req.ModuleUid != uuid.Nil {
		var targetModule entity.Module
		if err := database.DB.First(&targetModule, req.ModuleUid).Error; err != nil {
			c.JSON(http.StatusNotFound, gin.H{"success": false, "message": "Target module not found", "data": nil, "error": err.Error()})
			return
		}

		allowedTarget, err := canManageCourseByRole(userData, targetModule.CourseUid)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"success": false, "message": "Failed to validate target module access", "data": nil, "error": err.Error()})
			return
		}
		if !allowedTarget {
			c.JSON(http.StatusForbidden, gin.H{"success": false, "message": "Access denied to target module", "data": nil, "error": nil})
			return
		}
		lesson.ModuleUid = req.ModuleUid
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

	contentType, err := resolveUpdateLessonContentType(lesson.ContentType, req.ContentType, lesson.VideoURL)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": "Invalid lesson content_type", "data": nil, "error": err.Error()})
		return
	}

	if err := validateLessonPayload(contentType, json.RawMessage(lesson.Content), lesson.VideoURL); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": "Invalid lesson payload", "data": nil, "error": err.Error()})
		return
	}

	lesson.ContentType = contentType
	if req.StartTime != "" {
		if parsed, err := time.Parse(time.RFC3339, req.StartTime); err == nil {
			lesson.StartTime = parsed
		}
	}
	if req.EndTime != "" {
		if parsed, err := time.Parse(time.RFC3339, req.EndTime); err == nil {
			lesson.EndTime = parsed
		}
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

// DeleteLessonFunc deletes a lesson by ID (Admin/Mentor).
//
// @Summary      Delete lesson (Admin/Mentor)
// @Description  Delete a lesson by ID
// @Tags         Lesson
// @Accept       json
// @Produce      json
// @Security     BearerAuth
// @Param        id  path  int  true  "Lesson ID"
// @Success      200  {object}  map[string]any  "Lesson deleted successfully"
// @Failure      401  {object}  map[string]any  "Unauthorized"
// @Failure      403  {object}  map[string]any  "Access denied"
// @Failure      404  {object}  map[string]any  "Lesson not found"
// @Failure      500  {object}  map[string]any  "Failed to delete lesson"
// @Router       /lessons/{id} [delete]
func DeleteLessonFunc(c *gin.Context) {
	userData, ok := getAuthenticatedUser(c)
	if !ok {
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

	var module entity.Module
	if err := database.DB.First(&module, lesson.ModuleUid).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"success": false, "message": "Module not found", "data": nil, "error": err.Error()})
		return
	}

	allowed, err := canManageCourseByRole(userData, module.CourseUid)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "message": "Failed to validate access", "data": nil, "error": err.Error()})
		return
	}
	if !allowed {
		c.JSON(http.StatusForbidden, gin.H{"success": false, "message": "Access denied: Admin or assigned mentor only", "data": nil, "error": nil})
		return
	}

	if err := database.DB.Where("lesson_uid = ?", lesson.Uid).Delete(&entity.LessonAttendance{}).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "message": "Failed to delete lesson attendances", "data": nil, "error": err.Error()})
		return
	}

	if err := database.DB.Where("lesson_uid = ?", lesson.Uid).Delete(&entity.LessonAssignment{}).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "message": "Failed to delete lesson assignment", "data": nil, "error": err.Error()})
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

var youtubeURLRegex = regexp.MustCompile(`^(https?://)?(www\.)?(youtube\.com/watch\?v=|youtu\.be/)[A-Za-z0-9_-]+`)

func resolveCreateLessonContentType(rawType string, videoURL string) (entity.LessonContentType, error) {
	normalized := strings.ToLower(strings.TrimSpace(rawType))
	if normalized == "" {
		if strings.TrimSpace(videoURL) != "" {
			return entity.LessonContentTypeVideo, nil
		}
		return entity.LessonContentTypeText, nil
	}

	contentType := entity.LessonContentType(normalized)
	if contentType != entity.LessonContentTypeText && contentType != entity.LessonContentTypeVideo {
		return "", errors.New("content_type must be one of: text, video")
	}
	return contentType, nil
}

func resolveUpdateLessonContentType(current entity.LessonContentType, rawType string, videoURL string) (entity.LessonContentType, error) {
	if strings.TrimSpace(rawType) == "" {
		if current == "" {
			return resolveCreateLessonContentType("", videoURL)
		}
		return current, nil
	}

	return resolveCreateLessonContentType(rawType, videoURL)
}

func validateLessonPayload(contentType entity.LessonContentType, content interface{}, videoURL string) error {
	trimmedVideoURL := strings.TrimSpace(videoURL)
	switch contentType {
	case entity.LessonContentTypeText:
		if content == nil {
			return errors.New("content is required for text lessons")
		}
		if trimmedVideoURL != "" {
			return errors.New("video_url must be empty for text lessons")
		}
	case entity.LessonContentTypeVideo:
		if trimmedVideoURL == "" {
			return errors.New("video_url is required for video lessons")
		}
		if !youtubeURLRegex.MatchString(trimmedVideoURL) {
			return errors.New("video_url must be a valid YouTube URL")
		}
	default:
		return errors.New("invalid content_type")
	}
	return nil
}
