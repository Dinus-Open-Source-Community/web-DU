package service

import (
	"errors"
	"net/http"
	"strings"

	"backend/internal/database"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

// resolveUIDParam menarik nilai path/query param bernama paramName, kemudian
// menyelesaikannya menjadi full uuid.UUID dari `table` (mendukung input 8-char
// prefix maupun full UUID). Jika gagal, fungsi langsung menulis response error
// JSON dan mengembalikan ok=false.
//
// Parameter `label` dipakai untuk label pesan error, misal "course",
// "module", "lesson", dst.
func resolveUIDParam(c *gin.Context, table, paramName, label string) (uuid.UUID, bool) {
	raw := strings.TrimSpace(c.Param(paramName))
	if raw == "" {
		raw = strings.TrimSpace(c.Query(paramName))
	}
	return resolveUIDValue(c, table, raw, label)
}

// resolveUIDValue menerima string raw (full UUID atau 8-char prefix) dan
// mengembalikan full uuid.UUID dari tabel `table`. Jika gagal, langsung
// menulis response error JSON dan mengembalikan ok=false.
func resolveUIDValue(c *gin.Context, table, raw, label string) (uuid.UUID, bool) {
	id, err := database.ResolveUID(table, raw)
	if err != nil {
		status := http.StatusBadRequest
		msg := "Invalid " + label + " uid"
		switch {
		case errors.Is(err, database.ErrUIDNotFound):
			status = http.StatusNotFound
			msg = label + " not found"
		case errors.Is(err, database.ErrUIDAmbiguous):
			msg = "Ambiguous " + label + " uid prefix"
		}
		c.JSON(status, gin.H{
			"success": false,
			"message": msg,
			"data":    nil,
			"error":   err.Error(),
		})
		return uuid.Nil, false
	}
	return id, true
}
