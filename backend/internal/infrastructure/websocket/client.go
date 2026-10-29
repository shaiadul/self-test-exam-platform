package websocket

import (
	"encoding/json"
	"log"
	"time"

	"github.com/gorilla/websocket"
	"github.com/selftest/backend/internal/domain/notification"
)

const (
	// Time allowed to write a message to the peer.
	writeWait = 10 * time.Second

	// Time allowed to read the next pong message from the peer.
	pongWait = 60 * time.Second

	// Send pings to peer with this period. Must be less than pongWait.
	pingPeriod = (pongWait * 9) / 10

	// Maximum message size allowed from peer (in bytes).
	maxMessageSize = 4096

	// Channel buffer size for outgoing messages.
	sendBufferSize = 256
)

// Client represents a single active WebSocket connection for an authenticated user.
type Client struct {
	Hub    *Hub
	Conn   *websocket.Conn
	Send   chan []byte
	UserID int
	Role   string
}

// NewClient initializes a new Client instance.
func NewClient(hub *Hub, conn *websocket.Conn, userID int, role string) *Client {
	return &Client{
		Hub:    hub,
		Conn:   conn,
		Send:   make(chan []byte, sendBufferSize),
		UserID: userID,
		Role:   role,
	}
}

// SendWSMessage converts a message to standard JSON format and queues it for the client.
func (c *Client) SendWSMessage(msgType string, payload interface{}) {
	envelope := notification.WSMessage{
		Type:      msgType,
		Payload:   payload,
		Timestamp: time.Now().UTC(),
	}

	data, err := json.Marshal(envelope)
	if err != nil {
		log.Printf("[WebSocket] Error marshaling message for user %d: %v", c.UserID, err)
		return
	}

	select {
	case c.Send <- data:
	default:
		log.Printf("[WebSocket] Client buffer full for user %d, dropping message", c.UserID)
	}
}

// ReadPump handles incoming WebSocket frames, maintaining heartbeat and reading control frames.
func (c *Client) ReadPump() {
	defer func() {
		c.Hub.Unregister(c)
		_ = c.Conn.Close()
	}()

	c.Conn.SetReadLimit(maxMessageSize)
	_ = c.Conn.SetReadDeadline(time.Now().Add(pongWait))
	c.Conn.SetPongHandler(func(string) error {
		_ = c.Conn.SetReadDeadline(time.Now().Add(pongWait))
		return nil
	})

	for {
		_, message, err := c.Conn.ReadMessage()
		if err != nil {
			if websocket.IsUnexpectedCloseError(err, websocket.CloseGoingAway, websocket.CloseNormalClosure, websocket.CloseAbnormalClosure, websocket.CloseNoStatusReceived) {
				log.Printf("[WebSocket] Read error for user %d: %v", c.UserID, err)
			}
			break
		}

		// Handle client messages (e.g. client heartbeats or custom actions)
		var incoming struct {
			Type string `json:"type"`
		}
		if err := json.Unmarshal(message, &incoming); err == nil {
			if incoming.Type == notification.WSActionPing {
				c.SendWSMessage(notification.WSActionPong, "pong")
			}
		}
	}
}

// WritePump writes outgoing messages from the Send channel to the WebSocket connection.
func (c *Client) WritePump() {
	ticker := time.NewTicker(pingPeriod)
	defer func() {
		ticker.Stop()
		_ = c.Conn.Close()
	}()

	for {
		select {
		case message, ok := <-c.Send:
			_ = c.Conn.SetWriteDeadline(time.Now().Add(writeWait))
			if !ok {
				// The hub closed the channel
				_ = c.Conn.WriteMessage(websocket.CloseMessage, []byte{})
				return
			}

			w, err := c.Conn.NextWriter(websocket.TextMessage)
			if err != nil {
				return
			}
			if _, err := w.Write(message); err != nil {
				return
			}

			// Batch any additional queued messages into the same frame to save syscalls
			n := len(c.Send)
			for i := 0; i < n; i++ {
				_, _ = w.Write([]byte("\n"))
				_, _ = w.Write(<-c.Send)
			}

			if err := w.Close(); err != nil {
				return
			}

		case <-ticker.C:
			_ = c.Conn.SetWriteDeadline(time.Now().Add(writeWait))
			if err := c.Conn.WriteMessage(websocket.PingMessage, nil); err != nil {
				return
			}
		}
	}
}
