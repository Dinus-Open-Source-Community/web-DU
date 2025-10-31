package utils

import "golang.org/x/crypto/bcrypt"

// HashPassword digunakan untuk melakukan hashing terhadap password teks biasa (plain text).
// Fungsi ini mengubah password menjadi hash menggunakan algoritma bcrypt dengan tingkat keamanan default.
// Parameter:
//   - password: string berisi password asli dari user.
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
// Return:
//   - bool: true jika password cocok, false jika tidak cocok.
func CheckPassword(hashedPassword, plainPassword string) bool {
	err := bcrypt.CompareHashAndPassword([]byte(hashedPassword), []byte(plainPassword))
	return err == nil
}
