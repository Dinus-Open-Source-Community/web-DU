package middleware

import (
	"backend/internal/model"
	"os"
	"time"

	"github.com/golang-jwt/jwt/v5"
)

var jwtSecret = []byte(os.Getenv("JWT_SECRET_KEY"))

type errorMsg struct {
	Msg string
}

func (e *errorMsg) Error() string {
	return e.Msg
}

// GenerateJWT digunakan untuk membuat token JWT baru.
// Parameter:
//   - name: nama pengguna yang akan disimpan dalam token.
//   - email: email pengguna yang akan disimpan dalam token.
//   - expiresAt: waktu kedaluwarsa (expiry) token.
//
// Fungsi ini akan mengembalikan string token JWT beserta error jika terjadi kesalahan.
//
// Token ini menggunakan metode signing HS256 dan menyimpan claims seperti:
// - Name
// - Email
// - ExpiresAt (waktu kedaluwarsa)
// - IssuedAt (waktu pembuatan)
// - Subject ("user_auth")
func GenerateJWT(key string, expiresAt time.Time) (string, error) {
	// Membuat claims yang berisi data user dan informasi waktu.
	claims := model.Claims{
		Key: key,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(expiresAt),  // waktu token berakhir
			IssuedAt:  jwt.NewNumericDate(time.Now()), // waktu token dibuat
			Subject:   "user_auth",                    // penanda jenis token
		},
	}

	// Membuat token baru dengan metode signing HS256 dan data claims di atas.
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)

	// Menandatangani token menggunakan secret key dan mengembalikan hasilnya.
	return token.SignedString(jwtSecret)
}

// ParseToken digunakan untuk memvalidasi dan membaca token JWT yang dikirim oleh client.
// Parameter:
//   - tokenStr: string token JWT yang diterima (biasanya dari header Authorization).
func ParseToken(tokenStr string) (*model.Claims, error) {
	// Membuat objek untuk menampung claims hasil parsing token.
	claims := &model.Claims{}

	// Melakukan parsing token menggunakan claims yang disediakan.
	token, err := jwt.ParseWithClaims(tokenStr, claims, func(t *jwt.Token) (any, error) {
		// Memastikan metode signing yang digunakan adalah HMAC (HS256).
		if _, ok := t.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, &errorMsg{Msg: "Unexpected signing method"}
		}
		// Mengembalikan secret key untuk verifikasi token.
		return jwtSecret, nil
	})

	// Jika terjadi error saat parsing token, kembalikan error tersebut.
	if err != nil {
		return nil, err
	}

	// Jika token tidak valid, kembalikan error.
	if !token.Valid {
		return nil, &errorMsg{Msg: "Invalid token"}
	}

	// Pengecekan tambahan: apakah token sudah kedaluwarsa.
	// (Library JWT biasanya sudah memeriksa ini otomatis, tapi kita tambahkan untuk keamanan ekstra.)
	if claims.ExpiresAt == nil || time.Now().After(claims.ExpiresAt.Time) {
		return nil, &errorMsg{Msg: "Token is expired"}
	}

	// Jika semua validasi berhasil, kembalikan data claims.
	return claims, nil
}
