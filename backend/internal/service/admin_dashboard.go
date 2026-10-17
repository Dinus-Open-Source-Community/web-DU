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

// parseOptionalDashboardPeriod mem-parsing nilai `period` dari query string.
// Mengembalikan ok=false bila parameter kosong atau nilainya tidak dikenal,
// sehingga pemanggil bisa memakai rentang default sendiri.
//
// Nilai yang dikenali: 7d, 30d, 90d, 12m.
func parseOptionalDashboardPeriod(raw string) (dashboardPeriod, bool) {
	switch strings.ToLower(strings.TrimSpace(raw)) {
	case "7d", "30d", "90d", "12m":
		return parseDashboardPeriod(raw), true
	default:
		return dashboardPeriod{}, false
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

func sumSuccessfulPayments(start, end time.Time) float64 {
	var total float64
	database.DB.Table("payments").
		Where("status = ? AND created_at >= ? AND created_at <= ?", entity.PaymentSuccess, start, end).
		Select("COALESCE(SUM(amount), 0)").
		Scan(&total)
	return total
}

func countPayments(start, end time.Time) int64 {
	var count int64
	database.DB.Table("payments").
		Where("created_at >= ? AND created_at <= ?", start, end).
		Count(&count)
	return count
}

func countActiveUsers(start, end time.Time) int64 {
	var count int64
	database.DB.Table("users").
		Where(`uid IN (
			SELECT DISTINCT e.user_uid FROM enrollments e
			WHERE e.enrolled_at >= ? AND e.enrolled_at <= ?
			UNION
			SELECT DISTINCT e.user_uid FROM payments p
			INNER JOIN enrollments e ON e.uid = p.enrollment_uid
			WHERE p.status = ? AND p.created_at >= ? AND p.created_at <= ?
		)`, start, end, entity.PaymentSuccess, start, end).
		Count(&count)
	return count
}

// conversionRate menghitung persentase enrollment yang berubah menjadi transaksi
// lunas, DI DALAM rentang waktu yang sama.
//
// Penting: pembilang dan penyebut harus memakai populasi & kolom tanggal yang
// sama. Versi lama menghitung COUNT(payments by created_at) dibagi
// COUNT(enrollments by enrolled_at) - dua populasi berbeda dengan tanggal
// berbeda, sehingga pembayaran untuk enrollment lama bisa membuat hasil >100%
// (terbukti: 111.1% pada periode 12m, 2026-10-08).
//
// Sekarang: enrollment yang dibuat di [start,end] yang punya minimal satu
// pembayaran berstatus success. Hasil dijamin berada di rentang 0..100.
func conversionRate(start, end time.Time) float64 {
	var enrollments int64
	database.DB.Table("enrollments").
		Where("enrolled_at >= ? AND enrolled_at <= ?", start, end).
		Count(&enrollments)
	if enrollments == 0 {
		return 0
	}
	var paid int64
	database.DB.Table("enrollments AS e").
		Joins("INNER JOIN payments AS p ON p.enrollment_uid = e.uid AND p.status = ?", entity.PaymentSuccess).
		Where("e.enrolled_at >= ? AND e.enrolled_at <= ?", start, end).
		Distinct("e.uid").
		Count(&paid)
	if paid > enrollments {
		// Teoretically tidak mungkin (paid adalah subset dari enrollments pada
		// window yang sama), tapi dijaga agar metrik tidak pernah >100%.
		paid = enrollments
	}
	return math.Round((float64(paid)/float64(enrollments))*1000) / 10
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

	curRevenue := sumSuccessfulPayments(period.currentStart, period.currentEnd)
	prevRevenue := sumSuccessfulPayments(period.prevStart, period.prevEnd)

	curUsers := float64(countActiveUsers(period.currentStart, period.currentEnd))
	prevUsers := float64(countActiveUsers(period.prevStart, period.prevEnd))

	curTx := float64(countPayments(period.currentStart, period.currentEnd))
	prevTx := float64(countPayments(period.prevStart, period.prevEnd))

	curConv := conversionRate(period.currentStart, period.currentEnd)
	prevConv := conversionRate(period.prevStart, period.prevEnd)

	kpis := []gin.H{
		buildAdminKpi("gross-revenue", "Pendapatan kotor", "revenue", period.label, curRevenue, prevRevenue, func(v float64) string {
			return utils.FormatPriceIDR(v)
		}),
		buildAdminKpi("active-users", "Pengguna aktif", "users", "dibanding periode sebelumnya", curUsers, prevUsers, func(v float64) string {
			return fmt.Sprintf("%.0f", v)
		}),
		buildAdminKpi("transactions", "Transaksi", "transactions", period.label, curTx, prevTx, func(v float64) string {
			return fmt.Sprintf("%.0f", v)
		}),
		buildAdminKpi("conversion-rate", "Tingkat konversi", "conversion", period.label, curConv, prevConv, func(v float64) string {
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

// @Summary      Get recent admin transactions
// @Description  Retrieve recent transactions for the admin dashboard.
// @Tags         Admin
// @Accept       json
// @Produce      json
// @Security     BearerAuth
// @Param        limit  query  int     false  "Number of items (default: 5)"
// @Param        period query  string  false  "Period shorthand: 7d, 30d, 90d, 12m (used when no explicit date range)"
// @Success      200  {object}  map[string]any  "Recent transactions retrieved successfully"
// @Failure      401  {object}  map[string]any  "Unauthorized"
// @Failure      403  {object}  map[string]any  "Forbidden"
// @Failure      500  {object}  map[string]any  "Internal server error"
// @Router       /admin/dashboard/recent-transactions [get]
func GetAdminRecentTransactionsFunc(c *gin.Context) {
	if _, ok := requireAdminAccess(c); !ok {
		return
	}

	limit := 5
	if raw := c.Query("limit"); raw != "" {
		if parsed, err := strconv.Atoi(raw); err == nil && parsed > 0 {
			limit = parsed
		}
	}

	items, err := fetchRecentAdminTransactions(limit, strings.TrimSpace(c.Query("period")))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "Failed to retrieve recent transactions",
			"data":    nil,
			"error":   err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Recent transactions retrieved successfully",
		"data":    items,
		"error":   nil,
	})
}
