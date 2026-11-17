package cache

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"log"
	"math/rand"
	"sync"
	"sync/atomic"
	"time"

	"github.com/redis/go-redis/v9"
	"golang.org/x/sync/singleflight"
)

var ErrSkipCache = errors.New("cache: response is not cacheable")

type Cache struct {
	client *redis.Client
	cfg    Config
	group  singleflight.Group

	healthy atomic.Bool
	hits    atomic.Int64
	misses  atomic.Int64
	errors  atomic.Int64
	latency atomic.Int64
	ops     atomic.Int64

	closeOnce sync.Once
	stop      chan struct{}
}

type Stats struct {
	Hits         int64
	Misses       int64
	Errors       int64
	Operations   int64
	LatencyNanos int64
	RedisHealthy bool
}

type AuthSession struct {
	UserUID    string `json:"user_uid"`
	Role       string `json:"role"`
	IsVerified bool   `json:"is_verified"`
}

type loadedValue[T any] struct{ value T }

var Default *Cache

func New(cfg Config, client *redis.Client) *Cache {
	c := &Cache{cfg: cfg, client: client, stop: make(chan struct{})}
	c.healthy.Store(cfg.Enabled && client != nil)
	return c
}

func InitializeFromEnv() error {
	cfg, err := LoadConfig()
	if err != nil {
		return err
	}
	var client *redis.Client
	if cfg.Enabled {
		client = redis.NewClient(&redis.Options{
			Addr:                  cfg.Addr,
			Password:              cfg.Password,
			DB:                    cfg.DB,
			PoolSize:              cfg.PoolSize,
			DialTimeout:           cfg.DialTimeout,
			ReadTimeout:           cfg.ReadTimeout,
			WriteTimeout:          cfg.WriteTimeout,
			ContextTimeoutEnabled: true,
		})
	}
	Default = New(cfg, client)
	if !cfg.Enabled {
		log.Print("Redis cache disabled; requests use PostgreSQL")
		return nil
	}

	Default.checkHealth()
	if !Default.Available() {
		log.Print("Redis unavailable at startup; requests will use PostgreSQL until Redis recovers")
	}
	go Default.healthLoop()
	go Default.statsLoop()
	return nil
}

func (c *Cache) Close() error {
	if c == nil {
		return nil
	}
	c.closeOnce.Do(func() { close(c.stop) })
	if c.client != nil {
		return c.client.Close()
	}
	return nil
}

func (c *Cache) Available() bool {
	return c != nil && c.cfg.Enabled && c.client != nil && c.healthy.Load()
}

func (c *Cache) Stats() Stats {
	if c == nil {
		return Stats{}
	}
	return Stats{
		Hits: c.hits.Load(), Misses: c.misses.Load(), Errors: c.errors.Load(),
		Operations: c.ops.Load(), LatencyNanos: c.latency.Load(), RedisHealthy: c.healthy.Load(),
	}
}

func GetOrLoad[T any](c *Cache, ctx context.Context, namespace, suffix string, ttl time.Duration, load func() (T, error)) (T, error) {
	var zero T
	if !c.Available() {
		return load()
	}
	version, err := c.currentVersion(ctx, namespace)
	if err != nil {
		value, loadErr := load()
		if loadErr != nil {
			return zero, loadErr
		}
		return value, nil
	}
	key := physicalKey(namespace, suffix, version)
	var cached T
	if found, err := c.get(ctx, key, &cached, namespace); found || err != nil {
		if found {
			latest, versionErr := c.currentVersion(ctx, namespace)
			if versionErr == nil && latest == version {
				return cached, nil
			}
		}
		value, loadErr := load()
		if loadErr != nil {
			return zero, loadErr
		}
		return value, nil
	}
	log.Printf("redis cache miss namespace=%s", namespace)

	result, err, _ := c.group.Do(key, func() (any, error) {
		var cached T
		if found, err := c.get(ctx, key, &cached, namespace); found {
			data, marshalErr := json.Marshal(cached)
			return data, marshalErr
		} else if err != nil {
			value, loadErr := load()
			data, _ := json.Marshal(value)
			return data, loadErr
		}
		value, err := load()
		if err != nil {
			return nil, err
		}
		data, err := json.Marshal(value)
		if err != nil {
			return loadedValue[T]{value: value}, nil
		}
		latest, versionErr := c.currentVersion(ctx, namespace)
		if versionErr == nil && latest == version && ttl > 0 {
			if err := c.setAtVersion(ctx, namespace, suffix, version, value, ttl); err != nil {
				c.logError(namespace, "set", err)
			}
		}
		return data, nil
	})
	if err != nil {
		return zero, err
	}
	data, ok := result.([]byte)
	if !ok {
		if value, ok := result.(loadedValue[T]); ok {
			return value.value, nil
		}
		return zero, fmt.Errorf("cache singleflight returned unexpected value")
	}
	var value T
	if err := json.Unmarshal(data, &value); err != nil {
		return zero, err
	}
	return value, nil
}

