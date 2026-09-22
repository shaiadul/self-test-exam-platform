package cache

import (
	"context"
	"encoding/json"
	"errors"
	"log"
	"time"

	"github.com/redis/go-redis/v9"
)

const (
	DefaultPackTTL     = 1 * time.Hour
	DefaultExamTTL     = 30 * time.Minute
	DefaultQuestionTTL = 30 * time.Minute
	DefaultUserTTL     = 30 * time.Minute
	DefaultRoleTTL     = 1 * time.Hour
	DefaultStatsTTL    = 5 * time.Minute
)

// CacheService defines methods for caching data in Redis.
type CacheService interface {
	Get(ctx context.Context, key string, dest interface{}) (bool, error)
	Set(ctx context.Context, key string, value interface{}, ttl time.Duration) error
	Delete(ctx context.Context, keys ...string) error
	DeleteByPattern(ctx context.Context, pattern string) error
	Client() *redis.Client
}

type RedisCache struct {
	client *redis.Client
}

// NewRedisCache creates a new CacheService wrapping a Redis client.
func NewRedisCache(client *redis.Client) *RedisCache {
	return &RedisCache{client: client}
}

func (c *RedisCache) Client() *redis.Client {
	return c.client
}

// Get fetches data from Redis and unmarshals it into dest.
// Returns (true, nil) on cache hit, (false, nil) on miss or if Redis is unavailable.
func (c *RedisCache) Get(ctx context.Context, key string, dest interface{}) (bool, error) {
	if c.client == nil {
		return false, nil
	}

	val, err := c.client.Get(ctx, key).Bytes()
	if err != nil {
		if errors.Is(err, redis.Nil) {
			return false, nil
		}
		log.Printf("Cache GET error for key '%s': %v (falling back to DB)\n", key, err)
		return false, nil
	}

	if err := json.Unmarshal(val, dest); err != nil {
		log.Printf("Cache JSON unmarshal error for key '%s': %v\n", key, err)
		return false, nil
	}

	return true, nil
}

// Set serializes value as JSON and stores it in Redis with the given TTL.
func (c *RedisCache) Set(ctx context.Context, key string, value interface{}, ttl time.Duration) error {
	if c.client == nil {
		return nil
	}

	data, err := json.Marshal(value)
	if err != nil {
		return err
	}

	if err := c.client.Set(ctx, key, data, ttl).Err(); err != nil {
		log.Printf("Cache SET error for key '%s': %v\n", key, err)
		return err
	}

	return nil
}

// Delete removes one or more keys from Redis.
func (c *RedisCache) Delete(ctx context.Context, keys ...string) error {
	if c.client == nil || len(keys) == 0 {
		return nil
	}

	var validKeys []string
	for _, k := range keys {
		if k != "" {
			validKeys = append(validKeys, k)
		}
	}

	if len(validKeys) == 0 {
		return nil
	}

	if err := c.client.Del(ctx, validKeys...).Err(); err != nil {
		log.Printf("Cache DELETE error for keys %v: %v\n", validKeys, err)
		return err
	}

	return nil
}

// DeleteByPattern scans keys matching a pattern and deletes them non-blockingly.
func (c *RedisCache) DeleteByPattern(ctx context.Context, pattern string) error {
	if c.client == nil || pattern == "" {
		return nil
	}

	var cursor uint64
	var allKeys []string

	for {
		keys, nextCursor, err := c.client.Scan(ctx, cursor, pattern, 100).Result()
		if err != nil {
			log.Printf("Cache SCAN error for pattern '%s': %v\n", pattern, err)
			return err
		}

		allKeys = append(allKeys, keys...)
		cursor = nextCursor
		if cursor == 0 {
			break
		}
	}

	if len(allKeys) > 0 {
		// Delete in batches of 100
		batchSize := 100
		for i := 0; i < len(allKeys); i += batchSize {
			end := i + batchSize
			if end > len(allKeys) {
				end = len(allKeys)
			}
			if err := c.client.Del(ctx, allKeys[i:end]...).Err(); err != nil {
				log.Printf("Cache DEL batch error for pattern '%s': %v\n", pattern, err)
			}
		}
	}

	return nil
}
