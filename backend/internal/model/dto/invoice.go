package dto

import (
	"fmt"
	"strconv"
	"strings"
	"time"
)

type InvoiceDTO struct {
	ID            uint      `json:"id"`
	EnrollmentID  uint      `json:"enrollment_id"`
	UserID        uint      `json:"user_id"`
	CourseID      uint      `json:"course_id"`
	UserName      string    `json:"user_name"`
	UserEmail     string    `json:"user_email"`
	CourseTitle   string    `json:"course_title"`
	CoursePrice   float64   `json:"course_price"`
	Slug          string    `json:"slug"`
	EnrolledAt    time.Time `json:"enrolled_at"`
	PaymentStatus string    `json:"payment_status"`
	InvoiceURL    string    `json:"invoice_url"`
	Filename      string    `json:"filename"`
	CreatedAt     time.Time `json:"created_at"`
}

// GenerateInvoiceFilename generates filename in format: {enrollmentID}T{userID}T{courseID}T{dateYYYYMMDD}.pdf
func GenerateInvoiceFilename(enrollmentID uint, userID uint, courseID uint, date time.Time) string {
	return fmt.Sprintf("%dT%dT%dT%s.pdf", enrollmentID, userID, courseID, date.Format("20060102"))
}

// ParseInvoiceFilename parses filename to extract enrollmentID, userID, and courseID
// Format: {enrollmentID}T{userID}T{courseID}T{dateYYYYMMDD}.pdf
// Example: "1T4T3T20251201.pdf" -> enrollmentID=1, userID=4, courseID=3, date="20251201"
func ParseInvoiceFilename(filename string) (enrollmentID uint, userID uint, courseID uint, date string) {
	// Remove .pdf extension
	parts := strings.Split(strings.TrimSuffix(filename, ".pdf"), "T")
	if len(parts) < 4 {
		return 0, 0, 0, ""
	}

	// Parse each part
	var eID, uID, cID uint64
	eID, _ = strconv.ParseUint(parts[0], 10, 32)
	uID, _ = strconv.ParseUint(parts[1], 10, 32)
	cID, _ = strconv.ParseUint(parts[2], 10, 32)

	return uint(eID), uint(uID), uint(cID), parts[3]
}
