package entity

import (
	"time"

	"github.com/google/uuid"
)

type PaymentMethod string
type PaymentStatus string

const (
	PaymentCreditCard   PaymentMethod = "credit_card"
	PaymentBankTransfer PaymentMethod = "bank_transfer"
	PaymentEwallet      PaymentMethod = "ewallet"

	PaymentPending PaymentStatus = "pending"
	PaymentSuccess PaymentStatus = "success"
	PaymentFailed  PaymentStatus = "failed"
)

// Model Payment Migrations
type Payment struct {
	Uid           uuid.UUID     `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"uid"`
	EnrollmentUid *uuid.UUID    `gorm:"type:uuid;index" json:"enrollment_uid"`
	Amount        float64       `gorm:"type:decimal(10,2)" json:"amount"`
	Method        PaymentMethod `gorm:"type:payment_method" json:"payment_method"`
	Status        PaymentStatus `gorm:"type:payment_status" json:"payment_status"`
	TransactionID string        `gorm:"type:varchar(100)" json:"transaction_id"`
	CheckoutURL   string        `gorm:"type:text" json:"checkout_url"`
	PaidAt        *time.Time    `json:"paid_at"`
	CreatedAt     time.Time     `gorm:"autoCreateTime" json:"created_at"`
}
