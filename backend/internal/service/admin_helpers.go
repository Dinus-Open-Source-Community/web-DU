package service

import (
	"net/http"
	"strconv"
	"strings"
	"time"

	"backend/internal/database"
	"backend/internal/handler/middleware"
	"backend/internal/model/entity"
	"backend/internal/utils"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

func requireAdminAccess(c *gin.Context) (entity.User, bool) {
	adminRaw, exists := c.Get(middleware.UIDCK)
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{
			"success": false,
			"message": "Unauthorized",
			"data":    nil,
			"error":   "user_id not found in context",
		})
		return entity.User{}, false
	}

	var admin entity.User
	if err := database.DB.Select("uid", "role", "name").First(&admin, adminRaw).Error; err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{
			"success": false,
			"message": "Unauthorized",
			"data":    nil,
			"error":   err.Error(),
		})
		return entity.User{}, false
	}

	if !hasAdminAccess(admin.Role) {
		c.JSON(http.StatusForbidden, gin.H{
			"success": false,
			"message": "Access denied: Super Admin or Admin only",
			"data":    nil,
			"error":   nil,
		})
		return entity.User{}, false
	}

	return admin, true
}

type adminTransactionRow struct {
	PaymentUID      uuid.UUID            `gorm:"column:payment_uid"`
	Reference       string               `gorm:"column:reference"`
	Amount          float64              `gorm:"column:amount"`
	PaymentMethod   entity.PaymentMethod `gorm:"column:payment_method"`
	PaymentStatus   entity.PaymentStatus `gorm:"column:payment_status"`
	PaidAt          *time.Time           `gorm:"column:paid_at"`
	TransactionAt   time.Time            `gorm:"column:transaction_at"`
	EnrollmentUID   uuid.UUID            `gorm:"column:enrollment_uid"`
	StudentUID      uuid.UUID            `gorm:"column:student_uid"`
	StudentName     string               `gorm:"column:student_name"`
	StudentAvatar   string               `gorm:"column:student_avatar"`
	CourseUID       *uuid.UUID           `gorm:"column:course_uid"`
	CourseTitle     *string              `gorm:"column:course_title"`
	CourseCover     *string              `gorm:"column:course_cover"`
	CoursePremium   bool                 `gorm:"column:course_premium"`
	ClassTypeName   *string              `gorm:"column:class_type_name"`
}

type adminTransactionFilters struct {
	Status   string
	Search   string
	DateFrom *time.Time
	DateTo   *time.Time
	Page     int
	PerPage  int
	Limit    int
}

func parseAdminTransactionFilters(c *gin.Context) adminTransactionFilters {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	perPage, _ := strconv.Atoi(c.DefaultQuery("per_page", "10"))
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "0"))
	if page < 1 {
		page = 1
	}
	if perPage < 1 {
		perPage = 10
	}
	if perPage > 100 {
		perPage = 100
	}

	filters := adminTransactionFilters{
		Status:  strings.TrimSpace(c.Query("status")),
		Search:  strings.TrimSpace(c.Query("search")),
		Page:    page,
		PerPage: perPage,
		Limit:   limit,
	}

	if dateFromStr := strings.TrimSpace(c.Query("date_from")); dateFromStr != "" {
		if t, err := time.Parse(time.RFC3339, dateFromStr); err == nil {
			filters.DateFrom = &t
		} else if t, err := time.Parse("2006-01-02", dateFromStr); err == nil {
			filters.DateFrom = &t
		}
	}
	if dateToStr := strings.TrimSpace(c.Query("date_to")); dateToStr != "" {
		if t, err := time.Parse(time.RFC3339, dateToStr); err == nil {
			filters.DateTo = &t
		} else if t, err := time.Parse("2006-01-02", dateToStr); err == nil {
			end := t.Add(24*time.Hour - time.Nanosecond)
			filters.DateTo = &end
		}
	}

	return filters
}

