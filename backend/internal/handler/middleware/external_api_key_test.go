package middleware

import (
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/gin-gonic/gin"
)

func TestExternalAPIKeyMiddleware(t *testing.T) {
	gin.SetMode(gin.TestMode)

	tests := []struct {
		name       string
		configured string
		provided   string
		wantStatus int
	}{
		{name: "valid key", configured: "secret-key", provided: "secret-key", wantStatus: http.StatusNoContent},
		{name: "missing key", configured: "secret-key", wantStatus: http.StatusUnauthorized},
		{name: "invalid key", configured: "secret-key", provided: "wrong-key", wantStatus: http.StatusUnauthorized},
		{name: "missing configuration", provided: "secret-key", wantStatus: http.StatusUnauthorized},
	}

	for _, test := range tests {
		t.Run(test.name, func(t *testing.T) {
			t.Setenv("REDEEM_CODE_API_KEY", test.configured)

			router := gin.New()
			router.POST("/external/redeem-codes", ExternalAPIKeyMiddleware(), func(c *gin.Context) {
				c.Status(http.StatusNoContent)
			})

			request := httptest.NewRequest(http.MethodPost, "/external/redeem-codes", nil)
			if test.provided != "" {
				request.Header.Set("X-API-Key", test.provided)
			}
			response := httptest.NewRecorder()
			router.ServeHTTP(response, request)

			if response.Code != test.wantStatus {
				t.Fatalf("status = %d, want %d", response.Code, test.wantStatus)
			}
		})
	}
}
