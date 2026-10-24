package service

import (
	"backend/internal/database"
	"backend/internal/handler/middleware"
	"backend/internal/model/entity"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

func getAuthenticatedUser(c *gin.Context) (entity.User, bool) {
	userIDRaw, exists := c.Get(middleware.UIDCK)
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{
			"success": false,
			"message": "Unauthorized",
			"data":    nil,
			"error":   "user id not found in token context",
		})
		return entity.User{}, false
	}

	userID, ok := userIDRaw.(uuid.UUID)
	if !ok {
		c.JSON(http.StatusUnauthorized, gin.H{
			"success": false,
			"message": "Unauthorized",
			"data":    nil,
			"error":   "invalid user id in token context",
		})
		return entity.User{}, false
	}

	var user entity.User
	if err := database.DB.First(&user, userID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"success": false,
			"message": "User not found",
			"data":    nil,
			"error":   err.Error(),
		})
		return entity.User{}, false
	}

	return user, true
}

func canManageCourseByRole(user entity.User, courseUID uuid.UUID) (bool, error) {
	if user.Uid != uuid.Nil {
		return true, nil
	}
	return false, nil
}

func canReadCourseByRole(user entity.User, courseUID uuid.UUID) (bool, error) {
	if user.Uid != uuid.Nil {
		return true, nil
	}
	return false, nil
}

// canSubmitLessonAssignmentAsEnrolledParticipant is true only when the user has an enrollment on the course
// (active or completed). Mentors and admins are not allowed to submit via this check unless they
// are also enrolled as course participants.
func canSubmitLessonAssignmentAsEnrolledParticipant(userUID, courseUID uuid.UUID) (bool, error) {
	var enrollmentCount int64
	err := database.DB.Model(&entity.Enrollment{}).
		Where("user_uid = ? AND course_uid = ? AND status IN ?",
			userUID,
			courseUID,
			[]entity.EnrollmentStatus{entity.EnrollmentActive, entity.EnrollmentCompleted},
		).
		Count(&enrollmentCount).Error
	if err != nil {
		return false, err
	}
	return enrollmentCount > 0, nil
}
