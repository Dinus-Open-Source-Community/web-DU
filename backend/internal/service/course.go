package service

import (
	"backend/internal/database"
	"backend/internal/handler/middleware"
	"backend/internal/model/entity"
	"backend/internal/utils"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

// @Summary      Create new course
// @Description  Create a new course with details and optional thumbnail. Admin only.
// @Tags         Course
// @Accept       multipart/form-data
// @Produce      json
// @Security     BearerAuth
// @Param        title         formData  string  true   "Course title"
// @Param        slug          formData  string  true   "Course slug (unique identifier, lowercase with hyphens)"
// @Param        description   formData  string  false  "Course description"
// @Param        thumbnail     formData  file    false  "Course thumbnail image (JPG, PNG recommended)"
// @Param        price         formData  integer false  "Course price (optional for free courses)"
// @Param        is_premium    formData  boolean false  "Whether course is premium (default: false)"
// @Param        is_published  formData  boolean false  "Whether course is published (default: false)"
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
// @Summary      Get all courses with pagination and filters
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

// @Summary      Get course by ID
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

// @Summary      Join a course (Students only)
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

	// Fetch user data
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

	// Check if user is a student
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

	// Fetch course data
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

	// Check if user is already enrolled
	var existingEnrollment entity.Enrollment
	err := database.DB.Where("user_id = ? AND course_id = ?", userData.ID, course.ID).First(&existingEnrollment).Error
	if err == nil {
		// Enrollment already exists
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "Already enrolled in this course",
			"data":    nil,
			"error":   nil,
		})
		return
	}

	// Create new enrollment
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

	// Fetch the created enrollment with relations
	if err := database.DB.Preload("User").Preload("Course").First(&enrollment, enrollment.ID).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "Failed to retrieve enrollment",
			"data":    nil,
			"error":   err.Error(),
		})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"success": true,
		"message": "Successfully enrolled in course",
		"data":    enrollment,
		"error":   nil,
	})
}
