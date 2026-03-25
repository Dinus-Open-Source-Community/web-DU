package service

import (
	"backend/internal/database"
	"backend/internal/handler/middleware"
	"backend/internal/model/entity"
	"backend/internal/utils"
	"fmt"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

// @Summary      Create new course (Admin Only)
// @Description  Create a new course with details and optional thumbnail. Admin only.
// @Tags         Course
// @Accept       multipart/form-data
// @Produce      json
// @Security     BearerAuth
// @Param        title         formData  string  true   "Course title"
// @Param        slug          formData  string  true   "Course slug (unique identifier, lowercase with hyphens)"
// @Param        description   formData  string  true   "Course description"
// @Param        thumbnail     formData  file    false  "Course thumbnail image (JPG, PNG recommended)"
// @Param        price         formData  integer true   "Course price in cents"
// @Param        slot          formData  int     true   "Course slot capacity (0 = unlimited)"
// @Param        is_premium    formData  boolean true   "Whether course is premium (default: false)"
// @Param        is_published  formData  boolean true   "Whether course is published (default: false)"
// @Success      201  {object}  map[string]any  "Course created successfully"
// @Failure      401  {object}  map[string]any  "Unauthorized"
// @Failure      403  {object}  map[string]any  "Access denied: Admins only"
// @Failure      404  {object}  map[string]any  "User not found"
// @Failure      500  {object}  map[string]any  "Failed to create course"
// @Router       /courses [post]
func PostAdminCourseFunc(c *gin.Context) {
	userID, _ := c.Get(middleware.IDCK)

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
			"message": "Create Course Access denied: Admins only",
			"data":    nil,
			"error":   nil,
		})
		return
	}

	priceStr := c.PostForm("price")
	priceInt := 0
	if priceStr != "" {
		if p, err := strconv.Atoi(priceStr); err == nil {
			priceInt = p
		}
	}

	slotStr := c.PostForm("slot")
	slotInt := 0
	if slotStr != "" {
		if s, err := strconv.Atoi(slotStr); err == nil {
			slotInt = s
		}
	}

	var thumbnailURL string
	file, err := c.FormFile("thumbnail")
	if err == nil && file != nil {
		// Upload to MinIO
		bucket := utils.GetBucketCourses()
		url, err := utils.UploadFile(file, bucket)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{
				"success": false,
				"message": "Failed to upload thumbnail file",
				"data":    nil,
				"error":   err.Error(),
			})
			return
		}
		thumbnailURL = url
	}

	course := entity.Course{
		Title:        c.PostForm("title"),
		Slug:         c.PostForm("slug"),
		Description:  c.PostForm("description"),
		ThumbnailURL: thumbnailURL,
		Slot:         slotInt,
		Price:        float64(priceInt),
		IsPremium:    c.PostForm("is_premium") == "true",
		IsPublished:  c.PostForm("is_published") == "true",
	}

	if err := database.DB.Create(&course).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "Failed to create course",
			"data":    nil,
			"error":   err.Error(),
		})
		return
	}

	if err := database.DB.First(&course, course.ID).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "Failed to retrieve created course",
			"data":    nil,
			"error":   err.Error(),
		})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"success": true,
		"message": "Course created successfully",
		"data":    course,
		"error":   nil,
	})
}

