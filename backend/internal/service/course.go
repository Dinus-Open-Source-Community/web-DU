package service

import (
	"backend/internal/database"
	"backend/internal/handler/middleware"
	"backend/internal/model/dto"
	"backend/internal/model/entity"
	"backend/internal/utils"
	"encoding/json"
	"fmt"
	"net/http"
	"regexp"
	"strconv"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

var slugInvalidChars = regexp.MustCompile(`[^a-z0-9-]+`)

func buildSlug(raw string) string {
	raw = strings.TrimSpace(strings.ToLower(raw))
	raw = strings.ReplaceAll(raw, " ", "-")
	raw = slugInvalidChars.ReplaceAllString(raw, "")
	raw = strings.Trim(raw, "-")
	if raw == "" {
		return "course"
	}
	return raw
}

func parseFormBool(v string) bool {
	v = strings.TrimSpace(strings.ToLower(v))
	return v == "true" || v == "1"
}

func parseWhatYouLearn(c *gin.Context) (json.RawMessage, error) {
	if list := c.PostFormArray("what_you_learn[]"); len(list) > 0 {
		for i := range list {
			list[i] = strings.TrimSpace(list[i])
		}
		return json.Marshal(list)
	}

	if list := c.PostFormArray("what_you_learn"); len(list) > 1 {
		for i := range list {
			list[i] = strings.TrimSpace(list[i])
		}
		return json.Marshal(list)
	}

	raw := strings.TrimSpace(c.PostForm("what_you_learn"))
	if raw == "" {
		return json.Marshal([]string{})
	}

	var arr []string
	if err := json.Unmarshal([]byte(raw), &arr); err != nil {
		return nil, err
	}

	for i := range arr {
		arr[i] = strings.TrimSpace(arr[i])
	}

	return json.Marshal(arr)
}

// @Summary      Create new course (Admin Only)
// @Description  Create a new course with cover, title, subtitle/header, dynamic category, dynamic class type, level, pricing, and learning points. Admin only.
// @Tags         Course
// @Accept       multipart/form-data
// @Produce      json
// @Security     BearerAuth
// @Param        cover            formData  file    false  "Course cover image (JPG, PNG recommended). Fallback key: thumbnail"
// @Param        title            formData  string  true   "Course title"
// @Param        subtitle         formData  string  false  "Course subtitle/header"
// @Param        header           formData  string  false  "Alias for subtitle"
// @Param        slug             formData  string  false  "Course slug (auto-generated from title when empty)"
// @Param        category_uid     formData  string  true   "Dynamic category uid"
// @Param        class_type_uid   formData  string  true   "Dynamic class type uid"
// @Param        level            formData  string  true   "Course level: PEMULA | MENENGAH | LANJUTAN"
// @Param        price            formData  number  true   "Course selling price"
// @Param        price_strike     formData  number  false  "Displayed strike-through/original price"
// @Param        what_you_learn   formData  string  true   "JSON array of strings, e.g. [\"Gtw 1\", \"Gtw 2\"]"
// @Param        description      formData  string  true   "Course description"
// @Param        slot             formData  int     false  "Course slot capacity (0 = unlimited)"
// @Param        is_premium       formData  boolean false  "Whether course is premium (default: false)"
// @Param        is_published     formData  boolean false  "Whether course is published (default: false)"
// @Success      201  {object}  map[string]any  "Course created successfully"
// @Failure      400  {object}  map[string]any  "Invalid request payload"
// @Failure      401  {object}  map[string]any  "Unauthorized"
// @Failure      403  {object}  map[string]any  "Access denied: Admins only"
// @Failure      404  {object}  map[string]any  "User not found"
// @Failure      500  {object}  map[string]any  "Failed to create course"
// @Router       /courses [post]
func PostAdminCourseFunc(c *gin.Context) {
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
			"message": "Create Course Access denied: Admins only",
			"data":    nil,
			"error":   nil,
		})
		return
	}

	title := strings.TrimSpace(c.PostForm("title"))
	if title == "" {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "title is required",
			"data":    nil,
			"error":   nil,
		})
		return
	}

	description := strings.TrimSpace(c.PostForm("description"))
	if description == "" {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "description is required",
			"data":    nil,
			"error":   nil,
		})
		return
	}

	subtitle := strings.TrimSpace(c.PostForm("subtitle"))
	if subtitle == "" {
		subtitle = strings.TrimSpace(c.PostForm("header"))
	}

	slug := strings.TrimSpace(c.PostForm("slug"))
	if slug == "" {
		slug = buildSlug(title)
	} else {
		slug = buildSlug(slug)
	}

	priceStr := strings.TrimSpace(c.PostForm("price"))
	price, err := strconv.ParseFloat(priceStr, 64)
	if err != nil || price < 0 {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "price is required and must be a valid non-negative number",
			"data":    nil,
			"error":   nil,
		})
		return
	}

	priceStrike := 0.0
	priceStrikeStr := strings.TrimSpace(c.PostForm("price_strike"))
	if priceStrikeStr != "" {
		parsed, err := strconv.ParseFloat(priceStrikeStr, 64)
		if err != nil || parsed < 0 {
			c.JSON(http.StatusBadRequest, gin.H{
				"success": false,
				"message": "price_strike must be a valid non-negative number",
				"data":    nil,
				"error":   nil,
			})
			return
		}
		priceStrike = parsed
	}

	learningPointsRaw, err := parseWhatYouLearn(c)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "what_you_learn must be a valid JSON array of strings",
			"data":    nil,
			"error":   err.Error(),
		})
		return
	}

	categoryUIDStr := strings.TrimSpace(c.PostForm("category_uid"))
	categoryUID, err := uuid.Parse(categoryUIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "category_uid is required and must be a valid UUID",
			"data":    nil,
			"error":   err.Error(),
		})
		return
	}

	var category entity.CourseCategory
	if err := database.DB.First(&category, categoryUID).Error; err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "category_uid not found",
			"data":    nil,
			"error":   err.Error(),
		})
		return
	}

	classTypeUIDStr := strings.TrimSpace(c.PostForm("class_type_uid"))
	classTypeUID, err := uuid.Parse(classTypeUIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "class_type_uid is required and must be a valid UUID",
			"data":    nil,
			"error":   err.Error(),
		})
		return
	}

	var classType entity.ClassType
	if err := database.DB.First(&classType, classTypeUID).Error; err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "class_type_uid not found",
			"data":    nil,
			"error":   err.Error(),
		})
		return
	}

	levelInput := strings.ToUpper(strings.TrimSpace(c.PostForm("level")))
	var level entity.CourseLevel
	switch entity.CourseLevel(levelInput) {
	case entity.CourseLevelPemula, entity.CourseLevelMenengah, entity.CourseLevelLanjutan:
		level = entity.CourseLevel(levelInput)
	default:
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "level harus salah satu dari: PEMULA, MENENGAH, LANJUTAN",
			"data":    nil,
			"error":   nil,
		})
		return
	}

	slotStr := c.PostForm("slot")
	slotInt := 0
	if slotStr != "" {
		if s, err := strconv.Atoi(slotStr); err == nil && s >= 0 {
			slotInt = s
		} else {
			c.JSON(http.StatusBadRequest, gin.H{
				"success": false,
				"message": "slot must be a valid non-negative integer",
				"data":    nil,
				"error":   nil,
			})
			return
		}
	}

	var coverURL string
	file, err := c.FormFile("cover")
	if err != nil || file == nil {
		file, err = c.FormFile("thumbnail")
	}
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
		coverURL = url
	}

	course := entity.Course{
		Title:        title,
		Subtitle:     subtitle,
		Slug:         slug,
		CategoryUid:  &categoryUID,
		ClassTypeUid: &classTypeUID,
		Level:        level,
		Status:       entity.CourseStatusDraft,
		Description:  description,
		CoverURL:     coverURL,
		ThumbnailURL: coverURL,
		WhatYouLearn: learningPointsRaw,
		Slot:         slotInt,
		Price:        price,
		PriceStrike:  priceStrike,
		IsPremium:    parseFormBool(c.PostForm("is_premium")),
		IsPublished:  parseFormBool(c.PostForm("is_published")),
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

	if err := database.DB.Preload("Category").Preload("ClassType").First(&course, course.Uid).Error; err != nil {
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

	// Filter by mentor_uid (UUID) across legacy primary mentor and new course_mentors assignments.
	if mentorIDStr != "" {
		if mentorUid, err := uuid.Parse(mentorIDStr); err == nil {
			db = db.Where(
				"mentor_uid = ? OR EXISTS (SELECT 1 FROM course_mentors cm WHERE cm.course_uid = courses.uid AND cm.mentor_uid = ?)",
				mentorUid,
				mentorUid,
			)
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
	if err := db.Preload("Modules").Preload("Category").Preload("ClassType").Order("created_at DESC").Limit(perPage).Offset(offset).Find(&courses).Error; err != nil {
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
	if err := database.DB.Preload("Modules").Preload("Category").Preload("ClassType").First(&course, courseID).Error; err != nil {
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

// @Summary      Activate course status (Admin Only)
// @Description  Set course status to ACTIVE. Admin only endpoint.
// @Tags         Course
// @Accept       json
// @Produce      json
// @Security     BearerAuth
// @Param        id   path      string  true  "Course UID"
// @Success      200  {object}  map[string]any  "Course status updated successfully"
// @Failure      401  {object}  map[string]any  "Unauthorized"
// @Failure      403  {object}  map[string]any  "Access denied: Admins only"
// @Failure      404  {object}  map[string]any  "Course or user not found"
// @Failure      500  {object}  map[string]any  "Failed to update course status"
// @Router       /courses/{id}/status [patch]
func ActivateCourseStatusFunc(c *gin.Context) {
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
			"message": "Update Course Status Access denied: Admins only",
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

	course.Status = entity.CourseStatusActive
	if err := database.DB.Save(&course).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "Failed to update course status",
			"data":    nil,
			"error":   err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Course status updated successfully",
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
	err := database.DB.Where("user_uid = ? AND course_uid = ?", userData.Uid, course.Uid).First(&existingEnrollment).Error
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
		if err := database.DB.Model(&entity.Enrollment{}).Where("course_uid = ?", course.Uid).Count(&totalParticipants).Error; err != nil {
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
		UserUid:   userData.Uid,
		CourseUid: course.Uid,
		Status:    entity.EnrollmentPending,
		Progress:  0,
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

	if err := database.DB.Preload("User").Preload("Course").First(&enrollment, enrollment.Uid).Error; err != nil {
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
		fmt.Printf("Warning: Failed to generate invoice for enrollment %s: %v\n", enrollment.Uid.String(), err)
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

type CourseStudentSafeItem struct {
	EnrollmentUid    uuid.UUID               `json:"enrollment_uid"`
	StudentUid       uuid.UUID               `json:"student_uid"`
	StudentName      string                  `json:"student_name"`
	StudentAvatarURL string                  `json:"student_avatar_url,omitempty"`
	EnrolledAt       time.Time               `json:"enrolled_at"`
	Progress         float64                 `json:"progress"`
	Status           entity.EnrollmentStatus `json:"status"`
}

// @Summary      Get all enrolled students in a course (All Roles)
// @Description  Retrieve list of all students enrolled in a specific course for authenticated users. Response is sanitized and excludes sensitive user fields.
// @Tags         Course
// @Accept       json
// @Produce      json
// @Security     BearerAuth
// @Param        id       path  int  true   "Course ID"
// @Param        page     query int  false  "Page number (default: 1)"
// @Param        per_page query int  false  "Items per page (default: 10, max: 100)"
// @Success      200  {object}  map[string]any  "Students retrieved successfully"
// @Failure      401  {object}  map[string]any  "Unauthorized"
// @Failure      404  {object}  map[string]any  "Course not found"
// @Failure      500  {object}  map[string]any  "Failed to retrieve students"
// @Router       /courses/{id}/students [get]
func GetCourseStudentsFunc(c *gin.Context) {
	userID, _ := c.Get(middleware.UIDCK)

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
	if err := database.DB.Table("enrollments e").
		Joins("JOIN users u ON u.uid = e.user_uid").
		Where("e.course_uid = ?", course.Uid).
		Where("u.role = ?", entity.StudentRole).
		Count(&total).Error; err != nil {
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
	var students []CourseStudentSafeItem
	if err := database.DB.Table("enrollments e").
		Select(`
			e.uid as enrollment_uid,
			e.user_uid as student_uid,
			u.name as student_name,
			u.avatar_url as student_avatar_url,
			e.enrolled_at,
			e.progress,
			e.status
		`).
		Joins("JOIN users u ON u.uid = e.user_uid").
		Where("e.course_uid = ?", course.Uid).
		Where("u.role = ?", entity.StudentRole).
		Order("e.enrolled_at DESC").
		Limit(perPage).
		Offset(offset).
		Scan(&students).Error; err != nil {
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
			"enrollments": students,
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
	userID, _ := c.Get(middleware.UIDCK)
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
		userData.Uid == enrollment.UserUid ||
		(userData.Role == entity.MentorRole && enrollment.Course.MentorUid != nil && *enrollment.Course.MentorUid == userData.Uid)

	if !isAuthorized {
		c.JSON(http.StatusForbidden, gin.H{
			"success": false,
			"message": "Access denied: You can only view your own enrollment invoice",
			"data":    nil,
			"error":   nil,
		})
		return
	}

	filename := dto.GenerateInvoiceFilename(
		enrollment.Uid,
		enrollment.UserUid,
		enrollment.CourseUid,
		enrollment.EnrolledAt)

	// Construct invoice URL
	invoiceURL := utils.GetPublicURL(utils.GetBucketInvoices(), filename)

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Invoice retrieved successfully",
		"data": gin.H{
			"enrollment_uid": enrollment.Uid,
			"user_uid":       enrollment.UserUid,
			"course_uid":     enrollment.CourseUid,
			"filename":       filename,
			"invoice_url":    invoiceURL,
			"enrolled_at":    enrollment.EnrolledAt,
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
	userID, _ := c.Get(middleware.UIDCK)

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

	enrollUid, err := uuid.Parse(enrollmentIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "Invalid enrollment_id parameter (expected UUID)",
			"data":    nil,
			"error":   err.Error(),
		})
		return
	}

	parsedUserUid, err := uuid.Parse(userIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "Invalid user_id parameter (expected UUID)",
			"data":    nil,
			"error":   err.Error(),
		})
		return
	}

	courseUidParam, err := uuid.Parse(courseIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "Invalid course_id parameter (expected UUID)",
			"data":    nil,
			"error":   err.Error(),
		})
		return
	}

	var enrollment entity.Enrollment
	if err := database.DB.First(&enrollment, enrollUid).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"success": false,
			"message": "Enrollment not found",
			"data":    nil,
			"error":   err.Error(),
		})
		return
	}

	if enrollment.UserUid != parsedUserUid || enrollment.CourseUid != courseUidParam {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "Enrollment parameters do not match",
			"data":    nil,
			"error":   nil,
		})
		return
	}

	isAuthorized := userData.Role == entity.AdminRole ||
		userData.Uid == enrollment.UserUid

	if !isAuthorized {
		var course entity.Course
		if err := database.DB.First(&course, courseUidParam).Error; err == nil {
			if course.MentorUid != nil && *course.MentorUid == userData.Uid {
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

	filename := dto.GenerateInvoiceFilename(
		enrollment.Uid,
		enrollment.UserUid,
		enrollment.CourseUid,
		enrollment.EnrolledAt)

	invoiceURL := utils.GetPublicURL(utils.GetBucketInvoices(), filename)

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Invoice URL retrieved successfully",
		"data": gin.H{
			"enrollment_uid": enrollment.Uid,
			"user_uid":       enrollment.UserUid,
			"course_uid":     enrollment.CourseUid,
			"filename":       filename,
			"invoice_url":    invoiceURL,
			"enrolled_at":    enrollment.EnrolledAt,
		},
		"error": nil,
	})
}
