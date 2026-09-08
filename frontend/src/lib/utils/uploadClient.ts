import { getPresignedUrlAction, directUploadAction } from "../actions/upload";

export interface UploadResult {
  success: boolean;
  url?: string;
  key?: string;
  error?: string;
}

/**
 * Uploads a file to storage (Cloudflare R2 / S3 / IDrive e2).
 * Priority:
 * 1. Fast direct browser-to-bucket PUT via presigned URL
 * 2. Automatic seamless fallback to backend direct multipart upload if browser CORS/network blocks PUT
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
        console.warn("Direct presigned PUT failed (likely CORS or network), falling back to server upload:", directErr);
      }
    }

    // 3. Fallback: Server-side direct upload
    const formData = new FormData();
    formData.append("file", file);
    formData.append("folder", folder);

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
      error: directRes.error || presignRes.error || "Failed to upload image",
    };
  } catch (err: any) {
    return {
      success: false,
      error: err.message || "Failed to upload file to storage",
    };
  }
}

