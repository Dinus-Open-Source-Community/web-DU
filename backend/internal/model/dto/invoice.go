package dto

import (
	"fmt"
	"strings"
	"time"

	"github.com/google/uuid"
)

type InvoiceDTO struct {
	Uid           uuid.UUID `json:"uid"`
	EnrollmentUid uuid.UUID `json:"enrollment_uid"`
	UserUid       uuid.UUID `json:"user_uid"`
	CourseUid     uuid.UUID `json:"course_uid"`
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

// GenerateInvoiceFilename format: {enrollmentUid}__{userUid}__{courseUid}__{dateYYYYMMDD}.pdf
func GenerateInvoiceFilename(enrollmentUid, userUid, courseUid uuid.UUID, date time.Time) string {
	return fmt.Sprintf("%s__%s__%s__%s.pdf",
		enrollmentUid.String(), userUid.String(), courseUid.String(), date.Format("20060102"))
}

// ParseInvoiceFilename parses filename into UUIDs and date suffix.
func ParseInvoiceFilename(filename string) (enrollmentUid, userUid, courseUid uuid.UUID, date string, err error) {
	base := strings.TrimSuffix(filename, ".pdf")
	parts := strings.Split(base, "__")
	if len(parts) < 4 {
		return uuid.Nil, uuid.Nil, uuid.Nil, "", fmt.Errorf("invalid invoice filename")
	}
	enrollmentUid, err = uuid.Parse(parts[0])
	if err != nil {
		return uuid.Nil, uuid.Nil, uuid.Nil, "", err
	}
	userUid, err = uuid.Parse(parts[1])
	if err != nil {
		return uuid.Nil, uuid.Nil, uuid.Nil, "", err
	}
	courseUid, err = uuid.Parse(parts[2])
	if err != nil {
		return uuid.Nil, uuid.Nil, uuid.Nil, "", err
	}
	date = parts[3]
	return enrollmentUid, userUid, courseUid, date, nil
}
