package service

import (
	"fmt"
	"net/http"
	"time"

	"backend/internal/database"
	"backend/internal/model/entity"
	"backend/internal/utils"

	"github.com/gin-gonic/gin"
)

// @Summary      Get admin financial summary
// @Description  Revenue analytics for the admin financial page.
// @Tags         Admin
// @Accept       json
// @Produce      json
// @Security     BearerAuth
// @Param        period  query  string  false  "Period: 7d, 30d, 90d, 12m (default 12m)"
// @Success      200  {object}  map[string]any  "Financial summary retrieved successfully"
// @Failure      401  {object}  map[string]any  "Unauthorized"
// @Failure      403  {object}  map[string]any  "Forbidden"
// @Router       /admin/financial/summary [get]
var idMonthAbbr = [...]string{"Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"}

// formatRevenueBucket menghasilkan label bucket revenue yang stabil (tidak
// bergantung locale database, berbeda dari TO_CHAR(..., 'Mon')).
func formatRevenueBucket(t time.Time, truncUnit string) string {
	switch truncUnit {
	case "day":
		return fmt.Sprintf("%d %s", t.Day(), idMonthAbbr[int(t.Month())-1])
	default:
		return fmt.Sprintf("%s %d", idMonthAbbr[int(t.Month())-1], t.Year())
	}
}

