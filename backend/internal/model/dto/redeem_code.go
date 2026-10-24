package dto

import "time"

// RedeemCodeRequest request payload untuk menukarkan kode redeem kursus
type RedeemCodeRequest struct {
	Code string `json:"code" binding:"required,min=4,max=64" example:"KURSUS-REACT-2026"`
}

// RedeemCodeCourseResponse ringkasan data kursus yang berhasil di-redeem
type RedeemCodeCourseResponse struct {
	UID         string `json:"uid" example:"8f12a3bc"`
	Title       string `json:"title" example:"Dasar Pemrograman Golang"`
	Slug        string `json:"slug" example:"dasar-pemrograman-golang"`
	Description string `json:"description" example:"Belajar fundamental Go dari nol"`
	CoverURL    string `json:"cover_url" example:"https://..."`
	Level       string `json:"level" example:"Pemula"`
}

// RedeemCodeResponse detail data hasil penukaran kode redeem
type RedeemCodeResponse struct {
	EnrollmentUID string                   `json:"enrollment_uid" example:"3c7b91d2"`
	RedeemedAt    string                   `json:"redeemed_at" example:"2026-10-24T17:00:00Z"`
	Course        RedeemCodeCourseResponse `json:"course"`
}

// GenerateRedeemCodeRequest request payload untuk membuat/men-generate kode redeem baru (Admin / Mentor).
// TargetEmail opsional dan tidak mewajibkan email sudah terdaftar di sistem saat pembuatan kode (mendukung pembelian eksternal).
type GenerateRedeemCodeRequest struct {
	CourseUID   string     `json:"course_uid" binding:"required" example:"e61b7f94-9128-4444-a4f6-7b830d12e431"`
	Code        string     `json:"code,omitempty" example:"CUSTOM-CODE-2026"`
	Prefix      string     `json:"prefix,omitempty" example:"REACT"`
	TargetEmail string     `json:"target_email,omitempty" example:"buyer@external.com"`
	MaxUses     int        `json:"max_uses,omitempty" example:"1"`
	ExpiresAt   *time.Time `json:"expires_at,omitempty"`
	IsActive    *bool      `json:"is_active,omitempty"`
}

// GenerateRedeemCodeResponse response hasil pembuatan kode redeem
type GenerateRedeemCodeResponse struct {
	UID          string  `json:"uid" example:"7e484e3e-436e-44f3-b789-fdf2d0e653da"`
	Code         string  `json:"code" example:"REACT-X7K2-9B4Z"`
	CourseUID    string  `json:"course_uid" example:"e61b7f94-9128-4444-a4f6-7b830d12e431"`
	CourseTitle  string  `json:"course_title" example:"Dasar Pemrograman Golang"`
	TargetEmail  string  `json:"target_email,omitempty" example:"buyer@external.com"`
	MaxUses      int     `json:"max_uses" example:"1"`
	UsedCount    int     `json:"used_count" example:"0"`
	IsActive     bool    `json:"is_active" example:"true"`
	ExpiresAt    *string `json:"expires_at,omitempty"`
	CreatedByUID string  `json:"created_by_uid" example:"546502f3-18ef-417c-a63e-10c0e5a973cb"`
	CreatedAt    string  `json:"created_at" example:"2026-10-24T17:00:00Z"`
}
