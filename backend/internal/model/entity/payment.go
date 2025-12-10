package entity

import "time"

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
	ID            uint          `gorm:"primaryKey" json:"id"`
	EnrollmentID  *uint         `json:"enrollment_id"`
	Amount        float64       `gorm:"type:decimal(10,2)" json:"amount"`
	Method        PaymentMethod `gorm:"type:payment_method" json:"payment_method"`
	Status        PaymentStatus `gorm:"type:payment_status" json:"payment_status"`
	TransactionID string        `gorm:"type:varchar(100)" json:"transaction_id"`
	PaidAt        *time.Time    `json:"paid_at"`
	CreatedAt     time.Time     `gorm:"autoCreateTime" json:"created_at"`

	Enrollment *Enrollment
}
