"use client";

import Image from "next/image";
import Link from "next/link";
import {
  FaGraduationCap,
  FaUniversity,
  FaLayerGroup,
  FaCalendarAlt,
  FaCheckCircle,
  FaUserEdit,
} from "react-icons/fa";

interface UserCardProps {
  name: string;
  board: string;
  level: string;
  batch: string;
  institution: string;
  image: string;
}

export default function UserCard({
  name,
  board,
  level,
  batch,
  institution,
  image,
}: UserCardProps) {
  const displayInitials = name
    ? name
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map((n) => n[0])
        .join("")
        .toUpperCase()
    : "U";

  return (
    <div className="relative overflow-hidden rounded bg-white border border-slate-200/80 shadow-2xs hover:shadow-xs hover:border-primary/40 transition-all duration-150 p-4 sm:p-4.5 flex flex-col justify-between h-full group">
      {/* Ambient background decoration */}
      <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-bl from-primary/10 via-amber-500/5 to-transparent rounded-full blur-3xl pointer-events-none -mr-10 -mt-10" />

      {/* Subtle Coordinate / Grid SVG Telemetry Watermark */}
      <svg
        className="absolute right-0 bottom-0 w-48 h-32 text-slate-700 opacity-[0.03] pointer-events-none"
        viewBox="0 0 200 120"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <pattern id="user-telemetry-grid" width="16" height="16" patternUnits="userSpaceOnUse">
          <circle cx="8" cy="8" r="0.8" fill="currentColor" />
        </pattern>
        <rect width="100%" height="100%" fill="url(#user-telemetry-grid)" />
        <path d="M0 60 L60 60 L80 30 L100 90 L120 60 L200 60" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
        <circle cx="80" cy="30" r="3" fill="currentColor" />
        <circle cx="100" cy="90" r="3" fill="currentColor" />
      </svg>

      <div className="relative z-10 flex flex-col sm:flex-row items-center sm:items-start gap-3.5">
        {/* Avatar with subtle ring & verification status */}
        <div className="relative shrink-0">
          <div className="relative p-0.5 rounded bg-slate-200 shadow-2xs">
            <div className="relative w-18 h-18 sm:w-20 sm:h-20 rounded overflow-hidden bg-slate-100 flex items-center justify-center border border-white">
              {image && (image.startsWith("/") || image.startsWith("http")) ? (
                <Image
                  src={image}
                  alt={name || "User Avatar"}
                  fill
                  sizes="(max-width: 640px) 72px, 80px"
                  className="object-cover group-hover:scale-105 transition-transform duration-200"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/15 to-amber-50 text-primary text-xl font-black font-mono">
                  {displayInitials}
                </div>
              )}
            </div>
          </div>
          {/* Verified status pin */}
          <div
            className="absolute -bottom-1 -right-1 bg-white p-0.5 rounded shadow-2xs text-emerald-600"
            title="Verified Portal Account"
          >
            <FaCheckCircle className="text-xs" />
          </div>
        </div>

        {/* User Identity & Info Details */}
        <div className="flex-1 text-center sm:text-left min-w-0">
          {/* Top Status row */}
          <div className="flex flex-wrap items-center justify-center sm:justify-between gap-2 mb-1">
            <div className="inline-flex items-center gap-1.5 px-1.5 py-0.5 rounded bg-emerald-50 border border-emerald-200/80 text-emerald-700 text-[10px] font-mono font-bold tracking-wide">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              Active Profile
            </div>
            <Link
              href="/dashboard/edit-profile"
              className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-primary transition-colors group/edit"
            >
              <FaUserEdit className="text-xs group-hover/edit:scale-105 transition-transform" />
              <span>Edit</span>
            </Link>
          </div>

          <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight mb-0.5 truncate">
            {name || "Candidate"}
          </h2>

          {institution && (
            <p className="text-slate-600 text-xs font-medium flex items-center justify-center sm:justify-start gap-1.5 mb-2 truncate">
              <FaUniversity className="text-primary shrink-0 text-[11px]" />
              <span className="truncate">{institution}</span>
            </p>
          )}

          {/* Metadata Badges */}
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-1 pt-0.5">
            {level && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-50 hover:bg-primary/5 border border-slate-200/80 text-slate-700 hover:text-primary text-[10px] font-mono font-semibold transition-colors">
                <FaGraduationCap className="text-primary text-[10px]" />
                {level}
              </span>
            )}
            {board && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-50 hover:bg-primary/5 border border-slate-200/80 text-slate-700 hover:text-primary text-[10px] font-mono font-semibold transition-colors">
                <FaLayerGroup className="text-amber-500 text-[10px]" />
                {board}
              </span>
            )}
            {batch && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-50 hover:bg-primary/5 border border-slate-200/80 text-slate-700 hover:text-primary text-[10px] font-mono font-semibold transition-colors">
                <FaCalendarAlt className="text-primary-light text-[10px]" />
                Batch {batch}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
