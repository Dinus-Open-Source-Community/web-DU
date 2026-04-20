package service

import (
	"backend/internal/database"
	"backend/internal/handler/middleware"
	"backend/internal/model/dto"
	"backend/internal/model/entity"
	"backend/internal/utils"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

// @Summary      Create course review (Enrolled Students Only)
// @Description  Create a review for a course. User must be enrolled in the course with active status. Each user can only submit one review per course. Review comments are encrypted before storage.
// @Tags         Course
// @Accept       json
// @Produce      json
// @Security     BearerAuth
// @Param        id    path  int  true  "Course ID"
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

	// Check if user is enrolled in the course
	var enrollment entity.Enrollment
	if err := database.DB.Where("user_uid = ? AND course_uid = ? AND status = ?",
		userUid, courseUid, entity.EnrollmentActive).
		First(&enrollment).Error; err != nil {
		c.JSON(http.StatusForbidden, gin.H{
			"success": false,
			"message": "You must be enrolled in this course to leave a review",
			"data":    nil,
			"error":   "User not enrolled in course",
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
