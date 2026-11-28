package service

import (
	"backend/internal/database"
	"backend/internal/model/entity"
	"net/http"
	"strconv"
	"strings"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func GetAdminCourseByIDFunc(c *gin.Context) {
	user, ok := requireAdminOrMentorModerationAccess(c)
	if !ok {
		return
	}
	id, ok := resolveUIDParam(c, "courses", "id", "course")
	if !ok {
		return
	}
	var course entity.Course
	db := database.DB
	if !hasAdminAccess(user.Role) {
		courseUIDs, err := mentorAssignedCourseUIDs(user.Uid)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"success": false, "message": "Failed to resolve mentor courses", "data": nil, "error": err.Error()})
			return
		}
		db = db.Where("uid IN ?", courseUIDs)
	}
	if err := db.Preload("Modules", func(db *gorm.DB) *gorm.DB { return db.Order("order_index ASC") }).Preload("Category").Preload("ClassType").Preload("Mentor").Preload("Mentors").Preload("CreatedBy").Preload("CourseMentors").First(&course, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"success": false, "message": "Course not found", "data": nil, "error": err.Error()})
		return
	}
	reviews, err := fetchCourseReviewsByCourseUID(course.Uid)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "message": "Failed to retrieve course reviews", "data": nil, "error": err.Error()})
		return
	}
	var enrolled int64
	if err := database.DB.Model(&entity.Enrollment{}).Where("course_uid = ?", course.Uid).Count(&enrolled).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "message": "Failed to count course enrollments", "data": nil, "error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"success": true, "message": "Course retrieved successfully", "data": courseDetailResponse(course, reviews, int(enrolled)), "error": nil})
}

// GetAdminCoursesFunc returns a paginated course list for staff (admin/super_admin
// see all courses including DRAFT; mentor sees only assigned courses).
//
// Unlike the public GET /courses (ACTIVE only), this endpoint does NOT hardcode
// status — pass ?status=DRAFT|ACTIVE|"TIDAK ACTIVE" or omit for all statuses.
//
// @Summary      Get courses for admin/mentor (staff)
// @Description  Paginated course list with optional status/title/category/type/level filters. Admin sees all courses; mentor sees only assigned courses.
// @Tags         Admin
// @Accept       json
// @Produce      json
// @Security     BearerAuth
// @Param        page               query  int     false  "Page number (default: 1)"
// @Param        per_page           query  int     false  "Items per page (default: 10, max: 100)"
// @Param        status             query  string  false  "Filter by status: DRAFT, ACTIVE, TIDAK ACTIVE (empty = all)"
// @Param        title              query  string  false  "Search by title (case-insensitive)"
// @Param        course_category_id query  string  false  "Filter by category UID"
// @Param        course_type_id     query  string  false  "Filter by course type UID"
// @Param        level              query  string  false  "Filter by level (PEMULA/MENENGAH/LANJUTAN)"
// @Param        mentor_id          query  string  false  "Filter by mentor UID"
// @Success      200  {object}  map[string]any  "Courses retrieved successfully"
// @Failure      401  {object}  map[string]any  "Unauthorized"
// @Failure      403  {object}  map[string]any  "Access denied"
// @Failure      500  {object}  map[string]any  "Failed to retrieve courses"
// @Router       /admin/courses [get]
func GetAdminCoursesFunc(c *gin.Context) {
	user, ok := requireAdminOrMentorModerationAccess(c)
	if !ok {
		return
	}

	pageStr := c.DefaultQuery("page", "1")
	perPageStr := c.DefaultQuery("per_page", "10")
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

	// Semua status kecuali diminta sebaliknya — tanpa hardcode ACTIVE.
	db := database.DB.Model(&entity.Course{})
	db = applyCourseListFilters(db, c)

	// Mentor hanya melihat kursus yang ditugaskan kepadanya.
	if !hasAdminAccess(user.Role) {
		courseUIDs, err := mentorAssignedCourseUIDs(user.Uid)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{
				"success": false,
				"message": "Failed to resolve mentor courses",
				"data":    nil,
				"error":   err.Error(),
			})
			return
		}
		if len(courseUIDs) == 0 {
			db = db.Where("1 = 0")
		} else {
			db = db.Where("uid IN ?", courseUIDs)
		}
	}

	if mentorIDStr := c.Query("mentor_id"); mentorIDStr != "" {
		if mentorUID, err := database.ResolveUID("users", mentorIDStr); err == nil {
			db = db.Where(
				"mentor_uid = ? OR EXISTS (SELECT 1 FROM course_mentors cm WHERE cm.course_uid = courses.uid AND cm.mentor_uid = ?)",
				mentorUID,
				mentorUID,
			)
		}
	}

	// Title terenkripsi → filter in-memory setelah dekripsi (pola GetAllCoursesFunc).
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
