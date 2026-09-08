"use server";

import { cookies } from "next/headers";
import { API_URL } from "./constants";

export interface FetcherOptions extends RequestInit {
  params?: Record<string, string | number | boolean | undefined>;
}

/**
 * Resolves the bearer token from cookies (SSR) or passed clientToken override
 */
export async function getAuthToken(clientToken?: string): Promise<string | undefined> {
  if (clientToken) return clientToken;
  try {
    const cookieStore = await cookies();
    return cookieStore.get("token")?.value;
  } catch {
    return undefined;
  }
}

/**
 * Resolves full URL with query parameters
 */
function buildUrl(endpoint: string, params?: Record<string, string | number | boolean | undefined>): string {
  let url = endpoint.startsWith("http")
    ? endpoint
    : `${API_URL}${endpoint.startsWith("/") ? "" : "/"}${endpoint}`;

  if (params) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null) searchParams.set(k, String(v));
    });
    const qs = searchParams.toString();
    if (qs) url += (url.includes("?") ? "&" : "?") + qs;
  }

  return url;
}

/**
 * Public fetcher for unauthenticated endpoints
 */
export async function fetcher<T = any>(
  endpoint: string,
  options: FetcherOptions = {}
): Promise<T | null> {
  const { params, headers = {}, ...rest } = options;
  const url = buildUrl(endpoint, params);

  try {
    const response = await fetch(url, {
      headers: {
        "Content-Type": "application/json",
        ...headers,
      },
      cache: "no-store",
      next: { revalidate: 0 },
      ...rest,
    });

    if (!response.ok) return null;
    return (await response.json()) as T;
  } catch (err) {
    console.error(`fetcher error [${endpoint}]:`, err);
    return null;
  }
}

/**
 * Authenticated fetcher that automatically attaches Bearer token from cookies / clientToken
 * and applies cache: "no-store" & next: { revalidate: 0 }
 */
export async function fetcherWithAuth<T = any>(
  endpoint: string,
  options: FetcherOptions = {},
  clientToken?: string
): Promise<T | null> {
  const token = await getAuthToken(clientToken);
  const authHeaders: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {};

  return fetcher<T>(endpoint, {
    ...options,
    headers: {
      ...authHeaders,
      ...(options.headers || {}),
    },
  });
}
