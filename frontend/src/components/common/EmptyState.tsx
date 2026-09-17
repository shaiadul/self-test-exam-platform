"use client";

import React from "react";
import Link from "next/link";
import { FaArrowRight } from "react-icons/fa";

interface EmptyStateProps {
  title?: string;
  description?: string;
  actionLabel?: string;
  actionHref?: string;
  onAction?: () => void;
  type?: "exam" | "tasks" | "reports" | "general";
  compact?: boolean;
  className?: string;
}

export default function EmptyState({
  title = "No Data Available",
  description = "There are currently no records or entries to display in this view.",
  actionLabel,
  actionHref,
  onAction,
  type = "general",
  compact = false,
  className = "",
}: EmptyStateProps) {
  return (
    <div
      className={`relative overflow-hidden w-full flex flex-col items-center justify-center text-center select-none ${
        compact ? "py-6 px-3" : "py-10 sm:py-14 px-4 sm:px-6"
      } ${className}`}
    >
      {/* Background SVG Telemetry Matrix Grid */}
      <svg
        className="absolute inset-0 w-full h-full opacity-[0.035] pointer-events-none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <pattern
            id="empty-state-grid"
            width="24"
            height="24"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M 24 0 L 0 0 0 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="0.8"
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#empty-state-grid)" />
      </svg>

      {/* Main SVG Vector Graphic */}
      <div className={`relative ${compact ? "w-20 h-20 mb-2" : "w-28 h-28 sm:w-32 sm:h-32 mb-4"}`}>
        {type === "exam" ? (
          <svg
            viewBox="0 0 160 160"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full h-full drop-shadow-xs"
          >
            {/* Ambient Back Glow */}
            <circle cx="80" cy="80" r="54" className="fill-orange-500/10" />
            
            {/* Tech Ring & Ticks */}
            <circle
              cx="80"
              cy="80"
              r="62"
              stroke="currentColor"
              strokeWidth="1.2"
              strokeDasharray="4 6"
              className="text-slate-300"
            />
            <circle
              cx="80"
              cy="80"
              r="70"
              stroke="currentColor"
              strokeWidth="0.8"
              strokeDasharray="2 12"
              className="text-slate-400/70"
            />

            {/* Back Card Plate */}
            <rect
              x="52"
              y="32"
              width="68"
              height="90"
              rx="4"
              className="fill-slate-100 stroke-slate-300"
              strokeWidth="1.5"
            />

            {/* Main Exam Clipboard */}
            <rect
              x="42"
              y="42"
              width="74"
              height="94"
              rx="4"
              className="fill-white stroke-slate-300"
              strokeWidth="1.5"
            />

            {/* Top Clip */}
            <rect
              x="62"
              y="36"
              width="34"
              height="12"
              rx="2"
              className="fill-slate-800 stroke-slate-900"
              strokeWidth="1"
            />
            <circle cx="79" cy="42" r="2.5" className="fill-slate-200" />

            {/* Content Lines */}
            <rect x="52" y="58" width="38" height="4" rx="1.5" className="fill-orange-500" />
            <rect x="52" y="68" width="54" height="3" rx="1" className="fill-slate-200" />
            <rect x="52" y="76" width="46" height="3" rx="1" className="fill-slate-200" />
            
            {/* Radio Items */}
            <circle cx="56" cy="89" r="3.5" className="fill-emerald-50 stroke-emerald-500" strokeWidth="1" />
            <rect x="63" y="87.5" width="32" height="3" rx="1" className="fill-slate-300" />
            
            <circle cx="56" cy="100" r="3.5" className="fill-slate-50 stroke-slate-300" strokeWidth="1" />
            <rect x="63" y="98.5" width="26" height="3" rx="1" className="fill-slate-200" />

            <circle cx="56" cy="111" r="3.5" className="fill-slate-50 stroke-slate-300" strokeWidth="1" />
            <rect x="63" y="109.5" width="38" height="3" rx="1" className="fill-slate-200" />

            {/* Floating Scanner / Target Reticle */}
            <circle cx="112" cy="106" r="14" className="fill-white stroke-orange-500" strokeWidth="1.5" />
            <circle cx="112" cy="106" r="9" className="fill-orange-500/15" />
            <path
              d="M107 106h10M112 101v10"
              stroke="#dd6b01"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
        ) : type === "tasks" ? (
          <svg
            viewBox="0 0 160 160"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full h-full drop-shadow-xs"
          >
            <circle cx="80" cy="80" r="54" className="fill-blue-500/10" />
            <circle
              cx="80"
              cy="80"
              r="62"
              stroke="currentColor"
              strokeWidth="1.2"
              strokeDasharray="4 6"
              className="text-blue-200"
            />
            {/* Box Stack */}
            <rect
              x="44"
              y="48"
              width="72"
              height="74"
              rx="4"
              className="fill-white stroke-slate-300"
              strokeWidth="1.5"
            />
            <path
              d="M56 68l6 6 12-12"
              stroke="#22c55e"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <rect x="80" y="68" width="26" height="3.5" rx="1" className="fill-slate-300" />
            
            <path
              d="M56 88l6 6 12-12"
              stroke="#22c55e"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <rect x="80" y="88" width="22" height="3.5" rx="1" className="fill-slate-300" />

            <circle cx="62" cy="108" r="4.5" className="fill-slate-100 stroke-slate-300" strokeWidth="1" />
            <rect x="76" y="106" width="30" height="3.5" rx="1" className="fill-slate-200" />
          </svg>
        ) : (
          <svg
            viewBox="0 0 160 160"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full h-full drop-shadow-xs"
          >
            <circle cx="80" cy="80" r="54" className="fill-slate-200/50" />
            <circle
              cx="80"
              cy="80"
              r="64"
              stroke="currentColor"
              strokeWidth="1"
              strokeDasharray="4 8"
              className="text-slate-300"
            />
            <rect
              x="46"
              y="44"
              width="68"
              height="80"
              rx="4"
              className="fill-white stroke-slate-300"
              strokeWidth="1.5"
            />
            {/* Empty Folder Notch */}
            <path
              d="M56 56h18l6 6h24v46H56V56z"
              className="fill-slate-50 stroke-slate-200"
              strokeWidth="1.2"
            />
            <circle cx="80" cy="85" r="8" className="fill-slate-100 stroke-slate-300" strokeWidth="1" />
            <path d="M77 85h6M80 82v6" stroke="#94a3b8" strokeWidth="1.2" strokeLinecap="round" />
          </svg>
        )}
      </div>

      {/* Text Info */}
      <h4
        className={`font-bold text-slate-800 tracking-tight ${
          compact ? "text-xs mb-0.5" : "text-sm sm:text-base mb-1"
        }`}
      >
        {title}
      </h4>
      <p
        className={`text-slate-500 font-medium leading-relaxed max-w-sm ${
          compact ? "text-[11px] mb-2" : "text-xs mb-4"
        }`}
      >
        {description}
      </p>

      {/* Action CTA if provided */}
      {actionLabel && (actionHref || onAction) && (
        <div className="pt-1">
          {actionHref ? (
            <Link
              href={actionHref}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-primary hover:bg-primary-dark text-white font-mono font-bold text-xs shadow-xs transition-colors"
            >
              <span>{actionLabel}</span>
              <FaArrowRight className="text-[10px]" />
            </Link>
          ) : (
            <button
              type="button"
              onClick={onAction}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-primary hover:bg-primary-dark text-white font-mono font-bold text-xs shadow-xs transition-colors cursor-pointer"
            >
              <span>{actionLabel}</span>
              <FaArrowRight className="text-[10px]" />
            </button>
          )}
        </div>
      )}
    </div>
  );
}
