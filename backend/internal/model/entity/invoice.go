package entity

import (
	"time"

	"github.com/google/uuid"
)

type InvoiceStatus string

const (
	InvoicePending InvoiceStatus = "PENDING"
	InvoicePaid    InvoiceStatus = "PAID"
	InvoiceFailed  InvoiceStatus = "FAILED"
)

type Invoice struct {
	ID            uuid.UUID
	InvoiceNumber string
	UserID        uuid.UUID
	AmountCents   int64
	Currency      string
	Status        InvoiceStatus // Paid/Pending/Failed/etc
	FileURL       string
	PaymentAt     *time.Time
	CreatedAt     time.Time
	UpdatedAt     time.Time
}
