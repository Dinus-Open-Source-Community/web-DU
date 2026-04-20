package service

import (
	"errors"
	"net/http"
	"net/mail"
	"sort"
	"strconv"
	"strings"
	"time"

	"backend/internal/database"
	"backend/internal/handler/middleware"
	"backend/internal/model/dto"
	"backend/internal/model/entity"
	"backend/internal/utils"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

// @Summary      Get user detail by ID (Admin or Self)
// @Description  Retrieve detailed user data including profile, joined courses, transaction history, course reviews, enrollment summary, and mentored courses.
// @Tags         User
// @Accept       json
// @Produce      json
// @Security     BearerAuth
// @Param        id   path      string  true  "User UID"
// @Success      200  {object}  map[string]any  "User detail retrieved successfully"
// @Failure      400  {object}  map[string]any  "Invalid user uid"
// @Failure      401  {object}  map[string]any  "Unauthorized"
// @Failure      403  {object}  map[string]any  "Forbidden - only admin or user owner"
// @Failure      404  {object}  map[string]any  "User not found"
// @Failure      500  {object}  map[string]any  "Internal server error"
// @Router       /user/{id} [get]
func GetUserDetailByIDService(c *gin.Context) {
	requesterRaw, exists := c.Get(middleware.UIDCK)
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{
			"success": false,
			"message": "Unauthorized",
			"data":    nil,
			"error":   "user_id not found in context",
		})
		return
	}

	requesterUID := requesterRaw.(uuid.UUID)
	targetUID, err := uuid.Parse(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "Invalid user uid",
			"data":    nil,
			"error":   err.Error(),
		})
		return
	}

	var requester entity.User
	if err := database.DB.Select("uid", "role").First(&requester, requesterUID).Error; err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{
			"success": false,
			"message": "Unauthorized",
			"data":    nil,
			"error":   err.Error(),
		})
		return
	}

	if requester.Role != entity.AdminRole && requesterUID != targetUID {
		c.JSON(http.StatusForbidden, gin.H{
			"success": false,
			"message": "Access denied: only admin or user owner",
			"data":    nil,
			"error":   nil,
		})
		return
	}

	var userData entity.User
	if err := database.DB.Select("uid", "name", "email", "avatar_url", "role", "is_verified", "description", "created_at", "updated_at").First(&userData, targetUID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"success": false,
			"message": "User not found",
			"data":    nil,
			"error":   err.Error(),
		})
		return
	}

	nameDecrypted, _ := utils.Decrypt(userData.Name)
	emailDecrypted, _ := utils.Decrypt(userData.Email)
	descriptionDecrypted, _ := utils.Decrypt(userData.Description)

	var enrollments []entity.Enrollment
	if err := database.DB.
		Where("user_uid = ?", targetUID).
		Preload("Course").
		Order("enrolled_at DESC").
		Find(&enrollments).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "Failed to retrieve joined courses",
			"data":    nil,
			"error":   err.Error(),
		})
		return
	}

	courses := make([]gin.H, 0, len(enrollments))
	seenCourses := make(map[uuid.UUID]struct{}, len(enrollments))
	enrollmentSummary := gin.H{
		"total":     len(enrollments),
		"pending":   0,
		"active":    0,
		"completed": 0,
		"cancelled": 0,
	}

	for _, enrollment := range enrollments {
		switch enrollment.Status {
		case entity.EnrollmentPending:
			enrollmentSummary["pending"] = enrollmentSummary["pending"].(int) + 1
		case entity.EnrollmentActive:
			enrollmentSummary["active"] = enrollmentSummary["active"].(int) + 1
		case entity.EnrollmentCompleted:
			enrollmentSummary["completed"] = enrollmentSummary["completed"].(int) + 1
		case entity.EnrollmentCancelled:
			enrollmentSummary["cancelled"] = enrollmentSummary["cancelled"].(int) + 1
		}

		if enrollment.Course == nil {
			continue
		}

		if _, exists := seenCourses[enrollment.Course.Uid]; exists {
			continue
		}

		seenCourses[enrollment.Course.Uid] = struct{}{}
		courses = append(courses, gin.H{
			"uid":               enrollment.Course.Uid,
			"title":             enrollment.Course.Title,
			"subtitle":          enrollment.Course.Subtitle,
			"slug":              enrollment.Course.Slug,
			"cover_url":         enrollment.Course.CoverURL,
			"thumbnail_url":     enrollment.Course.ThumbnailURL,
			"level":             enrollment.Course.Level,
			"status":            enrollment.Course.Status,
			"price":             enrollment.Course.Price,
			"is_premium":        enrollment.Course.IsPremium,
			"is_published":      enrollment.Course.IsPublished,
			"enrolled_at":       enrollment.EnrolledAt,
			"progress":          enrollment.Progress,
			"enrollment_status": enrollment.Status,
		})
	}

	type reviewRow struct {
		ReviewUID   uuid.UUID  `gorm:"column:review_uid"`
		Rating      int        `gorm:"column:rating"`
		Comment     string     `gorm:"column:comment"`
		CreatedAt   time.Time  `gorm:"column:created_at"`
		CourseUID   *uuid.UUID `gorm:"column:course_uid"`
		CourseTitle *string    `gorm:"column:course_title"`
		CourseSlug  *string    `gorm:"column:course_slug"`
	}

	var reviewRows []reviewRow
	if err := database.DB.Table("course_reviews AS cr").
		Select(`
			cr.uid AS review_uid,
			cr.rating AS rating,
			cr.comment AS comment,
			cr.created_at AS created_at,
			c.uid AS course_uid,
			c.title AS course_title,
			c.slug AS course_slug`).
		Joins("LEFT JOIN courses AS c ON c.uid = cr.course_uid").
		Where("cr.user_uid = ?", targetUID).
		Order("cr.created_at DESC").
		Scan(&reviewRows).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "Failed to retrieve user course reviews",
			"data":    nil,
			"error":   err.Error(),
		})
		return
	}

	reviews := make([]gin.H, 0, len(reviewRows))
	totalRating := 0
	for _, review := range reviewRows {
		commentDecrypted, err := utils.Decrypt(review.Comment)
		if err != nil {
			commentDecrypted = review.Comment
		}

		totalRating += review.Rating

		var courseData any
		if review.CourseUID != nil {
			courseTitle := ""
			if review.CourseTitle != nil {
				courseTitle = *review.CourseTitle
			}

			courseSlug := ""
			if review.CourseSlug != nil {
				courseSlug = *review.CourseSlug
			}

			courseData = gin.H{
				"uid":   *review.CourseUID,
				"title": courseTitle,
				"slug":  courseSlug,
			}
		}

		reviews = append(reviews, gin.H{
			"uid":        review.ReviewUID,
			"rating":     review.Rating,
			"comment":    commentDecrypted,
			"created_at": review.CreatedAt,
			"course":     courseData,
		})
	}

	averageRating := 0.0
	if len(reviewRows) > 0 {
		averageRating = float64(totalRating) / float64(len(reviewRows))
	}

	type transactionRow struct {
		PaymentUID      uuid.UUID               `gorm:"column:payment_uid"`
		Reference       string                  `gorm:"column:reference"`
		Amount          float64                 `gorm:"column:amount"`
		PaymentMethod   entity.PaymentMethod    `gorm:"column:payment_method"`
		PaymentStatus   entity.PaymentStatus    `gorm:"column:payment_status"`
		CheckoutURL     string                  `gorm:"column:checkout_url"`
		PaidAt          *time.Time              `gorm:"column:paid_at"`
		TransactionAt   time.Time               `gorm:"column:transaction_at"`
		EnrollmentUID   uuid.UUID               `gorm:"column:enrollment_uid"`
		EnrollmentState entity.EnrollmentStatus `gorm:"column:enrollment_state"`
		CourseUID       *uuid.UUID              `gorm:"column:course_uid"`
		CourseTitle     *string                 `gorm:"column:course_title"`
		CourseSlug      *string                 `gorm:"column:course_slug"`
	}

	var transactionRows []transactionRow
	if err := database.DB.Table("payments AS p").
		Select(`
			p.uid AS payment_uid,
			p.transaction_id AS reference,
			p.amount AS amount,
			p.method AS payment_method,
			p.status AS payment_status,
			p.checkout_url AS checkout_url,
			p.paid_at AS paid_at,
			p.created_at AS transaction_at,
			e.uid AS enrollment_uid,
			e.status AS enrollment_state,
			c.uid AS course_uid,
			c.title AS course_title,
			c.slug AS course_slug`).
		Joins("INNER JOIN enrollments AS e ON e.uid = p.enrollment_uid").
		Joins("LEFT JOIN courses AS c ON c.uid = e.course_uid").
		Where("e.user_uid = ?", targetUID).
		Order("p.created_at DESC").
		Scan(&transactionRows).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "Failed to retrieve transaction history",
			"data":    nil,
			"error":   err.Error(),
		})
		return
	}

	transactions := make([]gin.H, 0, len(transactionRows))
	for _, trx := range transactionRows {
		var courseData any
		if trx.CourseUID != nil {
			courseTitle := ""
			if trx.CourseTitle != nil {
				courseTitle = *trx.CourseTitle
			}

			courseSlug := ""
			if trx.CourseSlug != nil {
				courseSlug = *trx.CourseSlug
			}

			courseData = gin.H{
				"uid":   *trx.CourseUID,
				"title": courseTitle,
				"slug":  courseSlug,
			}
		}

		transactions = append(transactions, gin.H{
			"uid":               trx.PaymentUID,
			"reference":         trx.Reference,
			"amount":            trx.Amount,
			"payment_method":    trx.PaymentMethod,
			"payment_status":    trx.PaymentStatus,
			"checkout_url":      trx.CheckoutURL,
			"paid_at":           trx.PaidAt,
			"transaction_at":    trx.TransactionAt,
			"enrollment_uid":    trx.EnrollmentUID,
			"enrollment_status": trx.EnrollmentState,
			"course":            courseData,
		})
	}

	var mentoredCourses []entity.Course
	if err := database.DB.Where("mentor_uid = ?", targetUID).Order("created_at DESC").Find(&mentoredCourses).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "Failed to retrieve mentored courses",
			"data":    nil,
			"error":   err.Error(),
		})
		return
	}

	mentoredCourseList := make([]gin.H, 0, len(mentoredCourses))
	for _, course := range mentoredCourses {
		mentoredCourseList = append(mentoredCourseList, gin.H{
			"uid":          course.Uid,
			"title":        course.Title,
			"subtitle":     course.Subtitle,
			"slug":         course.Slug,
			"level":        course.Level,
			"status":       course.Status,
			"price":        course.Price,
			"is_premium":   course.IsPremium,
			"is_published": course.IsPublished,
			"created_at":   course.CreatedAt,
		})
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "User detail retrieved successfully",
		"data": gin.H{
			"uid":            userData.Uid,
			"name":           nameDecrypted,
			"email":          emailDecrypted,
			"avatar_url":     userData.AvatarURL,
			"role":           userData.Role,
			"is_verified":    userData.IsVerified,
			"description":    descriptionDecrypted,
			"created_at":     userData.CreatedAt,
			"updated_at":     userData.UpdatedAt,
			"joined_courses": courses,
			"course_reviews": reviews,
			"review_summary": gin.H{
				"total_reviews":  len(reviewRows),
				"average_rating": averageRating,
			},
			"enrollment_summary":  enrollmentSummary,
			"mentored_courses":    mentoredCourseList,
			"transaction_history": transactions,
		},
		"error": nil,
	})
}

