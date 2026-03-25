package utils

import (
	"fmt"
	"strings"
)

// FormatPriceIDR formats price as Indonesian Rupiah currency with thousands separator
// Example: 100000 -> "Rp 100.000"
// Example: 1500000 -> "Rp 1.500.000"
func FormatPriceIDR(price float64) string {
	// Convert to integer to avoid decimal places
	priceInt := int64(price)

	// Format with thousands separator
	priceStr := fmt.Sprintf("%d", priceInt)

	// Add dots as thousands separator (Indonesian format)
	var result strings.Builder
	for i, digit := range priceStr {
		if i > 0 && (len(priceStr)-i)%3 == 0 {
			result.WriteString(".")
		}
		result.WriteRune(digit)
	}

	return fmt.Sprintf("Rp %s", result.String())
}
