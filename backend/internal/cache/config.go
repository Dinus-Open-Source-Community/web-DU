package cache

import (
	"fmt"
	"os"
	"strconv"
	"time"
)

const DefaultAuthCacheTTL = 45 * time.Second

type Config struct {
	Enabled      bool
	Addr         string
	Password     string
	DB           int
	PoolSize     int
	DialTimeout  time.Duration
	ReadTimeout  time.Duration
	WriteTimeout time.Duration
	AuthCacheTTL time.Duration
}

func LoadConfig() (Config, error) {
	cfg := Config{
		Addr:         envOr("REDIS_ADDR", "redis:6379"),
		Password:     os.Getenv("REDIS_PASSWORD"),
		PoolSize:     20,
		DialTimeout:  5 * time.Second,
		ReadTimeout:  3 * time.Second,
		WriteTimeout: 3 * time.Second,
		AuthCacheTTL: DefaultAuthCacheTTL,
	}

	var err error
	if cfg.Enabled, err = envBool("REDIS_ENABLED", false); err != nil {
		return Config{}, err
	}
	if cfg.DB, err = envInt("REDIS_DB", 0); err != nil || cfg.DB < 0 {
		return Config{}, fmt.Errorf("REDIS_DB must be a non-negative integer")
	}
	if cfg.PoolSize, err = envInt("REDIS_POOL_SIZE", cfg.PoolSize); err != nil || cfg.PoolSize < 1 {
		return Config{}, fmt.Errorf("REDIS_POOL_SIZE must be a positive integer")
	}
	if cfg.DialTimeout, err = envDuration("REDIS_DIAL_TIMEOUT", cfg.DialTimeout); err != nil {
		return Config{}, err
	}
	if cfg.ReadTimeout, err = envDuration("REDIS_READ_TIMEOUT", cfg.ReadTimeout); err != nil {
		return Config{}, err
	}
	if cfg.WriteTimeout, err = envDuration("REDIS_WRITE_TIMEOUT", cfg.WriteTimeout); err != nil {
		return Config{}, err
	}
	if cfg.AuthCacheTTL, err = envDuration("REDIS_AUTH_CACHE_TTL", DefaultAuthCacheTTL); err != nil {
		return Config{}, err
	}
	if cfg.AuthCacheTTL < 30*time.Second || cfg.AuthCacheTTL > 60*time.Second {
		return Config{}, fmt.Errorf("REDIS_AUTH_CACHE_TTL must be between 30s and 60s, got %s", cfg.AuthCacheTTL)
	}
	return cfg, nil
}

func envOr(name, fallback string) string {
	if value := os.Getenv(name); value != "" {
		return value
	}
	return fallback
}

func envBool(name string, fallback bool) (bool, error) {
	value, exists := os.LookupEnv(name)
	if !exists || value == "" {
		return fallback, nil
	}
	parsed, err := strconv.ParseBool(value)
	if err != nil {
		return false, fmt.Errorf("%s must be true or false: %w", name, err)
	}
	return parsed, nil
}

func envInt(name string, fallback int) (int, error) {
	value, exists := os.LookupEnv(name)
	if !exists || value == "" {
		return fallback, nil
	}
	parsed, err := strconv.Atoi(value)
	if err != nil {
		return 0, fmt.Errorf("%s must be an integer: %w", name, err)
	}
	return parsed, nil
}

func envDuration(name string, fallback time.Duration) (time.Duration, error) {
	value, exists := os.LookupEnv(name)
	if !exists || value == "" {
		return fallback, nil
	}
	parsed, err := time.ParseDuration(value)
	if err != nil || parsed <= 0 {
		return 0, fmt.Errorf("%s must be a positive duration: %q", name, value)
	}
	return parsed, nil
}
