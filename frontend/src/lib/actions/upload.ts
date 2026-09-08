"use server";

import { API_URL } from "./constants";
import { getAuthHeader } from "./common";

export interface PresignResponse {
  success: boolean;
  uploadUrl?: string;
  publicUrl?: string;
  key?: string;
  error?: string;
}

export async function getPresignedUrlAction(
  fileName: string,
  contentType: string,
  folder: string = "general",
  clientToken?: string
): Promise<PresignResponse> {
  try {
    const authHeader = await getAuthHeader();
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...authHeader,
    };
    if (clientToken) {
      headers["Authorization"] = `Bearer ${clientToken}`;
    }

    const res = await fetch(`${API_URL}/uploads/presign`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        fileName,
        contentType,
        folder,
      }),
      cache: "no-store",
    });

    const data = await res.json();
    if (!res.ok) {
      return {
        success: false,
        error: data.error || "Failed to generate presigned upload URL",
      };
    }

    return {
      success: true,
      uploadUrl: data.uploadUrl,
      publicUrl: data.publicUrl,
      key: data.key,
    };
  } catch (err: any) {
    return {
      success: false,
      error: err.message || "Failed to request upload signature",
    };
  }
}

export async function directUploadAction(
  formData: FormData,
  clientToken?: string
): Promise<PresignResponse> {
  try {
    const authHeader = await getAuthHeader();
    const headers: Record<string, string> = {
      ...authHeader,
    };
    if (clientToken) {
      headers["Authorization"] = `Bearer ${clientToken}`;
    }

    const res = await fetch(`${API_URL}/uploads/direct`, {
      method: "POST",
      headers,
      body: formData,
      cache: "no-store",
    });

    const data = await res.json();
    if (!res.ok) {
      return {
        success: false,
        error: data.error || "Failed to upload image directly",
      };
    }

    return {
      success: true,
      publicUrl: data.publicUrl,
      key: data.key,
    };
  } catch (err: any) {
    return {
      success: false,
      error: err.message || "Direct upload failed",
    };
  }
}

