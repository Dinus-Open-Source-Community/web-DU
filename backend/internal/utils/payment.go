package utils

import (
	"crypto/hmac"
	"crypto/sha256"
	"encoding/hex"
	"strconv"
)

// HMACSHA256 generates a hex-encoded HMAC SHA256 signature for a given message and key
func HMACSHA256(key, message string) string {
	mac := hmac.New(sha256.New, []byte(key))
	mac.Write([]byte(message))
	return hex.EncodeToString(mac.Sum(nil))
}

// GeneratePaymentSignature generates HMAC SHA256 signature for payment verification
// Parameters:
//   - privateKey: the private key for HMAC signature
//   - merchantCode: the merchant code
//   - merchantRef: the merchant reference (invoice number)
//   - amount: the payment amount in integer
//
// Returns:
//   - signature: hex encoded HMAC SHA256 signature
func GeneratePaymentSignature(privateKey, merchantCode, merchantRef string, amount int) string {
	// Combine merchant_code + merchant_ref + amount (amount must be string)
	message := merchantCode + merchantRef + strconv.Itoa(amount)

	// Create HMAC SHA256
	mac := hmac.New(sha256.New, []byte(privateKey))
	mac.Write([]byte(message))
	signature := hex.EncodeToString(mac.Sum(nil))

	return signature
}

// ValidateTripayCallbackSignature memverifikasi header X-Callback-Signature Tripay.
// Signature = HMAC-SHA256(privateKey, rawJSONBody) — lihat https://tripay.co.id/developer
func ValidateTripayCallbackSignature(privateKey string, rawBody []byte, signature string) bool {
	if privateKey == "" || signature == "" || len(rawBody) == 0 {
		return false
	}
	expected := HMACSHA256(privateKey, string(rawBody))
	return hmac.Equal([]byte(expected), []byte(signature))
}
