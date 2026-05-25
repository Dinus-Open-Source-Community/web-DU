package middleware

import (
	"bytes"
	"net/http"
	"strconv"
	"strings"

	"backend/internal/utils"

	"github.com/gin-gonic/gin"
)

// shortenUIDsBodyWriter membuffer body response Gin sehingga middleware bisa
// memodifikasi isinya sebelum dikirim ke client (memotong UID menjadi 8 char).
//
// Semua method gin.ResponseWriter yang berkaitan dengan menulis body/header
// sengaja ditahan agar tidak meneruskan ke writer asli sebelum middleware
// selesai memproses body.
type shortenUIDsBodyWriter struct {
	gin.ResponseWriter
	body       *bytes.Buffer
	statusCode int
	wroteCode  bool
	size       int
}

func (w *shortenUIDsBodyWriter) WriteHeader(code int) {
	w.statusCode = code
	w.wroteCode = true
}

// WriteHeaderNow ditahan; status code yang sebenarnya akan ditulis oleh
// middleware setelah body selesai dimodifikasi.
func (w *shortenUIDsBodyWriter) WriteHeaderNow() {
	w.wroteCode = true
}

func (w *shortenUIDsBodyWriter) Write(data []byte) (int, error) {
	n, err := w.body.Write(data)
	w.size += n
	return n, err
}

func (w *shortenUIDsBodyWriter) WriteString(s string) (int, error) {
	n, err := w.body.WriteString(s)
	w.size += n
	return n, err
}

// Status mengembalikan status code yang akan dipakai (default 200 jika belum
// ada panggilan WriteHeader). Override ini membuat c.Writer.Status() di
// handler/middleware selanjutnya memberi nilai yang konsisten dengan body.
func (w *shortenUIDsBodyWriter) Status() int {
	if w.wroteCode {
		return w.statusCode
	}
	return w.ResponseWriter.Status()
}

// Size mengembalikan jumlah byte yang telah dibuffer (sebelum modifikasi).
func (w *shortenUIDsBodyWriter) Size() int {
	return w.size
}

// Written mengembalikan true setelah handler memanggil WriteHeader/Write,
// sehingga gin tidak mencoba menulis ulang status code.
func (w *shortenUIDsBodyWriter) Written() bool {
	return w.wroteCode || w.size > 0
}

// ShortenUIDsMiddleware memendekkan setiap nilai UUID standalone dalam body
// JSON response menjadi ShortUIDLength karakter pertama. UID yang muncul
// sebagai bagian dari string lain (URL/path filename) tidak terpengaruh.
//
// Middleware ini bekerja dengan cara:
//  1. Membungkus c.Writer dengan buffer.
//  2. Membiarkan handler menulis response seperti biasa (ke buffer).
//  3. Setelah handler selesai, jika Content-Type bertipe application/json,
//     body dimodifikasi via regex sebelum benar-benar dikirim ke client.
//  4. Tipe lain (file, redirect, image, dsb.) dilewatkan tanpa modifikasi.
func ShortenUIDsMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		original := c.Writer
		buf := &bytes.Buffer{}
		writer := &shortenUIDsBodyWriter{
			ResponseWriter: original,
			body:           buf,
			statusCode:     http.StatusOK,
		}
		c.Writer = writer

		c.Next()

		body := buf.Bytes()
		contentType := original.Header().Get("Content-Type")

		if strings.Contains(contentType, "application/json") {
			body = utils.ShortenUIDsInJSON(body)
			original.Header().Set("Content-Length", strconv.Itoa(len(body)))
		}

		if writer.wroteCode {
			original.WriteHeader(writer.statusCode)
		}
		if len(body) > 0 {
			_, _ = original.Write(body)
		}
	}
}