// @Summary      Update user profile (All Roles)
// @Description  Update authenticated user's profile information including name, email, and description. All fields are optional and encrypted before storage.
// @Tags         User
// @Accept       json
// @Produce      json
// @Security     BearerAuth
// @Param        body  body  dto.UpdateUserProfileRequest  true  "Profile update data (all fields optional)"
// @Success      200  {object}  map[string]any  "Profile updated successfully"
// @Failure      400  {object}  map[string]any  "Invalid request data"
// @Failure      401  {object}  map[string]any  "Unauthorized"
// @Failure      409  {object}  map[string]any  "Email already registered"
// @Failure      500  {object}  map[string]any  "Internal server error"
// @Router       /user/profile [patch]
func UpdateUserProfileService(c *gin.Context) {
	userID, _ := c.Get(middleware.UIDCK)

	var req dto.UpdateUserProfileRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "Invalid request data",
			"data":    nil,
			"error":   err.Error(),
		})
		return
	}

	if req.Name == nil && req.Email == nil && req.Description == nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "No profile fields provided",
			"data":    nil,
			"error":   nil,
		})
		return
	}

	var user entity.User
	if err := database.DB.First(&user, userID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"success": false,
			"message": "User not found",
			"data":    nil,
			"error":   err.Error(),
		})
		return
	}

	updateData := map[string]any{}

	if req.Name != nil {
		name := strings.TrimSpace(*req.Name)
		if name == "" {
			c.JSON(http.StatusBadRequest, gin.H{
				"success": false,
				"message": "Name cannot be empty",
				"data":    nil,
				"error":   nil,
			})
			return
		}
		encName, err := utils.Encrypt(name)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{
				"success": false,
				"message": "Failed to encrypt name",
				"data":    nil,
				"error":   err.Error(),
			})
			return
		}
		updateData["name"] = encName
	}

	if req.Email != nil {
		email := strings.TrimSpace(*req.Email)
		if email == "" {
			c.JSON(http.StatusBadRequest, gin.H{
				"success": false,
				"message": "Email cannot be empty",
				"data":    nil,
				"error":   nil,
			})
			return
		}
		if _, err := mail.ParseAddress(email); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{
				"success": false,
				"message": "Invalid email format",
				"data":    nil,
				"error":   nil,
			})
			return
		}

		emailHash := utils.GenerateBlindIndex(email)
		var existing entity.User
		if err := database.DB.Where("email_hash = ? AND uid <> ?", emailHash, userID).First(&existing).Error; err == nil {
			c.JSON(http.StatusConflict, gin.H{
				"success": false,
				"message": "Email already registered",
				"data":    nil,
				"error":   nil,
			})
			return
		} else if !errors.Is(err, gorm.ErrRecordNotFound) {
			c.JSON(http.StatusInternalServerError, gin.H{
				"success": false,
				"message": "Failed to check email availability",
				"data":    nil,
				"error":   err.Error(),
			})
			return
		}

		encEmail, err := utils.Encrypt(email)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{
				"success": false,
				"message": "Failed to encrypt email",
				"data":    nil,
				"error":   err.Error(),
			})
			return
		}

		updateData["email"] = encEmail
		updateData["email_hash"] = emailHash
	}

	if req.Description != nil {
		description := strings.TrimSpace(*req.Description)
		if description == "" {
			updateData["description"] = ""
		} else {
			encDescription, err := utils.Encrypt(description)
			if err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{
					"success": false,
					"message": "Failed to encrypt description",
					"data":    nil,
					"error":   err.Error(),
				})
				return
			}
			updateData["description"] = encDescription
		}
	}

	if err := database.DB.Model(&user).Updates(updateData).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "Failed to update profile",
			"data":    nil,
			"error":   err.Error(),
		})
		return
	}

	if err := database.DB.First(&user, userID).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "Failed to retrieve updated profile",
			"data":    nil,
			"error":   err.Error(),
		})
		return
	}

	nameDecrypted, _ := utils.Decrypt(user.Name)
	emailDecrypted, _ := utils.Decrypt(user.Email)
	descriptionDecrypted, _ := utils.Decrypt(user.Description)

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Profile updated successfully",
		"data": gin.H{
			"uid":         user.Uid,
			"name":        nameDecrypted,
			"email":       emailDecrypted,
			"avatar_url":  user.AvatarURL,
			"role":        user.Role,
			"is_verified": user.IsVerified,
			"description": descriptionDecrypted,
			"created_at":  user.CreatedAt,
			"updated_at":  user.UpdatedAt,
		},
		"error": nil,
	})
}