// GetAllCoursesFunc returns a paginated list of courses with optional filters.
//
// Query parameters (all optional):
// - page (int, default 1)
// - per_page (int, default 10, max 100)
// - mentor_id (int)       -> filter by mentor_id
// - title (string)        -> search by title (case-insensitive)
// - price (float)         -> filter by exact price
// - is_premium (bool)     -> filter by premium status (true/false)
//
// @Summary      Get all courses with pagination and filters (All Roles)
// @Description  Retrieve paginated list of courses with optional filters (mentor_id, title, price, is_premium)
// @Tags         Course
// @Accept       json
// @Produce      json
// @Security     BearerAuth
// @Param        page        query  int     false  "Page number (default: 1)"
// @Param        per_page    query  int     false  "Items per page (default: 10, max: 100)"
// @Param        mentor_id   query  int     false  "Filter by mentor ID"
// @Param        title       query  string  false  "Search by title (case-insensitive)"
// @Param        price       query  number  false  "Filter by exact price"
// @Param        is_premium  query  bool    false  "Filter by premium status"
// @Success      200  {object}  map[string]any  "Courses retrieved successfully"
// @Failure      401  {object}  map[string]any  "Unauthorized"
// @Failure      404  {object}  map[string]any  "User not found"
// @Failure      500  {object}  map[string]any  "Failed to retrieve courses"
// @Router       /courses [get]
func GetAllCoursesFunc(c *gin.Context) {
	userID, _ := c.Get(middleware.IDCK)

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

	// Parse query params
	pageStr := c.DefaultQuery("page", "1")
	perPageStr := c.DefaultQuery("per_page", "10")
	mentorIDStr := c.Query("mentor_id")
	titleFilter := c.Query("title")
	priceStr := c.Query("price")
	isPremiumStr := c.Query("is_premium")

	page, err := strconv.Atoi(pageStr)
	if err != nil || page < 1 {
		page = 1
	}
	perPage, err := strconv.Atoi(perPageStr)
	if err != nil || perPage < 1 {
		perPage = 10
	}
	const maxPerPage = 100
	if perPage > maxPerPage {
		perPage = maxPerPage
	}

	// Build query with filters
	db := database.DB.Model(&entity.Course{})

	// Filter by mentor_id
	if mentorIDStr != "" {
		mentorID, err := strconv.Atoi(mentorIDStr)
		if err == nil {
			db = db.Where("mentor_id = ?", mentorID)
		}
	}

	// Filter by title (case-insensitive search)
	if titleFilter != "" {
		db = db.Where("LOWER(title) LIKE ?", "%"+titleFilter+"%")
	}

	// Filter by price
	if priceStr != "" {
		price, err := strconv.ParseFloat(priceStr, 64)
		if err == nil {
			db = db.Where("price = ?", price)
		}
	}

	// Filter by is_premium
	if isPremiumStr != "" {
		isPremium := isPremiumStr == "true" || isPremiumStr == "1"
		db = db.Where("is_premium = ?", isPremium)
	}

	// Count total records
	var total int64
	if err := db.Count(&total).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "Failed to count courses",
			"data":    nil,
			"error":   err.Error(),
		})
		return
	}

	// Apply pagination
	offset := (page - 1) * perPage
	var courses []entity.Course
	if err := db.Preload("Modules").Order("created_at DESC").Limit(perPage).Offset(offset).Find(&courses).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "Failed to retrieve courses",
			"data":    nil,
			"error":   err.Error(),
		})
		return
	}

	totalPages := int((total + int64(perPage) - 1) / int64(perPage))

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Courses retrieved successfully",
		"data": gin.H{
			"courses": courses,
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

// @Summary      Get course by ID (All Roles)
// @Description  Retrieve complete information of a specific course including all modules
// @Tags         Course
// @Accept       json
// @Produce      json
// @Security     BearerAuth
// @Param        id   path      int     true  "Course ID"
// @Success      200  {object}  map[string]any  "Course retrieved successfully"
// @Failure      401  {object}  map[string]any  "Unauthorized"
// @Failure      404  {object}  map[string]any  "Course not found"
// @Failure      500  {object}  map[string]any  "Internal server error"
// @Router       /courses/{id} [get]
func GetCourseByIDFunc(c *gin.Context) {
	courseID := c.Param("id")

	var course entity.Course
	if err := database.DB.Preload("Modules").First(&course, courseID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"success": false,
			"message": "Course not found",
			"data":    nil,
			"error":   err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Course retrieved successfully",
		"data":    course,
		"error":   nil,
	})
}

