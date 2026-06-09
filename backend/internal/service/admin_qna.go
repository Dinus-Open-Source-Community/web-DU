package service

import (
	"net/http"
	"strconv"
	"strings"

	"backend/internal/database"
	"backend/internal/model/dto"
	"backend/internal/model/entity"
	"backend/internal/utils"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

// @Summary      List Q&A threads (Admin)
// @Description  Retrieve paginated Q&A threads across courses.
// @Tags         Admin
// @Accept       json
// @Produce      json
// @Security     BearerAuth
// @Param        courseUid  query  string  false  "Filter by course UID"
// @Param        status     query  string  false  "answered or unanswered"
// @Param        page       query  int     false  "Page number"
// @Param        per_page   query  int     false  "Items per page"
// @Success      200  {object}  map[string]any  "Q&A threads retrieved successfully"
// @Failure      401  {object}  map[string]any  "Unauthorized"
// @Failure      403  {object}  map[string]any  "Forbidden"
// @Router       /admin/qna [get]
func GetAdminQnaFunc(c *gin.Context) {
	if _, ok := requireAdminAccess(c); !ok {
		return
	}

	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	perPage, _ := strconv.Atoi(c.DefaultQuery("per_page", "10"))
	if page < 1 {
		page = 1
	}
	if perPage < 1 {
		perPage = 10
	}
	if perPage > 100 {
		perPage = 100
	}

	db := database.DB.Model(&entity.CourseQaThread{})
	if courseUIDStr := strings.TrimSpace(c.Query("courseUid")); courseUIDStr != "" {
		if courseUID, err := database.ResolveUID("courses", courseUIDStr); err == nil {
			db = db.Where("course_uid = ?", courseUID)
		}
	}

	var allThreads []entity.CourseQaThread
	if err := db.Preload("Course").
		Preload("Author").
		Preload("Replies", func(tx *gorm.DB) *gorm.DB {
			return tx.Order("created_at ASC")
		}).
		Preload("Replies.Author").
		Order("created_at DESC").
		Find(&allThreads).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "Failed to retrieve Q&A threads",
			"data":    nil,
			"error":   err.Error(),
		})
		return
	}

	statusFilter := strings.TrimSpace(c.Query("status"))
	filtered := make([]entity.CourseQaThread, 0, len(allThreads))
	for _, thread := range allThreads {
		status := "unanswered"
		if threadHasStaffReply(thread.Replies) {
			status = "answered"
		}
		if statusFilter != "" && status != statusFilter {
			continue
		}
		filtered = append(filtered, thread)
	}

	total := len(filtered)
	start := (page - 1) * perPage
	if start > total {
		start = total
	}
	end := start + perPage
	if end > total {
		end = total
	}
	pageThreads := filtered[start:end]

	items := make([]map[string]any, 0, len(pageThreads))
	for _, thread := range pageThreads {
		items = append(items, mapAdminQaThreadItem(thread))
	}

	totalPages := 0
	if perPage > 0 {
		totalPages = (total + perPage - 1) / perPage
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Q&A threads retrieved successfully",
		"data": gin.H{
			"threads": items,
			"meta": gin.H{
				"current_page": page,
				"per_page":     perPage,
				"total":        total,
				"total_pages":  totalPages,
			},
		},
		"error": nil,
	})
}

// @Summary      Reply to a Q&A thread (Admin)
// @Description  Create an admin reply on a Q&A thread.
// @Tags         Admin
// @Accept       json
// @Produce      json
// @Security     BearerAuth
// @Param        thread_id  path  string  true  "Thread UID"
// @Param        body       body  dto.CreateCourseQaReplyRequest  true  "Reply body"
// @Success      200  {object}  map[string]any  "Q&A reply created successfully"
// @Failure      400  {object}  map[string]any  "Invalid request"
// @Failure      401  {object}  map[string]any  "Unauthorized"
// @Failure      403  {object}  map[string]any  "Forbidden"
// @Failure      404  {object}  map[string]any  "Thread not found"
// @Router       /admin/qna/{thread_id}/replies [post]
func CreateAdminQnaReplyFunc(c *gin.Context) {
	admin, ok := requireAdminAccess(c)
	if !ok {
		return
	}

	threadUID, ok := resolveUIDParam(c, "course_qa_threads", "thread_id", "thread")
	if !ok {
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

	var thread entity.CourseQaThread
	if err := database.DB.First(&thread, threadUID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"success": false, "message": "Thread not found", "data": nil, "error": err.Error()})
		return
	}

	encBody, err := utils.Encrypt(req.Body)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "message": "Failed to encrypt reply", "data": nil, "error": err.Error()})
		return
	}

	reply := entity.CourseQaReply{
		ThreadUid: threadUID,
		AuthorUid: admin.Uid,
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

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Q&A reply created successfully",
		"data":    mapAdminQaThreadItem(thread),
		"error":   nil,
	})
}
