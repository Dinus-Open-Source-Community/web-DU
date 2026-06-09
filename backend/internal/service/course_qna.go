package service

import (
	"net/http"
	"strings"

	"backend/internal/database"
	"backend/internal/handler/middleware"
	"backend/internal/model/dto"
	"backend/internal/model/entity"
	"backend/internal/utils"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

func requireEnrolledStudent(c *gin.Context, courseUID uuid.UUID) (entity.User, entity.Enrollment, bool) {
	userUID, _ := c.Get(middleware.UIDCK)

	var user entity.User
	if err := database.DB.Select("uid", "role", "name").First(&user, userUID).Error; err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"success": false, "message": "Unauthorized", "data": nil, "error": err.Error()})
		return entity.User{}, entity.Enrollment{}, false
	}

	if user.Role != entity.StudentRole {
		c.JSON(http.StatusForbidden, gin.H{"success": false, "message": "Only enrolled students can create Q&A threads", "data": nil, "error": nil})
		return entity.User{}, entity.Enrollment{}, false
	}

	var enrollment entity.Enrollment
	if err := database.DB.Where("user_uid = ? AND course_uid = ? AND status IN ?",
		user.Uid, courseUID, []entity.EnrollmentStatus{entity.EnrollmentActive, entity.EnrollmentCompleted}).
		First(&enrollment).Error; err != nil {
		c.JSON(http.StatusForbidden, gin.H{"success": false, "message": "You must be enrolled in this course", "data": nil, "error": err.Error()})
		return entity.User{}, entity.Enrollment{}, false
	}

	return user, enrollment, true
}

// @Summary      Create Q&A thread (Enrolled Student)
// @Description  Create a new Q&A thread in a course.
// @Tags         Course
// @Accept       json
// @Produce      json
// @Security     BearerAuth
// @Param        id    path  string  true  "Course UID"
// @Param        body  body  dto.CreateCourseQaThreadRequest  true  "Thread data"
// @Success      201  {object}  map[string]any  "Q&A thread created successfully"
// @Failure      400  {object}  map[string]any  "Invalid request"
// @Failure      403  {object}  map[string]any  "Forbidden"
// @Router       /courses/{id}/qna [post]
func CreateCourseQaThreadFunc(c *gin.Context) {
	courseUID, ok := resolveUIDParam(c, "courses", "id", "course")
	if !ok {
		return
	}

	user, _, ok := requireEnrolledStudent(c, courseUID)
	if !ok {
		return
	}

	var req dto.CreateCourseQaThreadRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": "Invalid request body", "data": nil, "error": err.Error()})
		return
	}
	req.Title = strings.TrimSpace(req.Title)
	req.Body = strings.TrimSpace(req.Body)
	if req.Title == "" || req.Body == "" {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": "title and body are required", "data": nil, "error": nil})
		return
	}

	encTitle, err := utils.Encrypt(req.Title)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "message": "Failed to encrypt title", "data": nil, "error": err.Error()})
		return
	}
	encBody, err := utils.Encrypt(req.Body)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "message": "Failed to encrypt body", "data": nil, "error": err.Error()})
		return
	}

	thread := entity.CourseQaThread{
		CourseUid: courseUID,
		AuthorUid: user.Uid,
		Title:     encTitle,
		Body:      encBody,
	}
	if err := database.DB.Create(&thread).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "message": "Failed to create Q&A thread", "data": nil, "error": err.Error()})
		return
	}

	if err := database.DB.Preload("Course").Preload("Author").Preload("Replies.Author").First(&thread, thread.Uid).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "message": "Failed to reload thread", "data": nil, "error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"success": true,
		"message": "Q&A thread created successfully",
		"data":    mapAdminQaThreadItem(thread),
		"error":   nil,
	})
}

