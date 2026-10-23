package service

import (
	"backend/internal/database"
	"backend/internal/handler/middleware"
	"backend/internal/model/entity"
	"backend/internal/utils"
	"encoding/json"
	"net/http"
	"regexp"
	"strconv"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"gorm.io/gorm"
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

// @Summary      Create new course (Super Admin / Admin)
// @Description  Create a new course with cover, title, subtitle/header, dynamic category, dynamic class type, level, and learning points. Requires Super Admin or Admin.
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
// @Param        course_type_uid  formData  string  true   "Dynamic course type uid"
// @Param        level            formData  string  true   "Course level: PEMULA | MENENGAH | LANJUTAN"
// @Param        what_you_learn   formData  string  true   "JSON array of strings, e.g. [\"Gtw 1\", \"Gtw 2\"]"
// @Param        description      formData  string  true   "Course description"
// @Param        slot             formData  int     false  "Course slot capacity (0 = unlimited)"
// @Param        is_published     formData  boolean false  "Whether course is published (default: false)"
// @Success      201  {object}  map[string]any  "Course created successfully"
// @Failure      400  {object}  map[string]any  "Invalid request payload"
// @Failure      401  {object}  map[string]any  "Unauthorized"
// @Failure      403  {object}  map[string]any  "Access denied: Super Admin or Admin only"
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

	if !hasAdminAccess(userData.Role) {
		c.JSON(http.StatusForbidden, gin.H{
			"success": false,
			"message": "Create course access denied: Super Admin or Admin only",
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
	categoryUID, ok := resolveUIDValue(c, "course_categories", categoryUIDStr, "category")
	if !ok {
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

	classTypeUIDStr := strings.TrimSpace(c.PostForm("course_type_uid"))
	if classTypeUIDStr == "" {
		classTypeUIDStr = strings.TrimSpace(c.PostForm("class_type_uid"))
	}
	classTypeUID, ok := resolveUIDValue(c, "class_types", classTypeUIDStr, "course type")
	if !ok {
		return
	}

	var classType entity.ClassType
	if err := database.DB.First(&classType, classTypeUID).Error; err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "course_type_uid not found",
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
			"message": "level must be one of: PEMULA, MENENGAH, LANJUTAN (beginner, intermediate, advanced)",
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

	titleEnc, err := utils.Encrypt(title)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "message": "Failed to encrypt title", "data": nil, "error": err.Error()})
		return
	}
	subtitleEnc, err := utils.Encrypt(subtitle)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "message": "Failed to encrypt subtitle", "data": nil, "error": err.Error()})
		return
	}
	descriptionEnc, err := utils.Encrypt(description)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "message": "Failed to encrypt description", "data": nil, "error": err.Error()})
		return
	}

	creatorUID := userID.(uuid.UUID)
	course := entity.Course{
		CreatedByUid: &creatorUID,
		Title:        titleEnc,
		Subtitle:     subtitleEnc,
		Slug:         slug,
		CategoryUid:  &categoryUID,
		ClassTypeUid: &classTypeUID,
		Level:        level,
		Status:       entity.CourseStatusDraft,
		Description:  descriptionEnc,
		CoverURL:     coverURL,
		ThumbnailURL: coverURL,
		WhatYouLearn: learningPointsRaw,
		Slot:         slotInt,
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

	if err := database.DB.Preload("Category").Preload("ClassType").Preload("Mentor").Preload("Mentors").Preload("CreatedBy").First(&course, course.Uid).Error; err != nil {
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
		"data":    courseResponse(course),
		"error":   nil,
	})
}

func multipartFormHas(c *gin.Context, key string) bool {
	if c.Request.MultipartForm != nil {
		if _, ok := c.Request.MultipartForm.Value[key]; ok {
			return true
		}
	}
	return c.Request.PostForm.Has(key)
}

