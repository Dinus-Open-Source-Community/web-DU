package service

import (
	"net/http"
	"strconv"
	"strings"
	"time"

	"backend/internal/database"
	"backend/internal/model/entity"
	"backend/internal/utils"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

func requireMentorAccess(c *gin.Context) (entity.User, bool) {
	user, ok := getAuthenticatedUser(c)
	if !ok {
		return entity.User{}, false
	}

	if !hasMentorAccess(user.Role) {
		c.JSON(http.StatusForbidden, gin.H{
			"success": false,
			"message": "Access denied: Mentor, Admin, or Super Admin only",
			"data":    nil,
			"error":   nil,
		})
		return entity.User{}, false
	}

	return user, true
}

func mentorAssignedCourseUIDs(mentorUID uuid.UUID) ([]uuid.UUID, error) {
	type row struct {
		CourseUID uuid.UUID `gorm:"column:course_uid"`
	}
	var rows []row

	err := database.DB.Raw(`
		SELECT DISTINCT c.uid AS course_uid
		FROM courses c
		LEFT JOIN course_mentors cm ON cm.course_uid = c.uid AND cm.mentor_uid = ?
		WHERE c.mentor_uid = ?
		   OR (cm.mentor_uid IS NOT NULL AND cm.status IN ?)
	`, mentorUID, mentorUID, []entity.CourseMentorStatus{
		entity.CourseMentorSelected,
		entity.CourseMentorJoined,
	}).Scan(&rows).Error
	if err != nil {
		return nil, err
	}

	uids := make([]uuid.UUID, 0, len(rows))
	for _, row := range rows {
		uids = append(uids, row.CourseUID)
	}
	return uids, nil
}

func countMentorTotalCourses(courseUIDs []uuid.UUID) int64 {
	if len(courseUIDs) == 0 {
		return 0
	}
	var count int64
	database.DB.Model(&entity.Course{}).
		Where("uid IN ? AND status = ?", courseUIDs, entity.CourseStatusActive).
		Count(&count)
	return count
}

func countMentorActiveStudents(courseUIDs []uuid.UUID) int64 {
	if len(courseUIDs) == 0 {
		return 0
	}
	var count int64
	database.DB.Model(&entity.Enrollment{}).
		Where("course_uid IN ? AND status = ?", courseUIDs, entity.EnrollmentActive).
		Count(&count)
	return count
}

func countMentorPendingGrading(courseUIDs []uuid.UUID) int64 {
	if len(courseUIDs) == 0 {
		return 0
	}
	var count int64
	database.DB.Table("lesson_assignment_submissions AS sub").
		Joins("JOIN lesson_assignments la ON la.uid = sub.lesson_assignment_uid").
		Joins("JOIN lessons l ON l.uid = la.lesson_uid").
		Joins("JOIN modules m ON m.uid = l.module_uid").
		Where("m.course_uid IN ?", courseUIDs).
		Where("la.task_type = ?", entity.LessonAssignmentTaskTypeText).
		Where("sub.graded_at IS NULL AND sub.is_auto_graded = ?", false).
		Count(&count)
	return count
}

func countMentorUnansweredQA(courseUIDs []uuid.UUID) int64 {
	if len(courseUIDs) == 0 {
		return 0
	}
	var count int64
	database.DB.Table("course_qa_threads AS t").
		Where("t.course_uid IN ?", courseUIDs).
		Where(`NOT EXISTS (
			SELECT 1 FROM course_qa_replies r
			INNER JOIN users u ON u.uid = r.author_uid
			WHERE r.thread_uid = t.uid AND u.role IN ?
		)`, []entity.UserRole{entity.MentorRole, entity.AdminRole, entity.SuperAdminRole}).
		Count(&count)
	return count
}

func deriveScheduleClassType(videoURL, classTypeName string) string {
	combined := strings.ToLower(videoURL + " " + classTypeName)
	onlineHints := []string{"online", "zoom", "meet", "virtual", "remote", "webinar"}
	for _, hint := range onlineHints {
		if strings.Contains(combined, hint) {
			return "online"
		}
	}
	if strings.TrimSpace(videoURL) != "" {
		return "online"
	}
	return "offline"
}

func deriveScheduleLocation(videoURL, eventLocation, classType string) string {
	if classType == "online" {
		if loc := strings.TrimSpace(videoURL); loc != "" {
			return loc
		}
		return "Online"
	}
	if loc := strings.TrimSpace(eventLocation); loc != "" {
		return loc
	}
	return "TBA"
}

type mentorScheduleRow struct {
	LessonUID      uuid.UUID `gorm:"column:lesson_uid"`
	CourseUID      uuid.UUID `gorm:"column:course_uid"`
	CourseTitle    string    `gorm:"column:course_title"`
	VideoURL       string    `gorm:"column:video_url"`
	ClassTypeName  string    `gorm:"column:class_type_name"`
	EventLocation  string    `gorm:"column:event_location"`
	StartTime      time.Time `gorm:"column:start_time"`
	EndTime        time.Time `gorm:"column:end_time"`
	StudentCount   int64     `gorm:"column:student_count"`
}

func mapMentorScheduleRow(row mentorScheduleRow) gin.H {
	classTypeName := utils.DecryptOrSelf(row.ClassTypeName)
	eventLocation := utils.DecryptOrSelf(row.EventLocation)
	classType := deriveScheduleClassType(row.VideoURL, classTypeName)

	return gin.H{
		"uid":          row.LessonUID,
		"courseId":     row.CourseUID,
		"courseName":   utils.DecryptOrSelf(row.CourseTitle),
		"scheduleDate": row.StartTime.Format("2006-01-02"),
		"scheduleTime": row.StartTime.Format("15:04"),
		"endTime":      row.EndTime.Format("15:04"),
		"location":     deriveScheduleLocation(row.VideoURL, eventLocation, classType),
		"classType":    classType,
		"studentCount": row.StudentCount,
	}
}

// @Summary      Get mentor dashboard KPIs
// @Description  Aggregate KPI metrics for the authenticated mentor dashboard.
// @Tags         Mentor
// @Accept       json
// @Produce      json
// @Security     BearerAuth
// @Success      200  {object}  map[string]any  "Mentor dashboard KPIs retrieved successfully"
// @Failure      401  {object}  map[string]any  "Unauthorized"
// @Failure      403  {object}  map[string]any  "Forbidden"
// @Failure      500  {object}  map[string]any  "Internal server error"
// @Router       /mentor/dashboard/kpis [get]
func GetMentorDashboardKPIsFunc(c *gin.Context) {
	mentor, ok := requireMentorAccess(c)
	if !ok {
		return
	}

	courseUIDs, err := mentorAssignedCourseUIDs(mentor.Uid)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "Failed to resolve mentor courses",
			"data":    nil,
			"error":   err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Mentor dashboard KPIs retrieved successfully",
		"data": gin.H{
			"pendingGrading": countMentorPendingGrading(courseUIDs),
			"unansweredQA":   countMentorUnansweredQA(courseUIDs),
			"activeStudents": countMentorActiveStudents(courseUIDs),
			"totalCourses":   countMentorTotalCourses(courseUIDs),
		},
		"error": nil,
	})
}

