package service

import (
	"fmt"
	"math"
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
// @Success      200  {object}  map[string]any  "Financial summary retrieved successfully"
// @Failure      401  {object}  map[string]any  "Unauthorized"
// @Failure      403  {object}  map[string]any  "Forbidden"
// @Router       /admin/financial/summary [get]
func GetAdminFinancialSummaryFunc(c *gin.Context) {
	if _, ok := requireAdminAccess(c); !ok {
		return
	}

	now := time.Now()
	start12m := now.AddDate(-1, 0, 0)

	var gross12m float64
	database.DB.Table("payments").
		Where("status = ? AND created_at >= ?", entity.PaymentSuccess, start12m).
		Select("COALESCE(SUM(amount), 0)").
		Scan(&gross12m)

	start30d := now.AddDate(0, 0, -30)
	startPrev30d := now.AddDate(0, 0, -60)
	var gross30d, grossPrev30d float64
	database.DB.Table("payments").
		Where("status = ? AND created_at >= ?", entity.PaymentSuccess, start30d).
		Select("COALESCE(SUM(amount), 0)").
		Scan(&gross30d)
	database.DB.Table("payments").
		Where("status = ? AND created_at >= ? AND created_at < ?", entity.PaymentSuccess, startPrev30d, start30d).
		Select("COALESCE(SUM(amount), 0)").
		Scan(&grossPrev30d)

	var txCount int64
	database.DB.Table("payments").
		Where("status = ? AND created_at >= ?", entity.PaymentSuccess, start30d).
		Count(&txCount)
	avgOrder := 0.0
	if txCount > 0 {
		avgOrder = gross30d / float64(txCount)
	}

	var totalUsers int64
	database.DB.Table("users").Count(&totalUsers)
	var paidEnrollments int64
	database.DB.Table("payments").
		Where("status = ?", entity.PaymentSuccess).
		Count(&paidEnrollments)
	convRate := 0.0
	if totalUsers > 0 {
		convRate = math.Round((float64(paidEnrollments)/float64(totalUsers))*1000) / 10
	}

	kpis := []gin.H{
		{
			"id": "gross-revenue-12m", "label": "Gross Revenue (12m)", "value": utils.FormatPriceIDR(gross12m),
			"trendValue": trendPercent(gross30d, grossPrev30d), "trendDirection": trendDirection(gross30d, grossPrev30d),
			"trendLabel": "30 hari terakhir", "iconName": "revenue",
		},
		{
			"id": "avg-order-value", "label": "Avg Order Value", "value": utils.FormatPriceIDR(avgOrder),
			"trendValue": 0, "trendDirection": "neutral", "trendLabel": "30 hari terakhir", "iconName": "transactions",
		},
		{
			"id": "paid-transactions", "label": "Paid Transactions", "value": fmt.Sprintf("%d", txCount),
			"trendValue": 0, "trendDirection": "neutral", "trendLabel": "30 hari terakhir", "iconName": "paid",
		},
		{
			"id": "conversion-rate", "label": "Conversion Rate", "value": fmt.Sprintf("%.1f%%", convRate),
			"trendValue": 0, "trendDirection": "neutral", "trendLabel": "all time", "iconName": "conversion",
		},
	}

	type monthRow struct {
		Month string  `gorm:"column:month_label"`
		Total float64 `gorm:"column:total"`
	}
	var monthRows []monthRow
	database.DB.Table("payments").
		Select(`TO_CHAR(created_at, 'Mon YYYY') AS month_label, COALESCE(SUM(amount), 0) AS total`).
		Where("status = ? AND created_at >= ?", entity.PaymentSuccess, start12m).
		Group("TO_CHAR(created_at, 'YYYY-MM'), TO_CHAR(created_at, 'Mon YYYY')").
		Order("TO_CHAR(created_at, 'YYYY-MM') ASC").
		Scan(&monthRows)

	monthlyRevenue := make([]gin.H, 0, len(monthRows))
	for _, row := range monthRows {
		monthlyRevenue = append(monthlyRevenue, gin.H{"label": row.Month, "value": row.Total})
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
		Where("p.status = ? AND p.created_at >= ?", entity.PaymentSuccess, start12m).
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