// @Summary      Update course (Super Admin / Admin)
// @Description  Update an existing course metadata (cover, title, subtitle, category, class type, level, learning points). Only sent fields are updated. Requires Super Admin or Admin.
// @Tags         Course
// @Accept       multipart/form-data
// @Produce      json
// @Security     BearerAuth
// @Param        id               path      string  true   "Course UID"
// @Param        cover            formData  file    false  "Course cover image (JPG, PNG recommended). Fallback key: thumbnail"
// @Param        title            formData  string  false  "Course title"
// @Param        subtitle         formData  string  false  "Course subtitle/header"
// @Param        header           formData  string  false  "Alias for subtitle"
// @Param        slug             formData  string  false  "Course slug"
// @Param        category_uid     formData  string  false  "Dynamic category uid"
// @Param        course_type_uid  formData  string  false  "Dynamic course type uid"
// @Param        level            formData  string  false  "Course level: PEMULA | MENENGAH | LANJUTAN"
// @Param        what_you_learn   formData  string  false  "JSON array of strings, e.g. [\"Gtw 1\", \"Gtw 2\"]"
// @Param        description      formData  string  false  "Course description"
// @Param        slot             formData  int     false  "Course slot capacity (0 = unlimited)"
// @Success      200  {object}  map[string]any  "Course updated successfully"
// @Failure      400  {object}  map[string]any  "Invalid request payload"
// @Failure      401  {object}  map[string]any  "Unauthorized"
// @Failure      403  {object}  map[string]any  "Access denied: Super Admin or Admin only"
// @Failure      404  {object}  map[string]any  "Course or user not found"
// @Failure      500  {object}  map[string]any  "Failed to update course"
// @Router       /courses/{id} [put]
func UpdateAdminCourseFunc(c *gin.Context) {
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
			"message": "Update course access denied: Super Admin or Admin only",
			"data":    nil,
			"error":   nil,
		})
		return
	}

	courseID, ok := resolveUIDParam(c, "courses", "id", "course")
	if !ok {
		return
	}

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

	if multipartFormHas(c, "title") {
		title := strings.TrimSpace(c.PostForm("title"))
		if title == "" {
			c.JSON(http.StatusBadRequest, gin.H{
				"success": false,
				"message": "title cannot be empty",
				"data":    nil,
				"error":   nil,
			})
			return
		}
		course.Title = title
	}

	if multipartFormHas(c, "subtitle") || multipartFormHas(c, "header") {
		subtitle := strings.TrimSpace(c.PostForm("subtitle"))
		if subtitle == "" {
			subtitle = strings.TrimSpace(c.PostForm("header"))
		}
		course.Subtitle = subtitle
	}

	if multipartFormHas(c, "description") {
		description := strings.TrimSpace(c.PostForm("description"))
		if description == "" {
			c.JSON(http.StatusBadRequest, gin.H{
				"success": false,
				"message": "description cannot be empty",
				"data":    nil,
				"error":   nil,
			})
			return
		}
		course.Description = description
	}

	if multipartFormHas(c, "slug") {
		slug := buildSlug(strings.TrimSpace(c.PostForm("slug")))
		if slug != course.Slug {
			var existingCount int64
			if err := database.DB.Model(&entity.Course{}).Where("slug = ? AND uid != ?", slug, course.Uid).Count(&existingCount).Error; err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{
					"success": false,
					"message": "Failed to validate course slug",
					"data":    nil,
					"error":   err.Error(),
				})
				return
			}
			if existingCount > 0 {
				c.JSON(http.StatusBadRequest, gin.H{
					"success": false,
					"message": "slug is already taken",
					"data":    nil,
					"error":   nil,
				})
				return
			}
		}
		course.Slug = slug
	}

	if multipartFormHas(c, "what_you_learn") || len(c.PostFormArray("what_you_learn[]")) > 0 || len(c.PostFormArray("what_you_learn")) > 0 {
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
		course.WhatYouLearn = learningPointsRaw
	}

	if multipartFormHas(c, "category_uid") {
		categoryUIDStr := strings.TrimSpace(c.PostForm("category_uid"))
		categoryUID, ok := resolveUIDValue(c, "course_categories", categoryUIDStr, "category")
		if !ok {
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
		course.CategoryUid = &categoryUID
	}

	if multipartFormHas(c, "course_type_uid") || multipartFormHas(c, "class_type_uid") {
		classTypeUIDStr := strings.TrimSpace(c.PostForm("course_type_uid"))
		if classTypeUIDStr == "" {
			classTypeUIDStr = strings.TrimSpace(c.PostForm("class_type_uid"))
		}
		classTypeUID, ok := resolveUIDValue(c, "class_types", classTypeUIDStr, "course type")
		if !ok {
			return
		}

		var classType entity.ClassType
		if err := database.DB.First(&classType, classTypeUID).Error; err != nil {
			c.JSON(http.StatusBadRequest, gin.H{
				"success": false,
				"message": "course_type_uid not found",
				"data":    nil,
				"error":   err.Error(),
			})
			return
		}
		course.ClassTypeUid = &classTypeUID
	}

	if multipartFormHas(c, "level") {
		levelInput := strings.ToUpper(strings.TrimSpace(c.PostForm("level")))
		switch entity.CourseLevel(levelInput) {
		case entity.CourseLevelPemula, entity.CourseLevelMenengah, entity.CourseLevelLanjutan:
			course.Level = entity.CourseLevel(levelInput)
		default:
			c.JSON(http.StatusBadRequest, gin.H{
				"success": false,
				"message": "level must be one of: PEMULA, MENENGAH, LANJUTAN (beginner, intermediate, advanced)",
				"data":    nil,
				"error":   nil,
			})
			return
		}
	}

	if multipartFormHas(c, "slot") {
		slotStr := c.PostForm("slot")
		if slotStr == "" {
			course.Slot = 0
		} else {
			slotInt, err := strconv.Atoi(slotStr)
			if err != nil || slotInt < 0 {
				c.JSON(http.StatusBadRequest, gin.H{
					"success": false,
					"message": "slot must be a valid non-negative integer",
					"data":    nil,
					"error":   nil,
				})
				return
			}
			course.Slot = slotInt
		}
	}

	file, err := c.FormFile("cover")
	if err != nil || file == nil {
		file, err = c.FormFile("thumbnail")
	}
	if err == nil && file != nil {
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
		course.CoverURL = url
		course.ThumbnailURL = url
	}

	if err := database.DB.Save(&course).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "Failed to update course",
			"data":    nil,
			"error":   err.Error(),
		})
		return
	}

	if err := database.DB.Preload("Category").Preload("ClassType").Preload("Mentor").Preload("Mentors").Preload("CreatedBy").First(&course, course.Uid).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "Failed to retrieve updated course",
			"data":    nil,
			"error":   err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Course updated successfully",
		"data":    courseResponse(course),
		"error":   nil,
	})
}

