"use client";

import React, { useState } from "react";
import { FiShare2, FiCheck } from "react-icons/fi";
import { toast } from "sonner";
import { cn } from "../../lib/utils";

export interface ShareMetadata {
  title: string;
  text?: string;
  url?: string;
  path?: string;
}

export type ShareBtnVariant = "action" | "glass" | "pill" | "outline" | "primary" | "ghost";
export type ShareBtnSize = "xs" | "sm" | "md" | "lg";

export interface ShareBtnProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  metadata: ShareMetadata;
  variant?: ShareBtnVariant;
  size?: ShareBtnSize;
  showLabel?: boolean;
  label?: string;
  copiedLabel?: string;
  showTooltip?: boolean;
  onSuccess?: (url: string) => void;
  onError?: (err: any) => void;
}

/**
 * Resolves the absolute route base from environment variables.
 * Prioritizes NEXT_PUBLIC_APP_URL, then NEXT_PUBLIC_SITE_URL, then browser origin.
 */
export const getRouteBaseUrl = (): string => {
  if (typeof process !== "undefined" && process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL.replace(/\/$/, "");
  }
  if (typeof process !== "undefined" && process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, "");
  }
  if (typeof window !== "undefined" && window.location?.origin) {
    return window.location.origin;
  }
  return "http://localhost:3000";
};

/**
 * Normalizes relative route path into an absolute URL using the route base from env.
 */
export const formatShareUrl = (urlOrPath?: string): string => {
  if (!urlOrPath) {
    return typeof window !== "undefined" ? window.location.href : getRouteBaseUrl();
  }
  if (urlOrPath.startsWith("http://") || urlOrPath.startsWith("https://")) {
    return urlOrPath;
  }
  const base = getRouteBaseUrl();
  const cleanPath = urlOrPath.startsWith("/") ? urlOrPath : `/${urlOrPath}`;
  return `${base}${cleanPath}`;
};

// Size styles for icon-only action / glass buttons
const iconActionSizeClasses: Record<ShareBtnSize, string> = {
  xs: "h-7 w-7 min-w-7 text-xs rounded",
  sm: "h-[30px] w-[30px] min-w-[30px] text-xs rounded",
  md: "h-[38px] w-[38px] min-w-[38px] text-sm rounded",
  lg: "h-10 w-10 min-w-10 text-base rounded-md",
};

// Size styles for glass circular buttons
const glassSizeClasses: Record<ShareBtnSize, string> = {
  xs: "h-6.5 w-6.5 min-w-6.5 text-[11px] rounded-full",
  sm: "h-7.5 w-7.5 min-w-7.5 text-xs rounded-full",
  md: "h-9 w-9 min-w-9 text-sm rounded-full",
  lg: "h-10 w-10 min-w-10 text-base rounded-full",
};

// Size styles when label is visible
const labelSizeClasses: Record<ShareBtnSize, string> = {
  xs: "h-7 px-2 text-[11px] rounded gap-1.5",
  sm: "h-[30px] px-2.5 text-xs rounded gap-1.5",
  md: "h-[38px] px-3.5 text-xs sm:text-sm rounded gap-2",
  lg: "h-10 px-4 text-sm rounded-md gap-2",
};

