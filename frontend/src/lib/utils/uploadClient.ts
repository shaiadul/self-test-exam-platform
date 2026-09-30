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
 * 1. Direct browser-to-backend API upload — works without bucket CORS setup
 * 2. Fast direct browser-to-bucket PUT via presigned URL (needs bucket CORS)
 * 3. Seamless server action direct upload fallback
 */
export async function uploadFileToStorage(
  file: File,
  folder: string = "general"
): Promise<UploadResult> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api";

  const formData = new FormData();
  formData.append("file", file);
  formData.append("folder", folder);

  try {
    // 1. Direct upload via the backend API with HTTP cookie credentials.
    //    The backend uploads to the bucket server-side.
    try {
      const apiRes = await fetch(`${apiUrl}/uploads/direct`, {
        method: "POST",
        credentials: "include",
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
      }
    } catch (apiErr) {
      console.warn("Backend direct upload failed, trying presigned URL:", apiErr);
    }

    // 2. Fast path: browser uploads straight to the bucket via presigned URL.
    //    Requires the bucket to allow PUT from this origin (CORS).
    const presignRes = await getPresignedUrlAction(file.name, file.type, folder);
    if (presignRes.success && presignRes.uploadUrl && presignRes.publicUrl) {
      try {
        const uploadRes = await fetch(presignRes.uploadUrl, {
          method: "PUT",
          headers: { "Content-Type": file.type },
          body: file,
        });

        if (uploadRes.ok) {
          return {
            success: true,
            url: presignRes.publicUrl,
            key: presignRes.key,
          };
        }
      } catch {
        // Bucket CORS/network blocked the direct PUT — fall through silently.
      }
    }

    // 3. Fallback: server action direct upload
    const directRes = await directUploadAction(formData);
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
