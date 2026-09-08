"use client";

import React, { useRef, useState, useEffect, DragEvent } from "react";
import {
  FaCloudUploadAlt,
  FaSpinner,
  FaCamera,
  FaTrashAlt,
  FaSyncAlt,
  FaCheckCircle,
} from "react-icons/fa";
import { toast } from "sonner";
import { uploadFileToStorage } from "@/lib/utils/uploadClient";
import Image from "next/image";

export interface ImageUploaderProps {
  // New standard props
  value?: string | null;
  onChange?: (url: string | null) => void;
  // Backward-compatibility props
  preview?: string | null;
  onUpload?: (url: string | null) => void;

  variant?: "box" | "avatar" | "compact";
  label?: string;
  description?: string;
  height?: string;
  aspectRatio?: string;
  folder?: "avatars" | "exam-packs" | "questions" | "exams" | "banners" | "general" | string;
  maxSizeMB?: number;
  disabled?: boolean;
  className?: string;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({
  value,
  onChange,
  preview,
  onUpload,
  variant = "box",
  label,
  description,
  height = "h-56",
  aspectRatio,
  folder = "general",
  maxSizeMB = 1,
  disabled = false,
  className = "",
}) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgressText, setUploadProgressText] = useState("Uploading image...");

  // Synchronize internal state with either `value` or `preview`
  const activeUrl = value !== undefined ? value : preview !== undefined ? preview : null;
  const [internalPreview, setInternalPreview] = useState<string | null>(activeUrl ?? null);

  useEffect(() => {
    setInternalPreview(activeUrl ?? null);
  }, [activeUrl]);

  const triggerChange = (newUrl: string | null) => {
    setInternalPreview(newUrl);
    if (onChange) onChange(newUrl);
    if (onUpload) onUpload(newUrl);
  };

  const handleFile = async (file: File) => {
    if (disabled || isUploading) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please upload a valid image file (JPG, PNG, WebP, SVG).");
      return;
    }

    const fileSizeMB = (file.size / (1024 * 1024)).toFixed(2);

    // Client-side file size check before making any network calls
    if (file.size > maxSizeMB * 1024 * 1024) {
      toast.error(
        `Selected image (${fileSizeMB} MB) exceeds the ${maxSizeMB} MB limit. Please select a photo under ${maxSizeMB} MB or compress it.`
      );
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      return;
    }

    try {
      setIsUploading(true);
      setUploadProgressText("Uploading to cloud storage...");

      const res = await uploadFileToStorage(file, folder);

      if (res.success && res.url) {
        triggerChange(res.url);
        toast.success("Image uploaded successfully!");
      } else {
        const errorMsg = res.error || "Failed to upload image.";
        if (
          errorMsg.includes("Body exceeded") ||
          errorMsg.includes("body size limit") ||
          errorMsg.includes("413") ||
          errorMsg.includes("Payload Too Large") ||
          errorMsg.toLowerCase().includes("limit") ||
          errorMsg.toLowerCase().includes("exceed")
        ) {
          toast.error(
            `Image size (${fileSizeMB} MB) exceeds the ${maxSizeMB} MB limit. Please select a photo under ${maxSizeMB} MB or compress it.`
          );
        } else {
          toast.error(errorMsg);
        }
      }
    } catch (err: any) {
      console.error("Upload handler error:", err);
      const rawMsg = err?.message || String(err);
      if (
        rawMsg.includes("Body exceeded") ||
        rawMsg.includes("body size limit") ||
        rawMsg.includes("413") ||
        rawMsg.includes("Payload Too Large") ||
        rawMsg.toLowerCase().includes("limit") ||
        rawMsg.toLowerCase().includes("exceed")
      ) {
        toast.error(
          `Image size (${fileSizeMB} MB) exceeds the ${maxSizeMB} MB limit. Please select a photo under ${maxSizeMB} MB or compress it.`
        );
      } else {
        toast.error("Failed to upload image. Please try again with a photo under 1 MB.");
      }
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled && !isUploading) setDragActive(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (disabled || isUploading) return;
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (disabled || isUploading) return;
    triggerChange(null);
    toast.info("Image removed");
  };

  // ----------------------------------------------------
  // AVATAR VARIANT (Profile / User photos)
  // ----------------------------------------------------
  if (variant === "avatar") {
    return (
      <div className={`flex flex-col items-center gap-3 ${className}`}>
        {label && <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">{label}</label>}

        <div className="relative group">
          <div
            onClick={() => !disabled && !isUploading && fileInputRef.current?.click()}
            className={`w-32 h-32 rounded-full overflow-hidden border-4 cursor-pointer relative transition-all duration-300 shadow-md ${
              dragActive
                ? "border-[#dd6b01] scale-105"
                : "border-white ring-2 ring-gray-200 hover:ring-[#dd6b01]"
            } ${disabled ? "opacity-60 cursor-not-allowed" : ""}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            {internalPreview ? (
              <Image
                width={100}
                height={100}
                src={internalPreview}
                alt="Avatar"
                className="w-full h-full object-cover object-center"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-orange-50 to-orange-100 flex flex-col items-center justify-center text-[#dd6b01]">
                <FaCamera className="text-3xl opacity-70 mb-1" />
                <span className="text-[10px] font-semibold">Upload Photo</span>
              </div>
            )}

            {/* Hover / Uploading Overlay */}
            <div
              className={`absolute inset-0 bg-black/50 backdrop-blur-[2px] flex flex-col items-center justify-center text-white transition-opacity duration-200 ${
                isUploading ? "opacity-100" : "opacity-0 group-hover:opacity-100"
              }`}
            >
              {isUploading ? (
                <div className="flex flex-col items-center p-2 text-center">
                  <FaSpinner className="text-2xl animate-spin text-orange-400 mb-1" />
                  <span className="text-[10px] font-medium leading-tight">Uploading...</span>
                </div>
              ) : (
                <div className="flex flex-col items-center">
                  <FaSyncAlt className="text-lg mb-1" />
                  <span className="text-[11px] font-medium">{internalPreview ? "Change" : "Upload"}</span>
                </div>
              )}
            </div>
          </div>

         
        </div>

        {description ? (
          <p className="text-xs text-gray-500 text-center max-w-xs">{description}</p>
        ) : (
          <p className="text-[11px] text-gray-400 text-center">JPG, PNG, WebP (max {maxSizeMB} MB)</p>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          disabled={disabled || isUploading}
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFile(file);
          }}
        />
      </div>
    );
  }

  // ----------------------------------------------------
  // COMPACT VARIANT (Single-row or small thumbnail)
  // ----------------------------------------------------
  if (variant === "compact") {
    return (
      <div className={`flex flex-col gap-1.5 w-full ${className}`}>
        {label && <label className="text-xs font-bold text-gray-700">{label}</label>}

        <div className="flex items-center gap-3">
          <div
            onClick={() => !disabled && !isUploading && fileInputRef.current?.click()}
            className="w-16 h-16 rounded-xl border-2 border-dashed border-gray-300 hover:border-[#dd6b01] bg-gray-50 flex items-center justify-center overflow-hidden cursor-pointer relative shrink-0"
          >
            {isUploading ? (
              <FaSpinner className="text-[#dd6b01] animate-spin text-lg" />
            ) : internalPreview ? (
              <Image width={100} height={100} src={internalPreview} alt="Thumbnail" className="w-full h-full object-cover" />
            ) : (
              <FaCloudUploadAlt className="text-gray-400 text-2xl" />
            )}
          </div>

          <div className="flex-1 flex items-center gap-2">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={disabled || isUploading}
              className="px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-orange-50 text-[#dd6b01] hover:bg-orange-100 border border-orange-200 transition-colors"
            >
              {internalPreview ? "Change Image" : "Select Image"}
            </button>
            {internalPreview && !isUploading && (
              <button
                type="button"
                onClick={handleRemove}
                className="px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                Remove
              </button>
            )}
          </div>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          disabled={disabled || isUploading}
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFile(file);
          }}
        />
      </div>
    );
  }

  // ----------------------------------------------------
  // BOX VARIANT (Default: Drag & Drop Card / Banner)
  // ----------------------------------------------------
  return (
    <div className={`flex flex-col gap-2 w-full ${className}`}>
      {label && (
        <div className="flex items-center justify-between">
          <label className="text-sm font-semibold text-gray-800">{label}</label>
          {internalPreview && (
            <span className="inline-flex items-center gap-1 text-xs text-emerald-600 font-medium">
              <FaCheckCircle size={12} /> Uploaded
            </span>
          )}
        </div>
      )}

      <div
        className={`relative w-full ${height} ${aspectRatio || ""} border-2 border-dashed rounded-2xl flex items-center justify-center text-center cursor-pointer transition-all duration-300 overflow-hidden group ${
          dragActive
            ? "border-[#dd6b01] bg-orange-50/80 shadow-lg scale-[0.99]"
            : "border-gray-200 hover:border-[#dd6b01] bg-gray-50/80 hover:bg-orange-50/20"
        } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !disabled && !isUploading && fileInputRef.current?.click()}
      >
        {isUploading ? (
          <div className="flex flex-col items-center justify-center p-6 space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-orange-50 text-[#dd6b01] flex items-center justify-center shadow-inner">
              <FaSpinner className="text-3xl animate-spin" />
            </div>
            <div>
              <p className="text-gray-800 font-bold text-sm">{uploadProgressText}</p>
              <p className="text-xs text-gray-500 mt-0.5">Optimizing & transferring to cloud storage</p>
            </div>
          </div>
        ) : internalPreview ? (
          <>
            <Image
              width={100}
              height={100}
              src={internalPreview}
              alt="Preview"
              className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
              draggable={false}
            />
            {/* Dark glass overlay on hover */}
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-3 backdrop-blur-[2px]">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  fileInputRef.current?.click();
                }}
                className="px-4 py-2 bg-white text-gray-800 rounded-xl font-semibold text-xs shadow-lg hover:bg-gray-100 flex items-center gap-1.5 transition-transform hover:scale-105 cursor-pointer"
              >
                <FaSyncAlt size={12} className="text-[#dd6b01]" /> Change Image
              </button>
              <button
                type="button"
                onClick={handleRemove}
                className="px-4 py-2 bg-red-600 text-white rounded-xl font-semibold text-xs shadow-lg hover:bg-red-700 flex items-center gap-1.5 transition-transform hover:scale-105 cursor-pointer"
              >
                <FaTrashAlt size={12} /> Remove
              </button>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center px-6 py-10 space-y-3">
            <div className="w-16 h-16 rounded-2xl bg-orange-100/70 text-[#dd6b01] flex items-center justify-center group-hover:scale-110 group-hover:bg-[#dd6b01] group-hover:text-white transition-all duration-300 shadow-sm">
              <FaCloudUploadAlt className="text-3xl" />
            </div>
            <div>
              <p className="text-gray-800 font-semibold text-sm">
                Drag & drop your image here, or <span className="text-[#dd6b01] underline underline-offset-2">browse</span>
              </p>
              <p className="text-xs text-gray-400 mt-1">
                Supports JPG, PNG, WebP or SVG up to {maxSizeMB}MB
              </p>
            </div>
          </div>
        )}
      </div>

      {description && <p className="text-xs text-gray-500">{description}</p>}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        disabled={disabled || isUploading}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
        }}
      />
    </div>
  );
};

export default ImageUploader;