// @Summary      Reply to Q&A thread (Student / Mentor)
// @Description  Reply to an existing Q&A thread in a course.
// @Tags         Course
// @Accept       json
// @Produce      json
// @Security     BearerAuth
// @Param        id         path  string  true  "Course UID"
// @Param        thread_id  path  string  true  "Thread UID"
// @Param        body       body  dto.CreateCourseQaReplyRequest  true  "Reply body"
// @Success      201  {object}  map[string]any  "Q&A reply created successfully"
// @Failure      400  {object}  map[string]any  "Invalid request"
// @Failure      403  {object}  map[string]any  "Forbidden"
// @Failure      404  {object}  map[string]any  "Thread not found"
// @Router       /courses/{id}/qna/{thread_id}/replies [post]
func CreateCourseQaReplyFunc(c *gin.Context) {
	courseUID, ok := resolveUIDParam(c, "courses", "id", "course")
	if !ok {
		return
	}

	threadUID, ok := resolveUIDParam(c, "course_qa_threads", "thread_id", "thread")
	if !ok {
		return
	}

	userUID, _ := c.Get(middleware.UIDCK)
	var actor entity.User
	if err := database.DB.Select("uid", "role", "name").First(&actor, userUID).Error; err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"success": false, "message": "Unauthorized", "data": nil, "error": err.Error()})
		return
	}

	var thread entity.CourseQaThread
	if err := database.DB.First(&thread, threadUID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"success": false, "message": "Thread not found", "data": nil, "error": err.Error()})
		return
	}
	if thread.CourseUid != courseUID {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": "Thread does not belong to the course", "data": nil, "error": nil})
		return
	}

	switch actor.Role {
	case entity.StudentRole:
		var enrollment entity.Enrollment
		if err := database.DB.Where("user_uid = ? AND course_uid = ? AND status IN ?",
			actor.Uid, courseUID, []entity.EnrollmentStatus{entity.EnrollmentActive, entity.EnrollmentCompleted}).
			First(&enrollment).Error; err != nil {
			c.JSON(http.StatusForbidden, gin.H{"success": false, "message": "You must be enrolled in this course", "data": nil, "error": nil})
			return
		}
	case entity.AdminRole, entity.SuperAdminRole:
		// admin can reply to any thread
	case entity.MentorRole:
		allowed, accessErr := canManageCourseByRole(actor, courseUID)
		if accessErr != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"success": false, "message": "Failed to validate access", "data": nil, "error": accessErr.Error()})
			return
		}
		if !allowed {
			c.JSON(http.StatusForbidden, gin.H{"success": false, "message": "Access denied: Mentor is not assigned to this course", "data": nil, "error": nil})
			return
		}
	default:
		c.JSON(http.StatusForbidden, gin.H{"success": false, "message": "Access denied", "data": nil, "error": nil})
		return
	}

	var req dto.CreateCourseQaReplyRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": "Invalid request body", "data": nil, "error": err.Error()})
		return
	}
	req.Body = strings.TrimSpace(req.Body)
	if req.Body == "" {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": "body is required", "data": nil, "error": nil})
		return
	}

	encBody, err := utils.Encrypt(req.Body)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "message": "Failed to encrypt reply", "data": nil, "error": err.Error()})
		return
	}

	reply := entity.CourseQaReply{
		ThreadUid: threadUID,
		AuthorUid: actor.Uid,
		Body:      encBody,
	}
	if err := database.DB.Create(&reply).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "message": "Failed to create Q&A reply", "data": nil, "error": err.Error()})
		return
	}

	if err := database.DB.Preload("Course").
		Preload("Author").
		Preload("Replies", func(tx *gorm.DB) *gorm.DB {
			return tx.Order("created_at ASC")
		}).
		Preload("Replies.Author").
		First(&thread, threadUID).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "message": "Failed to reload thread", "data": nil, "error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"success": true,
		"message": "Q&A reply created successfully",
		"data":    mapAdminQaThreadItem(thread),
		"error":   nil,
	})
}
