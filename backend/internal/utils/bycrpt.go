package utils

import (
	"crypto/aes"
	"crypto/cipher"
	"crypto/hmac"
	"crypto/rand"
	"crypto/sha256"
	"encoding/hex"
	"errors"
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

// Decrypt mengembalikan data asli dari ciphertext.
// Fungsi ini idempotent: jika input ternyata sudah berupa plaintext (misalnya
// untuk data lama yang belum dienkripsi atau field yang sudah lebih dulu
// didekripsi via GORM hook), nilai input akan dikembalikan apa adanya tanpa
// error agar pemanggil yang menggunakan pola `val, _ := Decrypt(val)` tetap
// mendapatkan nilai asli.
//
// Parameter:
//   - cipherHex: string ciphertext dalam format hexadecimal.
//
// Return:
//   - string: data asli setelah dekripsi (atau plaintext input bila gagal).
//   - error: error jika proses dekripsi gagal (input dipertahankan apa adanya).
func Decrypt(cipherHex string) (string, error) {
	if cipherHex == "" {
		return "", nil
	}

	aesKey := []byte(os.Getenv("AES_KEY"))
	data, decErr := hex.DecodeString(cipherHex)
	if decErr != nil {
		return cipherHex, decErr
	}

	block, err := aes.NewCipher(aesKey)
	if err != nil {
		return cipherHex, err
	}

	gcm, err := cipher.NewGCM(block)
	if err != nil {
		return cipherHex, err
	}

	nonceSize := gcm.NonceSize()
	if len(data) < nonceSize {
		return cipherHex, errors.New("ciphertext too short")
	}

	// Pisahkan nonce dan ciphertext
	nonce, ciphertext := data[:nonceSize], data[nonceSize:]
	plaintext, err := gcm.Open(nil, nonce, ciphertext, nil)
	if err != nil {
		return cipherHex, err
	}

	return string(plaintext), nil
}

// DecryptOrSelf melakukan dekripsi pada cipherHex. Jika gagal dekripsi (misalnya
// data sudah dalam bentuk plaintext atau format tidak valid), nilai asli akan
// dikembalikan apa adanya. Berguna agar pemanggil tidak perlu menulis fallback.
func DecryptOrSelf(cipherHex string) string {
	plain, _ := Decrypt(cipherHex)
	return plain
}

// EncryptOrSelf melakukan enkripsi pada plaintext. Jika gagal (misalnya AES key
// belum terkonfigurasi), nilai asli akan dikembalikan agar tidak menghilangkan
// data. Konsumen pada hot-path yang sudah memvalidasi konfigurasi sebaiknya tetap
// memakai Encrypt langsung untuk menangkap error secara eksplisit.
func EncryptOrSelf(plaintext string) string {
	if plaintext == "" {
		return ""
	}
	cipherHex, err := Encrypt(plaintext)
	if err != nil {
		return plaintext
	}
	return cipherHex
}

// IsLikelyEncrypted memeriksa apakah string sudah dalam bentuk ciphertext AES-GCM
// yang valid. Berguna untuk menghindari double-encryption pada hook BeforeSave.
func IsLikelyEncrypted(s string) bool {
	if s == "" {
		return false
	}
	_, err := Decrypt(s)
	return err == nil
}

// EncryptIfNeeded melakukan enkripsi hanya jika input belum berupa ciphertext.
// Berguna untuk hook BeforeSave/BeforeCreate agar idempotent terhadap kode service
// yang sudah mengenkripsi data sebelum memanggil Save/Create.
func EncryptIfNeeded(s string) (string, error) {
	if s == "" {
		return "", nil
	}
	if IsLikelyEncrypted(s) {
		return s, nil
	}
	return Encrypt(s)
}

// EncryptFields melakukan enkripsi pada beberapa pointer string sekaligus.
// Mengembalikan error pertama yang ditemukan. Field kosong dilewati.
func EncryptFields(fields ...*string) error {
	for _, f := range fields {
		if f == nil || *f == "" {
			continue
		}
		enc, err := Encrypt(*f)
		if err != nil {
			return err
		}
		*f = enc
	}
	return nil
}

// EncryptFieldsIfNeeded melakukan enkripsi pada beberapa pointer string sekaligus,
// tetapi melewati field yang sudah berupa ciphertext (idempotent). Cocok untuk
// dipanggil dari hook BeforeSave.
func EncryptFieldsIfNeeded(fields ...*string) error {
	for _, f := range fields {
		if f == nil || *f == "" {
			continue
		}
		enc, err := EncryptIfNeeded(*f)
		if err != nil {
			return err
		}
		*f = enc
	}
	return nil
}

// DecryptFields melakukan dekripsi pada beberapa pointer string sekaligus.
// Field yang gagal didekripsi (misalnya sudah plaintext) akan dibiarkan apa adanya.
func DecryptFields(fields ...*string) {
	for _, f := range fields {
		if f == nil || *f == "" {
			continue
		}
		*f = DecryptOrSelf(*f)
	}
}

// fileEncMagic adalah penanda 8-byte di awal file terenkripsi yang disimpan
// pada object storage. Tujuannya: (1) membedakan dari file plaintext lawas yang
// sudah lebih dulu diunggah agar proxy bisa fallback secara aman, (2) berfungsi
// sebagai versi format kalau format enkripsi diubah di masa depan (byte ke-8
// adalah versi).
var fileEncMagic = []byte{'D', 'O', 'S', 'C', 'A', 'E', 'S', 0x01}

// IsFileEncrypted memeriksa apakah byte slice diawali dengan magic header
// EncryptBytes. Berguna pada proxy unduh untuk membedakan file baru (terenkripsi)
// dengan file legacy (plaintext) yang sudah ada di MinIO sebelum sistem
// enkripsi-at-rest diaktifkan.
func IsFileEncrypted(data []byte) bool {
	if len(data) < len(fileEncMagic) {
		return false
	}
	for i, b := range fileEncMagic {
		if data[i] != b {
			return false
		}
	}
	return true
}

// EncryptBytes mengenkripsi sembarang byte slice (file content) menggunakan
// AES-GCM. Format hasil:
//
//	[8-byte magic][12-byte nonce][N-byte ciphertext+auth_tag]
//
// Kunci diambil dari env AES_KEY (16/24/32 byte sesuai AES-128/192/256).
// Cocok untuk file berukuran kecil-menengah (≤ beberapa puluh MB) karena
// keseluruhan plaintext perlu di-buffer sebelum di-Seal oleh GCM.
func EncryptBytes(plaintext []byte) ([]byte, error) {
	aesKey := []byte(os.Getenv("AES_KEY"))

	block, err := aes.NewCipher(aesKey)
	if err != nil {
		return nil, err
	}

	gcm, err := cipher.NewGCM(block)
	if err != nil {
		return nil, err
	}

	nonce := make([]byte, gcm.NonceSize())
	if _, err := io.ReadFull(rand.Reader, nonce); err != nil {
		return nil, err
	}

	out := make([]byte, 0, len(fileEncMagic)+len(nonce)+len(plaintext)+gcm.Overhead())
	out = append(out, fileEncMagic...)
	out = append(out, nonce...)
	out = gcm.Seal(out, nonce, plaintext, nil)
	return out, nil
}

// DecryptBytes mendekripsi byte slice yang dihasilkan oleh EncryptBytes.
// Bersifat idempotent terhadap data legacy: jika magic header tidak ditemukan,
// data dikembalikan apa adanya tanpa error agar file plaintext lama tetap
// dapat diserve oleh proxy unduh.
func DecryptBytes(data []byte) ([]byte, error) {
	if !IsFileEncrypted(data) {
		return data, nil
	}

	aesKey := []byte(os.Getenv("AES_KEY"))
	block, err := aes.NewCipher(aesKey)
	if err != nil {
		return nil, err
	}

	gcm, err := cipher.NewGCM(block)
	if err != nil {
		return nil, err
	}

	body := data[len(fileEncMagic):]
	nonceSize := gcm.NonceSize()
	if len(body) < nonceSize {
		return nil, errors.New("encrypted file too short")
	}

	nonce, ciphertext := body[:nonceSize], body[nonceSize:]
	plaintext, err := gcm.Open(nil, nonce, ciphertext, nil)
	if err != nil {
		return nil, err
	}
	return plaintext, nil
}
