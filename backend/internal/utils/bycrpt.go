package utils

import (
	"crypto/aes"
	"crypto/cipher"
	"crypto/hmac"
	"crypto/rand"
	"crypto/sha256"
	"encoding/hex"
	"io"
	"os"

	"golang.org/x/crypto/bcrypt"
)

// HashPassword digunakan untuk melakukan hashing terhadap password teks biasa (plain text).
// Fungsi ini mengubah password menjadi hash menggunakan algoritma bcrypt dengan tingkat keamanan default.
// Parameter:
//   - password: string berisi password asli dari user.
//
// Return:
//   - string: hasil hash dari password.
//   - error: error jika proses hashing gagal.
func HashPassword(password string) (string, error) {
	bytes, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	return string(bytes), err
}

// CheckPassword digunakan untuk memverifikasi apakah password asli cocok dengan hash password yang tersimpan.
// Fungsi ini membandingkan antara hashedPassword dengan plainPassword menggunakan bcrypt.
// Parameter:
//   - hashedPassword: string hasil hash yang tersimpan di database.
//   - plainPassword: string password asli yang ingin diverifikasi.
//
// Return:
//   - bool: true jika password cocok, false jika tidak cocok.
func CheckPassword(hashedPassword, plainPassword string) bool {
	err := bcrypt.CompareHashAndPassword([]byte(hashedPassword), []byte(plainPassword))
	return err == nil
}

// GenerateBlindIndex menghasilkan blind index untuk data sensitif menggunakan HMAC dengan SHA-256.
// Blind index ini dapat digunakan untuk pencarian data tanpa mengungkapkan data aslinya.
// Parameter:
//   - data: string data sensitif yang ingin diindeks.
//
// Return:
//   - string: blind index dalam format hexadecimal.
func GenerateBlindIndex(data string) string {
	hmacKey := []byte(os.Getenv("HMAC_KEY"))

	h := hmac.New(sha256.New, hmacKey)
	h.Write([]byte(data))
	return hex.EncodeToString(h.Sum(nil))
}

// Encrypt mengubah plaintext menjadi ciphertext menggunakan AES-GCM.
// Parameter:
//   - plaintext: string data asli yang ingin dienkripsi.
//
// Return:
//   - string: hasil enkripsi dalam format hexadecimal.
//   - error: error jika proses enkripsi gagal.
func Encrypt(plaintext string) (string, error) {
	aesKey := []byte(os.Getenv("AES_KEY"))

	block, err := aes.NewCipher(aesKey)
	if err != nil {
		return "", err
	}

	gcm, err := cipher.NewGCM(block)
	if err != nil {
		return "", err
	}

	// Membuat nonce (number used once) agar enkripsi unik setiap saat
	nonce := make([]byte, gcm.NonceSize())
	if _, err = io.ReadFull(rand.Reader, nonce); err != nil {
		return "", err
	}

	// Enkripsi data + gabungkan nonce di depan ciphertext
	ciphertext := gcm.Seal(nonce, nonce, []byte(plaintext), nil)
	return hex.EncodeToString(ciphertext), nil
}

// Decrypt mengembalikan data asli dari ciphertext
// Parameter:
//   - cipherHex: string ciphertext dalam format hexadecimal.
//
// Return:
//   - string: data asli setelah dekripsi.
//   - error: error jika proses dekripsi gagal.
func Decrypt(cipherHex string) (string, error) {
	aesKey := []byte(os.Getenv("AES_KEY"))
	data, _ := hex.DecodeString(cipherHex)

	block, err := aes.NewCipher(aesKey)
	if err != nil {
		return "", err
	}

	gcm, err := cipher.NewGCM(block)
	if err != nil {
		return "", err
	}

	nonceSize := gcm.NonceSize()
	if len(data) < nonceSize {
		return "", err
	}

	// Pisahkan nonce dan ciphertext
	nonce, ciphertext := data[:nonceSize], data[nonceSize:]
	plaintext, err := gcm.Open(nil, nonce, ciphertext, nil)
	if err != nil {
		return "", err
	}

	return string(plaintext), nil
}
