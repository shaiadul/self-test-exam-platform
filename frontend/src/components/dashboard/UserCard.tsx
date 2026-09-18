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
  board?: string;
  level?: string;
  batch?: string;
  institution?: string;
  image?: string;
  role?: string;
  portalTitle?: string;
}

export default function UserCard({
  name,
  board,
  level,
  batch,
  institution,
  image,
  role,
  portalTitle,
}: UserCardProps) {
  const normRole = (role || "").toLowerCase();

  const resolvedPortalTitle =
    portalTitle ||
    (normRole === "teacher"
      ? "Faculty Portal"
      : normRole === "admin"
      ? "Admin Console"
      : "Candidate Portal");

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
    <div className="relative overflow-hidden rounded bg-white border border-slate-200/80 shadow-2xs hover:shadow-xs hover:border-primary/50 transition-all duration-150 p-4 sm:p-4.5 flex flex-col justify-between h-full group">
      {/* Ambient warm gradient glow in right and left-bottom */}
      <div className="absolute top-0 right-0 w-3/5 h-full bg-gradient-to-l from-primary/10 via-amber-500/5 to-transparent pointer-events-none" />
      <div className="absolute -bottom-6 -right-6 w-48 h-48 bg-primary/10 rounded-full blur-2xl pointer-events-none" />
      <div className="absolute -bottom-8 -left-8 w-36 h-36 bg-gradient-to-tr from-primary/8 via-amber-500/5 to-transparent rounded-full blur-2xl pointer-events-none" />

      {/* Decorative Fluid Wave & Geometric Orbit Pattern */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none"
        viewBox="0 0 500 180"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="none"
      >
        <defs>
          {/* Wave 1 Gradient */}
          <linearGradient id="userWaveGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#f97a00" stopOpacity="0.16" />
            <stop offset="60%" stopColor="#fb923c" stopOpacity="0.08" />
            <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.02" />
          </linearGradient>

          {/* Wave 2 Gradient */}
          <linearGradient id="userWaveGrad2" x1="100%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#ea580c" stopOpacity="0.14" />
            <stop offset="50%" stopColor="#f97a00" stopOpacity="0.06" />
            <stop offset="100%" stopColor="#f97a00" stopOpacity="0.0" />
          </linearGradient>

          {/* Radial Ambient Glow */}
          <radialGradient id="userOrbitGlow" cx="65%" cy="50%" r="45%">
            <stop offset="0%" stopColor="#f97a00" stopOpacity="0.2" />
            <stop offset="60%" stopColor="#fb923c" stopOpacity="0.05" />
            <stop offset="100%" stopColor="#f97a00" stopOpacity="0" />
          </radialGradient>

          {/* Soft left fade mask for right-side wave artwork */}
          <linearGradient id="userFadeMask" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="white" stopOpacity="0" />
            <stop offset="35%" stopColor="white" stopOpacity="0.5" />
            <stop offset="100%" stopColor="white" stopOpacity="1" />
          </linearGradient>
          <mask id="fadeToLeftMask">
            <rect width="500" height="180" fill="url(#userFadeMask)" />
          </mask>
        </defs>

        {/* Left-bottom subtle decorative contour lines & arcs */}
        <g opacity="0.85">
          <circle cx="0" cy="180" r="45" stroke="#f97a00" strokeWidth="1" strokeOpacity="0.18" fill="none" />
          <circle cx="0" cy="180" r="80" stroke="#f97a00" strokeWidth="0.8" strokeOpacity="0.12" strokeDasharray="3 3" fill="none" />
          <circle cx="0" cy="180" r="115" stroke="#f97a00" strokeWidth="0.6" strokeOpacity="0.08" fill="none" />
          <path
            d="M0,150 Q65,145 130,168 T230,180"
            stroke="#fb923c"
            strokeWidth="1"
            strokeOpacity="0.18"
            fill="none"
          />
          {/* Micro accent crosshair */}
          <path d="M75,145 L75,151 M72,148 L78,148" stroke="#f97a00" strokeWidth="1" strokeOpacity="0.25" strokeLinecap="round" />
        </g>

        {/* Right-side wave and orbital artwork */}
        <g mask="url(#fadeToLeftMask)">
          {/* Ambient center glow circle */}
          <circle cx="360" cy="90" r="95" fill="url(#userOrbitGlow)" />

          {/* Layer 1: Sweeping bottom-up fluid curve */}
          <path
            d="M100,180 C180,105 270,145 360,65 C410,20 460,50 500,30 L500,180 Z"
            fill="url(#userWaveGrad1)"
          />
          <path
            d="M100,180 C180,105 270,145 360,65 C410,20 460,50 500,30"
            stroke="#f97a00"
            strokeWidth="1.5"
            strokeOpacity="0.28"
            strokeLinecap="round"
          />

          {/* Layer 2: Intersecting fluid curve */}
          <path
            d="M160,180 C230,125 310,165 400,100 C450,60 480,80 500,70 L500,180 Z"
            fill="url(#userWaveGrad2)"
          />
          <path
            d="M160,180 C230,125 310,165 400,100 C450,60 480,80 500,70"
            stroke="#fb923c"
            strokeWidth="1.2"
            strokeOpacity="0.22"
            strokeDasharray="5 3"
          />

          {/* Layer 3: Top accent contour */}
          <path
            d="M240,0 C290,45 350,20 410,55 C450,78 480,60 500,65"
            stroke="#f97a00"
            strokeWidth="1"
            strokeOpacity="0.2"
            fill="none"
          />

          {/* Concentric Tilted Orbital Ellipses & Nodes */}
          <g transform="translate(370, 85) rotate(-16)">
            {/* Outer dashed orbit */}
            <ellipse cx="0" cy="0" rx="105" ry="48" stroke="#f97a00" strokeWidth="0.9" strokeOpacity="0.22" strokeDasharray="5 4" fill="none" />
            {/* Middle solid orbit */}
            <ellipse cx="0" cy="0" rx="75" ry="34" stroke="#f97a00" strokeWidth="1" strokeOpacity="0.26" fill="none" />
            {/* Inner faint orbit */}
            <ellipse cx="0" cy="0" rx="45" ry="20" stroke="#f97a00" strokeWidth="0.8" strokeOpacity="0.18" strokeDasharray="3 3" fill="none" />

            {/* Core glowing node */}
            <circle cx="0" cy="0" r="4" fill="#f97a00" fillOpacity="0.75" />
            <circle cx="0" cy="0" r="9" stroke="#f97a00" strokeWidth="0.8" strokeOpacity="0.35" fill="none" />

            {/* Orbiting satellite points */}
            <circle cx="75" cy="0" r="2.8" fill="#f97a00" fillOpacity="0.65" />
            <circle cx="-53" cy="24" r="2.2" fill="#fb923c" fillOpacity="0.55" />
            <circle cx="32" cy="-30" r="2" fill="#f59e0b" fillOpacity="0.55" />
            <line x1="0" y1="0" x2="75" y2="0" stroke="#f97a00" strokeWidth="0.8" strokeOpacity="0.2" strokeDasharray="2 2" />
          </g>

          {/* Floating tech crosshairs */}
          <g stroke="#f97a00" strokeOpacity="0.28" strokeWidth="1" strokeLinecap="round">
            <path d="M440,24 L440,32 M436,28 L444,28" />
            <path d="M280,140 L280,148 M276,144 L284,144" />
            <path d="M470,145 L470,153 M466,149 L474,149" />
          </g>

          {/* Diagonal corner speedlines */}
          <path d="M450,180 L500,130" stroke="#f97a00" strokeWidth="0.8" strokeOpacity="0.16" />
          <path d="M468,180 L500,148" stroke="#f97a00" strokeWidth="0.8" strokeOpacity="0.16" />
          <path d="M485,180 L500,165" stroke="#f97a00" strokeWidth="0.8" strokeOpacity="0.16" />
        </g>
      </svg>

      {/* Top Main Section: Avatar + Candidate Identity + Portal Badge */}
      <div className="relative z-10 flex flex-col sm:flex-row items-center sm:items-start justify-between gap-4">
        {/* Left Side: Avatar + Candidate Identity */}
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-3.5 min-w-0">
          {/* Avatar with primary gradient accent & status indicator */}
          <div className="relative shrink-0">
            <div className="relative p-0.5 rounded bg-gradient-to-br from-primary/30 to-amber-500/20 shadow-2xs">
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
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/15 via-primary/5 to-amber-50 text-primary text-xl font-black font-mono">
                    {displayInitials}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Identity & Metadata Details */}
          <div className="text-center sm:text-left min-w-0">
            {/* Status & Quick Edit */}
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-1">
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

            {/* Metadata Badges with Primary & Accent Tones */}
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-1 pt-0.5">
              {level && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-primary/5 hover:bg-primary/10 border border-primary/20 text-slate-800 hover:text-primary text-[10px] font-mono font-semibold transition-colors">
                  <FaGraduationCap className="text-primary text-[10px]" />
                  {level}
                </span>
              )}
              {board && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-amber-50 hover:bg-amber-100/80 border border-amber-200 text-slate-800 hover:text-amber-800 text-[10px] font-mono font-semibold transition-colors">
                  <FaLayerGroup className="text-amber-600 text-[10px]" />
                  {board}
                </span>
              )}
              {batch && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-orange-50 hover:bg-orange-100/80 border border-orange-200 text-slate-800 hover:text-orange-800 text-[10px] font-mono font-semibold transition-colors">
                  <FaCalendarAlt className="text-primary-dark text-[10px]" />
                  Batch {batch}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Right Side: Dynamic Portal Badge */}
        <div className="hidden sm:flex flex-col items-end justify-between self-stretch shrink-0 pointer-events-none pl-4 py-0.5">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-primary/10 border border-primary/25 text-primary text-[10px] font-mono font-bold tracking-wider uppercase backdrop-blur-xs shadow-2xs">
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
            {resolvedPortalTitle}
          </div>
        </div>
      </div>

      {/* Bottom Telemetry & Status Row: Fills the Left-Bottom Space Elegantly */}
      <div className="relative z-10 pt-2.5 mt-3 border-t border-slate-100/90 flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-[11px] font-mono">
          <div className="inline-flex items-center gap-1.5 text-slate-600 font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>
              {normRole === "admin"
                ? "System Access: "
                : normRole === "teacher"
                ? "Faculty Access: "
                : "Portal Access: "}
              <strong className="text-emerald-700 font-bold">Active</strong>
            </span>
          </div>
          <span className="hidden sm:inline text-slate-300">•</span>
          <div className="inline-flex items-center gap-1 text-slate-500">
            <span className="text-slate-400">
              {normRole === "admin"
                ? "Role:"
                : normRole === "teacher"
                ? "Discipline:"
                : "Track:"}
            </span>
            <span className="font-semibold text-slate-700">
              {normRole === "admin"
                ? "Root Administration"
                : board
                ? `${board} ${normRole === "teacher" ? "Faculty" : "Board"}`
                : normRole === "teacher"
                ? "Academic Instructor"
                : "General Curriculum"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
