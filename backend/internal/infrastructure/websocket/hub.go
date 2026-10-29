package websocket

import (
	"context"
	"encoding/json"
	"log"
	"strings"
	"sync"
	"time"

	"github.com/redis/go-redis/v9"
)

const redisNotificationChannel = "selftest:notifications:pubsub"

// PubSubPayload is used when multi-instance Redis PubSub is active.
type PubSubPayload struct {
	TargetType string      `json:"targetType"` // "user", "role", "broadcast"
	TargetID   int         `json:"targetId,omitempty"`
	TargetRole string      `json:"targetRole,omitempty"`
	MsgType    string      `json:"msgType"`
	Payload    interface{} `json:"payload"`
}

// Hub manages active WebSocket connections and message dissemination.
type Hub struct {
	mu          sync.RWMutex
	clients     map[*Client]bool
	userClients map[int]map[*Client]bool
	roleClients map[string]map[*Client]bool

	register   chan *Client
	unregister chan *Client

	redisClient *redis.Client
	stopPubSub  chan struct{}
}

// NewHub initializes a new Hub instance.
func NewHub(redisClient *redis.Client) *Hub {
	h := &Hub{
		clients:     make(map[*Client]bool),
		userClients: make(map[int]map[*Client]bool),
		roleClients: make(map[string]map[*Client]bool),
		register:    make(chan *Client),
		unregister:  make(chan *Client),
		redisClient: redisClient,
		stopPubSub:  make(chan struct{}),
	}

	return h
}

// Run begins the hub's main coordination loop.
func (h *Hub) Run() {
	if h.redisClient != nil {
		go h.subscribeRedis()
	}

	for {
		select {
		case client := <-h.register:
			h.mu.Lock()
			h.clients[client] = true

			// Register in user map
			if client.UserID > 0 {
				if _, ok := h.userClients[client.UserID]; !ok {
					h.userClients[client.UserID] = make(map[*Client]bool)
				}
				h.userClients[client.UserID][client] = true
			}

			// Register in role map
			normRole := strings.ToLower(strings.TrimSpace(client.Role))
			if normRole != "" {
				if _, ok := h.roleClients[normRole]; !ok {
					h.roleClients[normRole] = make(map[*Client]bool)
				}
				h.roleClients[normRole][client] = true
			}
			h.mu.Unlock()

			log.Printf("[WebSocket] User %d (role: %s) connected. Total clients: %d", client.UserID, client.Role, len(h.clients))

		case client := <-h.unregister:
			h.mu.Lock()
			if _, ok := h.clients[client]; ok {
				delete(h.clients, client)
				close(client.Send)

				if client.UserID > 0 {
					if userMap, ok := h.userClients[client.UserID]; ok {
						delete(userMap, client)
						if len(userMap) == 0 {
							delete(h.userClients, client.UserID)
						}
					}
				}

				normRole := strings.ToLower(strings.TrimSpace(client.Role))
				if normRole != "" {
					if roleMap, ok := h.roleClients[normRole]; ok {
						delete(roleMap, client)
						if len(roleMap) == 0 {
							delete(h.roleClients, normRole)
						}
					}
				}
			}
			h.mu.Unlock()

			log.Printf("[WebSocket] User %d disconnected. Remaining clients: %d", client.UserID, len(h.clients))
		}
	}
}

// Register adds a client to the hub.
func (h *Hub) Register(client *Client) {
	h.register <- client
}

// Unregister removes a client from the hub.
func (h *Hub) Unregister(client *Client) {
	h.unregister <- client
}

// SendToUser dispatches a message to all active sessions of a given user.
func (h *Hub) SendToUser(userID int, msgType string, payload interface{}) {
	if h.redisClient != nil {
		h.publishRedis(PubSubPayload{
			TargetType: "user",
			TargetID:   userID,
			MsgType:    msgType,
			Payload:    payload,
		})
		return
	}

	h.dispatchLocalUser(userID, msgType, payload)
}

// SendToRole dispatches a message to all active sessions of a given role.
func (h *Hub) SendToRole(role string, msgType string, payload interface{}) {
	normRole := strings.ToLower(strings.TrimSpace(role))
	if h.redisClient != nil {
		h.publishRedis(PubSubPayload{
			TargetType: "role",
			TargetRole: normRole,
			MsgType:    msgType,
			Payload:    payload,
		})
		return
	}

	h.dispatchLocalRole(normRole, msgType, payload)
}

// Broadcast dispatches a message to all connected clients.
func (h *Hub) Broadcast(msgType string, payload interface{}) {
	if h.redisClient != nil {
		h.publishRedis(PubSubPayload{
			TargetType: "broadcast",
			MsgType:    msgType,
			Payload:    payload,
		})
		return
	}

	h.dispatchLocalBroadcast(msgType, payload)
}

func (h *Hub) dispatchLocalUser(userID int, msgType string, payload interface{}) {
	h.mu.RLock()
	defer h.mu.RUnlock()

	if clients, ok := h.userClients[userID]; ok {
		for client := range clients {
			client.SendWSMessage(msgType, payload)
		}
	}
}

func (h *Hub) dispatchLocalRole(role string, msgType string, payload interface{}) {
	h.mu.RLock()
	defer h.mu.RUnlock()

	if clients, ok := h.roleClients[role]; ok {
		for client := range clients {
			client.SendWSMessage(msgType, payload)
		}
	}
}

func (h *Hub) dispatchLocalBroadcast(msgType string, payload interface{}) {
	h.mu.RLock()
	defer h.mu.RUnlock()

	for client := range h.clients {
		client.SendWSMessage(msgType, payload)
	}
}

// publishRedis publishes message envelope to Redis channel for multi-instance sync.
func (h *Hub) publishRedis(data PubSubPayload) {
	bytes, err := json.Marshal(data)
	if err != nil {
		log.Printf("[WebSocket] Error marshaling Redis PubSub payload: %v", err)
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), 2*time.Second)
	defer cancel()

	if err := h.redisClient.Publish(ctx, redisNotificationChannel, bytes).Err(); err != nil {
		log.Printf("[WebSocket] Failed to publish notification to Redis: %v. Falling back to local dispatch.", err)
		// Fallback to local dispatch
		switch data.TargetType {
		case "user":
			h.dispatchLocalUser(data.TargetID, data.MsgType, data.Payload)
		case "role":
			h.dispatchLocalRole(data.TargetRole, data.MsgType, data.Payload)
		default:
			h.dispatchLocalBroadcast(data.MsgType, data.Payload)
		}
	}
}

// subscribeRedis listens for messages from other server replicas via Redis.
func (h *Hub) subscribeRedis() {
	pubsub := h.redisClient.Subscribe(context.Background(), redisNotificationChannel)
	defer pubsub.Close()

	ch := pubsub.Channel()
	for {
		select {
		case <-h.stopPubSub:
			return
		case msg, ok := <-ch:
			if !ok {
				return
			}

			var data PubSubPayload
			if err := json.Unmarshal([]byte(msg.Payload), &data); err != nil {
				log.Printf("[WebSocket] Invalid Redis PubSub payload: %v", err)
				continue
			}

			switch data.TargetType {
			case "user":
				h.dispatchLocalUser(data.TargetID, data.MsgType, data.Payload)
			case "role":
				h.dispatchLocalRole(data.TargetRole, data.MsgType, data.Payload)
			case "broadcast":
				h.dispatchLocalBroadcast(data.MsgType, data.Payload)
			}
		}
	}
}
