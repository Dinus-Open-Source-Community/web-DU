package service

import (
	"backend/internal/database"
	"backend/internal/handler/middleware"
	"backend/internal/model/dto"
	"backend/internal/model/entity"
	"backend/internal/utils"
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

// @Summary      Create course review (Enrolled Students Only)
// @Description  Create a review for a course. User must be enrolled in the course with active status. Each user can only submit one review per course. Review comments are encrypted before storage.
// @Tags         Course
// @Accept       json
// @Produce      json
// @Security     BearerAuth
// @Param        id    path  string  true  "Course UID"
// @Param        body  body  dto.CreateCourseReviewRequest  true  "Review data"
// @Success      201  {object}  map[string]any  "Review created successfully"
// @Failure      400  {object}  map[string]any  "Invalid course ID or request body"
// @Failure      401  {object}  map[string]any  "Unauthorized"
// @Failure      403  {object}  map[string]any  "User not enrolled in course"
// @Failure      409  {object}  map[string]any  "User already reviewed this course"
// @Failure      500  {object}  map[string]any  "Internal server error"
// @Router       /courses/{id}/review [post]
func CreateCourseReviewFunc(c *gin.Context) {
	courseID := c.Param("id")
	courseUid, err := uuid.Parse(courseID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "Invalid course uid",
			"data":    nil,
			"error":   err.Error(),
		})
		return
	}

	userUid, _ := c.Get(middleware.UIDCK)

	// Bind request body
	var req dto.CreateCourseReviewRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "Invalid request body",
			"data":    nil,
			"error":   err.Error(),
		})
		return
	}

	// Check enrollment and distinguish status for better feedback.
	var enrollment entity.Enrollment
	if err := database.DB.Where("user_uid = ? AND course_uid = ?",
		userUid, courseUid).
		First(&enrollment).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusForbidden, gin.H{
				"success": false,
				"message": "You must join this course before leaving a review",
				"data":    nil,
				"error":   "User not enrolled in course",
			})
			return
		}

		c.JSON(http.StatusForbidden, gin.H{
			"success": false,
			"message": "Failed to validate enrollment status",
			"data":    nil,
			"error":   err.Error(),
		})
		return
	}

	if enrollment.Status == entity.EnrollmentPending {
		c.JSON(http.StatusForbidden, gin.H{
			"success": false,
			"message": "Your enrollment is still pending. Reviews are available after activation",
			"data":    nil,
			"error":   "Enrollment pending",
		})
		return
	}

	if enrollment.Status != entity.EnrollmentActive && enrollment.Status != entity.EnrollmentCompleted {
		c.JSON(http.StatusForbidden, gin.H{
			"success": false,
			"message": "Your enrollment status does not allow leaving a review",
			"data":    nil,
			"error":   "Enrollment status is not eligible",
		})
		return
	}

	// Check if user already reviewed this course
	var existingReview entity.CourseReview
	if err := database.DB.Where("user_uid = ? AND course_uid = ?",
		userUid, courseUid).First(&existingReview).Error; err == nil {
		c.JSON(http.StatusConflict, gin.H{
			"success": false,
			"message": "You have already reviewed this course",
			"data":    nil,
			"error":   "Duplicate review",
		})
		return
	}

	// Encrypt the comment
	encryptedComment, err := utils.Encrypt(req.Comment)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "Failed to encrypt review",
			"data":    nil,
			"error":   err.Error(),
		})
		return
	}

	review := entity.CourseReview{
		UserUid:   userUid.(uuid.UUID),
		CourseUid: courseUid,
		Rating:    req.Rating,
		Comment:   encryptedComment,
	}

	if err := database.DB.Create(&review).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "Failed to create review",
			"data":    nil,
			"error":   err.Error(),
		})
		return
	}

	// Decrypt comment for response
	review.Comment, _ = utils.Decrypt(review.Comment)

	c.JSON(http.StatusCreated, gin.H{
		"success": true,
		"message": "Review created successfully",
		"data":    review,
		"error":   nil,
	})
}

// @Summary      Reply to a course review (Mentor/Admin)
// @Description  Allow assigned mentor or higher roles (admin/super admin) to post replies on a course review. Multiple replies are allowed.
// @Tags         Course
// @Accept       json
// @Produce      json
// @Security     BearerAuth
// @Param        id         path    string  true  "Course UID"
// @Param        review_id  path    string  true  "Course Review UID"
// @Param        body       body    dto.CreateCourseReviewReplyRequest  true  "Reply data"
// @Success      201  {object}  map[string]any  "Review reply created successfully"
// @Failure      400  {object}  map[string]any  "Invalid request"
// @Failure      401  {object}  map[string]any  "Unauthorized"
// @Failure      403  {object}  map[string]any  "Access denied"
// @Failure      404  {object}  map[string]any  "Review not found"
// @Failure      500  {object}  map[string]any  "Internal server error"
// @Router       /courses/{id}/review/{review_id}/reply [post]
func CreateCourseReviewReplyFunc(c *gin.Context) {
	courseUID, err := uuid.Parse(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": "Invalid course uid", "data": nil, "error": err.Error()})
		return
	}

	reviewUID, err := uuid.Parse(c.Param("review_id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": "Invalid review uid", "data": nil, "error": err.Error()})
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

	uidRaw, exists := c.Get(middleware.UIDCK)
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"success": false, "message": "Unauthorized", "data": nil, "error": "user_id not found in context"})
		return
	}

	var actor entity.User
	if err := database.DB.Select("uid", "role").First(&actor, uidRaw).Error; err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"success": false, "message": "Unauthorized", "data": nil, "error": err.Error()})
		return
	}

	if !hasMentorAccess(actor.Role) {
		c.JSON(http.StatusForbidden, gin.H{"success": false, "message": "Access denied: Mentor, Admin, or Super Admin only", "data": nil, "error": nil})
		return
	}

	var review entity.CourseReview
	if err := database.DB.First(&review, reviewUID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"success": false, "message": "Review not found", "data": nil, "error": err.Error()})
		return
	}
	if review.CourseUid != courseUID {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": "Review does not belong to the course", "data": nil, "error": nil})
		return
	}

	if !hasAdminAccess(actor.Role) {
		allowed, accessErr := canManageCourseByRole(actor, courseUID)
		if accessErr != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"success": false, "message": "Failed to validate access", "data": nil, "error": accessErr.Error()})
			return
		}
		if !allowed {
			c.JSON(http.StatusForbidden, gin.H{"success": false, "message": "Access denied: Mentor is not assigned to this course", "data": nil, "error": nil})
			return
		}
	}

	encComment, err := utils.Encrypt(req.Comment)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "message": "Failed to encrypt reply", "data": nil, "error": err.Error()})
		return
	}

	reply := entity.CourseReviewReply{
		CourseReviewUid: reviewUID,
		ReplierUid:      actor.Uid,
		Comment:         encComment,
	}

	if err := database.DB.Create(&reply).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "message": "Failed to create review reply", "data": nil, "error": err.Error()})
		return
	}

	decryptedComment, _ := utils.Decrypt(reply.Comment)

	c.JSON(http.StatusCreated, gin.H{
		"success": true,
		"message": "Review reply created successfully",
		"data": gin.H{
			"uid":               reply.Uid,
			"course_review_uid": reply.CourseReviewUid,
			"replier_uid":       reply.ReplierUid,
			"comment":           decryptedComment,
			"created_at":        reply.CreatedAt,
		},
		"error": nil,
	})
}
