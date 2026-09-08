import { getPresignedUrlAction, directUploadAction } from "../actions/upload";

export interface UploadResult {
  success: boolean;
  url?: string;
  key?: string;
  error?: string;
}

function formatUploadError(rawError?: string): string {
  if (!rawError) return "Failed to upload image. Please try again.";
  if (
    rawError.includes("Body exceeded") ||
    rawError.includes("body size limit") ||
    rawError.includes("413") ||
    rawError.includes("Payload Too Large")
  ) {
    return "Image size exceeds the 1 MB limit. Please select a photo under 1 MB or compress it.";
  }
  return rawError;
}

/**
 * Uploads a file to storage (Cloudflare R2 / S3 / IDrive e2).
 * Priority:
 * 1. Fast direct browser-to-bucket PUT via presigned URL
 * 2. Direct browser-to-backend API upload (avoids Next.js server action body size limits)
 * 3. Seamless server action direct upload fallback
 */
export async function uploadFileToStorage(
  file: File,
  folder: string = "general"
): Promise<UploadResult> {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") || undefined : undefined;

  try {
    // 1. Request presigned upload URL from backend
    const presignRes = await getPresignedUrlAction(file.name, file.type, folder, token);

    if (presignRes.success && presignRes.uploadUrl && presignRes.publicUrl) {
      try {
        // 2. Direct browser upload to bucket
        const uploadRes = await fetch(presignRes.uploadUrl, {
          method: "PUT",
          headers: {
            "Content-Type": file.type,
          },
          body: file,
        });

        if (uploadRes.ok) {
          return {
            success: true,
            url: presignRes.publicUrl,
            key: presignRes.key,
          };
        }
      } catch (directErr) {
        console.warn("Direct presigned PUT failed, falling back to direct API upload:", directErr);
      }
    }

    // 3. Fallback: Direct upload to backend API (bypasses Server Action body limits)
    const formData = new FormData();
    formData.append("file", file);
    formData.append("folder", folder);

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api";
    try {
      const apiRes = await fetch(`${apiUrl}/uploads/direct`, {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData,
      });

      if (apiRes.ok) {
        const data = await apiRes.json();
        if (data.publicUrl) {
          return {
            success: true,
            url: data.publicUrl,
            key: data.key,
          };
        }
      } else {
        const data = await apiRes.json().catch(() => ({}));
        if (data.error) {
          console.warn("Direct API upload returned error:", data.error);
        }
      }
    } catch (apiErr) {
      console.warn("Direct API upload network error, trying server action:", apiErr);
    }

    // 4. Fallback: Server-side action direct upload
    const directRes = await directUploadAction(formData, token);
    if (directRes.success && directRes.publicUrl) {
      return {
        success: true,
        url: directRes.publicUrl,
        key: directRes.key,
      };
    }

    return {
      success: false,
      error: formatUploadError(directRes.error || presignRes.error),
    };
  } catch (err: any) {
    return {
      success: false,
      error: formatUploadError(err.message),
    };
  }
}
