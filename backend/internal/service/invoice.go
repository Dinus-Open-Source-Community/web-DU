package service

import (
	"backend/internal/database"
	"backend/internal/model/dto"
	"backend/internal/model/entity"
	"backend/internal/utils"
	"bytes"
	"context"
	"fmt"
	"io"

	"github.com/jung-kurt/gofpdf"
)

// GenerateInvoicePDF generates a PDF invoice for an enrollment
// Returns the PDF bytes, filename, and error
func GenerateInvoicePDF(enrollment *entity.Enrollment) ([]byte, string, error) {
	// Fetch related data
	var user entity.User
	if err := database.DB.First(&user, enrollment.UserUid).Error; err != nil {
		return nil, "", fmt.Errorf("failed to fetch user: %w", err)
	}

	// Name/Email sudah plaintext via hook User.AfterFind; jangan Decrypt ulang.
	customerName := user.Name
	customerEmail := user.Email

	var course entity.Course
	if err := database.DB.First(&course, enrollment.CourseUid).Error; err != nil {
		return nil, "", fmt.Errorf("failed to fetch course: %w", err)
	}

	// Fetch payment status
	var payment entity.Payment
	paymentStatus := "unpaid"
	if err := database.DB.Where("enrollment_uid = ?", enrollment.Uid).First(&payment).Error; err == nil {
		paymentStatus = string(payment.Status)
	}

	filename := dto.GenerateInvoiceFilename(
		enrollment.Uid,
		enrollment.UserUid,
		enrollment.CourseUid,
		enrollment.EnrolledAt)

	// Create PDF
	pdf := gofpdf.New("P", "mm", "A4", "")
	pdf.AddPage()

	// Company Title
	pdf.SetFont("Arial", "B", 28)
	pdf.SetTextColor(52, 152, 219) // Blue color
	pdf.CellFormat(0, 15, "Doscom University", "", 1, "C", false, 0, "")
	pdf.Ln(3)

	// Header
	pdf.SetFont("Arial", "B", 20)
	pdf.SetTextColor(0, 0, 0)
	pdf.SetFillColor(52, 152, 219) // Blue color
	pdf.SetTextColor(255, 255, 255)
	pdf.CellFormat(0, 15, "INVOICE", "", 1, "C", true, 0, "")
	pdf.Ln(5)

	// Reset text color
	pdf.SetTextColor(0, 0, 0)
	pdf.SetFont("Arial", "", 10)

	// Invoice Info
	pdf.SetFont("Arial", "B", 11)
	pdf.CellFormat(50, 8, "Invoice Number:", "", 0, "L", false, 0, "")
	pdf.SetFont("Arial", "", 10)
	pdf.CellFormat(0, 8, fmt.Sprintf("INV-%s", enrollment.Uid.String()), "", 1, "L", false, 0, "")

	pdf.SetFont("Arial", "B", 11)
	pdf.CellFormat(50, 8, "Invoice Date:", "", 0, "L", false, 0, "")
	pdf.SetFont("Arial", "", 10)
	pdf.CellFormat(0, 8, enrollment.EnrolledAt.Format("02-01-2006"), "", 1, "L", false, 0, "")

	pdf.SetFont("Arial", "B", 11)
	pdf.CellFormat(50, 8, "Status:", "", 0, "L", false, 0, "")
	pdf.SetFont("Arial", "", 10)
	// Set color based on status
	switch paymentStatus {
	case "success":
		pdf.SetTextColor(39, 174, 96) // Green
	case "pending":
		pdf.SetTextColor(241, 196, 15) // Yellow/Orange
	case "failed":
		pdf.SetTextColor(231, 76, 60) // Red
	}
	pdf.CellFormat(0, 8, fmt.Sprintf("%s", paymentStatus), "", 1, "L", false, 0, "")
	pdf.SetTextColor(0, 0, 0)

	pdf.Ln(8)

	// Bill To Section
	pdf.SetFont("Arial", "B", 11)
	pdf.CellFormat(0, 8, "BILL TO:", "", 1, "L", false, 0, "")
	pdf.SetFont("Arial", "", 10)
	pdf.CellFormat(0, 8, fmt.Sprintf("Name: %s", customerName), "", 1, "L", false, 0, "")
	pdf.CellFormat(0, 8, fmt.Sprintf("Email: %s", customerEmail), "", 1, "L", false, 0, "")

	pdf.Ln(8)

	// Course Details Table
	pdf.SetFont("Arial", "B", 11)
	pdf.SetFillColor(189, 195, 199) // Light gray
	pdf.CellFormat(90, 8, "Course", "1", 0, "C", true, 0, "")
	pdf.CellFormat(40, 8, "Price", "1", 0, "C", true, 0, "")
	pdf.CellFormat(60, 8, "Status", "1", 1, "C", true, 0, "")

	pdf.SetFont("Arial", "", 10)
	pdf.SetFillColor(245, 245, 245)

	// Course row
	pdf.CellFormat(90, 8, course.Title, "1", 0, "L", true, 0, "")
	pdf.CellFormat(40, 8, utils.FormatPriceIDR(course.Price), "1", 0, "R", true, 0, "")
	pdf.CellFormat(60, 8, "Enrolled", "1", 1, "C", true, 0, "")

	pdf.Ln(5)

	// Total Section
	pdf.SetFont("Arial", "B", 12)
	pdf.CellFormat(130, 10, "Total Amount:", "1", 0, "R", false, 0, "")
	pdf.CellFormat(60, 10, utils.FormatPriceIDR(course.Price), "1", 1, "C", true, 0, "")

	pdf.Ln(10)

	// Footer
	pdf.SetFont("Arial", "I", 9)
	pdf.SetTextColor(128, 128, 128)
	pdf.CellFormat(0, 8, "Thank you for enrolling in this course!", "", 1, "C", false, 0, "")
	pdf.CellFormat(0, 8, fmt.Sprintf("Enrollment: %s | Course Slug: %s", enrollment.Uid.String(), course.Slug), "", 1, "C", false, 0, "")

	// Generate PDF bytes
	var buf bytes.Buffer
	if err := pdf.Output(&buf); err != nil {
		return nil, "", fmt.Errorf("failed to generate PDF: %w", err)
	}

	return buf.Bytes(), filename, nil
}

