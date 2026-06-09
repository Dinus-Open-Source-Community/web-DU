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

// @Summary      Get current authenticated user detail (Self)
// @Description  Retrieve own detailed user data including profile, joined courses, enrollment invoices (same structure as GET /invoices/{enrollment_id}, with invoice_url and filename per enrollment), transaction history, course reviews, enrollment summary, and mentored courses.
// @Tags         User
// @Accept       json
// @Produce      json
// @Security     BearerAuth
// @Success      200  {object}  map[string]any  "User detail retrieved successfully"
// @Failure      401  {object}  map[string]any  "Unauthorized"
// @Failure      404  {object}  map[string]any  "User not found"
// @Failure      500  {object}  map[string]any  "Internal server error"
// @Router       /user/data [get]
func GetSelfUserDetailService(c *gin.Context) {
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
	respondUserDetail(c, requesterUID)
}

// @Summary      Get user detail by ID (Super Admin / Admin)
// @Description  Retrieve detailed user data by target user UID. Accessible by Super Admin or Admin.
// @Tags         User
// @Accept       json
// @Produce      json
// @Security     BearerAuth
// @Param        id   path      string  true  "User UID"
// @Success      200  {object}  map[string]any  "User detail retrieved successfully"
// @Failure      400  {object}  map[string]any  "Invalid user uid"
// @Failure      401  {object}  map[string]any  "Unauthorized"
// @Failure      403  {object}  map[string]any  "Forbidden — Super Admin or Admin only"
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
	targetUID, ok := resolveUIDParam(c, "users", "id", "user")
	if !ok {
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

	if !hasAdminAccess(requester.Role) {
		c.JSON(http.StatusForbidden, gin.H{
			"success": false,
			"message": "Access denied: Super Admin or Admin only",
			"data":    nil,
			"error":   nil,
		})
		return
	}

	respondUserDetail(c, targetUID)
}

