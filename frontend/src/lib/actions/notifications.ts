"use server";

import { revalidatePath } from "next/cache";
import { fetcherWithAuth } from "./fetcher";

export interface NotificationItem {
  id: number;
  userId?: number;
  role?: string;
  title: string;
  message: string;
  type: "info" | "success" | "warning" | "error";
  link?: string;
  isRead: boolean;
  readAt?: string;
  createdAt: string;
}

export interface NotificationsListResponse {
  data: NotificationItem[];
  total: number;
  unreadCount: number;
  page: number;
  limit: number;
}

export async function getNotificationsAction(
  params: { page?: number; limit?: number } = {},
  clientToken?: string
): Promise<NotificationsListResponse> {
  try {
    const res = await fetcherWithAuth<NotificationsListResponse>(
      "/notifications",
      {
        params: {
          page: params.page || 1,
          limit: params.limit || 20,
        },
      },
      clientToken
    );

    return res || { data: [], total: 0, unreadCount: 0, page: 1, limit: 20 };
  } catch (error) {
    console.error("Failed to fetch notifications:", error);
    return { data: [], total: 0, unreadCount: 0, page: 1, limit: 20 };
  }
}

export async function getUnreadCountAction(clientToken?: string): Promise<number> {
  try {
    const res = await fetcherWithAuth<{ unreadCount: number }>(
      "/notifications/unread-count",
      {},
      clientToken
    );
    return res?.unreadCount ?? 0;
  } catch {
    return 0;
  }
}

export async function markNotificationReadAction(
  id: number,
  clientToken?: string
): Promise<{ success: boolean }> {
  try {
    await fetcherWithAuth(
      `/notifications/${id}/read`,
      {
        method: "PATCH",
        throwOnError: true,
      },
      clientToken
    );
    revalidatePath("/dashboard");
    return { success: true };
  } catch (error: any) {
    return { success: false };
  }
}

export async function markAllNotificationsReadAction(
  clientToken?: string
): Promise<{ success: boolean }> {
  try {
    await fetcherWithAuth(
      "/notifications/read-all",
      {
        method: "PUT",
        throwOnError: true,
      },
      clientToken
    );
    revalidatePath("/dashboard");
    return { success: true };
  } catch (error: any) {
    return { success: false };
  }
}

export async function deleteNotificationAction(
  id: number,
  clientToken?: string
): Promise<{ success: boolean }> {
  try {
    await fetcherWithAuth(
      `/notifications/${id}`,
      {
        method: "DELETE",
        throwOnError: true,
      },
      clientToken
    );
    revalidatePath("/dashboard");
    return { success: true };
  } catch (error: any) {
    return { success: false };
  }
}

export async function broadcastNotificationAction(
  payload: {
    title: string;
    message: string;
    type?: "info" | "success" | "warning" | "error";
    link?: string;
    targetRole?: string;
  },
  clientToken?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const res = await fetcherWithAuth<{ success: boolean }>(
      "/notifications",
      {
        method: "POST",
        body: JSON.stringify(payload),
        throwOnError: true,
      },
      clientToken
    );
    return { success: res?.success ?? false };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
