package dto

// VerifyOTPRequest merepresentasikan data untuk verifikasi kode OTP.
type VerifyOTPRequest struct {
	Email string `json:"email" binding:"required,email"`
	OTP   string `json:"otp" binding:"required,len=6"`
}

// ResendOTPRequest merepresentasikan data untuk kirim ulang kode OTP.
type ResendOTPRequest struct {
	Email string `json:"email" binding:"required,email"`
}
