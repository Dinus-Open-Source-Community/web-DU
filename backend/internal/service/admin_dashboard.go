package service

import (
	"fmt"
	"math"
	"net/http"
	"strconv"
	"strings"
	"time"

	"backend/internal/database"
	"backend/internal/model/entity"
	"backend/internal/utils"

	"github.com/gin-gonic/gin"
)

type dashboardPeriod struct {
	currentStart time.Time
	currentEnd   time.Time
	prevStart    time.Time
	prevEnd      time.Time
	label        string
}

func parseDashboardPeriod(raw string) dashboardPeriod {
	now := time.Now()
	end := now
	switch strings.ToLower(strings.TrimSpace(raw)) {
	case "7d":
		start := now.AddDate(0, 0, -7)
		prevEnd := start
		return dashboardPeriod{
			currentStart: start,
			currentEnd:   end,
			prevStart:    start.AddDate(0, 0, -7),
			prevEnd:      prevEnd,
			label:        "7 hari terakhir",
		}
	case "90d":
		start := now.AddDate(0, 0, -90)
		return dashboardPeriod{
			currentStart: start,
			currentEnd:   end,
			prevStart:    start.AddDate(0, 0, -90),
			prevEnd:      start,
			label:        "90 hari terakhir",
		}
	case "12m":
		start := now.AddDate(-1, 0, 0)
		return dashboardPeriod{
			currentStart: start,
			currentEnd:   end,
			prevStart:    start.AddDate(-1, 0, 0),
			prevEnd:      start,
			label:        "12 bulan terakhir",
		}
	default:
		start := now.AddDate(0, 0, -30)
		return dashboardPeriod{
			currentStart: start,
			currentEnd:   end,
			prevStart:    start.AddDate(0, 0, -30),
			prevEnd:      start,
			label:        "30 hari terakhir",
		}
	}
}

func trendDirection(current, previous float64) string {
	switch {
	case current > previous:
		return "up"
	case current < previous:
		return "down"
	default:
		return "neutral"
	}
}

func trendPercent(current, previous float64) float64 {
	if previous == 0 {
		if current == 0 {
			return 0
		}
		return 100
	}
	return math.Round(((current-previous)/previous)*1000) / 10
}

func countActiveUsers(start, end time.Time) int64 {
	var count int64
	database.DB.Table("users").
		Where(`uid IN (
			SELECT DISTINCT e.user_uid FROM enrollments e
			WHERE e.enrolled_at >= ? AND e.enrolled_at <= ?
		)`, start, end).
		Count(&count)
	return count
}

func countTotalStudents() int64 {
	var count int64
	database.DB.Table("users").
		Where("role = ?", entity.StudentRole).
		Count(&count)
	return count
}

func countActiveCourses() int64 {
	var count int64
	database.DB.Table("courses").
		Where("is_published = ?", true).
		Count(&count)
	return count
}

func assignmentCompletionRate() float64 {
	// placeholder: akan diisi saat schema lesson_assignments sudah diverifikasi
	return 0
}

func courseCompletionRate() float64 {
	var enrollments int64
	var completed int64

	database.DB.Table("enrollments").Count(&enrollments)
	if enrollments == 0 {
		return 0
	}

	database.DB.Table("enrollments").
		Where("progress = ?", 1.0).
		Count(&completed)

	return math.Round((float64(completed)/float64(enrollments))*1000) / 10
}

type CourseStat struct {
	CourseUID    string `gorm:"column:course_uid"`
	CourseName   string `gorm:"column:course_name"`
	StudentCount int64  `gorm:"column:student_count"`
	Completed    int64  `gorm:"column:completed"`
}

