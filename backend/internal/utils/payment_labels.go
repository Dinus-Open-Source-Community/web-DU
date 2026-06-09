package utils

import (
	"strings"
)

// PaymentMethodLabel maps Tripay/payment enum codes to UI-friendly labels.
func PaymentMethodLabel(method string) string {
	code := strings.ToUpper(strings.TrimSpace(method))
	switch {
	case code == "QRIS2" || strings.Contains(code, "QRIS"):
		return "QRIS"
	case code == "OVO" || code == "DANA" || code == "SHOPEEPAY" || code == "LINKAJA":
		return "E-Wallet"
	case strings.HasSuffix(code, "VA"):
		return "Virtual Account"
	case code == "BANK_TRANSFER" || code == "CREDIT_CARD":
		return "Bank Transfer"
	default:
		return "Bank Transfer"
	}
}

// DeriveClassTypeLabel maps course metadata to FE class type labels.
func DeriveClassTypeLabel(isPremium bool, classTypeName string) string {
	name := strings.ToLower(strings.TrimSpace(classTypeName))
	switch {
	case strings.Contains(name, "bootcamp"):
		return "Bootcamp"
	case isPremium:
		return "Premium"
	default:
		return "Free"
	}
}