// @Summary      Change user password (All Roles)
// @Description  Change authenticated user's password after verifying the old password. Requires old password verification before setting new password.
// @Tags         User
// @Accept       json
// @Produce      json
// @Security     BearerAuth
// @Param        body  body  dto.ChangePasswordRequest  true  "Password change data"
// @Success      200  {object}  map[string]any  "Password changed successfully"
// @Failure      400  {object}  map[string]any  "Invalid request data or password validation failed"
// @Failure      401  {object}  map[string]any  "Unauthorized or incorrect old password"
// @Failure      404  {object}  map[string]any  "User not found"
// @Failure      500  {object}  map[string]any  "Internal server error"
// @Router       /user/password [patch]
func ChangePasswordService(c *gin.Context) {
	userID, _ := c.Get(middleware.UIDCK)

	var req dto.ChangePasswordRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "Invalid request data",
			"data":    nil,
			"error":   err.Error(),
		})
		return
	}

	if strings.TrimSpace(req.OldPassword) == "" || strings.TrimSpace(req.NewPassword) == "" {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "Old and new password are required",
			"data":    nil,
			"error":   nil,
		})
		return
	}

	var user entity.User
	if err := database.DB.First(&user, userID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"success": false,
			"message": "User not found",
			"data":    nil,
			"error":   err.Error(),
		})
		return
	}

	if !utils.CheckPassword(user.Password, req.OldPassword) {
		c.JSON(http.StatusUnauthorized, gin.H{
			"success": false,
			"message": "Invalid old password",
			"data":    nil,
			"error":   nil,
		})
		return
	}

	hashedPassword, err := utils.HashPassword(req.NewPassword)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "Failed to hash new password",
			"data":    nil,
			"error":   err.Error(),
		})
		return
	}

	if err := database.DB.Model(&user).Update("password", hashedPassword).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "Failed to change password",
			"data":    nil,
			"error":   err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Password changed successfully",
		"data":    nil,
		"error":   nil,
	})
}

