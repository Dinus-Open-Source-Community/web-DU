package service

import (
	"backend/internal/database"
	"backend/internal/handler/middleware"
	"backend/internal/model/dto"
	"backend/internal/model/entity"
	"backend/internal/utils"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
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
	// Get course ID from URL parameter
	courseID := c.Param("id")
	courseIDInt, err := strconv.Atoi(courseID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "Invalid course ID",
			"data":    nil,
			"error":   "Course ID must be a valid number",
		})
		return
	}

	// Get user ID from JWT token
	userID, _ := c.Get(middleware.IDCK)

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
	if err := database.DB.Where("user_id = ? AND course_id = ? AND status = ?",
		userID, courseIDInt, entity.EnrollmentActive).
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
	if err := database.DB.Where("user_id = ? AND course_id = ?",
		userID, courseIDInt).First(&existingReview).Error; err == nil {
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

	// Create the review
	review := entity.CourseReview{
		UserID:   userID.(uint),
		CourseID: uint(courseIDInt),
		Rating:   req.Rating,
		Comment:  encryptedComment,
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
