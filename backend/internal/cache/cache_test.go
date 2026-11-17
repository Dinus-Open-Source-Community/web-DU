package cache

import (
	"context"
	"net/url"
	"strings"
	"sync/atomic"
	"testing"
	"time"

	"github.com/alicebob/miniredis/v2"
	"github.com/redis/go-redis/v9"
)

func testCache(t *testing.T) (*Cache, *miniredis.Miniredis) {
	t.Helper()
	server := miniredis.RunT(t)
	client := redis.NewClient(&redis.Options{Addr: server.Addr()})
	t.Cleanup(func() { _ = client.Close() })
	return New(Config{Enabled: true, AuthCacheTTL: DefaultAuthCacheTTL}, client), server
}

func TestGetOrLoadHitAndExpire(t *testing.T) {
	c, server := testCache(t)
	ctx := context.Background()
	calls := 0
	load := func() (map[string]string, error) {
		calls++
		return map[string]string{"name": "DKelas"}, nil
	}
	first, err := GetOrLoad(c, ctx, "public:test", "one", time.Minute, load)
	if err != nil || first["name"] != "DKelas" || calls != 1 {
		t.Fatalf("first load = %#v, calls=%d, err=%v", first, calls, err)
	}
	second, err := GetOrLoad(c, ctx, "public:test", "one", time.Minute, load)
	if err != nil || second["name"] != "DKelas" || calls != 1 {
		t.Fatalf("cache hit = %#v, calls=%d, err=%v", second, calls, err)
	}
	server.FastForward(2 * time.Minute)
	if _, err := GetOrLoad(c, ctx, "public:test", "one", time.Minute, load); err != nil || calls != 2 {
		t.Fatalf("expired cache calls=%d, err=%v", calls, err)
	}
}

func TestNamespaceInvalidationBlocksLateFill(t *testing.T) {
	c, server := testCache(t)
	ctx := context.Background()
	version, err := c.currentVersion(ctx, "courses")
	if err != nil {
		t.Fatal(err)
	}
	if err := c.Invalidate(ctx, "courses"); err != nil {
		t.Fatal(err)
	}
	if err := c.setAtVersion(ctx, "courses", "list", version, []string{"stale"}, time.Minute); err != nil {
		t.Fatal(err)
	}
	if server.Exists(physicalKey("courses", "list", version)) {
		t.Fatal("late fill wrote into invalidated namespace version")
	}
}

func TestAuthSessionVersionAndTTL(t *testing.T) {
	c, server := testCache(t)
	c.cfg.AuthCacheTTL = 45 * time.Second
	ctx := context.Background()
	version, err := c.authVersion(ctx, "blind-index")
	if err != nil {
		t.Fatal(err)
	}
	want := AuthSession{UserUID: "canonical-full-uuid", Role: "student", IsVerified: true}
	if err := c.SetAuthSession(ctx, "blind-index", version, want); err != nil {
		t.Fatal(err)
	}
	got, gotVersion, hit, err := c.GetAuthSession(ctx, "blind-index")
	if err != nil || !hit || got != want || gotVersion != version {
		t.Fatalf("auth cache = %#v version=%q hit=%t err=%v", got, gotVersion, hit, err)
	}
	ttl := server.TTL(authSessionKey("blind-index"))
	if ttl < 30*time.Second || ttl > 60*time.Second {
		t.Fatalf("auth TTL = %s", ttl)
	}
	if err := c.DeleteAuthSession(ctx, "blind-index"); err != nil {
		t.Fatal(err)
	}
	if _, _, hit, err := c.GetAuthSession(ctx, "blind-index"); err != nil || hit {
		t.Fatalf("invalidated auth cache hit=%t err=%v", hit, err)
	}
}

func TestRedisFailureFallsBackToLoader(t *testing.T) {
	c, _ := testCache(t)
	_ = c.client.Close()
	var calls atomic.Int32
	value, err := GetOrLoad(c, context.Background(), "failure", "key", time.Minute, func() (string, error) {
		calls.Add(1)
		return "postgres", nil
	})
	if err != nil || value != "postgres" || calls.Load() != 1 {
		t.Fatalf("fallback value=%q calls=%d err=%v", value, calls.Load(), err)
	}
}

func TestConfigAuthTTLBounds(t *testing.T) {
	t.Setenv("REDIS_ENABLED", "false")
	t.Setenv("REDIS_DB", "0")
	t.Setenv("REDIS_POOL_SIZE", "20")
	t.Setenv("REDIS_DIAL_TIMEOUT", "5s")
	t.Setenv("REDIS_READ_TIMEOUT", "3s")
	t.Setenv("REDIS_WRITE_TIMEOUT", "3s")
	for _, value := range []string{"29s", "61s", "invalid"} {
		t.Setenv("REDIS_AUTH_CACHE_TTL", value)
		if _, err := LoadConfig(); err == nil {
			t.Errorf("LoadConfig accepted REDIS_AUTH_CACHE_TTL=%q", value)
		}
	}
	for _, value := range []string{"30s", "45s", "60s"} {
		t.Setenv("REDIS_AUTH_CACHE_TTL", value)
		want, _ := time.ParseDuration(value)
		if cfg, err := LoadConfig(); err != nil || cfg.AuthCacheTTL != want {
			t.Errorf("LoadConfig(%q) = %s, err=%v", value, cfg.AuthCacheTTL, err)
		}
	}
}

func TestNormalizedRequestKeyAndFullDigest(t *testing.T) {
	a := RequestSuffix("/courses", url.Values{"page": {" 1 "}, "level": {"BEGINNER"}})
	b := RequestSuffix("/courses", url.Values{"level": {"BEGINNER"}, "page": {"1"}})
	if a != b || len(a) != 64 || strings.Contains(a, "BEGINNER") {
		t.Fatalf("request hashes differ or disclose parameters: %q %q", a, b)
	}
	if !strings.HasPrefix(authSessionKey("hash"), "dkelas:auth:session:") {
		t.Fatal("auth cache key missing project prefix")
	}
}

func TestCacheSerializationAndVersionMismatchDoNotExposeData(t *testing.T) {
	c, server := testCache(t)
	ctx := context.Background()
	version, _ := c.currentVersion(ctx, "test")
	_ = server.Set(physicalKey("test", "invalid", version), "not-json")
	var value map[string]string
	if found, err := c.Get(ctx, "test", "invalid", &value); err != nil || found {
		t.Fatalf("invalid json found=%t err=%v", found, err)
	}
}

func TestJitterTTLBounds(t *testing.T) {
	ttl := time.Minute
	for range 1000 {
		got := JitterTTL(ttl)
		if got < 54*time.Second || got > 66*time.Second {
			t.Fatalf("TTL jitter out of expected range: %s", got)
		}
	}
}
