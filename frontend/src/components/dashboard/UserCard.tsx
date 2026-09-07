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
    <div className="relative overflow-hidden rounded-3xl bg-white border border-slate-200/80 shadow-sm hover:shadow-xl hover:shadow-orange-500/5 transition-all duration-300 p-6 md:p-7 flex flex-col justify-between h-full group">
      {/* Ambient background decoration */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-bl from-orange-500/10 via-amber-500/5 to-transparent rounded-full blur-3xl pointer-events-none -mr-16 -mt-16 group-hover:from-orange-500/15 transition-all duration-500" />
      <div className="absolute bottom-0 left-1/3 w-40 h-40 bg-orange-400/5 rounded-full blur-2xl pointer-events-none" />

      <div className="relative z-10 flex flex-col sm:flex-row items-center sm:items-start gap-6">
        {/* Avatar with luxury gradient ring & verification status */}
        <div className="relative shrink-0">
          <div className="relative p-1 rounded-2xl bg-gradient-to-tr from-[#dd6b01] via-[#f97a00] to-amber-300 shadow-lg shadow-orange-500/20 group-hover:shadow-orange-500/30 transition-shadow">
            <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-[14px] overflow-hidden bg-slate-100 flex items-center justify-center border-2 border-white">
              {image && (image.startsWith("/") || image.startsWith("http")) ? (
                <Image
                  src={image}
                  alt={name || "User Avatar"}
                  fill
                  sizes="(max-width: 640px) 96px, 112px"
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-orange-100 to-amber-50 text-[#dd6b01] text-3xl font-black">
                  {displayInitials}
                </div>
              )}
            </div>
          </div>
          {/* Verified status pin */}
          <div
            className="absolute -bottom-1 -right-1 bg-white p-1 rounded-full shadow-md text-emerald-600"
            title="Verified Portal Account"
          >
            <FaCheckCircle className="text-base" />
          </div>
        </div>

        {/* User Identity & Info Details */}
        <div className="flex-1 text-center sm:text-left min-w-0">
          {/* Top Status row */}
          <div className="flex flex-wrap items-center justify-center sm:justify-between gap-2 mb-2">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200/80 text-emerald-700 text-[11px] font-bold tracking-wide">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              Active Profile
            </div>
            <Link
              href="/dashboard/edit-profile"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-[#dd6b01] transition-colors group/edit"
            >
              <FaUserEdit className="text-sm group-hover/edit:scale-110 transition-transform" />
              <span>Edit Profile</span>
            </Link>
          </div>

          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mb-1.5 truncate">
            {name || "Candidate"}
          </h2>

          {institution && (
            <p className="text-slate-600 text-xs font-semibold flex items-center justify-center sm:justify-start gap-1.5 mb-4 truncate">
              <FaUniversity className="text-[#dd6b01] shrink-0" />
              <span className="truncate">{institution}</span>
            </p>
          )}

          {/* Metadata Badges Bento */}
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1">
            {level && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-50 hover:bg-orange-50/70 border border-slate-200/80 hover:border-orange-200 text-slate-700 hover:text-[#dd6b01] text-xs font-bold transition-colors">
                <FaGraduationCap className="text-orange-500" />
                {level}
              </span>
            )}
            {board && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-50 hover:bg-orange-50/70 border border-slate-200/80 hover:border-orange-200 text-slate-700 hover:text-[#dd6b01] text-xs font-bold transition-colors">
                <FaLayerGroup className="text-amber-500" />
                {board}
              </span>
            )}
            {batch && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-50 hover:bg-orange-50/70 border border-slate-200/80 hover:border-orange-200 text-slate-700 hover:text-[#dd6b01] text-xs font-bold transition-colors">
                <FaCalendarAlt className="text-orange-400" />
                Batch {batch}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