// @Summary      Update user role (Admin/Super Admin)
// @Description  Update a specific user's role. Admin can update mentor/student role, while role changes for admin/super_admin users are restricted to super_admin.
// @Tags         User Management
// @Accept       json
// @Produce      json
// @Security     BearerAuth
// @Param        id    path      string                           true  "User UID to update"
// @Param        body  body      dto.UpdateUserRoleRequest        true  "Role assignment (super_admin/admin/mentor/student)"
// @Success      200   {object}  map[string]any                   "User role updated successfully"
// @Failure      400   {object}  map[string]any                   "Invalid role value"
// @Failure      401   {object}  map[string]any                   "Unauthorized - Invalid or missing JWT token"
// @Failure      403   {object}  map[string]any                   "Forbidden - insufficient role update permission"
// @Failure      404   {object}  map[string]any                   "User not found"
// @Failure      500   {object}  map[string]any                   "Internal server error"
// @Router       /user/role/{id} [patch]
func UpdateUserRoleService(c *gin.Context) {
	adminID, _ := c.Get(middleware.UIDCK)
	adminUid := adminID.(uuid.UUID)

	var adminData entity.User
	if err := database.DB.First(&adminData, adminUid).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"success": false,
			"message": "Admin user not found",
			"data":    nil,
			"error":   err.Error(),
		})
		return
	}

	if adminData.Role != entity.AdminRole && adminData.Role != entity.SuperAdminRole {
		c.JSON(http.StatusForbidden, gin.H{
			"success": false,
			"message": "Access denied: Admin or Super Admin only",
			"data":    nil,
			"error":   nil,
		})
		return
	}

	userIDStr := c.Param("id")
	targetUserUid, err := uuid.Parse(userIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "Invalid user uid",
			"data":    nil,
			"error":   err.Error(),
		})
		return
	}

	var req dto.UpdateUserRoleRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "Invalid request",
			"data":    nil,
			"error":   err.Error(),
		})
		return
	}

	// Validate role
	validRoles := map[string]entity.UserRole{
		"super_admin": entity.SuperAdminRole,
		"admin":       entity.AdminRole,
		"mentor":      entity.MentorRole,
		"student":     entity.StudentRole,
	}

	newRole, exists := validRoles[strings.ToLower(req.Role)]
	if !exists {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "Invalid role. Must be one of: super_admin, admin, mentor, student",
			"data":    nil,
			"error":   nil,
		})
		return
	}

	var targetUser entity.User
	if err := database.DB.First(&targetUser, targetUserUid).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"success": false,
			"message": "Target user not found",
			"data":    nil,
			"error":   err.Error(),
		})
		return
	}

	// Only super admin can change role of admin/super admin users.
	if (targetUser.Role == entity.AdminRole || targetUser.Role == entity.SuperAdminRole) && adminData.Role != entity.SuperAdminRole {
		c.JSON(http.StatusForbidden, gin.H{
			"success": false,
			"message": "Only super admin can change role for admin/super_admin users",
			"data":    nil,
			"error":   nil,
		})
		return
	}

	// Admin peer/self role mutation is blocked by rule above; keep explicit guard for clarity.
	if targetUserUid == adminUid && adminData.Role == entity.AdminRole {
		c.JSON(http.StatusForbidden, gin.H{
			"success": false,
			"message": "Admin cannot change their own role",
			"data":    nil,
			"error":   nil,
		})
		return
	}

	// Update role
	if err := database.DB.Model(&targetUser).Update("role", newRole).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "Failed to update user role",
			"data":    nil,
			"error":   err.Error(),
		})
		return
	}

	// Decrypt user data for response
	nameDecrypted, _ := utils.Decrypt(targetUser.Name)
	emailDecrypted, _ := utils.Decrypt(targetUser.Email)

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "User role updated successfully",
		"data": gin.H{
			"uid":         targetUser.Uid,
			"name":        nameDecrypted,
			"email":       emailDecrypted,
			"avatar_url":  targetUser.AvatarURL,
			"role":        newRole,
			"is_verified": targetUser.IsVerified,
			"created_at":  targetUser.CreatedAt,
			"updated_at":  targetUser.UpdatedAt,
		},
		"error": nil,
	})
}