// UploadInvoiceToPDF uploads the generated invoice to MinIO
func UploadInvoiceToPDF(pdfBytes []byte, filename string) (string, error) {
	bucket := utils.GetBucketInvoices()
	if bucket == "" {
		return "", fmt.Errorf("invoices bucket not configured")
	}

	reader := bytes.NewReader(pdfBytes)
	url, err := utils.UploadFileFromReader(reader, int64(len(pdfBytes)), bucket, filename, "application/pdf")
	if err != nil {
		return "", fmt.Errorf("failed to upload invoice to MinIO: %w", err)
	}

	return url, nil
}

// CreateAndUploadInvoice generates and uploads invoice for an enrollment
func CreateAndUploadInvoice(enrollment *entity.Enrollment) (string, string, error) {
	// Generate PDF
	pdfBytes, filename, err := GenerateInvoicePDF(enrollment)
	if err != nil {
		return "", "", err
	}

	// Upload to MinIO with custom filename
	bucket := utils.GetBucketInvoices()
	if bucket == "" {
		return "", "", fmt.Errorf("invoices bucket not configured")
	}

	reader := bytes.NewReader(pdfBytes)
	// Upload with the specific filename format
	url, err := uploadInvoiceWithCustomFilename(reader, int64(len(pdfBytes)), bucket, filename)
	if err != nil {
		return "", "", err
	}

	return url, filename, nil
}

// uploadInvoiceWithCustomFilename mengunggah invoice dengan nama file spesifik
// (bukan UUID acak). Dipakai supaya invoice dari enrollment yang sama selalu
// menulis ke object key yang deterministik. Konten disimpan apa adanya
// (tanpa enkripsi) melalui PutObject.
func uploadInvoiceWithCustomFilename(reader io.Reader, _ int64, bucket, filename string) (string, error) {
	if utils.MinioClient == nil {
		return "", fmt.Errorf("MinIO client is not initialized")
	}

	data, err := io.ReadAll(reader)
	if err != nil {
		return "", fmt.Errorf("failed to read invoice bytes: %w", err)
	}

	if err := utils.PutObject(context.Background(), bucket, filename, data, "application/pdf", filename); err != nil {
		return "", err
	}

	return utils.GetPublicURL(bucket, filename), nil
}
