package service

import (
	"encoding/base64"
	"errors"
	"fmt"
	"net/http"
	"path/filepath"
	"strings"

	"backend/internal/utils"

	"github.com/gin-gonic/gin"
	"github.com/minio/minio-go/v7"
)

const maxBatchObjects = 50

type multiFileBatchRequest struct {
	Objects []string `json:"objects"`
}

type batchFileItem struct {
	Object      string `json:"object"`
	ContentType string `json:"content_type"`
	Data        string `json:"data"`
	Filename    string `json:"filename,omitempty"`
}

type multiFileBatchData struct {
	Files []batchFileItem `json:"files"`
}

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
		if fileProxyNotFoundResponse(c, err) {
			return
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

// @Summary      Fetch multiple encrypted MinIO files for web display (All Roles)
// @Description  Fetches multiple objects from the same MinIO bucket, decrypts each one, and returns them as base64-encoded file data in JSON. Intended for displaying images and other inline content on the web (e.g. img src via data URLs). Requires Bearer JWT; all authenticated roles are allowed. Maximum 50 objects per request.
// @Tags         File
// @Security     BearerAuth
// @Accept       json
// @Produce      json
// @Param        bucket  path  string                  true  "MinIO bucket name"
// @Param        body    body  multiFileBatchRequest   true  "Object keys to fetch"
// @Success      200  {object}  map[string]any  "JSON with files array (object, content_type, data as base64)"
// @Failure      400  {object}  map[string]any  "Invalid parameters"
// @Failure      401  {object}  map[string]any  "Unauthorized — missing or invalid token"
// @Failure      404  {object}  map[string]any  "One or more objects not found"
// @Failure      500  {object}  map[string]any  "Failed to decrypt or read objects"
// @Router       /files/{bucket}/batch [post]
func ServeMultiFileBatchFunc(c *gin.Context) {
	bucket := strings.TrimSpace(c.Param("bucket"))
	if bucket == "" {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "bucket is required",
			"data":    nil,
			"error":   nil,
		})
		return
	}

	var req multiFileBatchRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "Invalid request body",
			"data":    nil,
			"error":   err.Error(),
		})
		return
	}

	objectKeys := normalizeObjectKeys(req.Objects)
	if len(objectKeys) == 0 {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "at least one object key is required",
			"data":    nil,
			"error":   nil,
		})
		return
	}
	if len(objectKeys) > maxBatchObjects {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": fmt.Sprintf("too many objects: maximum is %d", maxBatchObjects),
			"data":    nil,
			"error":   nil,
		})
		return
	}

	files := make([]batchFileItem, 0, len(objectKeys))
	for _, objectKey := range objectKeys {
		data, contentType, originalFilename, err := utils.FetchAndDecryptObject(c.Request.Context(), bucket, objectKey)
		if err != nil {
			if fileProxyNotFoundResponse(c, fmt.Errorf("%s: %w", objectKey, err)) {
				return
			}
			c.JSON(http.StatusInternalServerError, gin.H{
				"success": false,
				"message": "Failed to retrieve files",
				"data":    nil,
				"error":   fmt.Sprintf("%s: %s", objectKey, err.Error()),
			})
			return
		}

		filename := strings.TrimSpace(originalFilename)
		if filename == "" {
			filename = filepath.Base(objectKey)
		}

		files = append(files, batchFileItem{
			Object:      objectKey,
			ContentType: contentType,
			Data:        base64.StdEncoding.EncodeToString(data),
			Filename:    filename,
		})
	}

	c.Header("Cache-Control", "private, max-age=300")
	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Files retrieved successfully",
		"data": multiFileBatchData{
			Files: files,
		},
		"error": nil,
	})
}

func normalizeObjectKeys(objects []string) []string {
	keys := make([]string, 0, len(objects))
	seen := make(map[string]struct{}, len(objects))
	for _, raw := range objects {
		key := strings.TrimSpace(strings.TrimPrefix(raw, "/"))
		if key == "" {
			continue
		}
		if _, ok := seen[key]; ok {
			continue
		}
		seen[key] = struct{}{}
		keys = append(keys, key)
	}
	return keys
}

func fileProxyNotFoundResponse(c *gin.Context, err error) bool {
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
			return true
		}
	}
	return false
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