// @Summary      Join a course (Student Only)
// @Description  Allow authenticated students to enroll in a course. Creates an enrollment record.
// @Tags         Course
// @Accept       json
// @Produce      json
// @Security     BearerAuth
// @Param        id   path  int  true  "Course ID to enroll in"
// @Success      201  {object}  map[string]any  "Successfully enrolled in course"
// @Failure      400  {object}  map[string]any  "Already enrolled in this course"
// @Failure      401  {object}  map[string]any  "Unauthorized"
// @Failure      403  {object}  map[string]any  "Access denied: Students only"
// @Failure      404  {object}  map[string]any  "Course or user not found"
// @Failure      500  {object}  map[string]any  "Failed to join course"
// @Router       /courses/{id}/join [post]
func JoinCourseFunc(c *gin.Context) {
	userID, _ := c.Get(middleware.IDCK)

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

	if userData.Role != entity.StudentRole {
		c.JSON(http.StatusForbidden, gin.H{
			"success": false,
			"message": "Join Course Access denied: Students only. Admins and Mentors cannot join courses",
			"data":    nil,
			"error":   nil,
		})
		return
	}

	courseID := c.Param("id")

	var course entity.Course
	if err := database.DB.First(&course, courseID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"success": false,
			"message": "Course not found",
			"data":    nil,
			"error":   err.Error(),
		})
		return
	}

	var existingEnrollment entity.Enrollment
	err := database.DB.Where("user_id = ? AND course_id = ?", userData.ID, course.ID).First(&existingEnrollment).Error
	if err == nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "Already enrolled in this course",
			"data":    nil,
			"error":   nil,
		})
		return
	}

	if course.Slot > 0 {
		var totalParticipants int64
		if err := database.DB.Model(&entity.Enrollment{}).Where("course_id = ?", course.ID).Count(&totalParticipants).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{
				"success": false,
				"message": "Failed to check course quota",
				"data":    nil,
				"error":   err.Error(),
			})
			return
		}

		if int(totalParticipants) >= course.Slot {
			c.JSON(http.StatusBadRequest, gin.H{
				"success": false,
				"message": "Class is full",
				"data":    nil,
				"error":   nil,
			})
			return
		}
	}

	enrollment := entity.Enrollment{
		UserID:   userData.ID,
		CourseID: course.ID,
		Status:   entity.EnrollmentPending,
		Progress: 0,
	}

	if err := database.DB.Create(&enrollment).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "Failed to join course",
			"data":    nil,
			"error":   err.Error(),
		})
		return
	}

	if err := database.DB.Preload("User").Preload("Course").First(&enrollment, enrollment.ID).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "Failed to retrieve enrollment",
			"data":    nil,
			"error":   err.Error(),
		})
		return
	}

	// Generate and upload invoice
	invoiceURL, _, err := CreateAndUploadInvoice(&enrollment)
	if err != nil {
		// Log the error but don't fail the enrollment
		// Invoice generation is non-critical
		fmt.Printf("Warning: Failed to generate invoice for enrollment %d: %v\n", enrollment.ID, err)
	}

	c.JSON(http.StatusCreated, gin.H{
		"success": true,
		"message": "Successfully enrolled in course",
		"data": gin.H{
			"enrollment":  enrollment,
			"invoice_url": invoiceURL,
		},
		"error": nil,
	})
}