func buildAdminTransactionsQuery(filters adminTransactionFilters) *gorm.DB {
	db := database.DB.Table("payments AS p").
		Select(`
			p.uid AS payment_uid,
			p.transaction_id AS reference,
			p.amount AS amount,
			p.method AS payment_method,
			p.status AS payment_status,
			p.paid_at AS paid_at,
			p.created_at AS transaction_at,
			e.uid AS enrollment_uid,
			u.uid AS student_uid,
			u.name AS student_name,
			u.avatar_url AS student_avatar,
			c.uid AS course_uid,
			c.title AS course_title,
			c.cover_url AS course_cover,
			c.is_premium AS course_premium,
			ct.name AS class_type_name`).
		Joins("INNER JOIN enrollments AS e ON e.uid = p.enrollment_uid").
		Joins("INNER JOIN users AS u ON u.uid = e.user_uid").
		Joins("LEFT JOIN courses AS c ON c.uid = e.course_uid").
		Joins("LEFT JOIN class_types AS ct ON ct.uid = c.class_type_uid")

	if filters.Status != "" {
		db = db.Where("p.status = ?", filters.Status)
	}
	if filters.DateFrom != nil {
		db = db.Where("p.created_at >= ?", *filters.DateFrom)
	}
	if filters.DateTo != nil {
		db = db.Where("p.created_at <= ?", *filters.DateTo)
	}

	return db
}

func mapAdminTransactionRow(row adminTransactionRow) gin.H {
	courseTitle := ""
	if row.CourseTitle != nil {
		courseTitle = utils.DecryptOrSelf(*row.CourseTitle)
	}
	courseImage := ""
	if row.CourseCover != nil {
		courseImage = *row.CourseCover
	}
	classTypeName := ""
	if row.ClassTypeName != nil {
		classTypeName = utils.DecryptOrSelf(*row.ClassTypeName)
	}
	studentName, _ := utils.Decrypt(row.StudentName)

	purchasedAt := row.TransactionAt
	if row.PaidAt != nil {
		purchasedAt = *row.PaidAt
	}

	item := gin.H{
		"uid":            row.PaymentUID,
		"transactionId":  row.Reference,
		"courseUid":      row.CourseUID,
		"studentUid":     row.StudentUID,
		"courseImage":    courseImage,
		"courseName":     courseTitle,
		"classType":      utils.DeriveClassTypeLabel(row.CoursePremium, classTypeName),
		"price":          row.Amount,
		"paymentStatus":  row.PaymentStatus,
		"purchasedAt":    purchasedAt,
		"paymentMethod":  utils.PaymentMethodLabel(string(row.PaymentMethod)),
		"studentName":    studentName,
		"studentAvatar":  row.StudentAvatar,
	}

	return item
}

func filterAdminTransactionsBySearch(rows []adminTransactionRow, search string) []adminTransactionRow {
	if search == "" {
		return rows
	}
	needle := strings.ToLower(search)
	filtered := make([]adminTransactionRow, 0, len(rows))
	for _, row := range rows {
		courseTitle := ""
		if row.CourseTitle != nil {
			courseTitle = utils.DecryptOrSelf(*row.CourseTitle)
		}
		studentName, _ := utils.Decrypt(row.StudentName)
		haystack := strings.ToLower(strings.Join([]string{
			row.Reference,
			courseTitle,
			studentName,
		}, " "))
		if strings.Contains(haystack, needle) {
			filtered = append(filtered, row)
		}
	}
	return filtered
}

func computeTransactionSummary(rows []adminTransactionRow) gin.H {
	var gross float64
	paid, pending, failed := 0, 0, 0
	for _, row := range rows {
		switch row.PaymentStatus {
		case entity.PaymentSuccess:
			paid++
			gross += row.Amount
		case entity.PaymentPending:
			pending++
		case entity.PaymentFailed:
			failed++
		}
	}
	return gin.H{
		"grossRevenue": gross,
		"paidCount":    paid,
		"pendingCount": pending,
		"failedCount":  failed,
	}
}
