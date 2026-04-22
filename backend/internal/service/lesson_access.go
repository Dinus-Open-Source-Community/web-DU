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
	if hasAdminAccess(user.Role) {
		return true, nil
	}
	if !hasMentorAccess(user.Role) {
		return false, nil
	}

	var ownCount int64
	if err := database.DB.Model(&entity.Course{}).
		Where("uid = ? AND mentor_uid = ?", courseUID, user.Uid).
		Count(&ownCount).Error; err != nil {
		return false, err
	}
	if ownCount > 0 {
		return true, nil
	}

	var assignmentCount int64
	if err := database.DB.Model(&entity.CourseMentor{}).
		Where("course_uid = ? AND mentor_uid = ? AND status IN ?", courseUID, user.Uid, []entity.CourseMentorStatus{entity.CourseMentorSelected, entity.CourseMentorJoined}).
		Count(&assignmentCount).Error; err != nil {
		return false, err
	}

	return assignmentCount > 0, nil
}
