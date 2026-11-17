package cache

import (
	"bytes"
	"context"
	"encoding/json"
	"net/http"
	"strings"
	"time"

	"backend/internal/database"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

type responseWriter struct {
	gin.ResponseWriter
	body   bytes.Buffer
	status int
}

type cachedHTTPResponse struct {
	Status      int         `json:"status"`
	ContentType string      `json:"content_type"`
	Headers     http.Header `json:"headers,omitempty"`
	Body        []byte      `json:"body"`
}

func (w *responseWriter) WriteHeader(code int) {
	w.status = code
	w.ResponseWriter.WriteHeader(code)
}

func (w *responseWriter) Write(data []byte) (int, error) {
	w.body.Write(data)
	return len(data), nil
}

func (w *responseWriter) WriteString(data string) (int, error) {
	w.body.WriteString(data)
	return len(data), nil
}

func (w *responseWriter) WriteHeaderNow() {
	if w.status == 0 {
		w.status = http.StatusOK
	}
}

func (w *responseWriter) Status() int {
	if w.status != 0 {
		return w.status
	}
	return w.ResponseWriter.Status()
}

func ResponseCache(namespace string, ttl time.Duration) gin.HandlerFunc {
	return responseCache(namespace, ttl, nil)
}

func ResponseCacheUID(namespace string, ttl time.Duration, table, param string) gin.HandlerFunc {
	return responseCache(namespace, ttl, func(c *gin.Context) (string, string) {
		rawUID := c.Param(param)
		uid, err := uuid.Parse(rawUID)
		if err != nil {
			uid, err = database.ResolveUID(table, rawUID)
			if err != nil {
				return "", ""
			}
		}
		return namespace, strings.Replace(c.Request.URL.Path, "/"+rawUID, "/"+uid.String(), 1)
	})
}

func responseCache(namespace string, ttl time.Duration, canonicalPath func(*gin.Context) (string, string)) gin.HandlerFunc {
	return func(c *gin.Context) {
		if c.Request.Method != http.MethodGet || Default == nil || !Default.Available() {
			c.Next()
			return
		}

		path := c.Request.URL.Path
		if canonicalPath != nil {
			namespace, path = canonicalPath(c)
			if path == "" {
				c.Next()
				return
			}
		}
		query := c.Request.URL.Query()
		query.Set("_accept", c.GetHeader("Accept"))
		suffix := RequestSuffix(path, query)
		ctx, cancel := context.WithTimeout(c.Request.Context(), operationTimeout)
		version, versionErr := Default.currentVersion(ctx, namespace)
		var response cachedHTTPResponse
		found, err := false, versionErr
		if err == nil {
			found, err = Default.get(ctx, physicalKey(namespace, suffix, version), &response, namespace)
			if found && err == nil {
				latest, latestErr := Default.currentVersion(ctx, namespace)
				if latestErr != nil || latest != version {
					found = false
				}
			}
		}
		cancel()
		if err == nil && found {
			for key, values := range response.Headers {
				for _, value := range values {
					c.Writer.Header().Add(key, value)
				}
			}
			c.Data(response.Status, response.ContentType, response.Body)
			c.Abort()
			return
		}

		responseKey := "response:" + physicalKey(namespace, suffix, "singleflight")
		result, _, _ := Default.group.Do(responseKey, func() (any, error) {
			original := c.Writer
			writer := &responseWriter{ResponseWriter: original}
			c.Writer = writer
			defer func() { c.Writer = original }()
			c.Next()
			status := writer.Status()
			headers := original.Header().Clone()
			body := append([]byte(nil), writer.body.Bytes()...)
			contentType := headers.Get("Content-Type")
			var envelope struct {
				Success bool `json:"success"`
			}
			validResponse := json.Unmarshal(body, &envelope) == nil && envelope.Success
			if status == http.StatusOK && validResponse && len(body) > 0 && headers.Get("Set-Cookie") == "" &&
				strings.Contains(strings.ToLower(contentType), "application/json") {
				writeCtx, writeCancel := context.WithTimeout(c.Request.Context(), operationTimeout)
				if err := Default.setAtVersion(writeCtx, namespace, suffix, version, cachedHTTPResponse{
					Status: status, ContentType: contentType, Headers: safeHeaders(headers), Body: body,
				}, ttl); err != nil {
					Default.logError(namespace, "set", err)
				}
				writeCancel()
			}
			return cachedHTTPResponse{Status: status, ContentType: contentType, Headers: safeHeaders(headers), Body: body}, nil
		})
		response, ok := result.(cachedHTTPResponse)
		if !ok {
			return
		}
		for key, values := range response.Headers {
			for _, value := range values {
				c.Writer.Header().Add(key, value)
			}
		}
		c.Status(response.Status)
		c.Writer.WriteHeaderNow()
		_, _ = c.Writer.Write(response.Body)
	}
}

func safeHeaders(headers http.Header) http.Header {
	result := make(http.Header)
	for _, key := range []string{"Cache-Control", "Content-Language", "Content-Disposition"} {
		if values := headers.Values(key); len(values) > 0 {
			result[key] = append([]string(nil), values...)
		}
	}
	return result
}