func topEnrolledCourses(limit int) []map[string]interface{} {
	var stats []CourseStat
	database.DB.Table("courses c").
		Joins("LEFT JOIN enrollments e ON e.course_uid = c.uid").
		Select("c.uid as course_uid, c.title as course_name, COUNT(e.uid) as student_count, SUM(CASE WHEN e.progress = 1.0 THEN 1 ELSE 0 END) as completed").
		Where("c.is_published = ?", true).
		Group("c.uid, c.title").
		Order("student_count DESC").
		Limit(limit).
		Scan(&stats)

	result := make([]map[string]interface{}, 0)
	for _, stat := range stats {
		completionRate := 0.0
		if stat.StudentCount > 0 {
			completionRate = float64(stat.Completed) / float64(stat.StudentCount) * 100
		}
		result = append(result, map[string]interface{}{
			"course_name":     utils.DecryptOrSelf(stat.CourseName),
			"students":        stat.StudentCount,
			"completed":       stat.Completed,
			"completion_rate": math.Round(completionRate*10) / 10,
		})
	}
	return result
}

type EnrollmentTrend struct {
	Date  string `gorm:"column:date"`
	Count int64  `gorm:"column:count"`
}

func enrollmentTrend(days int) []map[string]interface{} {
	var trends []EnrollmentTrend
	database.DB.Table("enrollments").
		Select("DATE(enrolled_at) as date, COUNT(*) as count").
		Where("enrolled_at >= ?", time.Now().AddDate(0, 0, -days)).
		Group("DATE(enrolled_at)").
		Order("date ASC").
		Scan(&trends)

	result := make([]map[string]interface{}, 0)
	for _, t := range trends {
		result = append(result, map[string]interface{}{
			"date":        t.Date,
			"enrollments": t.Count,
		})
	}
	return result
}

type StudentDistribution struct {
	Status string `gorm:"column:status"`
	Count  int64  `gorm:"column:count"`
}

func studentProgressDistribution() []map[string]interface{} {
	var dist []StudentDistribution
	caseExpr := "CASE WHEN progress = 0 THEN 'Belum mulai' WHEN progress < 0.5 THEN 'Sedang berjalan' WHEN progress < 1.0 THEN 'Hampir selesai' ELSE 'Selesai' END"
	database.DB.Table("enrollments").
		Select(caseExpr + " as status, COUNT(*) as count").
		Group(caseExpr).
		Scan(&dist)

	result := make([]map[string]interface{}, 0)
	for _, d := range dist {
		result = append(result, map[string]interface{}{
			"status": d.Status,
			"count":  d.Count,
		})
	}
	return result
}

type MentorActivity struct {
	MentorName   string `gorm:"column:mentor_name"`
	CourseCount  int64  `gorm:"column:course_count"`
	StudentCount int64  `gorm:"column:student_count"`
}

func topActiveMentors(limit int) []map[string]interface{} {
	var mentors []MentorActivity
	database.DB.Table("users u").
		Joins("LEFT JOIN courses c ON c.mentor_uid = u.uid").
		Joins("LEFT JOIN enrollments e ON e.course_uid = c.uid").
		Where("u.role = ?", entity.MentorRole).
		Select("u.name as mentor_name, COUNT(DISTINCT c.uid) as course_count, COUNT(DISTINCT e.uid) as student_count").
		Group("u.uid, u.name").
		Order("course_count DESC").
		Limit(limit).
		Scan(&mentors)

	result := make([]map[string]interface{}, 0)
	for _, m := range mentors {
		result = append(result, map[string]interface{}{
			"mentor_name": utils.DecryptOrSelf(m.MentorName),
			"courses":     m.CourseCount,
			"students":    m.StudentCount,
		})
	}
	return result
}

type RecentEnrollment struct {
	StudentName string `gorm:"column:student_name"`
	CourseName  string `gorm:"column:course_name"`
	EnrolledAt  string `gorm:"column:enrolled_at"`
}

func recentEnrollments(limit int) []map[string]interface{} {
	var enrollments []RecentEnrollment
	database.DB.Table("enrollments e").
		Joins("JOIN users u ON u.uid = e.user_uid").
		Joins("JOIN courses c ON c.uid = e.course_uid").
		Select("u.name as student_name, c.title as course_name, DATE(e.enrolled_at) as enrolled_at").
		Order("e.enrolled_at DESC").
		Limit(limit).
		Scan(&enrollments)

	result := make([]map[string]interface{}, 0)
	for _, e := range enrollments {
		result = append(result, map[string]interface{}{
			"student_name": utils.DecryptOrSelf(e.StudentName),
			"course_name":  utils.DecryptOrSelf(e.CourseName),
			"enrolled_at":  e.EnrolledAt,
		})
	}
	return result
}

