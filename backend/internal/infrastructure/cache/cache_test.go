package cache

import (
	"context"
	"testing"
	"time"
)

type sampleStruct struct {
	ID   int    `json:"id"`
	Name string `json:"name"`
}

func TestNilClientPassthrough(t *testing.T) {
	c := NewRedisCache(nil)
	ctx := context.Background()

	// 1. Get should return false, nil
	var dest sampleStruct
	hit, err := c.Get(ctx, "test:key", &dest)
	if err != nil {
		t.Fatalf("expected nil error on nil client get, got %v", err)
	}
	if hit {
		t.Fatalf("expected false on nil client get, got true")
	}

	// 2. Set should return nil
	err = c.Set(ctx, "test:key", sampleStruct{ID: 1, Name: "Test"}, time.Minute)
	if err != nil {
		t.Fatalf("expected nil error on nil client set, got %v", err)
	}

	// 3. Delete should return nil
	err = c.Delete(ctx, "test:key", "test:key2")
	if err != nil {
		t.Fatalf("expected nil error on nil client delete, got %v", err)
	}

	// 4. DeleteByPattern should return nil
	err = c.DeleteByPattern(ctx, "test:*")
	if err != nil {
		t.Fatalf("expected nil error on nil client delete by pattern, got %v", err)
	}
}