func (c *Cache) Get(ctx context.Context, namespace, suffix string, dst any) (bool, error) {
	if !c.Available() {
		return false, nil
	}
	version, err := c.currentVersion(ctx, namespace)
	if err != nil {
		return false, err
	}
	found, err := c.get(ctx, physicalKey(namespace, suffix, version), dst, namespace)
	if !found || err != nil {
		return found, err
	}
	latest, err := c.currentVersion(ctx, namespace)
	if err != nil {
		return false, err
	}
	return latest == version, nil
}

func (c *Cache) GetAuthSession(ctx context.Context, emailHash string) (AuthSession, string, bool, error) {
	var session AuthSession
	if !c.Available() {
		return session, "", false, nil
	}
	version, err := c.authVersion(ctx, emailHash)
	if err != nil {
		return session, "", false, err
	}
	var data string
	err = c.run(ctx, "auth:session", "get", func(ctx context.Context) error {
		value, err := c.client.Eval(ctx, `local version=redis.call('GET', KEYS[1]) or '0'; if version ~= ARGV[1] then return false end; return redis.call('GET', KEYS[2]) or false`,
			[]string{authVersionKey(emailHash), authSessionKey(emailHash)}, version).Result()
		if err != nil {
			return err
		}
		if value == nil {
			return redis.Nil
		}
		data, _ = value.(string)
		return nil
	})
	if errors.Is(err, redis.Nil) {
		c.misses.Add(1)
		log.Print("redis cache miss namespace=auth:session")
		return session, version, false, nil
	}
	if err != nil {
		return session, "", false, err
	}
	if err := json.Unmarshal([]byte(data), &session); err != nil {
		_ = c.DeleteAuthSession(ctx, emailHash)
		return AuthSession{}, version, false, nil
	}
	c.hits.Add(1)
	log.Print("redis cache hit namespace=auth:session")
	return session, version, true, nil
}

func (c *Cache) SetAuthSession(ctx context.Context, emailHash, version string, session AuthSession) error {
	if !c.Available() {
		return nil
	}
	data, err := json.Marshal(session)
	if err != nil {
		return err
	}
	return c.run(ctx, "auth:session", "set", func(ctx context.Context) error {
		return c.client.Eval(ctx, `local version=redis.call('GET', KEYS[1]) or '0'; if version == ARGV[1] then return redis.call('SET', KEYS[2], ARGV[2], 'PX', ARGV[3]) else return 0 end`,
			[]string{authVersionKey(emailHash), authSessionKey(emailHash)}, version, data, c.cfg.AuthCacheTTL.Milliseconds()).Err()
	})
}

func (c *Cache) DeleteAuthSession(ctx context.Context, emailHash string) error {
	if !c.Available() {
		return nil
	}
	return c.run(ctx, "auth:session", "invalidate", func(ctx context.Context) error {
		return c.client.Eval(ctx, `redis.call('INCR', KEYS[1]); return redis.call('DEL', KEYS[2])`,
			[]string{authVersionKey(emailHash), authSessionKey(emailHash)}).Err()
	})
}

func authSessionKey(emailHash string) string {
	return keyPrefix + "auth:session:" + emailHash
}

func authVersionKey(emailHash string) string {
	return keyPrefix + "version:auth:session:" + emailHash
}

func (c *Cache) authVersion(ctx context.Context, emailHash string) (string, error) {
	var version string
	err := c.run(ctx, "auth:session", "version", func(ctx context.Context) error {
		value, err := c.client.Get(ctx, authVersionKey(emailHash)).Result()
		if errors.Is(err, redis.Nil) {
			version = "0"
			return nil
		}
		version = value
		return err
	})
	return version, err
}

