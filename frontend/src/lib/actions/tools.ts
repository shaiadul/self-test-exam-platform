"use server";

import { revalidatePath } from "next/cache";
import { fetcherWithAuth } from "./fetcher";

export interface CacheStatusInfo {
  connected: boolean;
  provider: string;
  status: string;
  details: string;
}

export interface RequestCategoryInfo {
  key: string;
  name: string;
  description: string;
  total: number;
  pending: number;
  approved: number;
  rejected: number;
  breakdown?: Record<string, number>;
}

export interface RequestApprovalOverview {
  totalRequests: number;
  totalPending: number;
  totalResolved: number;
  categories: RequestCategoryInfo[];
}

export interface ToolsOverview {
  cache: CacheStatusInfo;
  requests: RequestApprovalOverview;
}

export interface ClearRequestResult {
  target: string;
  scope: string;
  totalDeleted: number;
  details: Record<string, number>;
  message: string;
}

export async function getToolsOverviewAction(clientToken?: string): Promise<ToolsOverview | null> {
  try {
    const data = await fetcherWithAuth<ToolsOverview>(
      "/admin/tools/overview",
      { throwOnError: true },
      clientToken
    );
    return data;
  } catch (error: any) {
    console.error("Failed to fetch tools overview:", error);
    return null;
  }
}

export async function clearBackendCacheAction(clientToken?: string): Promise<{
  success: boolean;
  message?: string;
  error?: string;
}> {
  try {
    const res = await fetcherWithAuth<{ success: boolean; message: string }>(
      "/admin/tools/cache/clear",
      {
        method: "POST",
        throwOnError: true,
      },
      clientToken
    );

    revalidatePath("/dashboard/settings/tools");
    revalidatePath("/dashboard/requests");
    revalidatePath("/dashboard");

    return {
      success: true,
      message: res?.message || "Backend cache successfully cleared.",
    };
  } catch (error: any) {
    return {
      success: false,
      error: error?.message || "Failed to clear backend cache.",
    };
  }
}

export async function clearRequestApprovalDataAction(
  payload: {
    target?: "all" | "quota" | "institution" | string;
    scope?: "all" | "resolved" | "pending" | string;
  } = {},
  clientToken?: string
): Promise<{
  success: boolean;
  result?: ClearRequestResult;
  error?: string;
}> {
  try {
    const res = await fetcherWithAuth<ClearRequestResult>(
      "/admin/tools/requests/clear",
      {
        method: "POST",
        body: JSON.stringify({
          target: payload.target || "quota",
          scope: payload.scope || "all",
        }),
        throwOnError: true,
      },
      clientToken
    );

    revalidatePath("/dashboard/settings/tools");
    revalidatePath("/dashboard/requests");
    revalidatePath("/dashboard");

    return {
      success: true,
      result: res || undefined,
    };
  } catch (error: any) {
    return {
      success: false,
      error: error?.message || "Failed to purge request approval data.",
    };
  }
}