// @Summary      Get all enrolled students in a course (Admin Only)
// @Description  Retrieve list of all students enrolled in a specific course. Admin only endpoint.
// @Tags         Course
// @Accept       json
// @Produce      json
// @Security     BearerAuth
// @Param        id       path  int  true   "Course ID"
// @Param        page     query int  false  "Page number (default: 1)"
// @Param        per_page query int  false  "Items per page (default: 10, max: 100)"
// @Success      200  {object}  map[string]any  "Students retrieved successfully"
// @Failure      401  {object}  map[string]any  "Unauthorized"
// @Failure      403  {object}  map[string]any  "Access denied: Admins only"
// @Failure      404  {object}  map[string]any  "Course not found"
// @Failure      500  {object}  map[string]any  "Failed to retrieve students"
// @Router       /courses/{id}/students [get]
func GetCourseStudentsFunc(c *gin.Context) {
	userID, _ := c.Get(middleware.IDCK)

	// Verify user is admin
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
			"message": "Get Course Students Access denied: Admins only",
			"data":    nil,
			"error":   nil,
		})
		return
	}

	courseID := c.Param("id")

	// Verify course exists
	var course entity.Course
	if err := database.DB.First(&course, courseID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"success": false,
			"message": "Course not found",
			"data":    nil,
			"error":   err.Error(),
		})
		return
	}

	// Parse pagination params
	pageStr := c.DefaultQuery("page", "1")
	perPageStr := c.DefaultQuery("per_page", "10")

	page, err := strconv.Atoi(pageStr)
	if err != nil || page < 1 {
		page = 1
	}
	perPage, err := strconv.Atoi(perPageStr)
	if err != nil || perPage < 1 {
		perPage = 10
	}
	const maxPerPage = 100
	if perPage > maxPerPage {
		perPage = maxPerPage
	}

	// Count total enrollments for this course
	var total int64
	if err := database.DB.Model(&entity.Enrollment{}).Where("course_id = ?", course.ID).Count(&total).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "Failed to count students",
			"data":    nil,
			"error":   err.Error(),
		})
		return
	}

	// Get paginated enrollments
	offset := (page - 1) * perPage
	var enrollments []entity.Enrollment
	if err := database.DB.Where("course_id = ?", course.ID).
		Preload("User").
		Order("enrolled_at DESC").
		Limit(perPage).
		Offset(offset).
		Find(&enrollments).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "Failed to retrieve students",
			"data":    nil,
			"error":   err.Error(),
		})
		return
	}

	totalPages := int((total + int64(perPage) - 1) / int64(perPage))

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Students retrieved successfully",
		"data": gin.H{
			"enrollments": enrollments,
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

// @Summary      Get course enrollment invoice (All Roles)
// @Description  Retrieve or generate invoice for a specific enrollment
// @Tags         Course
// @Accept       json
// @Produce      json
// @Security     BearerAuth
// @Param        enrollment_id   path      int     true  "Enrollment ID"
// @Success      200  {object}  map[string]any  "Invoice retrieved successfully"
// @Failure      401  {object}  map[string]any  "Unauthorized"
// @Failure      404  {object}  map[string]any  "Enrollment not found"
// @Failure      500  {object}  map[string]any  "Failed to retrieve invoice"
// @Router       /enrollments/{enrollment_id}/invoice [get]
func GetEnrollmentInvoiceFunc(c *gin.Context) {
	userID, _ := c.Get(middleware.IDCK)
	enrollmentID := c.Param("enrollment_id")

	// Verify user exists
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

	// Fetch enrollment
	var enrollment entity.Enrollment
	if err := database.DB.Preload("User").Preload("Course").First(&enrollment, enrollmentID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"success": false,
			"message": "Enrollment not found",
			"data":    nil,
			"error":   err.Error(),
		})
		return
	}

	// Verify user has permission to view this invoice
	// Only allow if user is admin, mentor of the course, or the enrolled student
	isAuthorized := userData.Role == entity.AdminRole ||
		userData.ID == enrollment.UserID ||
		(userData.Role == entity.MentorRole && enrollment.Course.MentorID != nil && *enrollment.Course.MentorID == userData.ID)

	if !isAuthorized {
		c.JSON(http.StatusForbidden, gin.H{
			"success": false,
			"message": "Access denied: You can only view your own enrollment invoice",
			"data":    nil,
			"error":   nil,
		})
		return
	}

	// Generate invoice filename
	filename := fmt.Sprintf("%dT%dT%dT%s.pdf",
		enrollment.ID,
		enrollment.UserID,
		enrollment.CourseID,
		enrollment.EnrolledAt.Format("20060102"))

	// Construct invoice URL
	invoiceURL := utils.GetPublicURL(utils.GetBucketInvoices(), filename)

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Invoice retrieved successfully",
		"data": gin.H{
			"enrollment_id": enrollment.ID,
			"user_id":       enrollment.UserID,
			"course_id":     enrollment.CourseID,
			"filename":      filename,
			"invoice_url":   invoiceURL,
			"enrolled_at":   enrollment.EnrolledAt,
		},
		"error": nil,
	})
}