export const ShareBtn: React.FC<ShareBtnProps> = ({
  metadata,
  variant = "action",
  size = "sm",
  showLabel = false,
  label = "Share",
  copiedLabel = "Copied!",
  showTooltip = true,
  className,
  onSuccess,
  onError,
  onClick,
  ...props
}) => {
  const [copied, setCopied] = useState(false);

  const handleShare = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();

    onClick?.(e);

    const shareUrl = formatShareUrl(metadata.url || metadata.path);
    const shareData = {
      title: metadata.title,
      text: metadata.text || metadata.title,
      url: shareUrl,
    };

    // 1. Native Web Share API
    if (
      typeof navigator !== "undefined" &&
      typeof navigator.share === "function" &&
      (!navigator.canShare || navigator.canShare(shareData))
    ) {
      try {
        await navigator.share(shareData);
        toast.success("Shared successfully!");
        onSuccess?.(shareUrl);
        return;
      } catch (err: any) {
        if (err?.name === "AbortError") {
          return;
        }
      }
    }

    // 2. Clipboard fallback
    try {
      if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(shareUrl);
      } else {
        const textArea = document.createElement("textarea");
        textArea.value = shareUrl;
        textArea.style.position = "fixed";
        textArea.style.opacity = "0";
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand("copy");
        document.body.removeChild(textArea);
      }

      setCopied(true);
      toast.success("Exam link copied to clipboard!");
      onSuccess?.(shareUrl);

      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (err: any) {
      toast.error("Failed to copy link to clipboard.");
      onError?.(err);
    }
  };

  // Determine size classes
  let sizeClass = labelSizeClasses[size];
  if (!showLabel) {
    sizeClass = variant === "glass" ? glassSizeClasses[size] : iconActionSizeClasses[size];
  }

  // Variant design classes
  let variantClass = "";
  switch (variant) {
    case "action":
      variantClass = copied
        ? "bg-emerald-50 text-emerald-600 border border-emerald-300 shadow-2xs"
        : "bg-white text-slate-500 border border-slate-200/90 hover:border-primary/50 hover:text-primary hover:bg-primary/5 shadow-2xs";
      break;
    case "glass":
      variantClass = copied
        ? "bg-emerald-600 text-white shadow-xs border border-emerald-500"
        : "bg-white/90 hover:bg-white text-slate-700 hover:text-primary backdrop-blur-md shadow-xs border border-white/60 hover:scale-105";
      break;
    case "pill":
      variantClass = copied
        ? "bg-emerald-50 text-emerald-700 border border-emerald-300 rounded-full shadow-2xs"
        : "bg-white text-slate-700 border border-slate-200/90 hover:border-primary/50 hover:text-primary hover:bg-primary/5 rounded-full shadow-2xs";
      break;
    case "outline":
      variantClass = copied
        ? "bg-emerald-50 text-emerald-600 border border-emerald-300 shadow-2xs"
        : "bg-white text-slate-700 border border-slate-200/90 hover:border-primary/50 hover:text-primary hover:bg-primary/5 shadow-2xs";
      break;
    case "primary":
      variantClass = copied
        ? "bg-emerald-600 text-white shadow-xs"
        : "bg-primary hover:bg-primary-dark text-white shadow-xs";
      break;
    case "ghost":
      variantClass = copied
        ? "bg-emerald-50 text-emerald-600"
        : "bg-transparent text-slate-500 hover:text-primary hover:bg-slate-100/80";
      break;
  }

  return (
    <button
      type="button"
      onClick={handleShare}
      title={copied ? "Link Copied!" : props.title || `Share ${metadata.title}`}
      aria-label={props["aria-label"] || `Share ${metadata.title}`}
      className={cn(
        "relative inline-flex items-center justify-center font-medium transition-all duration-200 cursor-pointer active:scale-95 shrink-0 group select-none",
        sizeClass,
        variantClass,
        className
      )}
      {...props}
    >
      {/* Icon with smooth transition */}
      {copied ? (
        <FiCheck
          className={cn(
            "text-emerald-500 shrink-0 transition-all duration-200 scale-110",
            variant === "primary" || (variant === "glass" && copied) ? "text-white" : ""
          )}
        />
      ) : (
        <FiShare2
          className="shrink-0 transition-transform duration-200 group-hover:scale-110 group-hover:-rotate-6"
        />
      )}

      {/* Optional Label */}
      {showLabel && (
        <span className="font-semibold whitespace-nowrap transition-colors">
          {copied ? copiedLabel : label}
        </span>
      )}

      {/* Floating Mini Tooltip on Copied State */}
      {showTooltip && copied && (
        <span className="absolute -top-7 left-1/2 -translate-x-1/2 px-1.5 py-0.5 bg-slate-900/95 text-white text-[9px] font-mono font-bold rounded shadow-md pointer-events-none whitespace-nowrap z-30 animate-in fade-in zoom-in-95 duration-150">
          Copied!
          <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-slate-900/95 rotate-45" />
        </span>
      )}
    </button>
  );
};
