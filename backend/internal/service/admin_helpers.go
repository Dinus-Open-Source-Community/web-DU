package service

import (
	"net/http"

	"backend/internal/database"
	"backend/internal/handler/middleware"
	"backend/internal/model/entity"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

func requireAdminAccess(c *gin.Context) (entity.User, bool) {
	adminRaw, exists := c.Get(middleware.UIDCK)
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{
			"success": false,
			"message": "Unauthorized",
			"data":    nil,
			"error":   "user_id not found in context",
		})
		return entity.User{}, false
	}

	var admin entity.User
	if err := database.DB.Select("uid", "role", "name").First(&admin, adminRaw).Error; err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{
			"success": false,
			"message": "Unauthorized",
			"data":    nil,
			"error":   err.Error(),
		})
		return entity.User{}, false
	}

	if !hasAdminAccess(admin.Role) {
		c.JSON(http.StatusForbidden, gin.H{
			"success": false,
			"message": "Access denied: Super Admin or Admin only",
			"data":    nil,
			"error":   nil,
		})
		return entity.User{}, false
	}

	return admin, true
}

// requireAdminOrMentorModerationAccess allows admin/super_admin (all courses) and mentor (assigned courses only).
func requireAdminOrMentorModerationAccess(c *gin.Context) (entity.User, bool) {
	user, ok := getAuthenticatedUser(c)
	if !ok {
		return entity.User{}, false
	}

	if hasAdminAccess(user.Role) || user.Role == entity.MentorRole {
		return user, true
	}

	c.JSON(http.StatusForbidden, gin.H{
		"success": false,
		"message": "Access denied: Admin or assigned mentor only",
		"data":    nil,
		"error":   nil,
	})
	return entity.User{}, false
}

func scopeModerationQueryToMentorCourses(db *gorm.DB, user entity.User) (*gorm.DB, error) {
	if hasAdminAccess(user.Role) {
		return db, nil
	}

	courseUIDs, err := mentorAssignedCourseUIDs(user.Uid)
	if err != nil {
		return nil, err
	}
	if len(courseUIDs) == 0 {
		return db.Where("1 = 0"), nil
	}

	return db.Where("course_uid IN ?", courseUIDs), nil
}

func ensureUserCanModerateCourse(c *gin.Context, user entity.User, courseUID uuid.UUID) bool {
	if hasAdminAccess(user.Role) {
		return true
	}

	allowed, err := canManageCourseByRole(user, courseUID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "Failed to verify course access",
			"data":    nil,
			"error":   err.Error(),
		})
		return false
	}
	if !allowed {
		c.JSON(http.StatusForbidden, gin.H{
			"success": false,
			"message": "Access denied for this course",
			"data":    nil,
			"error":   nil,
		})
		return false
	}

	return true
}