func GetAdminFinancialSummaryFunc(c *gin.Context) {
	if _, ok := requireAdminAccess(c); !ok {
		return
	}

	// `period` Opsional. Bila tidak dikirim, tetap 12 bulan agar halaman
	// Laporan Keuangan tidak berubah perilakunya. Dasbor admin mengirim nilai
	// period yang sama dengan selector-nya, sehingga chart ikut mengikuti pilihan
	// pengguna (bug: selector hanya memengaruhi KPI card, chart tetap 12 bulan).
	period, ok := parseOptionalDashboardPeriod(c.Query("period"))
	if !ok {
		period = parseDashboardPeriod("12m")
	}
	start := period.currentStart
	end := period.currentEnd
	label := period.label

	var gross float64
	database.DB.Table("payments").
		Where("status = ? AND created_at >= ? AND created_at <= ?", entity.PaymentSuccess, start, end).
		Select("COALESCE(SUM(amount), 0)").
		Scan(&gross)

	var grossPrev float64
	database.DB.Table("payments").
		Where("status = ? AND created_at >= ? AND created_at <= ?", entity.PaymentSuccess, period.prevStart, period.prevEnd).
		Select("COALESCE(SUM(amount), 0)").
		Scan(&grossPrev)

	var txCount int64
	database.DB.Table("payments").
		Where("status = ? AND created_at >= ? AND created_at <= ?", entity.PaymentSuccess, start, end).
		Count(&txCount)
	avgOrder := 0.0
	if txCount > 0 {
		avgOrder = gross / float64(txCount)
	}

	// Tingkat konversi memakai enrollment sebagai penyebut, bukan total users.
	// Versi lama membagi all-time successful payments dengan COUNT(users), yang
	// termasuk admin dan mentor yang tidak pernah membeli - hasilnya 125.0%
	// (terbukti 2026-10-08) dan secara definisi tidak bisa melebihi 100% bila
	// pembilang dan penyebut memakai populasi yang sama.
	convRate := conversionRate(start, end)

	kpis := []gin.H{
		{
			"id": "gross-revenue", "label": "Pendapatan kotor", "value": utils.FormatPriceIDR(gross),
			"trendValue": trendPercent(gross, grossPrev), "trendDirection": trendDirection(gross, grossPrev),
			"trendLabel": label, "iconName": "revenue",
		},
		{
			"id": "avg-order-value", "label": "Nilai pesanan rata-rata", "value": utils.FormatPriceIDR(avgOrder),
			"trendValue": 0, "trendDirection": "neutral", "trendLabel": label, "iconName": "transactions",
		},
		{
			"id": "paid-transactions", "label": "Transaksi lunas", "value": fmt.Sprintf("%d", txCount),
			"trendValue": 0, "trendDirection": "neutral", "trendLabel": label, "iconName": "paid",
		},
		{
			"id": "conversion-rate", "label": "Tingkat konversi", "value": fmt.Sprintf("%.1f%%", convRate),
			"trendValue": 0, "trendDirection": "neutral", "trendLabel": label, "iconName": "conversion",
		},
	}

	// Tren pendapatan mengikuti `period` yang dipilih. Bucket per-bulan untuk
	// periode panjang, per-hari untuk 7d/30d (kalau tidak, 7 hari hanya akan
	// menghasilkan 1 batang). Label diformat di Go, bukan TO_CHAR 'Mon', supaya
	// tidak bergantung pada locale database.
	type bucketRow struct {
		Bucket time.Time `gorm:"column:bucket_start"`
		Total  float64   `gorm:"column:total"`
	}
	// Tentukan unit bucket berdasarkan panjang periode: hari untuk <=31 hari,
	// bulan untuk yang lebih lama. Label diformat di Go, bukan TO_CHAR 'Mon',
	// supaya tidak bergantung pada locale database.
	isDaily := period.currentEnd.Sub(period.currentStart) <= 31*24*time.Hour
	var bucketRows []bucketRow
	if isDaily {
		database.DB.Table("payments").
			Select("date_trunc('day', created_at) AS bucket_start, COALESCE(SUM(amount), 0) AS total").
			Where("status = ? AND created_at >= ? AND created_at <= ?", entity.PaymentSuccess, start, end).
			Group("date_trunc('day', created_at)").
			Order("bucket_start ASC").
			Scan(&bucketRows)
	} else {
		database.DB.Table("payments").
			Select("date_trunc('month', created_at) AS bucket_start, COALESCE(SUM(amount), 0) AS total").
			Where("status = ? AND created_at >= ? AND created_at <= ?", entity.PaymentSuccess, start, end).
			Group("date_trunc('month', created_at)").
			Order("bucket_start ASC").
			Scan(&bucketRows)
	}

	// Isi bucket kosong dengan 0 supaya grafik tidak terlihat melompati periode.
	// Gunakan string key (YYYY-MM-DD atau YYYY-MM) untuk map agar lookup
	// tidak gagal karena perbedaan timezone/monotonic clock pada time.Time.
	monthlyRevenue := make([]gin.H, 0, len(bucketRows)+1)
	totals := make(map[string]float64, len(bucketRows))
	for _, row := range bucketRows {
		key := row.Bucket.UTC().Format("2006-01-02")
		totals[key] += row.Total
	}

	// Iterator mulai dari awal periode yang dibulatkan ke unit bucket.
	iterStart := start
	if isDaily {
		iterStart = time.Date(start.Year(), start.Month(), start.Day(), 0, 0, 0, 0, time.UTC)
	} else {
		iterStart = time.Date(start.Year(), start.Month(), 1, 0, 0, 0, 0, time.UTC)
	}

	if isDaily {
		for cur := iterStart; !cur.After(end); cur = cur.Add(24 * time.Hour) {
			key := cur.UTC().Format("2006-01-02")
			monthlyRevenue = append(monthlyRevenue, gin.H{
				"label": formatRevenueBucket(cur, "day"),
				"value": totals[key],
			})
			if len(monthlyRevenue) > 400 {
				break
			}
		}
	} else {
		for cur := iterStart; !cur.After(end); cur = cur.AddDate(0, 1, 0) {
			key := cur.UTC().Format("2006-01-02")
			monthlyRevenue = append(monthlyRevenue, gin.H{
				"label": formatRevenueBucket(cur, "month"),
				"value": totals[key],
			})
			if len(monthlyRevenue) > 400 {
				break
			}
		}
	}

	type categoryRow struct {
		Name  string  `gorm:"column:category_name"`
		Total float64 `gorm:"column:total"`
	}
	var categoryRows []categoryRow
	database.DB.Table("payments AS p").
		Select("cc.name AS category_name, COALESCE(SUM(p.amount), 0) AS total").
		Joins("INNER JOIN enrollments e ON e.uid = p.enrollment_uid").
		Joins("LEFT JOIN courses c ON c.uid = e.course_uid").
		Joins("LEFT JOIN course_categories cc ON cc.uid = c.category_uid").
		Where("p.status = ? AND p.created_at >= ? AND p.created_at <= ?", entity.PaymentSuccess, start, end).
		Group("cc.uid, cc.name").
		Order("total DESC").
		Scan(&categoryRows)

	revenueByCategory := make([]gin.H, 0, len(categoryRows))
	for _, row := range categoryRows {
		revenueByCategory = append(revenueByCategory, gin.H{
			"label": utils.DecryptOrSelf(row.Name),
			"value": row.Total,
		})
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Financial summary retrieved successfully",
		"data": gin.H{
			"kpis":              kpis,
			"monthlyRevenue":    monthlyRevenue,
			"revenueByCategory": revenueByCategory,
			"revenueSource": []gin.H{
				{"label": "Website", "value": 100, "color": "#4F46E5"},
			},
		},
		"error": nil,
	})
}