// @Summary      Get invoice URL by enrollment details (All Roles)
// @Description  Retrieve invoice URL by providing enrollment_id, user_id, and course_id as query parameters
// @Tags         Invoice
// @Accept       json
// @Produce      json
// @Security     BearerAuth
// @Param        enrollment_id   query  int     true  "Enrollment ID"
// @Param        user_id         query  int     true  "User ID"
// @Param        course_id       query  int     true  "Course ID"
// @Success      200  {object}  map[string]any  "Invoice URL retrieved successfully"
// @Failure      400  {object}  map[string]any  "Missing required parameters"
// @Failure      401  {object}  map[string]any  "Unauthorized"
// @Failure      404  {object}  map[string]any  "Enrollment not found"
// @Failure      500  {object}  map[string]any  "Internal server error"
// @Router       /invoices/url [get]
func GetInvoiceURLFunc(c *gin.Context) {
	userID, _ := c.Get(middleware.IDCK)

	// Verify user exists
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

	// Get query parameters
	enrollmentIDStr := c.Query("enrollment_id")
	userIDStr := c.Query("user_id")
	courseIDStr := c.Query("course_id")

	// Validate parameters
	if enrollmentIDStr == "" || userIDStr == "" || courseIDStr == "" {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "Missing required parameters: enrollment_id, user_id, course_id",
			"data":    nil,
			"error":   nil,
		})
		return
	}

	// Parse parameters
	enrollmentID, err := strconv.ParseUint(enrollmentIDStr, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "Invalid enrollment_id parameter",
			"data":    nil,
			"error":   err.Error(),
		})
		return
	}

	parsedUserID, err := strconv.ParseUint(userIDStr, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "Invalid user_id parameter",
			"data":    nil,
			"error":   err.Error(),
		})
		return
	}

	courseID, err := strconv.ParseUint(courseIDStr, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "Invalid course_id parameter",
			"data":    nil,
			"error":   err.Error(),
		})
		return
	}

	// Fetch enrollment to verify it exists and belongs to the user
	var enrollment entity.Enrollment
	if err := database.DB.First(&enrollment, enrollmentID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"success": false,
			"message": "Enrollment not found",
			"data":    nil,
			"error":   err.Error(),
		})
		return
	}

	// Verify the enrollment matches the provided parameters
	if enrollment.UserID != uint(parsedUserID) || enrollment.CourseID != uint(courseID) {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "Enrollment parameters do not match",
			"data":    nil,
			"error":   nil,
		})
		return
	}

	// Verify authorization
	// Only allow if user is admin, owner of enrollment, or mentor of the course
	isAuthorized := userData.Role == entity.AdminRole ||
		userData.ID == enrollment.UserID

	if !isAuthorized {
		// Check if user is mentor of the course
		var course entity.Course
		if err := database.DB.First(&course, courseID).Error; err == nil {
			if course.MentorID != nil && *course.MentorID == userData.ID {
				isAuthorized = true
			}
		}
	}

	if !isAuthorized {
		c.JSON(http.StatusForbidden, gin.H{
			"success": false,
			"message": "Access denied: You don't have permission to view this invoice",
			"data":    nil,
			"error":   nil,
		})
		return
	}

	// Generate invoice filename: {enrollmentID}T{userID}T{courseID}T{dateYYYYMMDD}.pdf
	filename := fmt.Sprintf("%dT%dT%dT%s.pdf",
		enrollment.ID,
		enrollment.UserID,
		enrollment.CourseID,
		enrollment.EnrolledAt.Format("20060102"))

	// Construct invoice URL
	invoiceURL := utils.GetPublicURL(utils.GetBucketInvoices(), filename)

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Invoice URL retrieved successfully",
		"data": gin.H{
			"enrollment_id": enrollment.ID,
			"user_id":       enrollment.UserID,
			"course_id":     enrollment.CourseID,
			"filename":      filename,
			"invoice_url":   invoiceURL,
			"enrolled_at":   enrollment.EnrolledAt,
		},
		"error": nil,
	})
}