// @Summary      Delete course (Super Admin / Admin)
// @Description  Soft-delete a course by setting status to TIDAK ACTIVE and unpublishing it. Requires Super Admin or Admin.
// @Tags         Course
// @Produce      json
// @Security     BearerAuth
// @Param        id   path      string  true  "Course UID"
// @Success      200  {object}  map[string]any  "Course deleted successfully"
// @Failure      401  {object}  map[string]any  "Unauthorized"
// @Failure      403  {object}  map[string]any  "Access denied: Super Admin or Admin only"
// @Failure      404  {object}  map[string]any  "Course or user not found"
// @Failure      500  {object}  map[string]any  "Failed to delete course"
// @Router       /courses/{id} [delete]
func DeleteAdminCourseFunc(c *gin.Context) {
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
			"message": "Delete course access denied: Super Admin or Admin only",
			"data":    nil,
			"error":   nil,
		})
		return
	}

	courseID, ok := resolveUIDParam(c, "courses", "id", "course")
	if !ok {
		return
	}

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

	course.Status = entity.CourseStatusTidakActive
	course.IsPublished = false

	if err := database.DB.Save(&course).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "Failed to delete course",
			"data":    nil,
			"error":   err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Course deleted successfully",
		"data": gin.H{
			"uid":    course.Uid,
			"status": course.Status,
		},
		"error": nil,
	})
}

// GetAllCoursesFunc returns a paginated list of courses with optional filters.
//
// Query parameters (all optional):
// - page (int, default 1)
// - per_page (int, default 10, max 100)
// - mentor_id (int)       -> filter by mentor_id
// - title (string)        -> search by title (case-insensitive)
//
// @Summary      Get all courses with pagination and filters (Public)
// @Description  Retrieve paginated list of courses with optional filters (mentor_id, title)
// @Tags         Course
// @Accept       json
// @Produce      json
// @Param        page        query  int     false  "Page number (default: 1)"
// @Param        per_page    query  int     false  "Items per page (default: 10, max: 100)"
// @Param        mentor_id   query  string  false  "Filter by mentor UID"
// @Param        title       query  string  false  "Search by title (case-insensitive)"
// @Success      200  {object}  map[string]any  "Courses retrieved successfully"
// @Failure      500  {object}  map[string]any  "Failed to retrieve courses"
// @Router       /courses [get]
func applyCourseListFilters(db *gorm.DB, c *gin.Context) *gorm.DB {
	categoryIDStr := c.Query("course_category_id")
	if categoryIDStr == "" {
		categoryIDStr = c.Query("category_uid")
	}
	if categoryIDStr != "" {
		if categoryUID, err := database.ResolveUID("course_categories", categoryIDStr); err == nil {
			db = db.Where("category_uid = ?", categoryUID)
		}
	}

	classTypeIDStr := c.Query("course_type_id")
	if classTypeIDStr == "" {
		classTypeIDStr = c.Query("class_type_id")
	}
	if classTypeIDStr != "" {
		if classTypeUID, err := database.ResolveUID("class_types", classTypeIDStr); err == nil {
			db = db.Where("class_type_uid = ?", classTypeUID)
		}
	}

	if statusFilter := strings.TrimSpace(c.Query("status")); statusFilter != "" {
		db = db.Where("status = ?", statusFilter)
	}

	return db
}

func courseListOrderClause(c *gin.Context) string {
	sortBy := strings.ToLower(strings.TrimSpace(c.Query("sort_by")))
	order := strings.ToLower(strings.TrimSpace(c.DefaultQuery("sort_order", "desc")))
	if order != "asc" && order != "desc" {
		order = "desc"
	}

	switch sortBy {
	case "created_at", "":
		return "created_at " + order
	default:
		return "created_at desc"
	}
}