func respondUserDetail(c *gin.Context, targetUID uuid.UUID) {
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
		Preload("Course.Mentor").
		Preload("Course.Mentors").
		Preload("Course.CreatedBy").
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

	enrollmentInvoices := make([]gin.H, 0, len(enrollments))
	for _, en := range enrollments {
		filename := dto.GenerateInvoiceFilename(
			en.Uid,
			en.UserUid,
			en.CourseUid,
			en.EnrolledAt,
		)
		invoiceURL := utils.GetPublicURL(utils.GetBucketInvoices(), filename)

		enrollmentInvoices = append(enrollmentInvoices, gin.H{
			"enrollment_uid": en.Uid,
			"user_uid":       en.UserUid,
			"course_uid":     en.CourseUid,
			"filename":       filename,
			"invoice_url":    invoiceURL,
			"enrolled_at":    en.EnrolledAt,
		})
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

	// --- kalkulasi progress lesson per enrollment (satu query batch) ---
	// Kumpulkan enrollment_uid dan course_uid terlebih dahulu.
	type enrollmentProgressKey struct {
		EnrollmentUID uuid.UUID
		CourseUID     uuid.UUID
	}
	var enrollmentKeys []enrollmentProgressKey
	var courseUIDs []uuid.UUID
	var enrollmentUIDs []uuid.UUID
	seenForProgress := make(map[uuid.UUID]struct{})
	for _, en := range enrollments {
		if en.Course == nil {
			continue
		}
		if _, already := seenForProgress[en.Uid]; already {
			continue
		}
		seenForProgress[en.Uid] = struct{}{}
		enrollmentKeys = append(enrollmentKeys, enrollmentProgressKey{EnrollmentUID: en.Uid, CourseUID: en.Course.Uid})
		courseUIDs = append(courseUIDs, en.Course.Uid)
		enrollmentUIDs = append(enrollmentUIDs, en.Uid)
	}

	// Total lesson per course (satu query)
	type lessonCountRow struct {
		CourseUID    uuid.UUID `gorm:"column:course_uid"`
		TotalLessons int64     `gorm:"column:total_lessons"`
	}
	var lessonCountRows []lessonCountRow
	if len(courseUIDs) > 0 {
		database.DB.Table("lessons l").
			Select("m.course_uid AS course_uid, COUNT(l.uid) AS total_lessons").
			Joins("JOIN modules m ON m.uid = l.module_uid").
			Where("m.course_uid IN ?", courseUIDs).
			Group("m.course_uid").
			Scan(&lessonCountRows)
	}
	totalLessonByCourse := make(map[uuid.UUID]int64, len(lessonCountRows))
	for _, row := range lessonCountRows {
		totalLessonByCourse[row.CourseUID] = row.TotalLessons
	}

	// Lesson yang sudah dibaca per enrollment (satu query)
	type readCountRow struct {
		EnrollmentUID uuid.UUID `gorm:"column:enrollment_uid"`
		ReadCount     int64     `gorm:"column:read_count"`
	}
	var readCountRows []readCountRow
	if len(enrollmentUIDs) > 0 {
		database.DB.Table("lesson_readings").
			Select("enrollment_uid, COUNT(uid) AS read_count").
			Where("enrollment_uid IN ?", enrollmentUIDs).
			Group("enrollment_uid").
			Scan(&readCountRows)
	}
	readCountByEnrollment := make(map[uuid.UUID]int64, len(readCountRows))
	for _, row := range readCountRows {
		readCountByEnrollment[row.EnrollmentUID] = row.ReadCount
	}

	// Hitung progress (0.0 – 1.0) per enrollment
	progressByEnrollment := make(map[uuid.UUID]float64, len(enrollmentKeys))
	for _, key := range enrollmentKeys {
		total := totalLessonByCourse[key.CourseUID]
		read := readCountByEnrollment[key.EnrollmentUID]
		if total > 0 {
			progressByEnrollment[key.EnrollmentUID] = float64(read) / float64(total)
		} else {
			progressByEnrollment[key.EnrollmentUID] = 0.0
		}
	}
	// --- akhir kalkulasi progress ---

	// --- batch query: assignment submission per course ---
	// Ambil semua submission assignment milik user di course-course yang diikuti,
	// beserta info module dan lesson tempat assignment itu berada.
	type assignmentSubmissionRow struct {
		SubmissionUID        uuid.UUID  `gorm:"column:submission_uid"`
		AttemptCount        int        `gorm:"column:attempt_count"`
		ScorePercent        *float64   `gorm:"column:score_percent"`
		Passed              *bool      `gorm:"column:passed"`
		IsAutoGraded        bool       `gorm:"column:is_auto_graded"`
		SubmittedAt         time.Time  `gorm:"column:submitted_at"`
		GradedAt            *time.Time `gorm:"column:graded_at"`
		AssignmentUID       uuid.UUID  `gorm:"column:assignment_uid"`
		AssignmentTitle     string     `gorm:"column:assignment_title"`
		AssignmentStatus    string     `gorm:"column:assignment_status"`
		AssignmentTaskType  string     `gorm:"column:assignment_task_type"`
		AssignmentDeadline  time.Time  `gorm:"column:assignment_deadline"`
		LessonUID           uuid.UUID  `gorm:"column:lesson_uid"`
		LessonTitle         string     `gorm:"column:lesson_title"`
		LessonOrderIndex    int        `gorm:"column:lesson_order_index"`
		ModuleUID           uuid.UUID  `gorm:"column:module_uid"`
		ModuleTitle         string     `gorm:"column:module_title"`
		ModuleOrderIndex    int        `gorm:"column:module_order_index"`
		CourseUID           uuid.UUID  `gorm:"column:course_uid"`
	}
	var assignmentSubmissionRows []assignmentSubmissionRow
	if len(courseUIDs) > 0 {
		database.DB.Table("lesson_assignment_submissions AS sub").
			Select(`
				sub.uid AS submission_uid,
				sub.attempt_count AS attempt_count,
				sub.score_percent AS score_percent,
				sub.passed AS passed,
				sub.is_auto_graded AS is_auto_graded,
				sub.created_at AS submitted_at,
				sub.graded_at AS graded_at,
				la.uid AS assignment_uid,
				la.title AS assignment_title,
				la.status AS assignment_status,
				la.task_type AS assignment_task_type,
				la.deadline_at AS assignment_deadline,
				l.uid AS lesson_uid,
				l.title AS lesson_title,
				l.order_index AS lesson_order_index,
				m.uid AS module_uid,
				m.title AS module_title,
				m.order_index AS module_order_index,
				m.course_uid AS course_uid`).
			Joins("JOIN lesson_assignments la ON la.uid = sub.lesson_assignment_uid").
			Joins("JOIN lessons l ON l.uid = la.lesson_uid").
			Joins("JOIN modules m ON m.uid = l.module_uid").
			Where("sub.user_uid = ? AND m.course_uid IN ?", targetUID, courseUIDs).
			Order("sub.created_at DESC").
			Scan(&assignmentSubmissionRows)
	}
	// Group submission per course_uid
	assignmentsByCourse := make(map[uuid.UUID][]gin.H)
	for _, row := range assignmentSubmissionRows {
		assignmentsByCourse[row.CourseUID] = append(assignmentsByCourse[row.CourseUID], gin.H{
			"submission_uid":  row.SubmissionUID,
			"attempt_count":   row.AttemptCount,
			"score_percent":   row.ScorePercent,
			"passed":          row.Passed,
			"is_auto_graded":  row.IsAutoGraded,
			"submitted_at":    row.SubmittedAt,
			"graded_at":       row.GradedAt,
			"assignment": gin.H{
				"uid":        row.AssignmentUID,
				"title":      utils.DecryptOrSelf(row.AssignmentTitle),
				"status":     row.AssignmentStatus,
				"task_type":  row.AssignmentTaskType,
				"deadline_at": row.AssignmentDeadline,
			},
			"lesson": gin.H{
				"uid":         row.LessonUID,
				"title":       utils.DecryptOrSelf(row.LessonTitle),
				"order_index": row.LessonOrderIndex,
			},
			"module": gin.H{
				"uid":         row.ModuleUID,
				"title":       utils.DecryptOrSelf(row.ModuleTitle),
				"order_index": row.ModuleOrderIndex,
			},
		})
	}
	// --- akhir batch query assignment ---

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
		calculatedProgress := progressByEnrollment[enrollment.Uid]
		courseItem := joinedCourseListItemResponse(*enrollment.Course, enrollment, calculatedProgress)
		assignments := assignmentsByCourse[enrollment.Course.Uid]
		if assignments == nil {
			assignments = []gin.H{}
		}
		courseItem["assignments"] = assignments
		courses = append(courses, courseItem)
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
				courseTitle = utils.DecryptOrSelf(*review.CourseTitle)
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
				courseTitle = utils.DecryptOrSelf(*trx.CourseTitle)
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

	type mentoredCourseRow struct {
		CourseUID   uuid.UUID           `gorm:"column:course_uid"`
		Title       string              `gorm:"column:title"`
		Subtitle    string              `gorm:"column:subtitle"`
		Slug        string              `gorm:"column:slug"`
		Level       entity.CourseLevel  `gorm:"column:level"`
		Status      entity.CourseStatus `gorm:"column:status"`
		Price       float64             `gorm:"column:price"`
		IsPremium   bool                `gorm:"column:is_premium"`
		IsPublished bool                `gorm:"column:is_published"`
		CreatedAt   time.Time           `gorm:"column:created_at"`
	}

	var mentoredCourseRows []mentoredCourseRow
	if err := database.DB.Table("courses AS c").
		Select(`
			c.uid AS course_uid,
			c.title,
			c.subtitle,
			c.slug,
			c.level,
			c.status,
			c.price,
			c.is_premium,
			c.is_published,
			c.created_at`).
		Joins("LEFT JOIN course_mentors cm ON cm.course_uid = c.uid AND cm.mentor_uid = ? AND cm.status = 'joined'", targetUID).
		Where("c.mentor_uid = ? OR cm.mentor_uid = ?", targetUID, targetUID).
		Group("c.uid").
		Order("c.created_at DESC").
		Scan(&mentoredCourseRows).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "Failed to retrieve mentored courses",
			"data":    nil,
			"error":   err.Error(),
		})
		return
	}

	mentoredCourseList := make([]gin.H, 0, len(mentoredCourseRows))
	for _, course := range mentoredCourseRows {
		mentoredCourseList = append(mentoredCourseList, gin.H{
			"uid":          course.CourseUID,
			"title":        utils.DecryptOrSelf(course.Title),
			"subtitle":     utils.DecryptOrSelf(course.Subtitle),
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
			"enrollment_summary":   enrollmentSummary,
			"enrollment_invoices":  enrollmentInvoices,
			"mentored_courses":     mentoredCourseList,
			"transaction_history":  transactions,
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

// @Summary      Update user role (Super Admin / Admin)
// @Description  Assign target roles admin, mentor, or student only (super_admin cannot be set via this endpoint). Only super_admin may assign the admin role; admin may assign mentor or student only. Changing roles for users who are already admin or super_admin requires the caller to be super_admin.
// @Tags         User Management
// @Accept       json
// @Produce      json
// @Security     BearerAuth
// @Param        id    path      string                           true  "User UID to update"
// @Param        body  body      dto.UpdateUserRoleRequest        true  "Target role: admin (super_admin only), mentor, or student"
// @Success      200   {object}  map[string]any                   "User role updated successfully"
// @Failure      400   {object}  map[string]any                   "Invalid role value (must be admin, mentor, or student)"
// @Failure      401   {object}  map[string]any                   "Unauthorized - Invalid or missing JWT token"
// @Failure      403   {object}  map[string]any                   "Forbidden - only super_admin may assign admin role, or insufficient permission for target user"
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

	if !hasAdminAccess(adminData.Role) {
		c.JSON(http.StatusForbidden, gin.H{
			"success": false,
			"message": "Access denied: Super Admin or Admin only",
			"data":    nil,
			"error":   nil,
		})
		return
	}

	targetUserUid, ok := resolveUIDParam(c, "users", "id", "user")
	if !ok {
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

	// Assignable roles via this endpoint (super_admin is not assignable here).
	validRoles := map[string]entity.UserRole{
		"admin":   entity.AdminRole,
		"mentor":  entity.MentorRole,
		"student": entity.StudentRole,
	}

	newRole, exists := validRoles[strings.ToLower(req.Role)]
	if !exists {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "Invalid role. Must be one of: admin, mentor, student",
			"data":    nil,
			"error":   nil,
		})
		return
	}

	if newRole == entity.AdminRole && adminData.Role != entity.SuperAdminRole {
		c.JSON(http.StatusForbidden, gin.H{
			"success": false,
			"message": "Only super_admin can assign the admin role",
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

// DeleteUserService deletes a user. Super Admin or Admin may use this endpoint.
//
// @Summary      Delete user account (Super Admin / Admin)
// @Description  Delete a user account permanently. Requires Super Admin or Admin. You cannot delete your own account.
// @Tags         User Management
// @Accept       json
// @Produce      json
// @Security     BearerAuth
// @Param        id  path      string  true  "User UID to delete"
// @Success      200  {object}  map[string]any  "User deleted successfully"
// @Failure      401  {object}  map[string]any  "Unauthorized - Invalid or missing JWT token"
// @Failure      403  {object}  map[string]any  "Forbidden — Super Admin or Admin only"
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

	if !hasAdminAccess(adminData.Role) {
		c.JSON(http.StatusForbidden, gin.H{
			"success": false,
			"message": "Access denied: Super Admin or Admin only",
			"data":    nil,
			"error":   nil,
		})
		return
	}

	targetUserUid, ok := resolveUIDParam(c, "users", "id", "user")
	if !ok {
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
// @Summary      Get all users with pagination (Super Admin / Admin)
// @Description  Retrieve paginated list of all users with optional filtering by role and search. Supports sorting by created_at or name. Requires Super Admin or Admin.
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
// @Failure      403  {object}  map[string]any  "Forbidden — Super Admin or Admin only"
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

	if !hasAdminAccess(userData.Role) {
		c.JSON(http.StatusForbidden, gin.H{
			"success": false,
			"message": "Access denied: Super Admin or Admin only",
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

	applyRoleFilter := func(db *gorm.DB) *gorm.DB {
		switch roleFilter {
		case string(entity.AdminRole):
			return db.Where("role IN ?", []entity.UserRole{entity.AdminRole, entity.SuperAdminRole})
		case "":
			return db
		default:
			return db.Where("role = ?", roleFilter)
		}
	}

	// If no search query provided, do DB-level pagination and filtering by role.
	if search == "" {
		db := database.DB.Model(&entity.User{})
		db = applyRoleFilter(db)

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
	db = applyRoleFilter(db)

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
