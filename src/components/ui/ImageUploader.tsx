"use client";

import React, { useRef, useState, DragEvent } from "react";
import { FaCloudUploadAlt } from "react-icons/fa";
import { MdClose } from "react-icons/md";

interface ImageUploaderProps {
  onUpload: (base64: string | null) => void;
  preview?: string | null;
  label?: string;
  height?: string;
}

const DEFAULT_HEIGHT = "h-80";

const ImageUploader: React.FC<ImageUploaderProps> = ({
  onUpload,
  preview,
  label = "Upload Image",
  height = DEFAULT_HEIGHT,
}) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(preview ?? null);
  const [ratioMsg, setRatioMsg] = useState<string>("");

  const TARGET_RATIO = 2.06; // 663 / 322
  const RATIO_TOLERANCE = 0.05; // allow small deviation

  const fileToBase64 = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (err) => reject(err);
    });

  const handleFileChange = async (file: File) => {
    try {
      // Validate image ratio before converting
      setRatioMsg("");
      const img = new Image();
      img.src = URL.createObjectURL(file);

      img.onload = async () => {
        const ratio = img.width / img.height;
        const withinRange =
          ratio > TARGET_RATIO - RATIO_TOLERANCE &&
          ratio < TARGET_RATIO + RATIO_TOLERANCE;

        if (!withinRange) {
          setRatioMsg(
            `Invalid image ratio! Expected around 663×322 (≈2.06:1). Your image is ${img.width}×${img.height}.`
          );
          if (fileInputRef.current) fileInputRef.current.value = "";
          return;
        }

        // ratio is valid, proceed
        const base64 = await fileToBase64(file);
        setPreviewUrl(base64);
        onUpload(base64);
      };
    } catch (err) {
      console.error("Image to base64 failed:", err);
    }
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
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
    const file = e.dataTransfer.files?.[0];
    if (file) handleFileChange(file);
  };

  const handleRemoveImage = () => {
    setPreviewUrl(null);
    onUpload(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="flex flex-col gap-2 w-full">
      {label && (
        <label className="font-medium text-gray-700 text-sm select-none">
          {label}
        </label>
      )}

      <div
        className={`relative w-full ${height} border-2 border-dashed rounded-2xl flex items-center justify-center text-center cursor-pointer transition-all duration-200 overflow-hidden ${
          dragActive
            ? "border-[#dd6b01] bg-orange-50"
            : "border-gray-300 bg-gray-100 hover:border-[#dd6b01] hover:bg-orange-50/30"
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        {previewUrl ? (
          <>
            <img
              src={previewUrl}
              alt="preview"
              className="w-full h-full object-cover object-center"
              draggable={false}
            />
            <div className="absolute inset-0 pointer-events-none" />
            <div className="absolute top-3 right-3 pointer-events-auto">
              <button
                type="button"
                onClick={handleRemoveImage}
                className="bg-white/90 text-gray-700 hover:text-[#dd6b01] rounded-full p-2 shadow-md transition-colors duration-500 cursor-pointer"
                title="Remove image"
              >
                <MdClose size={18} />
              </button>
            </div>
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-black/40 text-red-500 font-medium text-xs rounded-md select-none">
              Click to replace
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center px-4 py-20">
            <FaCloudUploadAlt className="text-5xl text-[#dd6b01] mb-3" />
            <p className="text-gray-700 font-medium">Drag & drop image here</p>
            <p className="text-sm text-gray-500 mt-1">
              or click to upload (JPG, PNG)
            </p>
          </div>
        )}
      </div>

      <div className="flex items-center justify-start text-red-500 text-sm">
        <p>{ratioMsg ? ratioMsg : " "}</p>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFileChange(file);
        }}
      />
    </div>
  );
};

export default ImageUploader;