func InvalidateAuthSession(emailHash string) {
	if Default == nil {
		return
	}
	ctx, cancel := context.WithTimeout(context.Background(), operationTimeout)
	defer cancel()
	if err := Default.DeleteAuthSession(ctx, emailHash); err != nil {
		log.Printf("redis auth cache invalidation failed: %v", err)
	}
}

func (c *Cache) Set(ctx context.Context, namespace, suffix string, value any, ttl time.Duration) error {
	if !c.Available() {
		return nil
	}
	version, err := c.currentVersion(ctx, namespace)
	if err != nil {
		return err
	}
	data, err := json.Marshal(value)
	if err != nil {
		return err
	}
	key := physicalKey(namespace, suffix, version)
	if err := c.setRaw(ctx, key, data, JitterTTL(ttl), namespace); err != nil {
		return err
	}
	latest, err := c.currentVersion(ctx, namespace)
	if err == nil && latest != version {
		_ = c.deleteRaw(ctx, key, namespace)
	}
	return err
}

func (c *Cache) setAtVersion(ctx context.Context, namespace, suffix, version string, value any, ttl time.Duration) error {
	if !c.Available() || ttl <= 0 {
		return nil
	}
	data, err := json.Marshal(value)
	if err != nil {
		return err
	}
	return c.run(ctx, namespace, "set", func(ctx context.Context) error {
		return c.client.Eval(ctx, `local version=redis.call('GET', KEYS[1]) or '0'; if version == ARGV[1] then return redis.call('SET', KEYS[2], ARGV[2], 'PX', ARGV[3]) else return 0 end`,
			[]string{versionKey(namespace), physicalKey(namespace, suffix, version)}, version, data, JitterTTL(ttl).Milliseconds()).Err()
	})
}

func (c *Cache) Delete(ctx context.Context, namespace, suffix string) error {
	if !c.Available() {
		return nil
	}
	version, err := c.currentVersion(ctx, namespace)
	if err != nil {
		return err
	}
	return c.deleteRaw(ctx, physicalKey(namespace, suffix, version), namespace)
}

func (c *Cache) DeleteMany(ctx context.Context, namespace string, suffixes ...string) error {
	if len(suffixes) == 0 || !c.Available() {
		return nil
	}
	version, err := c.currentVersion(ctx, namespace)
	if err != nil {
		return err
	}
	keys := make([]string, len(suffixes))
	for i, suffix := range suffixes {
		keys[i] = physicalKey(namespace, suffix, version)
	}
	return c.run(ctx, namespace, "delete", func(ctx context.Context) error {
		return c.client.Del(ctx, keys...).Err()
	})
}

func (c *Cache) Exists(ctx context.Context, namespace, suffix string) (bool, error) {
	if !c.Available() {
		return false, nil
	}
	version, err := c.currentVersion(ctx, namespace)
	if err != nil {
		return false, err
	}
	var exists bool
	err = c.run(ctx, namespace, "exists", func(ctx context.Context) error {
		count, err := c.client.Exists(ctx, physicalKey(namespace, suffix, version)).Result()
		exists = count > 0
		return err
	})
	return exists, err
}

func (c *Cache) TTL(ctx context.Context, namespace, suffix string) (time.Duration, error) {
	if !c.Available() {
		return 0, nil
	}
	version, err := c.currentVersion(ctx, namespace)
	if err != nil {
		return 0, err
	}
	var ttl time.Duration
	err = c.run(ctx, namespace, "ttl", func(ctx context.Context) error {
		var err error
		ttl, err = c.client.TTL(ctx, physicalKey(namespace, suffix, version)).Result()
		return err
	})
	return ttl, err
}

func (c *Cache) Invalidate(ctx context.Context, namespace string) error {
	if !c.Available() {
		return nil
	}
	return c.run(ctx, namespace, "invalidate", func(ctx context.Context) error {
		return c.client.Incr(ctx, versionKey(namespace)).Err()
	})
}

func Invalidate(namespaces ...string) {
	if Default == nil {
		return
	}
	ctx, cancel := context.WithTimeout(context.Background(), operationTimeout)
	defer cancel()
	for _, namespace := range namespaces {
		if err := Default.Invalidate(ctx, namespace); err != nil {
			log.Printf("redis cache invalidation failed namespace=%s: %v", namespace, err)
		}
	}
}

