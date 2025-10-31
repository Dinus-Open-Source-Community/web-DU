// Example penggunaan token JWT dengan middleware AuthMiddleware

package services

import (
	"backend/internal/handler/middleware"
	"net/http"

	"github.com/gin-gonic/gin"
)

// GetServicefunc merupakan contoh handler (endpoint) yang hanya bisa diakses
// jika user sudah terautentikasi menggunakan JWT token yang valid.
//
// Fungsi ini menggunakan middleware `AuthMiddleware` untuk memverifikasi token JWT.
// Setelah token terverifikasi, data klaim seperti `Name` dan `Email` disimpan
// ke dalam context (c.Set) dan dapat diambil kembali di handler ini.
func GetServicefunc(c *gin.Context) {
	// Ambil data Name dan Email dari context yang sudah di-set oleh AuthMiddleware
	Name, _ := c.Get(middleware.NameCK)
	Email, _ := c.Get(middleware.EmailCK)

	// Kirim response JSON berisi data user yang diambil dari token JWT
	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Hello from Golang Backend!",
		"data": gin.H{
			"name":  Name,
			"email": Email,
		},
		"error": nil,
	})
}
