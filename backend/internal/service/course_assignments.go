package service

import (
	"net/http"
	"strconv"

	"backend/internal/database"
	"backend/internal/model/entity"
	"backend/internal/utils"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

type courseAssignmentListRow struct {
	AssignmentUID       uuid.UUID `gorm:"column:assignment_uid"`
	AssignmentTitle     string    `gorm:"column:assignment_title"`
	TaskType            string    `gorm:"column:task_type"`
	AssignmentStatus    string    `gorm:"column:assignment_status"`
	DeadlineAt          string    `gorm:"column:deadline_at"`
	AllowFileSubmission bool      `gorm:"column:allow_file_submission"`
	AllowPlainText      bool      `gorm:"column:allow_plain_text_submission"`
	AllowRichText       bool      `gorm:"column:allow_rich_text_submission"`
	RequireFileDesc     bool      `gorm:"column:require_file_description"`
	AutoCloseAfter      bool      `gorm:"column:auto_close_after_deadline"`
	AllowResubmit       bool      `gorm:"column:allow_resubmit"`
	MaxResubmitCount    *int      `gorm:"column:max_resubmit_count"`
	LessonUID           uuid.UUID `gorm:"column:lesson_uid"`
	LessonTitle         string    `gorm:"column:lesson_title"`
	LessonOrderIndex    int       `gorm:"column:lesson_order_index"`
	ModuleUID           uuid.UUID `gorm:"column:module_uid"`
	ModuleTitle         string    `gorm:"column:module_title"`
	ModuleOrderIndex    int       `gorm:"column:module_order_index"`
	CourseUID           uuid.UUID `gorm:"column:course_uid"`
	CourseTitle         string    `gorm:"column:course_title"`
	SubmissionCount     int64     `gorm:"column:submission_count"`
}

func courseAssignmentsBaseQuery() *gorm.DB {
	return database.DB.Table("lesson_assignments AS la").
		Select(`
			la.uid AS assignment_uid,
			la.title AS assignment_title,
			la.task_type AS task_type,
			la.status AS assignment_status,
			la.deadline_at AS deadline_at,
			la.allow_file_submission AS allow_file_submission,
			la.allow_plain_text_submission AS allow_plain_text_submission,
			la.allow_rich_text_submission AS allow_rich_text_submission,
			la.require_file_description AS require_file_description,
			la.auto_close_after_deadline AS auto_close_after_deadline,
			la.allow_resubmit AS allow_resubmit,
			la.max_resubmit_count AS max_resubmit_count,
			l.uid AS lesson_uid,
			l.title AS lesson_title,
			l.order_index AS lesson_order_index,
			m.uid AS module_uid,
			m.title AS module_title,
			m.order_index AS module_order_index,
			m.course_uid AS course_uid,
			c.title AS course_title,
			(SELECT COUNT(*) FROM lesson_assignment_submissions s WHERE s.lesson_assignment_uid = la.uid) AS submission_count`).
		Joins("JOIN lessons l ON l.uid = la.lesson_uid").
		Joins("JOIN modules m ON m.uid = l.module_uid").
		Joins("JOIN courses c ON c.uid = m.course_uid")
}

func mapCourseAssignmentListRow(row courseAssignmentListRow) gin.H {
	item := gin.H{
		"uid":                         row.AssignmentUID,
		"lesson_uid":                  row.LessonUID,
		"lesson_title":                utils.DecryptOrSelf(row.LessonTitle),
		"lesson_order_index":          row.LessonOrderIndex,
		"module_uid":                  row.ModuleUID,
		"module_title":                utils.DecryptOrSelf(row.ModuleTitle),
		"module_order_index":          row.ModuleOrderIndex,
		"course_uid":                  row.CourseUID,
		"course_title":                utils.DecryptOrSelf(row.CourseTitle),
		"meeting_number":              row.LessonOrderIndex,
		"title":                       utils.DecryptOrSelf(row.AssignmentTitle),
		"task_type":                   row.TaskType,
		"status":                      row.AssignmentStatus,
		"deadline_at":                 row.DeadlineAt,
		"allow_file_submission":       row.AllowFileSubmission,
		"allow_plain_text_submission": row.AllowPlainText,
		"allow_rich_text_submission":  row.AllowRichText,
		"require_file_description":    row.RequireFileDesc,
		"auto_close_after_deadline":   row.AutoCloseAfter,
		"allow_resubmit":              row.AllowResubmit,
		"max_resubmit_count":          row.MaxResubmitCount,
		"submission_count":            row.SubmissionCount,
	}
	return item
}

// @Summary      List assignments in a course (Admin/Mentor)
// @Description  Retrieve all lesson assignments within a course, including lesson/module context and submission counts.
// @Tags         Course
// @Produce      json
// @Security     BearerAuth
// @Param        id        path   string  true   "Course UID"
// @Param        page      query  int     false  "Page number (default: 1)"
// @Param        per_page  query  int     false  "Items per page (default: 50, max: 100)"
// @Param        status    query  string  false  "Filter by assignment status (DRAFT, TERBIT, DITUTUP)"
// @Success      200  {object}  map[string]any  "Course assignments retrieved successfully"
// @Failure      401  {object}  map[string]any  "Unauthorized"
// @Failure      403  {object}  map[string]any  "Access denied"
// @Failure      404  {object}  map[string]any  "Course not found"
// @Failure      500  {object}  map[string]any  "Internal server error"
// @Router       /courses/{id}/assignments [get]
func GetCourseAssignmentsFunc(c *gin.Context) {
	user, ok := getAuthenticatedUser(c)
	if !ok {
		return
	}

	courseUID, ok := resolveUIDParam(c, "courses", "id", "course")
	if !ok {
		return
	}

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

	allowed, err := canManageCourseByRole(user, courseUID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "Failed to validate access",
			"data":    nil,
			"error":   err.Error(),
		})
		return
	}
	if !allowed {
		c.JSON(http.StatusForbidden, gin.H{
			"success": false,
			"message": "Access denied: Admin or assigned mentor only",
			"data":    nil,
			"error":   nil,
		})
		return
	}

	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	perPage, _ := strconv.Atoi(c.DefaultQuery("per_page", "50"))
	if page < 1 {
		page = 1
	}
	if perPage < 1 {
		perPage = 50
	}
	if perPage > 100 {
		perPage = 100
	}

	db := courseAssignmentsBaseQuery().Where("m.course_uid = ?", courseUID)
	if statusFilter := c.Query("status"); statusFilter != "" {
		db = db.Where("la.status = ?", statusFilter)
	}

	var total int64
	countDB := database.DB.Table("lesson_assignments AS la").
		Joins("JOIN lessons l ON l.uid = la.lesson_uid").
		Joins("JOIN modules m ON m.uid = l.module_uid").
		Where("m.course_uid = ?", courseUID)
	if statusFilter := c.Query("status"); statusFilter != "" {
		countDB = countDB.Where("la.status = ?", statusFilter)
	}
	if err := countDB.Count(&total).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "Failed to count course assignments",
			"data":    nil,
			"error":   err.Error(),
		})
		return
	}

	offset := (page - 1) * perPage
	var rows []courseAssignmentListRow
	if err := db.
		Order("m.order_index ASC, l.order_index ASC").
		Limit(perPage).
		Offset(offset).
		Scan(&rows).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "Failed to retrieve course assignments",
			"data":    nil,
			"error":   err.Error(),
		})
		return
	}

	assignments := make([]gin.H, 0, len(rows))
	for _, row := range rows {
		assignments = append(assignments, mapCourseAssignmentListRow(row))
	}

	totalPages := 0
	if perPage > 0 {
		totalPages = int((total + int64(perPage) - 1) / int64(perPage))
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Course assignments retrieved successfully",
		"data": gin.H{
			"assignments": assignments,
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

type studentAssignmentRow struct {
	courseAssignmentListRow
	SubmissionUID      *uuid.UUID `gorm:"column:submission_uid"`
	AttemptCount       *int       `gorm:"column:attempt_count"`
	ScorePercent       *float64   `gorm:"column:score_percent"`
	Passed             *bool      `gorm:"column:passed"`
	IsAutoGraded       *bool      `gorm:"column:is_auto_graded"`
	SubmittedAt        *string    `gorm:"column:submitted_at"`
	GradedAt           *string    `gorm:"column:graded_at"`
}

// @Summary      List my assignments (Student)
// @Description  Retrieve all published assignments across courses the authenticated student is enrolled in, with latest submission if any.
// @Tags         Student
// @Produce      json
// @Security     BearerAuth
// @Param        page      query  int     false  "Page number (default: 1)"
// @Param        per_page  query  int     false  "Items per page (default: 20, max: 100)"
// @Success      200  {object}  map[string]any  "Student assignments retrieved successfully"
// @Failure      401  {object}  map[string]any  "Unauthorized"
// @Failure      403  {object}  map[string]any  "Access denied: Students only"
// @Failure      500  {object}  map[string]any  "Internal server error"
// @Router       /students/me/assignments [get]
func GetStudentMyAssignmentsFunc(c *gin.Context) {
	user, ok := getAuthenticatedUser(c)
	if !ok {
		return
	}

	if user.Role != entity.StudentRole {
		c.JSON(http.StatusForbidden, gin.H{
			"success": false,
			"message": "Access denied: Students only",
			"data":    nil,
			"error":   nil,
		})
		return
	}

	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	perPage, _ := strconv.Atoi(c.DefaultQuery("per_page", "20"))
	if page < 1 {
		page = 1
	}
	if perPage < 1 {
		perPage = 20
	}
	if perPage > 100 {
		perPage = 100
	}

	enrolledStatuses := []entity.EnrollmentStatus{
		entity.EnrollmentPending,
		entity.EnrollmentActive,
		entity.EnrollmentCompleted,
	}

	countDB := database.DB.Table("lesson_assignments AS la").
		Joins("JOIN lessons l ON l.uid = la.lesson_uid").
		Joins("JOIN modules m ON m.uid = l.module_uid").
		Joins("JOIN enrollments e ON e.course_uid = m.course_uid AND e.user_uid = ?", user.Uid).
		Where("e.status IN ?", enrolledStatuses).
		Where("la.status = ?", entity.LessonAssignmentStatusTerbit)

	var total int64
	if err := countDB.Count(&total).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "Failed to count student assignments",
			"data":    nil,
			"error":   err.Error(),
		})
		return
	}

	offset := (page - 1) * perPage
	var rows []studentAssignmentRow
	if err := database.DB.Table("lesson_assignments AS la").
		Select(`
			la.uid AS assignment_uid,
			la.title AS assignment_title,
			la.task_type AS task_type,
			la.status AS assignment_status,
			la.deadline_at AS deadline_at,
			la.allow_file_submission AS allow_file_submission,
			la.allow_plain_text_submission AS allow_plain_text_submission,
			la.allow_rich_text_submission AS allow_rich_text_submission,
			la.require_file_description AS require_file_description,
			la.auto_close_after_deadline AS auto_close_after_deadline,
			la.allow_resubmit AS allow_resubmit,
			la.max_resubmit_count AS max_resubmit_count,
			l.uid AS lesson_uid,
			l.title AS lesson_title,
			l.order_index AS lesson_order_index,
			m.uid AS module_uid,
			m.title AS module_title,
			m.order_index AS module_order_index,
			m.course_uid AS course_uid,
			c.title AS course_title,
			0 AS submission_count,
			sub.uid AS submission_uid,
			sub.attempt_count AS attempt_count,
			sub.score_percent AS score_percent,
			sub.passed AS passed,
			sub.is_auto_graded AS is_auto_graded,
			sub.created_at AS submitted_at,
			sub.graded_at AS graded_at`).
		Joins("JOIN lessons l ON l.uid = la.lesson_uid").
		Joins("JOIN modules m ON m.uid = l.module_uid").
		Joins("JOIN courses c ON c.uid = m.course_uid").
		Joins("JOIN enrollments e ON e.course_uid = m.course_uid AND e.user_uid = ?", user.Uid).
		Joins("LEFT JOIN lesson_assignment_submissions sub ON sub.lesson_assignment_uid = la.uid AND sub.user_uid = ?", user.Uid).
		Where("e.status IN ?", enrolledStatuses).
		Where("la.status = ?", entity.LessonAssignmentStatusTerbit).
		Order("la.deadline_at ASC").
		Limit(perPage).
		Offset(offset).
		Scan(&rows).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "Failed to retrieve student assignments",
			"data":    nil,
			"error":   err.Error(),
		})
		return
	}

	items := make([]gin.H, 0, len(rows))
	for _, row := range rows {
		item := gin.H{
			"course_uid":   row.CourseUID,
			"course_title": utils.DecryptOrSelf(row.CourseTitle),
			"assignment":   mapCourseAssignmentListRow(row.courseAssignmentListRow),
			"latest_submission": nil,
		}
		if row.SubmissionUID != nil {
			item["latest_submission"] = gin.H{
				"uid":            row.SubmissionUID,
				"attempt_count":  row.AttemptCount,
				"score_percent":  row.ScorePercent,
				"passed":         row.Passed,
				"is_auto_graded": row.IsAutoGraded,
				"submitted_at":   row.SubmittedAt,
				"graded_at":      row.GradedAt,
			}
		}
		items = append(items, item)
	}

	totalPages := 0
	if perPage > 0 {
		totalPages = int((total + int64(perPage) - 1) / int64(perPage))
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Student assignments retrieved successfully",
		"data": gin.H{
			"assignments": items,
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
