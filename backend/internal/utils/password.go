package utils

import (
	"errors"
	"unicode/utf8"
)

// ValidatePasswordStrength memvalidasi 5 syarat password yang sama dengan
// indikator kekuatan password frontend (EvaluatePassword): minimal 8 karakter,
// huruf besar, huruf kecil, angka, dan karakter spesial.
func ValidatePasswordStrength(password string) error {
	if utf8.RuneCountInString(password) < 8 {
		return errors.New("Password minimal 8 karakter")
	}

	var hasUpper, hasLower, hasDigit, hasSpecial bool
	for _, r := range password {
		switch {
		case r >= 'A' && r <= 'Z':
			hasUpper = true
		case r >= 'a' && r <= 'z':
			hasLower = true
		case r >= '0' && r <= '9':
			hasDigit = true
		default:
			// Selaras regex frontend [^A-Za-z0-9].
			hasSpecial = true
		}
	}

	if !hasUpper {
		return errors.New("Password harus mengandung huruf besar (A-Z)")
	}
	if !hasLower {
		return errors.New("Password harus mengandung huruf kecil (a-z)")
	}
	if !hasDigit {
		return errors.New("Password harus mengandung angka")
	}
	if !hasSpecial {
		return errors.New("Password harus mengandung karakter spesial (!@#$%...)")
	}
	return nil
}
