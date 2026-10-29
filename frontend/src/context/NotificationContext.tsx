"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  useCallback,
  ReactNode,
} from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useUser } from "./UserContext";
import { getAuthToken } from "../lib/auth";
import {
  NotificationItem,
  getNotificationsAction,
  getUnreadCountAction,
  markNotificationReadAction,
  markAllNotificationsReadAction,
  deleteNotificationAction,
} from "../lib/actions/notifications";

interface NotificationContextType {
  notifications: NotificationItem[];
  unreadCount: number;
  isConnected: boolean;
  isLoading: boolean;
  markAsRead: (id: number) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (id: number) => Promise<void>;
  refreshNotifications: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

// Resolves WebSocket connection URL
function resolveWsUrl(token: string): string {
  if (process.env.NEXT_PUBLIC_WS_URL) {
    const base = process.env.NEXT_PUBLIC_WS_URL.replace(/\/$/, "");
    return `${base}/api/ws/notifications?token=${encodeURIComponent(token)}`;
  }

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api";
  let wsUrl = apiUrl.replace(/\/api\/?$/, "");

  if (wsUrl.startsWith("https://")) {
    wsUrl = wsUrl.replace("https://", "wss://");
  } else if (wsUrl.startsWith("http://")) {
    wsUrl = wsUrl.replace("http://", "ws://");
  } else if (typeof window !== "undefined") {
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    wsUrl = `${protocol}//${window.location.host}`;
  }

  return `${wsUrl}/api/ws/notifications?token=${encodeURIComponent(token)}`;
}

export function NotificationProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { user } = useUser();
  const userId = user?.id;

  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const wsRef = useRef<WebSocket | null>(null);
  const reconnectAttemptsRef = useRef<number>(0);
  const reconnectTimerRef = useRef<NodeJS.Timeout | null>(null);
  const pingTimerRef = useRef<NodeJS.Timeout | null>(null);
  const intentionalDisconnectRef = useRef<boolean>(false);
  const routerRef = useRef(router);
  routerRef.current = router;

