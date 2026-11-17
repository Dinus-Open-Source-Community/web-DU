package middleware

import (
	"context"
	"net/http"
	"net/http/httptest"
	"testing"
	"time"

	"backend/internal/cache"

	"github.com/alicebob/miniredis/v2"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/redis/go-redis/v9"
)

func TestAuthMiddlewareUsesValidatedCacheAndStillRejectsInvalidTokens(t *testing.T) {
	previousSecret, previousCache := jwtSecret, cache.Default
	jwtSecret = []byte("test-secret-key")
	defer func() { jwtSecret, cache.Default = previousSecret, previousCache }()

	server := miniredis.RunT(t)
	client := redis.NewClient(&redis.Options{Addr: server.Addr()})
	defer client.Close()
	cache.Default = cache.New(cache.Config{Enabled: true, AuthCacheTTL: cache.DefaultAuthCacheTTL}, client)

	uid := uuid.New()
	ctx := context.Background()
	validToken, err := GenerateJWT("verified-email-hash", time.Now().Add(time.Minute))
	if err != nil {
		t.Fatal(err)
	}
	authVersion, err := authCacheVersion(ctx, "verified-email-hash")
	if err != nil {
		t.Fatal(err)
	}
	if err := cache.Default.SetAuthSession(ctx, "verified-email-hash", authVersion, cache.AuthSession{
		UserUID: uid.String(), Role: "mentor", IsVerified: true,
	}); err != nil {
		t.Fatal(err)
	}

	gin.SetMode(gin.TestMode)
	router := gin.New()
	router.GET("/protected", AuthMiddleware(), func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{"uid": c.MustGet(UIDCK), "role": c.MustGet(RoleCK)})
	})
	request := httptest.NewRequest(http.MethodGet, "/protected", nil)
	request.Header.Set("Authorization", "Bearer "+validToken)
	response := httptest.NewRecorder()
	router.ServeHTTP(response, request)
	if response.Code != http.StatusOK {
		t.Fatalf("valid cached session status=%d body=%s", response.Code, response.Body.String())
	}

	badTokenRequest := httptest.NewRequest(http.MethodGet, "/protected", nil)
	badTokenRequest.Header.Set("Authorization", "Bearer invalid-token")
	badTokenResponse := httptest.NewRecorder()
	router.ServeHTTP(badTokenResponse, badTokenRequest)
	if badTokenResponse.Code != http.StatusUnauthorized {
		t.Fatalf("invalid JWT status=%d", badTokenResponse.Code)
	}

	expiredToken, err := GenerateJWT("verified-email-hash", time.Now().Add(-time.Minute))
	if err != nil {
		t.Fatal(err)
	}
	expiredRequest := httptest.NewRequest(http.MethodGet, "/protected", nil)
	expiredRequest.Header.Set("Authorization", "Bearer "+expiredToken)
	expiredResponse := httptest.NewRecorder()
	router.ServeHTTP(expiredResponse, expiredRequest)
	if expiredResponse.Code != http.StatusUnauthorized {
		t.Fatalf("expired JWT status=%d", expiredResponse.Code)
	}
}

func TestAuthMiddlewareRejectsUnverifiedCachedUser(t *testing.T) {
	previousSecret, previousCache := jwtSecret, cache.Default
	jwtSecret = []byte("test-secret-key")
	defer func() { jwtSecret, cache.Default = previousSecret, previousCache }()

	server := miniredis.RunT(t)
	client := redis.NewClient(&redis.Options{Addr: server.Addr()})
	defer client.Close()
	cache.Default = cache.New(cache.Config{Enabled: true, AuthCacheTTL: cache.DefaultAuthCacheTTL}, client)
	token, err := GenerateJWT("unverified-email-hash", time.Now().Add(time.Minute))
	if err != nil {
		t.Fatal(err)
	}
	version, err := authCacheVersion(context.Background(), "unverified-email-hash")
	if err != nil {
		t.Fatal(err)
	}
	if err := cache.Default.SetAuthSession(context.Background(), "unverified-email-hash", version, cache.AuthSession{
		UserUID: uuid.NewString(), Role: "student", IsVerified: false,
	}); err != nil {
		t.Fatal(err)
	}

	gin.SetMode(gin.TestMode)
	router := gin.New()
	router.GET("/protected", AuthMiddleware(), func(c *gin.Context) { c.Status(http.StatusNoContent) })
	request := httptest.NewRequest(http.MethodGet, "/protected", nil)
	request.Header.Set("Authorization", "Bearer "+token)
	response := httptest.NewRecorder()
	router.ServeHTTP(response, request)
	if response.Code != http.StatusForbidden {
		t.Fatalf("unverified cached user status=%d", response.Code)
	}
}

func authCacheVersion(ctx context.Context, emailHash string) (string, error) {
	_, version, _, err := cache.Default.GetAuthSession(ctx, emailHash)
	return version, err
}
