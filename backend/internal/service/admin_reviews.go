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

func mapAdminReviewItem(review entity.CourseReview) gin.H {
	studentName := ""
	studentAvatar := ""
	if review.User != nil {
		studentName, _ = utils.Decrypt(review.User.Name)
		studentAvatar = review.User.AvatarURL
	}

	courseTitle := ""
	if review.Course != nil {
		courseTitle = review.Course.Title
	}

	item := gin.H{
		"uid":           review.Uid,
		"courseUid":     review.CourseUid,
		"studentUid":    review.UserUid,
		"courseTitle":   courseTitle,
		"studentName":   studentName,
		"studentAvatar": studentAvatar,
		"rating":        review.Rating,
		"comment":       review.Comment,
		"createdAt":     review.CreatedAt,
	}

	if len(review.Replies) > 0 {
		latest := review.Replies[len(review.Replies)-1]
		author := "Admin"
		if latest.Replier != nil {
			author, _ = utils.Decrypt(latest.Replier.Name)
		}
		item["reply"] = gin.H{
			"author":    author,
			"comment":   latest.Comment,
			"createdAt": latest.CreatedAt,
		}
	}

	return item
}

// @Summary      List course reviews (Admin)
// @Description  Retrieve paginated reviews across all courses for moderation.
// @Tags         Admin
// @Accept       json
// @Produce      json
// @Security     BearerAuth
// @Param        courseUid   query  string  false  "Filter by course UID"
// @Param        rating      query  int     false  "Filter by rating"
// @Param        has_reply   query  bool    false  "Filter reviews with replies"
// @Param        page        query  int     false  "Page number"
// @Param        per_page    query  int     false  "Items per page"
// @Success      200  {object}  map[string]any  "Reviews retrieved successfully"
// @Failure      401  {object}  map[string]any  "Unauthorized"
// @Failure      403  {object}  map[string]any  "Forbidden"
// @Router       /admin/reviews [get]
func GetAdminReviewsFunc(c *gin.Context) {
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

	db := database.DB.Model(&entity.CourseReview{})
	if courseUIDStr := strings.TrimSpace(c.Query("courseUid")); courseUIDStr != "" {
		if courseUID, err := database.ResolveUID("courses", courseUIDStr); err == nil {
			db = db.Where("course_uid = ?", courseUID)
		}
	}
	if ratingStr := strings.TrimSpace(c.Query("rating")); ratingStr != "" {
		if rating, err := strconv.Atoi(ratingStr); err == nil {
			db = db.Where("rating = ?", rating)
		}
	}
	if hasReplyStr := strings.TrimSpace(c.Query("has_reply")); hasReplyStr != "" {
		hasReply := hasReplyStr == "true" || hasReplyStr == "1"
		if hasReply {
			db = db.Where("EXISTS (SELECT 1 FROM course_review_replies r WHERE r.course_review_uid = course_reviews.uid)")
		} else {
			db = db.Where("NOT EXISTS (SELECT 1 FROM course_review_replies r WHERE r.course_review_uid = course_reviews.uid)")
		}
	}

	var total int64
	if err := db.Count(&total).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "Failed to count reviews",
			"data":    nil,
			"error":   err.Error(),
		})
		return
	}

	offset := (page - 1) * perPage
	var reviews []entity.CourseReview
	if err := db.Preload("User").
		Preload("Course").
		Preload("Replies", func(tx *gorm.DB) *gorm.DB {
			return tx.Order("created_at ASC")
		}).
		Preload("Replies.Replier").
		Order("created_at DESC").
		Limit(perPage).
		Offset(offset).
		Find(&reviews).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "Failed to retrieve reviews",
			"data":    nil,
			"error":   err.Error(),
		})
		return
	}

	items := make([]gin.H, 0, len(reviews))
	for _, review := range reviews {
		items = append(items, mapAdminReviewItem(review))
	}

	totalPages := int((total + int64(perPage) - 1) / int64(perPage))
	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Reviews retrieved successfully",
		"data": gin.H{
			"reviews": items,
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

// @Summary      Reply to a review (Admin)
// @Description  Create an admin reply for a course review.
// @Tags         Admin
// @Accept       json
// @Produce      json
// @Security     BearerAuth
// @Param        review_id  path  string  true  "Review UID"
// @Param        body       body  dto.CreateCourseReviewReplyRequest  true  "Reply body"
// @Success      200  {object}  map[string]any  "Review reply created successfully"
// @Failure      400  {object}  map[string]any  "Invalid request"
// @Failure      401  {object}  map[string]any  "Unauthorized"
// @Failure      403  {object}  map[string]any  "Forbidden"
// @Failure      404  {object}  map[string]any  "Review not found"
// @Router       /admin/reviews/{review_id}/reply [post]
func CreateAdminReviewReplyFunc(c *gin.Context) {
	admin, ok := requireAdminAccess(c)
	if !ok {
		return
	}

	reviewUID, ok := resolveUIDParam(c, "course_reviews", "review_id", "review")
	if !ok {
		return
	}

	var req dto.CreateCourseReviewReplyRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": "Invalid request body", "data": nil, "error": err.Error()})
		return
	}
	req.Comment = strings.TrimSpace(req.Comment)
	if req.Comment == "" {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": "comment is required", "data": nil, "error": nil})
		return
	}

	var review entity.CourseReview
	if err := database.DB.First(&review, reviewUID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"success": false, "message": "Review not found", "data": nil, "error": err.Error()})
		return
	}

	encComment, err := utils.Encrypt(req.Comment)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "message": "Failed to encrypt reply", "data": nil, "error": err.Error()})
		return
	}

	reply := entity.CourseReviewReply{
		CourseReviewUid: reviewUID,
		ReplierUid:      admin.Uid,
		Comment:         encComment,
	}
	if err := database.DB.Create(&reply).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "message": "Failed to create review reply", "data": nil, "error": err.Error()})
		return
	}

	if err := database.DB.Preload("User").
		Preload("Course").
		Preload("Replies", func(tx *gorm.DB) *gorm.DB {
			return tx.Order("created_at ASC")
		}).
		Preload("Replies.Replier").
		First(&review, reviewUID).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "message": "Failed to reload review", "data": nil, "error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Review reply created successfully",
		"data":    mapAdminReviewItem(review),
		"error":   nil,
	})
}
