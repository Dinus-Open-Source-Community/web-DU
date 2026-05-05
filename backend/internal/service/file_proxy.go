package service

import (
	"errors"
	"net/http"
	"path/filepath"
	"strings"

	"backend/internal/utils"

	"github.com/gin-gonic/gin"
	"github.com/minio/minio-go/v7"
)

// @Summary      Serve encrypted MinIO file (All Roles)
// @Description  Decrypts objects stored as ciphertext in MinIO and streams plaintext bytes to the client with the original content type. Replaces direct MinIO access for file URLs (avatars, course covers, lesson assignment attachments, invoice PDFs, etc.). Requires Bearer JWT; all authenticated roles are allowed. Backward compatible with legacy plaintext objects.
// @Tags         File
// @Security     BearerAuth
// @Produce      octet-stream
// @Param        bucket  path  string  true  "MinIO bucket name"
// @Param        object  path  string  true  "Object key (may contain slashes)"
// @Success      200  {file}  binary  "File bytes (decrypted when stored encrypted)"
// @Failure      400  {object}  map[string]any  "Invalid parameters"
// @Failure      401  {object}  map[string]any  "Unauthorized — missing or invalid token"
// @Failure      404  {object}  map[string]any  "Object not found"
// @Failure      500  {object}  map[string]any  "Failed to decrypt or read object"
// @Router       /files/{bucket}/{object} [get]
func ServeFileProxyFunc(c *gin.Context) {
	bucket := strings.TrimSpace(c.Param("bucket"))
	objectKey := strings.TrimPrefix(c.Param("object"), "/")
	objectKey = strings.TrimSpace(objectKey)

	if bucket == "" || objectKey == "" {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "bucket and object are required",
			"data":    nil,
			"error":   nil,
		})
		return
	}

	data, contentType, originalFilename, err := utils.FetchAndDecryptObject(c.Request.Context(), bucket, objectKey)
	if err != nil {
		var minioErr minio.ErrorResponse
		if errors.As(err, &minioErr) {
			switch minioErr.Code {
			case "NoSuchKey", "NoSuchBucket":
				c.JSON(http.StatusNotFound, gin.H{
					"success": false,
					"message": "File not found",
					"data":    nil,
					"error":   minioErr.Code,
				})
				return
			}
		}
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "Failed to retrieve file",
			"data":    nil,
			"error":   err.Error(),
		})
		return
	}

	disposition := contentDispositionFor(originalFilename, objectKey)
	c.Header("Content-Disposition", disposition)
	c.Header("Cache-Control", "public, max-age=300")
	c.Header("X-Content-Type-Options", "nosniff")

	c.Data(http.StatusOK, contentType, data)
}

// contentDispositionFor menentukan apakah file sebaiknya ditampilkan inline
// (gambar, PDF) atau di-download attachment (file generik). originalFilename
// dipakai sebagai filename hint, fallback ke object key bila metadata tidak
// tersedia (kasus file legacy yang diunggah sebelum sistem enkripsi aktif).
func contentDispositionFor(originalFilename, objectKey string) string {
	name := strings.TrimSpace(originalFilename)
	if name == "" {
		name = filepath.Base(objectKey)
	}
	ext := strings.ToLower(filepath.Ext(name))
	inlineExts := map[string]struct{}{
		".jpg": {}, ".jpeg": {}, ".png": {}, ".gif": {}, ".webp": {}, ".svg": {},
		".pdf": {}, ".mp4": {}, ".webm": {}, ".mp3": {}, ".ogg": {}, ".wav": {},
	}
	if _, ok := inlineExts[ext]; ok {
		return "inline; filename=\"" + sanitizeFilename(name) + "\""
	}
	return "attachment; filename=\"" + sanitizeFilename(name) + "\""
}

// sanitizeFilename membersihkan karakter yang berisiko pada header HTTP
// Content-Disposition (CR/LF/quote). Bukan substitusi penuh untuk RFC 5987
// tapi memadai untuk filename ASCII yang umum dipakai sistem.
func sanitizeFilename(name string) string {
	cleaned := strings.NewReplacer("\r", "", "\n", "", "\"", "'").Replace(name)
	return strings.TrimSpace(cleaned)
}
