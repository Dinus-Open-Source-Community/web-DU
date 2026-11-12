package cache

import (
	"net/http"
	"net/http/httptest"
	"sync/atomic"
	"testing"
	"time"

	"github.com/alicebob/miniredis/v2"
	"github.com/gin-gonic/gin"
	"github.com/redis/go-redis/v9"
)

func TestResponseCacheHitAndInvalidation(t *testing.T) {
	server := miniredis.RunT(t)
	client := redis.NewClient(&redis.Options{Addr: server.Addr()})
	defer client.Close()
	previous := Default
	Default = New(Config{Enabled: true}, client)
	defer func() { Default = previous }()

	gin.SetMode(gin.TestMode)
	router := gin.New()
	var calls atomic.Int32
	router.GET("/courses", ResponseCache(NamespaceCourseList, time.Minute), func(c *gin.Context) {
		calls.Add(1)
		c.JSON(http.StatusOK, gin.H{"success": true, "data": gin.H{"query": c.Query("level")}})
	})

	request := func(level string) *httptest.ResponseRecorder {
		recorder := httptest.NewRecorder()
		req := httptest.NewRequest(http.MethodGet, "/courses?level="+level, nil)
		router.ServeHTTP(recorder, req)
		return recorder
	}
	first := request("beginner")
	second := request("beginner")
	if first.Code != http.StatusOK || second.Code != http.StatusOK || calls.Load() != 1 || first.Body.String() != second.Body.String() {
		t.Fatalf("response cache calls=%d statuses=%d/%d bodies=%q/%q", calls.Load(), first.Code, second.Code, first.Body.String(), second.Body.String())
	}
	if got := request("advanced"); got.Code != http.StatusOK || calls.Load() != 2 {
		t.Fatalf("different filters shared cache: calls=%d status=%d", calls.Load(), got.Code)
	}
	InvalidateCourseList()
	if got := request("beginner"); got.Code != http.StatusOK || calls.Load() != 3 {
		t.Fatalf("invalidation did not force reload: calls=%d status=%d", calls.Load(), got.Code)
	}
}

func TestSetFailureDoesNotBreakCachedGetPath(t *testing.T) {
	server := miniredis.RunT(t)
	client := redis.NewClient(&redis.Options{Addr: server.Addr()})
	defer client.Close()
	previous := Default
	Default = New(Config{Enabled: true}, client)
	defer func() { Default = previous }()

	gin.SetMode(gin.TestMode)
	router := gin.New()
	router.GET("/courses", ResponseCache("course:set-failure", time.Minute), func(c *gin.Context) {
		server.Close()
		c.JSON(http.StatusOK, gin.H{"success": true, "data": "postgres"})
	})
	request := httptest.NewRequest(http.MethodGet, "/courses", nil)
	response := httptest.NewRecorder()
	router.ServeHTTP(response, request)
	if response.Code != http.StatusOK || response.Body.String() == "" {
		t.Fatalf("Redis write failure broke GET: status=%d body=%q", response.Code, response.Body.String())
	}
}