// @Summary      Get mentor class schedules
// @Description  Retrieve upcoming lesson schedules across courses assigned to the authenticated mentor.
// @Tags         Mentor
// @Accept       json
// @Produce      json
// @Security     BearerAuth
// @Param        from           query  string  false  "Filter from date (YYYY-MM-DD or RFC3339)"
// @Param        to             query  string  false  "Filter to date (YYYY-MM-DD or RFC3339)"
// @Param        include_past   query  bool    false  "Include past schedules (default: false)"
// @Param        limit          query  int     false  "Max items (default: 50, max: 100)"
// @Success      200  {object}  map[string]any  "Mentor schedules retrieved successfully"
// @Failure      401  {object}  map[string]any  "Unauthorized"
// @Failure      403  {object}  map[string]any  "Forbidden"
// @Failure      500  {object}  map[string]any  "Internal server error"
// @Router       /mentor/dashboard/schedules [get]
func GetMentorDashboardSchedulesFunc(c *gin.Context) {
	mentor, ok := requireMentorAccess(c)
	if !ok {
		return
	}

	courseUIDs, err := mentorAssignedCourseUIDs(mentor.Uid)
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
		c.JSON(http.StatusOK, gin.H{
			"success": true,
			"message": "Mentor schedules retrieved successfully",
			"data":    []gin.H{},
			"error":   nil,
		})
		return
	}

	limit := 50
	if raw := c.Query("limit"); raw != "" {
		if parsed, err := strconv.Atoi(raw); err == nil && parsed > 0 {
			limit = parsed
		}
	}
	if limit > 100 {
		limit = 100
	}

	includePast := c.Query("include_past") == "true" || c.Query("include_past") == "1"
	now := time.Now()

	db := database.DB.Table("lessons AS l").
		Select(`
			l.uid AS lesson_uid,
			c.uid AS course_uid,
			c.title AS course_title,
			l.video_url AS video_url,
			ct.name AS class_type_name,
			e.location AS event_location,
			l.start_time AS start_time,
			l.end_time AS end_time,
			(SELECT COUNT(*) FROM enrollments en
			 WHERE en.course_uid = c.uid AND en.status IN ?) AS student_count`,
			[]entity.EnrollmentStatus{entity.EnrollmentActive, entity.EnrollmentCompleted}).
		Joins("JOIN modules m ON m.uid = l.module_uid").
		Joins("JOIN courses c ON c.uid = m.course_uid").
		Joins("LEFT JOIN class_types ct ON ct.uid = c.class_type_uid").
		Joins("LEFT JOIN events e ON e.uid = c.event_uid").
		Where("m.course_uid IN ?", courseUIDs).
		Where("l.start_time > ?", time.Time{})

	if !includePast {
		db = db.Where("l.start_time >= ?", now)
	}

	if fromStr := strings.TrimSpace(c.Query("from")); fromStr != "" {
		if t, err := time.Parse(time.RFC3339, fromStr); err == nil {
			db = db.Where("l.start_time >= ?", t)
		} else if t, err := time.Parse("2006-01-02", fromStr); err == nil {
			db = db.Where("l.start_time >= ?", t)
		}
	}

	if toStr := strings.TrimSpace(c.Query("to")); toStr != "" {
		if t, err := time.Parse(time.RFC3339, toStr); err == nil {
			db = db.Where("l.start_time <= ?", t)
		} else if t, err := time.Parse("2006-01-02", toStr); err == nil {
			end := t.Add(24*time.Hour - time.Nanosecond)
			db = db.Where("l.start_time <= ?", end)
		}
	}

	var rows []mentorScheduleRow
	if err := db.Order("l.start_time ASC").Limit(limit).Scan(&rows).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "Failed to retrieve mentor schedules",
			"data":    nil,
			"error":   err.Error(),
		})
		return
	}

	schedules := make([]gin.H, 0, len(rows))
	for _, row := range rows {
		schedules = append(schedules, mapMentorScheduleRow(row))
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Mentor schedules retrieved successfully",
		"data":    schedules,
		"error":   nil,
	})
}