func buildAdminKpi(id, label, iconName, trendLabel string, current, previous float64, formatValue func(float64) string) gin.H {
	return gin.H{
		"id":             id,
		"label":          label,
		"value":          formatValue(current),
		"trendValue":     trendPercent(current, previous),
		"trendDirection": trendDirection(current, previous),
		"trendLabel":     trendLabel,
		"iconName":       iconName,
	}
}

// @Summary      Get admin dashboard KPIs
// @Description  Aggregate KPI metrics for the admin dashboard.
// @Tags         Admin
// @Accept       json
// @Produce      json
// @Security     BearerAuth
// @Param        period  query  string  false  "Period: 7d, 30d, 90d, 12m (default 30d)"
// @Success      200  {object}  map[string]any  "Dashboard KPIs retrieved successfully"
// @Failure      401  {object}  map[string]any  "Unauthorized"
// @Failure      403  {object}  map[string]any  "Forbidden"
// @Router       /admin/dashboard/kpis [get]
func GetAdminDashboardKPIsFunc(c *gin.Context) {
	if _, ok := requireAdminAccess(c); !ok {
		return
	}

	period := parseDashboardPeriod(c.DefaultQuery("period", "30d"))

	curUsers := float64(countActiveUsers(period.currentStart, period.currentEnd))
	prevUsers := float64(countActiveUsers(period.prevStart, period.prevEnd))

	totalStudents := float64(countTotalStudents())
	activeCourses := float64(countActiveCourses())
	courseCompletion := courseCompletionRate()

	kpis := []gin.H{
		buildAdminKpi("active-users", "Pengguna aktif", "users", "dibanding periode sebelumnya", curUsers, prevUsers, func(v float64) string {
			return fmt.Sprintf("%.0f", v)
		}),
		buildAdminKpi("total-students", "Total siswa", "users", "terdaftar di platform", totalStudents, totalStudents, func(v float64) string {
			return fmt.Sprintf("%.0f", v)
		}),
		buildAdminKpi("active-courses", "Kursus aktif", "ticket", "sedang berlangsung", activeCourses, activeCourses, func(v float64) string {
			return fmt.Sprintf("%.0f", v)
		}),
		buildAdminKpi("course-completion", "Course completion", "ticket", "keseluruhan", courseCompletion, courseCompletion, func(v float64) string {
			return fmt.Sprintf("%.1f%%", v)
		}),
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "KPI dasbor berhasil diambil",
		"data":    kpis,
		"error":   nil,
	})
}

// @Summary      Get admin dashboard analytics
// @Description  Get rich analytics data for admin dashboard (charts, distributions, trends).
// @Tags         Admin
// @Accept       json
// @Produce      json
// @Security     BearerAuth
// @Param        days  query  int  false  "Days for trend (default: 30)"
// @Success      200  {object}  map[string]any  "Analytics data retrieved successfully"
// @Failure      401  {object}  map[string]any  "Unauthorized"
// @Failure      403  {object}  map[string]any  "Forbidden"
// @Router       /admin/dashboard/analytics [get]
func GetAdminDashboardAnalyticsFunc(c *gin.Context) {
	if _, ok := requireAdminAccess(c); !ok {
		return
	}

	days := 30
	if rawDays := c.Query("days"); rawDays != "" {
		if parsedDays, err := strconv.Atoi(rawDays); err == nil && parsedDays > 0 {
			days = parsedDays
		}
	}

	topCourses := topEnrolledCourses(5)
	trend := enrollmentTrend(days)
	distribution := studentProgressDistribution()
	mentors := topActiveMentors(5)
	recentEnroll := recentEnrollments(10)

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Analytics dasbor berhasil diambil",
		"data": gin.H{
			"top_courses":                   topCourses,
			"enrollment_trend":              trend,
			"student_progress_distribution": distribution,
			"top_mentors":                   mentors,
			"recent_enrollments":            recentEnroll,
		},
		"error": nil,
	})
}
