package config

import (
	"context"
	"fmt"
	"log"
	"os"
	"time"

	"github.com/redis/go-redis/v9"
)

// RedisClient is the shared Redis client used by the caching layer.
var RedisClient *redis.Client

// InitRedis parses REDIS_URL (e.g. from Upstash or local redis), tests connection,
// and initializes the global RedisClient.
func InitRedis() {
	redisURL := os.Getenv("REDIS_URL")
	if redisURL == "" {
		log.Println("Notice: REDIS_URL is not set. Caching will run in passthrough mode (direct database).")
		return
	}

	opt, err := redis.ParseURL(redisURL)
	if err != nil {
		log.Printf("Warning: Failed to parse REDIS_URL: %v. Running with cache passthrough.\n", err)
		return
	}

	client := redis.NewClient(opt)

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	if err := client.Ping(ctx).Err(); err != nil {
		log.Printf("Warning: Failed to connect to Redis at %s: %v. Running with cache passthrough.\n", opt.Addr, err)
		return
	}

	RedisClient = client
	fmt.Printf("Connected to Redis (%s) successfully!\n", opt.Addr)
}

// CloseRedis gracefully closes the Redis client connection.
func CloseRedis() {
	if RedisClient != nil {
		if err := RedisClient.Close(); err != nil {
			log.Printf("Error closing Redis client: %v\n", err)
		} else {
			fmt.Println("Redis connection closed.")
		}
	}
}