func (c *Cache) currentVersion(ctx context.Context, namespace string) (string, error) {
	var version string
	err := c.run(ctx, namespace, "version", func(ctx context.Context) error {
		value, err := c.client.Get(ctx, versionKey(namespace)).Result()
		if errors.Is(err, redis.Nil) {
			version = "0"
			return nil
		}
		version = value
		return err
	})
	return version, err
}

func (c *Cache) get(ctx context.Context, key string, dst any, namespace string) (bool, error) {
	var data []byte
	err := c.run(ctx, namespace, "get", func(ctx context.Context) error {
		var err error
		data, err = c.client.Get(ctx, key).Bytes()
		return err
	})
	if errors.Is(err, redis.Nil) {
		c.misses.Add(1)
		log.Printf("redis cache miss namespace=%s", namespace)
		return false, nil
	}
	if err != nil {
		return false, err
	}
	if err := json.Unmarshal(data, dst); err != nil {
		_ = c.deleteRaw(ctx, key, namespace)
		return false, nil
	}
	c.hits.Add(1)
	log.Printf("redis cache hit namespace=%s", namespace)
	return true, nil
}

func (c *Cache) setRaw(ctx context.Context, key string, data []byte, ttl time.Duration, namespace string) error {
	if ttl <= 0 {
		return nil
	}
	return c.run(ctx, namespace, "set", func(ctx context.Context) error {
		return c.client.Set(ctx, key, data, ttl).Err()
	})
}

func (c *Cache) deleteRaw(ctx context.Context, key, namespace string) error {
	return c.run(ctx, namespace, "delete", func(ctx context.Context) error {
		return c.client.Del(ctx, key).Err()
	})
}

const operationTimeout = 250 * time.Millisecond

func (c *Cache) run(parent context.Context, namespace, operation string, fn func(context.Context) error) error {
	ctx, cancel := context.WithTimeout(parent, operationTimeout)
	defer cancel()
	started := time.Now()
	err := fn(ctx)
	c.ops.Add(1)
	c.latency.Add(time.Since(started).Nanoseconds())
	if err != nil && !errors.Is(err, redis.Nil) {
		c.errors.Add(1)
		c.healthy.Store(false)
		c.logError(namespace, operation, err)
	} else if err == nil {
		c.healthy.Store(true)
	}
	return err
}

func (c *Cache) logError(namespace, operation string, err error) {
	log.Printf("redis cache error namespace=%s operation=%s: %v", namespace, operation, err)
}

func (c *Cache) checkHealth() {
	ctx, cancel := context.WithTimeout(context.Background(), operationTimeout)
	defer cancel()
	if err := c.client.Ping(ctx).Err(); err != nil {
		c.healthy.Store(false)
		c.errors.Add(1)
		c.logError("health", "ping", err)
		return
	}
	c.healthy.Store(true)
}

func (c *Cache) healthLoop() {
	ticker := time.NewTicker(10 * time.Second)
	defer ticker.Stop()
	for {
		select {
		case <-ticker.C:
			c.checkHealth()
		case <-c.stop:
			return
		}
	}
}

func (c *Cache) statsLoop() {
	ticker := time.NewTicker(time.Minute)
	defer ticker.Stop()
	for {
		select {
		case <-ticker.C:
			stats := c.Stats()
			attempts := stats.Hits + stats.Misses
			hitRatio := float64(0)
			if attempts > 0 {
				hitRatio = float64(stats.Hits) * 100 / float64(attempts)
			}
			log.Printf("redis cache stats hits=%d misses=%d hit_ratio=%.1f%% errors=%d operations=%d latency_avg=%s healthy=%t",
				stats.Hits, stats.Misses, hitRatio, stats.Errors, stats.Operations,
				time.Duration(average(stats.LatencyNanos, stats.Operations)), stats.RedisHealthy)
		case <-c.stop:
			return
		}
	}
}

func average(total, count int64) int64 {
	if count == 0 {
		return 0
	}
	return total / count
}

func JitterTTL(ttl time.Duration) time.Duration {
	if ttl <= 0 {
		return ttl
	}
	return ttl - ttl/10 + time.Duration(rand.Int63n(int64(ttl/5)+1))
}
