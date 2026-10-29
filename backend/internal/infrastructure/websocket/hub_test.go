package websocket

import (
	"testing"
	"time"
)

func TestHubLifecycle(t *testing.T) {
	hub := NewHub(nil)
	go hub.Run()

	client := &Client{
		Hub:    hub,
		Conn:   nil,
		Send:   make(chan []byte, 10),
		UserID: 42,
		Role:   "teacher",
	}

	hub.Register(client)

	// Wait briefly for registration
	time.Sleep(10 * time.Millisecond)

	hub.mu.RLock()
	if !hub.clients[client] {
		t.Errorf("Expected client to be in hub.clients")
	}
	if !hub.userClients[42][client] {
		t.Errorf("Expected client to be in hub.userClients[42]")
	}
	if !hub.roleClients["teacher"][client] {
		t.Errorf("Expected client to be in hub.roleClients['teacher']")
	}
	hub.mu.RUnlock()

	// Dispatch message to user
	hub.SendToUser(42, "notification", map[string]string{"title": "Hello"})

	select {
	case msg := <-client.Send:
		if len(msg) == 0 {
			t.Errorf("Expected received message to not be empty")
		}
	case <-time.After(500 * time.Millisecond):
		t.Errorf("Timed out waiting for message")
	}

	// Unregister
	hub.Unregister(client)
	time.Sleep(10 * time.Millisecond)

	hub.mu.RLock()
	if hub.clients[client] {
		t.Errorf("Expected client to be removed from hub.clients")
	}
	if _, ok := hub.userClients[42]; ok {
		t.Errorf("Expected user 42 map to be cleaned up")
	}
	hub.mu.RUnlock()
}