// DeleteUserService deletes a user. Only admin can use this endpoint.
//
// @Summary      Delete user account (Admin Only)
// @Description  Delete a user account permanently. Only administrators can perform this action. Admins cannot delete their own account.
// @Tags         User Management
// @Accept       json
// @Produce      json
// @Security     BearerAuth
// @Param        id  path      int  true  "User ID to delete"
// @Success      200  {object}  map[string]any  "User deleted successfully"
// @Failure      401  {object}  map[string]any  "Unauthorized - Invalid or missing JWT token"
// @Failure      403  {object}  map[string]any  "Forbidden - Only admins can delete users"
// @Failure      404  {object}  map[string]any  "User not found"
// @Failure      500  {object}  map[string]any  "Internal server error"
// @Router       /user/manage/{id} [delete]
func DeleteUserService(c *gin.Context) {
	adminID, _ := c.Get(middleware.UIDCK)
	adminUid := adminID.(uuid.UUID)

	var adminData entity.User
	if err := database.DB.First(&adminData, adminUid).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"success": false,
			"message": "Admin user not found",
			"data":    nil,
			"error":   err.Error(),
		})
		return
	}

	if adminData.Role != entity.AdminRole {
		c.JSON(http.StatusForbidden, gin.H{
			"success": false,
			"message": "Access denied: Admins only",
			"data":    nil,
			"error":   nil,
		})
		return
	}

	userIDStr := c.Param("id")
	targetUserUid, err := uuid.Parse(userIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "Invalid user uid",
			"data":    nil,
			"error":   err.Error(),
		})
		return
	}

	if targetUserUid == adminUid {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "Cannot delete your own account",
			"data":    nil,
			"error":   nil,
		})
		return
	}

	var targetUser entity.User
	if err := database.DB.First(&targetUser, targetUserUid).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"success": false,
			"message": "User not found",
			"data":    nil,
			"error":   err.Error(),
		})
		return
	}

	if err := database.DB.Delete(&targetUser).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "Failed to delete user",
			"data":    nil,
			"error":   err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "User deleted successfully",
		"data":    nil,
		"error":   nil,
	})
}