  // Initial fetch of notifications
  const refreshNotifications = useCallback(async () => {
    if (!userId) return;
    try {
      const res = await getNotificationsAction({ page: 1, limit: 30 });
      setNotifications(res.data || []);
      setUnreadCount(res.unreadCount || 0);
    } catch (err) {
      console.error("Failed to fetch initial notifications:", err);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  // Handle incoming websocket message
  const handleWsMessage = useCallback((event: MessageEvent) => {
    try {
      const data = JSON.parse(event.data);
      if (!data || !data.type) return;

      switch (data.type) {
        case "notification": {
          const newNotif: NotificationItem = data.payload;
          if (!newNotif || !newNotif.id) return;

          // Prepend new notification, avoiding duplicates
          setNotifications((prev) => {
            if (prev.some((n) => n.id === newNotif.id)) return prev;
            return [newNotif, ...prev];
          });

          setUnreadCount((prev) => prev + 1);

          // Display rich toast notification
          const toastAction = newNotif.link
            ? {
                label: "View",
                onClick: () => {
                  if (newNotif.link) routerRef.current.push(newNotif.link);
                },
              }
            : undefined;

          const toastOptions = {
            description: newNotif.message,
            action: toastAction,
            duration: 6000,
          };

          switch (newNotif.type) {
            case "success":
              toast.success(newNotif.title, toastOptions);
              break;
            case "warning":
              toast.warning(newNotif.title, toastOptions);
              break;
            case "error":
              toast.error(newNotif.title, toastOptions);
              break;
            default:
              toast.info(newNotif.title, toastOptions);
              break;
          }
          break;
        }

        case "unread_count": {
          const count = Number(data.payload);
          if (!isNaN(count)) {
            setUnreadCount(count);
          }
          break;
        }

        case "pong":
          break;

        default:
          break;
      }
    } catch (err) {
      console.error("Failed to parse websocket message:", err);
    }
  }, []);

  const handleWsMessageRef = useRef(handleWsMessage);
  handleWsMessageRef.current = handleWsMessage;

  // Connect to WebSocket server
  const connectWs = useCallback(() => {
    if (typeof window === "undefined") return;
    if (!userId) {
      if (wsRef.current) {
        intentionalDisconnectRef.current = true;
        wsRef.current.close(1000, "No user");
        wsRef.current = null;
      }
      setIsConnected(false);
      return;
    }

    const token = getAuthToken();
    if (!token) {
      setIsConnected(false);
      return;
    }

    // If already connected or connecting, do not create duplicate
    if (
      wsRef.current &&
      (wsRef.current.readyState === WebSocket.OPEN ||
        wsRef.current.readyState === WebSocket.CONNECTING)
    ) {
      return;
    }

    // Clean up any stale closed socket
    if (wsRef.current) {
      wsRef.current.onopen = null;
      wsRef.current.onmessage = null;
      wsRef.current.onerror = null;
      wsRef.current.onclose = null;
      wsRef.current = null;
    }

    try {
      intentionalDisconnectRef.current = false;
      const url = resolveWsUrl(token);
      const ws = new WebSocket(url);
      wsRef.current = ws;

      ws.onopen = () => {
        setIsConnected(true);
        reconnectAttemptsRef.current = 0;

        // Periodic keep-alive ping
        if (pingTimerRef.current) clearInterval(pingTimerRef.current);
        pingTimerRef.current = setInterval(() => {
          if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ type: "ping" }));
          }
        }, 30000);
      };

      ws.onmessage = (e) => {
        handleWsMessageRef.current(e);
      };

      ws.onerror = (error) => {
        console.warn("[WebSocket] Error occurred on connection:", error);
      };

      ws.onclose = () => {
        setIsConnected(false);
        if (pingTimerRef.current) {
          clearInterval(pingTimerRef.current);
          pingTimerRef.current = null;
        }

        // Exponential backoff reconnect if not intentionally closed
        if (!intentionalDisconnectRef.current && userId) {
          const attempt = reconnectAttemptsRef.current;
          const delay = Math.min(1000 * Math.pow(2, attempt), 30000);
          reconnectAttemptsRef.current += 1;

          if (reconnectTimerRef.current) clearTimeout(reconnectTimerRef.current);
          reconnectTimerRef.current = setTimeout(() => {
            connectWs();
          }, delay);
        }
      };
    } catch (err) {
      console.error("[WebSocket] Connection attempt failed:", err);
    }
  }, [userId]);

  // Connect on userId change
  useEffect(() => {
    if (!userId) {
      if (wsRef.current) {
        intentionalDisconnectRef.current = true;
        wsRef.current.close(1000, "User logged out");
        wsRef.current = null;
      }
      setIsConnected(false);
      setNotifications([]);
      setUnreadCount(0);
      return;
    }

    intentionalDisconnectRef.current = false;
    refreshNotifications();
    connectWs();

    // Re-sync on window focus / visibility change
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
          connectWs();
        } else {
          getUnreadCountAction().then((count) => setUnreadCount(count));
        }
      }
    };

    window.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("focus", handleVisibilityChange);

    return () => {
      intentionalDisconnectRef.current = true;
      if (reconnectTimerRef.current) clearTimeout(reconnectTimerRef.current);
      if (pingTimerRef.current) clearInterval(pingTimerRef.current);
      if (wsRef.current) {
        wsRef.current.close(1000, "Provider cleanup");
        wsRef.current = null;
      }
      window.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("focus", handleVisibilityChange);
    };
  }, [userId, connectWs, refreshNotifications]);

  // Mark single as read (optimistic update)
  const markAsRead = useCallback(async (id: number) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));

    try {
      await markNotificationReadAction(id);
    } catch (err) {
      console.error("Failed to mark notification as read:", err);
    }
  }, []);

  // Mark all as read (optimistic update)
  const markAllAsRead = useCallback(async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    setUnreadCount(0);

    try {
      await markAllNotificationsReadAction();
    } catch (err) {
      console.error("Failed to mark all notifications as read:", err);
    }
  }, []);

  // Delete notification (optimistic update)
  const deleteNotification = useCallback(
    async (id: number) => {
      const target = notifications.find((n) => n.id === id);
      setNotifications((prev) => prev.filter((n) => n.id !== id));
      if (target && !target.isRead) {
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }

      try {
        await deleteNotificationAction(id);
      } catch (err) {
        console.error("Failed to delete notification:", err);
      }
    },
    [notifications]
  );

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        isConnected,
        isLoading,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        refreshNotifications,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error("useNotifications must be used within a NotificationProvider");
  }
  return context;
}
