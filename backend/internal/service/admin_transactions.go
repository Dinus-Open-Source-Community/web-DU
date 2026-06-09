package service

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

// @Summary      List all transactions (Admin)
// @Description  Retrieve paginated admin transaction list with summary counts.
// @Tags         Admin
// @Accept       json
// @Produce      json
// @Security     BearerAuth
// @Param        page       query  int     false  "Page number (default: 1)"
// @Param        per_page   query  int     false  "Items per page (default: 10, max: 100)"
// @Param        status     query  string  false  "Filter by payment status"
// @Param        search     query  string  false  "Search by reference, course, or student"
// @Param        date_from  query  string  false  "Filter from date (YYYY-MM-DD or RFC3339)"
// @Param        date_to    query  string  false  "Filter to date (YYYY-MM-DD or RFC3339)"
// @Success      200  {object}  map[string]any  "Transactions retrieved successfully"
// @Failure      401  {object}  map[string]any  "Unauthorized"
// @Failure      403  {object}  map[string]any  "Forbidden"
// @Failure      500  {object}  map[string]any  "Internal server error"
// @Router       /admin/transactions [get]
// @Summary      Get admin transactions summary
// @Description  Aggregate payment counts and gross revenue for admin dashboards.
// @Tags         Admin
// @Accept       json
// @Produce      json
// @Security     BearerAuth
// @Param        status     query  string  false  "Filter by payment status"
// @Param        search     query  string  false  "Search by reference, course, or student"
// @Param        date_from  query  string  false  "Filter from date (YYYY-MM-DD or RFC3339)"
// @Param        date_to    query  string  false  "Filter to date (YYYY-MM-DD or RFC3339)"
// @Success      200  {object}  map[string]any  "Transaction summary retrieved successfully"
// @Failure      401  {object}  map[string]any  "Unauthorized"
// @Failure      403  {object}  map[string]any  "Forbidden"
// @Failure      500  {object}  map[string]any  "Internal server error"
// @Router       /admin/transactions/summary [get]
func GetAdminTransactionsSummaryFunc(c *gin.Context) {
	if _, ok := requireAdminAccess(c); !ok {
		return
	}

	filters := parseAdminTransactionFilters(c)
	db := buildAdminTransactionsQuery(filters)

	var allRows []adminTransactionRow
	if err := db.Order("p.created_at DESC").Scan(&allRows).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "Failed to retrieve transaction summary",
			"data":    nil,
			"error":   err.Error(),
		})
		return
	}

	filtered := filterAdminTransactionsBySearch(allRows, filters.Search)

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Transaction summary retrieved successfully",
		"data":    computeTransactionSummary(filtered),
		"error":   nil,
	})
}

func GetAdminTransactionsFunc(c *gin.Context) {
	if _, ok := requireAdminAccess(c); !ok {
		return
	}

	filters := parseAdminTransactionFilters(c)
	db := buildAdminTransactionsQuery(filters)

	var allRows []adminTransactionRow
	if err := db.Order("p.created_at DESC").Scan(&allRows).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "Failed to retrieve transactions",
			"data":    nil,
			"error":   err.Error(),
		})
		return
	}

	filtered := filterAdminTransactionsBySearch(allRows, filters.Search)
	total := len(filtered)
	start := (filters.Page - 1) * filters.PerPage
	if start > total {
		start = total
	}
	end := start + filters.PerPage
	if end > total {
		end = total
	}
	pageRows := filtered[start:end]

	transactions := make([]gin.H, 0, len(pageRows))
	for _, row := range pageRows {
		transactions = append(transactions, mapAdminTransactionRow(row))
	}

	totalPages := 0
	if filters.PerPage > 0 {
		totalPages = (total + filters.PerPage - 1) / filters.PerPage
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Transactions retrieved successfully",
		"data": gin.H{
			"transactions": transactions,
			"meta": gin.H{
				"current_page": filters.Page,
				"per_page":     filters.PerPage,
				"total":        total,
				"total_pages":  totalPages,
			},
			"summary": computeTransactionSummary(filtered),
		},
		"error": nil,
	})
}

func fetchRecentAdminTransactions(limit int) ([]gin.H, error) {
	if limit <= 0 {
		limit = 5
	}
	filters := adminTransactionFilters{Limit: limit}
	db := buildAdminTransactionsQuery(filters)

	var rows []adminTransactionRow
	if err := db.Order("p.created_at DESC").Limit(limit).Scan(&rows).Error; err != nil {
		return nil, err
	}

	items := make([]gin.H, 0, len(rows))
	for _, row := range rows {
		items = append(items, mapAdminTransactionRow(row))
	}
	return items, nil
}
