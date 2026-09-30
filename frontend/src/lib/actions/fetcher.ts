"use server";

import { cookies } from "next/headers";
import { API_URL } from "./constants";

export interface FetcherOptions extends Omit<RequestInit, "next"> {
  params?: Record<string, string | number | boolean | undefined>;
  throwOnError?: boolean;
  next?: {
    revalidate?: number | false;
    tags?: string[];
  };
}

/**
 * Resolves the bearer token directly from HTTP cookies.
 * Falls back to clientToken override if provided.
 */
export async function getAuthToken(clientToken?: string): Promise<string | undefined> {
  try {
    const cookieStore = await cookies();
    const cookieToken =
      cookieStore.get("token")?.value ||
      cookieStore.get("authjs.session-token")?.value ||
      cookieStore.get("__Secure-authjs.session-token")?.value ||
      cookieStore.get("next-auth.session-token")?.value ||
      cookieStore.get("__Secure-next-auth.session-token")?.value;

    if (cookieToken) {
      return cookieToken;
    }
  } catch {
    // cookies() unavailable outside request context
  }

  return clientToken;
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
  const { params, headers = {}, throwOnError = false, cache, next, ...rest } = options;
  const url = buildUrl(endpoint, params);

  const fetchOptions: RequestInit & {
    next?: { revalidate?: number | false; tags?: string[] };
  } = {
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },
    ...rest,
  };

  // Dynamic next & cache configuration:
  if (next !== undefined) {
    fetchOptions.next = next;
  }

  // If cache is explicitly provided, use it.
  // When next is omitted, default to dynamic "no-store" to ensure real-time consistency.
  if (cache !== undefined) {
    fetchOptions.cache = cache;
  } else if (next === undefined) {
    fetchOptions.cache = "no-store";
  }

  let response: Response;
  try {
    response = await fetch(url, fetchOptions);
  } catch (err: any) {
    if (
      err?.digest === "DYNAMIC_SERVER_USAGE" ||
      (typeof err?.message === "string" && err.message.includes("DYNAMIC_SERVER_USAGE"))
    ) {
      throw err;
    }
    console.error(`fetcher network error [${endpoint}]:`, err);
    if (throwOnError) throw new Error("Network error while contacting the server.");
    return null;
  }

  if (!response.ok) {
    if (throwOnError) throw await httpErrorFromResponse(response);
    return null;
  }

  try {
    return (await response.json()) as T;
  } catch {
    // Some endpoints return 204/empty bodies on success.
    return null;
  }
}

async function httpErrorFromResponse(response: Response): Promise<Error> {
  let message = `Request failed with status ${response.status}`;
  try {
    const body = await response.json();
    if (body && typeof body.error === "string" && body.error.trim()) {
      message = body.error.trim();
    }
  } catch {
    // body was not JSON; fall back to the generic message
  }
  return new Error(message);
}

/**
 * Authenticated fetcher that automatically attaches Bearer token from HTTP cookies.
 * The caller does NOT need to pass or extract tokens. Dynamic cache and next options are respected.
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