// GetAllUsersService returns a paginated list of users with optional filters and sorting.
//
// Query parameters (all optional):
// - page (int, default 1)
// - per_page (int, default 10, max 100)
// - role (string)         -> filter by role (admin/mentor/student)
// - search (string)       -> search in decrypted name and email (performed in-memory; may be expensive)
// - sort (string)         -> "created_at" (default) or "name"
// - order (string)        -> "asc" or "desc" (default "desc")
//
// @Summary      Get all users with pagination (Admin Only)
// @Description  Retrieve paginated list of all users with optional filtering by role and search. Supports sorting by created_at or name. Admin only.
// @Tags         User Management
// @Accept       json
// @Produce      json
// @Security     BearerAuth
// @Param        page      query  int     false  "Page number (default: 1, minimum: 1)"
// @Param        per_page  query  int     false  "Items per page (default: 5, max: 100)"
// @Param        role      query  string  false  "Filter by role (admin/mentor/student)"
// @Param        search    query  string  false  "Search by name or email (case-insensitive)"
// @Param        sort      query  string  false  "Sort field: created_at (default) or name"
// @Param        order     query  string  false  "Sort order: asc or desc (default: desc)"
// @Success      200  {object}  map[string]any  "Users retrieved successfully with pagination metadata"
// @Failure      401  {object}  map[string]any  "Unauthorized - Invalid or missing JWT token"
// @Failure      403  {object}  map[string]any  "Forbidden - Only admins can access this endpoint"
// @Failure      500  {object}  map[string]any  "Internal server error"
// @Router       /user/manage/all [get]
func GetAllUsersService(c *gin.Context) {
	userID, _ := c.Get(middleware.UIDCK)

	var userData entity.User
	if err := database.DB.First(&userData, userID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"success": false,
			"message": "User not found",
			"data":    nil,
			"error":   err.Error(),
		})
		return
	}

	if userData.Role != entity.AdminRole {
		c.JSON(http.StatusForbidden, gin.H{
			"success": false,
			"message": "Access denied: Admins only",
			"data":    nil,
			"error":   nil,
		})
		return
	}

	// Parse query params
	pageStr := c.DefaultQuery("page", "1")
	perPageStr := c.DefaultQuery("per_page", "5")
	roleFilter := c.Query("role")
	search := strings.TrimSpace(c.Query("search"))
	sortBy := c.DefaultQuery("sort", "created_at")
	order := strings.ToLower(c.DefaultQuery("order", "desc"))

	page, err := strconv.Atoi(pageStr)
	if err != nil || page < 1 {
		page = 1
	}
	perPage, err := strconv.Atoi(perPageStr)
	if err != nil || perPage < 1 {
		perPage = 5
	}
	const maxPerPage = 100
	if perPage > maxPerPage {
		perPage = maxPerPage
	}

	// If no search query provided, do DB-level pagination and filtering by role.
	if search == "" {
		db := database.DB.Model(&entity.User{})
		if roleFilter != "" {
			db = db.Where("role = ?", roleFilter)
		}

		var total int64
		if err := db.Count(&total).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{
				"success": false,
				"message": "Failed to count users",
				"data":    nil,
				"error":   err.Error(),
			})
			return
		}

		// apply sorting
		sortField := "created_at"
		if sortBy == "name" {
			// name is encrypted in DB, sorting by name at DB level is not meaningful.
			// fallback to created_at when sortBy == "name" and no search is requested.
			sortField = "created_at"
		}
		if order != "asc" && order != "desc" {
			order = "desc"
		}

		offset := (page - 1) * perPage
		var users []entity.User
		if err := db.Preload("Enrollments", func(db *gorm.DB) *gorm.DB {
			return db.Order("enrolled_at DESC")
		}).Preload("Enrollments.Course").Order(sortField + " " + order).Limit(perPage).Offset(offset).Find(&users).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{
				"success": false,
				"message": "Failed to retrieve users",
				"data":    nil,
				"error":   err.Error(),
			})
			return
		}

		// decrypt and build result
		result := make([]gin.H, 0, len(users))
		for _, u := range users {
			nameDecrypted, _ := utils.Decrypt(u.Name)
			emailDecrypted, _ := utils.Decrypt(u.Email)
			result = append(result, gin.H{
				"uid":         u.Uid,
				"name":        nameDecrypted,
				"email":       emailDecrypted,
				"avatar_url":  u.AvatarURL,
				"role":        u.Role,
				"is_verified": u.IsVerified,
				"enrollments": u.Enrollments,
				"created_at":  u.CreatedAt,
				"updated_at":  u.UpdatedAt,
			})
		}

		totalPages := int((total + int64(perPage) - 1) / int64(perPage))

		c.JSON(http.StatusOK, gin.H{
			"success": true,
			"message": "Users retrieved successfully",
			"data": gin.H{
				"users": result,
				"meta": gin.H{
					"total":        total,
					"per_page":     perPage,
					"current_page": page,
					"total_pages":  totalPages,
				},
			},
			"error": nil,
		})
		return
	}

	// If search is provided -> need to decrypt and filter in-memory.
	db := database.DB.Model(&entity.User{})
	if roleFilter != "" {
		db = db.Where("role = ?", roleFilter)
	}

	var users []entity.User
	if err := db.Preload("Enrollments", func(db *gorm.DB) *gorm.DB {
		return db.Order("enrolled_at DESC")
	}).Preload("Enrollments.Course").Find(&users).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "Failed to retrieve users for search",
			"data":    nil,
			"error":   err.Error(),
		})
		return
	}

	type userWithDecrypted struct {
		User  entity.User
		Name  string
		Email string
	}

	searchLower := strings.ToLower(search)
	filtered := make([]userWithDecrypted, 0, len(users))
	for _, u := range users {
		nameDecrypted, _ := utils.Decrypt(u.Name)
		emailDecrypted, _ := utils.Decrypt(u.Email)

		if strings.Contains(strings.ToLower(nameDecrypted), searchLower) || strings.Contains(strings.ToLower(emailDecrypted), searchLower) {
			filtered = append(filtered, userWithDecrypted{
				User:  u,
				Name:  nameDecrypted,
				Email: emailDecrypted,
			})
		}
	}

	// Sorting in-memory
	if sortBy == "name" {
		if order == "asc" {
			sort.Slice(filtered, func(i, j int) bool { return filtered[i].Name < filtered[j].Name })
		} else {
			sort.Slice(filtered, func(i, j int) bool { return filtered[i].Name > filtered[j].Name })
		}
	} else {
		// default sort by created_at
		if order == "asc" {
			sort.Slice(filtered, func(i, j int) bool { return filtered[i].User.CreatedAt.Before(filtered[j].User.CreatedAt) })
		} else {
			sort.Slice(filtered, func(i, j int) bool { return filtered[i].User.CreatedAt.After(filtered[j].User.CreatedAt) })
		}
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

	paginated := filtered[start:end]
	result := make([]gin.H, 0, len(paginated))
	for _, item := range paginated {
		u := item.User
		result = append(result, gin.H{
			"uid":         u.Uid,
			"name":        item.Name,
			"email":       item.Email,
			"avatar_url":  u.AvatarURL,
			"role":        u.Role,
			"is_verified": u.IsVerified,
			"enrollments": u.Enrollments,
			"created_at":  u.CreatedAt,
			"updated_at":  u.UpdatedAt,
		})
	}

	totalPages := (total + perPage - 1) / perPage

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Users retrieved successfully",
		"data": gin.H{
			"users": result,
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