func GetAllCoursesFunc(c *gin.Context) {
	// Parse query params
	pageStr := c.DefaultQuery("page", "1")
	perPageStr := c.DefaultQuery("per_page", "10")
	mentorIDStr := c.Query("mentor_id")
	titleFilter := c.Query("title")

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
	db = applyCourseListFilters(db, c)

	// Filter by mentor_uid (UUID atau 8-char prefix) across legacy primary mentor and new course_mentors assignments.
	if mentorIDStr != "" {
		if mentorUid, err := database.ResolveUID("users", mentorIDStr); err == nil {
			db = db.Where(
				"mentor_uid = ? OR EXISTS (SELECT 1 FROM course_mentors cm WHERE cm.course_uid = courses.uid AND cm.mentor_uid = ?)",
				mentorUid,
				mentorUid,
			)
		}
	}

	// Karena title disimpan dalam bentuk terenkripsi, filter berbasis title harus
	// dilakukan secara in-memory setelah dekripsi (sama seperti pola search user
	// pada GetAllUsersService) agar fungsionalitas pencarian tetap berjalan.
	if strings.TrimSpace(titleFilter) != "" {
		var allCourses []entity.Course
		if err := db.Preload("Mentor").Preload("Mentors").Preload("CreatedBy").Order(courseListOrderClause(c)).Find(&allCourses).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{
				"success": false,
				"message": "Failed to retrieve courses for search",
				"data":    nil,
				"error":   err.Error(),
			})
			return
		}

		needle := strings.ToLower(strings.TrimSpace(titleFilter))
		filtered := make([]entity.Course, 0, len(allCourses))
		for _, course := range allCourses {
			if strings.Contains(strings.ToLower(course.Title), needle) {
				filtered = append(filtered, course)
			}
		}

		total := int64(len(filtered))
		start := (page - 1) * perPage
		if start > len(filtered) {
			start = len(filtered)
		}
		end := start + perPage
		if end > len(filtered) {
			end = len(filtered)
		}
		paginated := filtered[start:end]
		totalPages := int((total + int64(perPage) - 1) / int64(perPage))
		reviewSummaries := fetchCourseReviewSummaries(courseUIDsFromCourses(paginated))

		c.JSON(http.StatusOK, gin.H{
			"success": true,
			"message": "Courses retrieved successfully",
			"data": gin.H{
				"courses": courseListResponse(paginated, reviewSummaries),
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
	if err := db.Preload("Mentor").Preload("Mentors").Preload("CreatedBy").Order(courseListOrderClause(c)).Limit(perPage).Offset(offset).Find(&courses).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "Failed to retrieve courses",
			"data":    nil,
			"error":   err.Error(),
		})
		return
	}

	totalPages := int((total + int64(perPage) - 1) / int64(perPage))
	reviewSummaries := fetchCourseReviewSummaries(courseUIDsFromCourses(courses))

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Courses retrieved successfully",
		"data": gin.H{
			"courses": courseListResponse(courses, reviewSummaries),
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

// @Summary      Get course by ID (Public)
// @Description  Retrieve complete information of a specific course including all modules
// @Tags         Course
// @Accept       json
// @Produce      json
// @Param        id   path      string  true  "Course UID"
// @Success      200  {object}  map[string]any  "Course retrieved successfully"
// @Failure      404  {object}  map[string]any  "Course not found"
// @Failure      500  {object}  map[string]any  "Internal server error"
// @Router       /courses/{id} [get]
func GetCourseByIDFunc(c *gin.Context) {
	courseID, ok := resolveUIDParam(c, "courses", "id", "course")
	if !ok {
		return
	}

	var course entity.Course
	if err := database.DB.Preload("Modules", func(db *gorm.DB) *gorm.DB {
		return db.Order("order_index ASC")
	}).Preload("Modules.Lessons", func(db *gorm.DB) *gorm.DB {
		return db.Select("uid, module_uid, title, content_type, video_url, start_time, end_time, order_index, created_at, updated_at").Order("order_index ASC")
	}).Preload("Category").Preload("ClassType").Preload("Mentor").Preload("Mentors").Preload("CreatedBy").Preload("CourseMentors").First(&course, courseID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"success": false,
			"message": "Course not found",
			"data":    nil,
			"error":   err.Error(),
		})
		return
	}

	reviews, err := fetchCourseReviewsByCourseUID(course.Uid)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "Failed to retrieve course reviews",
			"data":    nil,
			"error":   err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Course retrieved successfully",
		"data":    courseDetailResponse(course, reviews),
		"error":   nil,
	})
}

// @Summary      Activate course status (Super Admin / Admin)
// @Description  Set course status to ACTIVE. Requires Super Admin or Admin.
// @Tags         Course
// @Accept       json
// @Produce      json
// @Security     BearerAuth
// @Param        id   path      string  true  "Course UID"
// @Success      200  {object}  map[string]any  "Course status updated successfully"
// @Failure      401  {object}  map[string]any  "Unauthorized"
// @Failure      403  {object}  map[string]any  "Access denied: Super Admin or Admin only"
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

	if !hasAdminAccess(userData.Role) {
		c.JSON(http.StatusForbidden, gin.H{
			"success": false,
			"message": "Update course status access denied: Super Admin or Admin only",
			"data":    nil,
			"error":   nil,
		})
		return
	}

	courseID, ok := resolveUIDParam(c, "courses", "id", "course")
	if !ok {
		return
	}

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
	course.IsPublished = true
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
// @Description  Allow authenticated students to enroll in a course. Creates an enrollment record. Course must be in ACTIVE status.
// @Tags         Course
// @Accept       json
// @Produce      json
// @Security     BearerAuth
// @Param        id   path  string  true  "Course UID to enroll in"
// @Success      201  {object}  map[string]any  "Successfully enrolled in course"
// @Failure      400  {object}  map[string]any  "Already enrolled in this course"
// @Failure      401  {object}  map[string]any  "Unauthorized"
// @Failure      403  {object}  map[string]any  "Access denied: Students only or course not available"
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
			"message": "Access denied: only students may join courses; admins and mentors cannot enroll",
			"data":    nil,
			"error":   nil,
		})
		return
	}

	courseID, ok := resolveUIDParam(c, "courses", "id", "course")
	if !ok {
		return
	}

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

	// Reject enrollment for courses that are not published (DRAFT or TIDAK ACTIVE)
	if course.Status != entity.CourseStatusActive {
		c.JSON(http.StatusForbidden, gin.H{
			"success": false,
			"message": "Course is not available for enrollment",
			"data":    nil,
			"error":   nil,
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
		Status:    entity.EnrollmentActive,
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

	if err := database.DB.First(&enrollment, enrollment.Uid).Error; err != nil {
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
		"data": gin.H{
			"enrollment": enrollment,
		},
		"error": nil,
	})
}

type CourseStudentSafeItem struct {
	EnrollmentUid       uuid.UUID               `json:"enrollment_uid"`
	StudentUid          uuid.UUID               `json:"student_uid"`
	StudentName         string                  `json:"student_name"`
	StudentAvatarURL    string                  `json:"student_avatar_url,omitempty"`
	EnrolledAt          time.Time               `json:"enrolled_at"`
	Progress            float64                 `json:"progress"`
	Status              entity.EnrollmentStatus `json:"status"`
	AttendancePresent   int                     `json:"attendance_present"`
	AttendanceTotal     int                     `json:"attendance_total"`
	LastActiveAt        *time.Time              `json:"last_active_at,omitempty"`
}

func countCourseLessons(courseUID uuid.UUID) int {
	var count int64
	database.DB.Table("lessons l").
		Joins("JOIN modules m ON m.uid = l.module_uid").
		Where("m.course_uid = ?", courseUID).
		Count(&count)
	return int(count)
}

func fetchEnrollmentAttendancePresent(courseUID uuid.UUID, enrollmentUIDs []uuid.UUID) map[uuid.UUID]int {
	result := make(map[uuid.UUID]int, len(enrollmentUIDs))
	if len(enrollmentUIDs) == 0 {
		return result
	}

	type row struct {
		EnrollmentUID uuid.UUID `gorm:"column:enrollment_uid"`
		Count         int       `gorm:"column:cnt"`
	}
	var rows []row
	database.DB.Table("lesson_attendances la").
		Select("la.enrollment_uid, COUNT(*) AS cnt").
		Joins("JOIN lessons l ON l.uid = la.lesson_uid").
		Joins("JOIN modules m ON m.uid = l.module_uid").
		Where("m.course_uid = ?", courseUID).
		Where("la.enrollment_uid IN ?", enrollmentUIDs).
		Where("la.status IN ?", []entity.AttendanceStatus{entity.AttendancePresent, entity.AttendanceLate}).
		Group("la.enrollment_uid").
		Scan(&rows)

	for _, r := range rows {
		result[r.EnrollmentUID] = r.Count
	}
	return result
}

// buildEnrollmentProgressMap menghitung progress (0.0–1.0) per enrollment dari lesson_readings dan lesson_assignment_submissions.
func buildEnrollmentProgressMap(enrollments []entity.Enrollment) map[uuid.UUID]float64 {
	result := make(map[uuid.UUID]float64, len(enrollments))
	if len(enrollments) == 0 {
		return result
	}

	enrollmentUIDs := make([]uuid.UUID, 0, len(enrollments))
	courseUIDs := make([]uuid.UUID, 0, len(enrollments))
	seenCourse := make(map[uuid.UUID]struct{}, len(enrollments))
	userUIDs := make([]uuid.UUID, 0, len(enrollments))
	seenUser := make(map[uuid.UUID]struct{}, len(enrollments))
	missingUserEnrollmentUIDs := make([]uuid.UUID, 0)
	userByEnrollment := make(map[uuid.UUID]uuid.UUID, len(enrollments))

	for _, en := range enrollments {
		enrollmentUIDs = append(enrollmentUIDs, en.Uid)
		if _, ok := seenCourse[en.CourseUid]; !ok {
			seenCourse[en.CourseUid] = struct{}{}
			courseUIDs = append(courseUIDs, en.CourseUid)
		}
		if en.UserUid != uuid.Nil {
			userByEnrollment[en.Uid] = en.UserUid
			if _, ok := seenUser[en.UserUid]; !ok {
				seenUser[en.UserUid] = struct{}{}
				userUIDs = append(userUIDs, en.UserUid)
			}
		} else {
			missingUserEnrollmentUIDs = append(missingUserEnrollmentUIDs, en.Uid)
		}
	}

	if len(missingUserEnrollmentUIDs) > 0 {
		type userLookupRow struct {
			Uid     uuid.UUID `gorm:"column:uid"`
			UserUid uuid.UUID `gorm:"column:user_uid"`
		}
		var userLookupRows []userLookupRow
		database.DB.Table("enrollments").
			Select("uid, user_uid").
			Where("uid IN ?", missingUserEnrollmentUIDs).
			Scan(&userLookupRows)
		for _, row := range userLookupRows {
			userByEnrollment[row.Uid] = row.UserUid
			if _, ok := seenUser[row.UserUid]; !ok {
				seenUser[row.UserUid] = struct{}{}
				userUIDs = append(userUIDs, row.UserUid)
			}
		}
	}

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

	type assignmentCountRow struct {
		CourseUID        uuid.UUID `gorm:"column:course_uid"`
		TotalAssignments int64     `gorm:"column:total_assignments"`
	}
	var assignmentCountRows []assignmentCountRow
	if len(courseUIDs) > 0 {
		database.DB.Table("lesson_assignments la").
			Select("m.course_uid AS course_uid, COUNT(la.uid) AS total_assignments").
			Joins("JOIN lessons l ON l.uid = la.lesson_uid").
			Joins("JOIN modules m ON m.uid = l.module_uid").
			Where("m.course_uid IN ? AND la.status = ?", courseUIDs, entity.LessonAssignmentStatusTerbit).
			Group("m.course_uid").
			Scan(&assignmentCountRows)
	}
	totalAssignmentByCourse := make(map[uuid.UUID]int64, len(assignmentCountRows))
	for _, row := range assignmentCountRows {
		totalAssignmentByCourse[row.CourseUID] = row.TotalAssignments
	}

	type submittedAssignmentRow struct {
		CourseUID      uuid.UUID `gorm:"column:course_uid"`
		UserUID        uuid.UUID `gorm:"column:user_uid"`
		SubmittedCount int64     `gorm:"column:submitted_count"`
	}
	var submittedAssignmentRows []submittedAssignmentRow
	if len(courseUIDs) > 0 && len(userUIDs) > 0 {
		database.DB.Table("lesson_assignment_submissions sub").
			Select("m.course_uid AS course_uid, sub.user_uid AS user_uid, COUNT(DISTINCT sub.lesson_assignment_uid) AS submitted_count").
			Joins("JOIN lesson_assignments la ON la.uid = sub.lesson_assignment_uid").
			Joins("JOIN lessons l ON l.uid = la.lesson_uid").
			Joins("JOIN modules m ON m.uid = l.module_uid").
			Where("m.course_uid IN ? AND sub.user_uid IN ? AND la.status = ?", courseUIDs, userUIDs, entity.LessonAssignmentStatusTerbit).
			Group("m.course_uid, sub.user_uid").
			Scan(&submittedAssignmentRows)
	}
	type userCourseKey struct {
		UserUID   uuid.UUID
		CourseUID uuid.UUID
	}
	submittedMap := make(map[userCourseKey]int64, len(submittedAssignmentRows))
	for _, row := range submittedAssignmentRows {
		submittedMap[userCourseKey{UserUID: row.UserUID, CourseUID: row.CourseUID}] = row.SubmittedCount
	}

	readCountMap := fetchEnrollmentLessonReadCount(enrollmentUIDs)
	for _, en := range enrollments {
		userUID := en.UserUid
		if userUID == uuid.Nil {
			userUID = userByEnrollment[en.Uid]
		}
		totalLessons := totalLessonByCourse[en.CourseUid]
		totalAssignments := totalAssignmentByCourse[en.CourseUid]
		readLessons := readCountMap[en.Uid]
		submittedAssignments := submittedMap[userCourseKey{UserUID: userUID, CourseUID: en.CourseUid}]

		totalItems := totalLessons + totalAssignments
		completedItems := readLessons + submittedAssignments

		if totalItems > 0 {
			prog := float64(completedItems) / float64(totalItems)
			if prog > 1.0 {
				prog = 1.0
			}
			result[en.Uid] = prog
		} else {
			result[en.Uid] = 0.0
		}
	}
	return result
}

func applyCalculatedEnrollmentProgress(enrollments []entity.Enrollment) {
	progressMap := buildEnrollmentProgressMap(enrollments)
	for i := range enrollments {
		enrollments[i].Progress = progressMap[enrollments[i].Uid]
	}
}

func applyCalculatedEnrollmentProgressPtr(enrollment *entity.Enrollment) {
	if enrollment == nil {
		return
	}
	progressMap := buildEnrollmentProgressMap([]entity.Enrollment{*enrollment})
	enrollment.Progress = progressMap[enrollment.Uid]
}

func applyCalculatedEnrollmentProgressToAttendances(attendances []entity.LessonAttendance, enrollments []entity.Enrollment) {
	progressMap := buildEnrollmentProgressMap(enrollments)
	for i := range attendances {
		if attendances[i].Enrollment != nil {
			attendances[i].Enrollment.Progress = progressMap[attendances[i].EnrollmentUid]
		}
	}
}

func applyCalculatedEnrollmentProgressToReadings(readings []entity.LessonReading, enrollments []entity.Enrollment) {
	progressMap := buildEnrollmentProgressMap(enrollments)
	for i := range readings {
		if readings[i].Enrollment != nil {
			readings[i].Enrollment.Progress = progressMap[readings[i].EnrollmentUid]
		}
	}
}

func fetchEnrollmentLessonReadCount(enrollmentUIDs []uuid.UUID) map[uuid.UUID]int64 {
	result := make(map[uuid.UUID]int64, len(enrollmentUIDs))
	if len(enrollmentUIDs) == 0 {
		return result
	}

	type row struct {
		EnrollmentUID uuid.UUID `gorm:"column:enrollment_uid"`
		ReadCount     int64     `gorm:"column:read_count"`
	}
	var rows []row
	database.DB.Table("lesson_readings").
		Select("enrollment_uid, COUNT(uid) AS read_count").
		Where("enrollment_uid IN ?", enrollmentUIDs).
		Group("enrollment_uid").
		Scan(&rows)

	for _, r := range rows {
		result[r.EnrollmentUID] = r.ReadCount
	}
	return result
}

func fetchEnrollmentLastActive(courseUID uuid.UUID, enrollmentUIDs []uuid.UUID) map[uuid.UUID]*time.Time {
	result := make(map[uuid.UUID]*time.Time, len(enrollmentUIDs))
	if len(enrollmentUIDs) == 0 {
		return result
	}

	type row struct {
		EnrollmentUID uuid.UUID `gorm:"column:enrollment_uid"`
		LastActiveAt  time.Time `gorm:"column:last_active_at"`
	}
	var rows []row
	database.DB.Table("lesson_readings lr").
		Select("lr.enrollment_uid, MAX(lr.read_at) AS last_active_at").
		Joins("JOIN lessons l ON l.uid = lr.lesson_uid").
		Joins("JOIN modules m ON m.uid = l.module_uid").
		Where("m.course_uid = ?", courseUID).
		Where("lr.enrollment_uid IN ?", enrollmentUIDs).
		Group("lr.enrollment_uid").
		Scan(&rows)

	for _, r := range rows {
		t := r.LastActiveAt
		result[r.EnrollmentUID] = &t
	}
	return result
}

// @Summary      Get all enrolled students in a course (Public)
// @Description  Retrieve list of all students enrolled in a specific course. Response is sanitized and excludes sensitive user fields.
// @Tags         Course
// @Accept       json
// @Produce      json
// @Param        id       path  string  true   "Course UID"
// @Param        page     query int  false  "Page number (default: 1)"
// @Param        per_page query int  false  "Items per page (default: 10, max: 100)"
// @Param        name     query string false "Search student by name"
// @Success      200  {object}  map[string]any  "Students retrieved successfully"
// @Failure      404  {object}  map[string]any  "Course not found"
// @Failure      500  {object}  map[string]any  "Failed to retrieve students"
// @Router       /courses/{id}/students [get]
func GetCourseStudentsFunc(c *gin.Context) {
	courseID, ok := resolveUIDParam(c, "courses", "id", "course")
	if !ok {
		return
	}

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
	nameFilter := strings.TrimSpace(c.Query("name"))

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
	countQuery := database.DB.Table("enrollments e").
		Joins("JOIN users u ON u.uid = e.user_uid").
		Where("e.course_uid = ?", course.Uid).
		Where("u.role = ?", entity.StudentRole)

	if nameFilter != "" {
		nameLike := "%" + strings.ToLower(nameFilter) + "%"
		countQuery = countQuery.Where("LOWER(u.name) LIKE ?", nameLike)
	}

	if err := countQuery.Count(&total).Error; err != nil {
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
	studentQuery := database.DB.Table("enrollments e").
		Select(`
			e.uid as enrollment_uid,
			e.user_uid as student_uid,
			u.name as student_name,
			u.avatar_url as student_avatar_url,
			e.enrolled_at,
			e.status
		`).
		Joins("JOIN users u ON u.uid = e.user_uid").
		Where("e.course_uid = ?", course.Uid).
		Where("u.role = ?", entity.StudentRole)

	if nameFilter != "" {
		nameLike := "%" + strings.ToLower(nameFilter) + "%"
		studentQuery = studentQuery.Where("LOWER(u.name) LIKE ?", nameLike)
	}

	if err := studentQuery.
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

	lessonTotal := countCourseLessons(course.Uid)
	enrollmentUIDs := make([]uuid.UUID, 0, len(students))
	for i := range students {
		if decryptedName, decErr := utils.Decrypt(students[i].StudentName); decErr == nil {
			students[i].StudentName = decryptedName
		}
		students[i].AttendanceTotal = lessonTotal
		enrollmentUIDs = append(enrollmentUIDs, students[i].EnrollmentUid)
	}

	attendanceMap := fetchEnrollmentAttendancePresent(course.Uid, enrollmentUIDs)
	lastActiveMap := fetchEnrollmentLastActive(course.Uid, enrollmentUIDs)
	enrollmentsForProgress := make([]entity.Enrollment, 0, len(students))
	for _, s := range students {
		enrollmentsForProgress = append(enrollmentsForProgress, entity.Enrollment{
			Uid:       s.EnrollmentUid,
			UserUid:   s.StudentUid,
			CourseUid: course.Uid,
		})
	}
	progressMap := buildEnrollmentProgressMap(enrollmentsForProgress)
	for i := range students {
		students[i].AttendancePresent = attendanceMap[students[i].EnrollmentUid]
		students[i].LastActiveAt = lastActiveMap[students[i].EnrollmentUid]
		students[i].Progress = progressMap[students[i].EnrollmentUid]
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

// @Summary      Get course reading progress for authenticated user (Enrolled Student/Admin/Mentor)
// @Description  Returns how many lessons the authenticated user has read out of the total lessons
//
//	in the given course, expressed as a decimal between 0.0 and 1.0.
//	Formula: lessons_read / total_lessons.
//	Requires the user to be enrolled (active or completed) in the course, or to be an
//	admin / assigned mentor (they receive progress = 0.0 since they have no enrollment).
//
// @Tags         Course
// @Accept       json
// @Produce      json
// @Security     BearerAuth
// @Param        id  path  string  true  "Course UID"
// @Success      200  {object}  map[string]any  "Progress retrieved successfully"
// @Failure      400  {object}  map[string]any  "Invalid course uid"
// @Failure      401  {object}  map[string]any  "Unauthorized"
// @Failure      403  {object}  map[string]any  "Access denied: must be enrolled in this course"
// @Failure      404  {object}  map[string]any  "Course not found"
// @Failure      500  {object}  map[string]any  "Failed to retrieve progress"
// @Router       /courses/{id}/progress [get]
func GetCourseProgressFunc(c *gin.Context) {
	userData, ok := getAuthenticatedUser(c)
	if !ok {
		return
	}

	courseUID, ok := resolveUIDParam(c, "courses", "id", "course")
	if !ok {
		return
	}

	// Pastikan course ada
	var course entity.Course
	if err := database.DB.First(&course, courseUID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"success": false,
			"message": "Course not found",
			"data":    nil,
			"error":   err.Error(),
		})
		return
	}

	// --- Hitung total lesson di course ini ---
	var totalLessons int64
	if err := database.DB.Table("lessons l").
		Joins("JOIN modules m ON m.uid = l.module_uid").
		Where("m.course_uid = ?", courseUID).
		Count(&totalLessons).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "Failed to count total lessons",
			"data":    nil,
			"error":   err.Error(),
		})
		return
	}

	// --- Hitung total tugas terbit di course ini ---
	var totalAssignments int64
	if err := database.DB.Table("lesson_assignments la").
		Joins("JOIN lessons l ON l.uid = la.lesson_uid").
		Joins("JOIN modules m ON m.uid = l.module_uid").
		Where("m.course_uid = ? AND la.status = ?", courseUID, entity.LessonAssignmentStatusTerbit).
		Count(&totalAssignments).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "Failed to count total assignments",
			"data":    nil,
			"error":   err.Error(),
		})
		return
	}

	// Admin & Mentor: boleh lihat, progress selalu 0 (tidak punya enrollment)
	isAdminOrMentor := hasAdminAccess(userData.Role) || userData.Role == entity.MentorRole
	if isAdminOrMentor {
		c.JSON(http.StatusOK, gin.H{
			"success": true,
			"message": "Course progress retrieved successfully",
			"data": gin.H{
				"course_uid":            courseUID,
				"total_lessons":         totalLessons,
				"lessons_read":          0,
				"total_assignments":     totalAssignments,
				"assignments_submitted": 0,
				"progress":              0.0,
				"enrollment_uid":        nil,
				"enrollment_status":     nil,
			},
			"error": nil,
		})
		return
	}

	// Student: cari enrollment aktif/completed
	var enrollment entity.Enrollment
	err := database.DB.
		Where("user_uid = ? AND course_uid = ? AND status IN ?",
			userData.Uid,
			courseUID,
			[]entity.EnrollmentStatus{entity.EnrollmentActive, entity.EnrollmentCompleted},
		).
		First(&enrollment).Error
	if err != nil {
		c.JSON(http.StatusForbidden, gin.H{
			"success": false,
			"message": "Access denied: you must be enrolled in this course",
			"data":    nil,
			"error":   nil,
		})
		return
	}

	// --- Hitung lesson yang sudah dibaca user (via enrollment) ---
	var lessonsRead int64
	if err := database.DB.Model(&entity.LessonReading{}).
		Where("enrollment_uid = ?", enrollment.Uid).
		Count(&lessonsRead).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "Failed to count read lessons",
			"data":    nil,
			"error":   err.Error(),
		})
		return
	}

	// --- Hitung tugas yang sudah disubmit user ---
	var assignmentsSubmitted int64
	if err := database.DB.Table("lesson_assignment_submissions sub").
		Joins("JOIN lesson_assignments la ON la.uid = sub.lesson_assignment_uid").
		Joins("JOIN lessons l ON l.uid = la.lesson_uid").
		Joins("JOIN modules m ON m.uid = l.module_uid").
		Where("m.course_uid = ? AND sub.user_uid = ? AND la.status = ?", courseUID, userData.Uid, entity.LessonAssignmentStatusTerbit).
		Count(&assignmentsSubmitted).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "Failed to count submitted assignments",
			"data":    nil,
			"error":   err.Error(),
		})
		return
	}

	// Kalkulasi progress (0.0 – 1.0)
	totalItems := totalLessons + totalAssignments
	completedItems := lessonsRead + assignmentsSubmitted
	progress := 0.0
	if totalItems > 0 {
		progress = float64(completedItems) / float64(totalItems)
		if progress > 1.0 {
			progress = 1.0
		}
	}

	effectiveStatus := enrollment.Status
	if effectiveStatus == entity.EnrollmentCompleted && progress < 0.9999 {
		effectiveStatus = entity.EnrollmentActive
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Course progress retrieved successfully",
		"data": gin.H{
			"course_uid":            courseUID,
			"total_lessons":         totalLessons,
			"lessons_read":          lessonsRead,
			"total_assignments":     totalAssignments,
			"assignments_submitted": assignmentsSubmitted,
			"progress":              progress,
			"enrollment_uid":        enrollment.Uid,
			"enrollment_status":     effectiveStatus,
		},
		"error": nil,
	})
}
