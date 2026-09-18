"use client";

import Image from "next/image";
import {
  FaCalendarAlt,
  FaClock,
  FaPlay,
  FaGraduationCap,
} from "react-icons/fa";
import { PrimaryBtn } from "../ui/PrimaryBtn";

type UpcomingExamCardProps = {
  id: string;
  image: string;
  title: string;
  dateTime: string;
};

export default function UpcomingExamCard({
  id,
  image,
  title,
  dateTime,
}: UpcomingExamCardProps) {
  // Parse dateTime: format usually "03:04 PM | Monday, 02nd Jan 2006" or similar
  const parts = dateTime ? dateTime.split(" | ") : ["Scheduled", "Upcoming"];
  const time = parts.length > 1 ? parts[0] : "";
  const date = parts.length > 1 ? parts[1] : dateTime;

  const hasValidImage =
    image &&
    image !== "/global/no-picture.jpg" &&
    (image.startsWith("/") || image.startsWith("http"));

  return (
    <div className="relative overflow-hidden rounded bg-white border border-slate-200/80 p-3 sm:p-3.5 shadow-2xs hover:shadow-xs hover:border-primary/40 transition-all duration-150 flex flex-col justify-between gap-2.5 group">
      {/* Subtle Background SVG Telemetry Trace (prevents empty feel) */}
      <svg
        className="absolute -right-6 -bottom-6 w-32 h-32 text-primary opacity-[0.035] pointer-events-none group-hover:opacity-[0.07] transition-opacity duration-300"
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle
          cx="50"
          cy="50"
          r="45"
          stroke="currentColor"
          strokeWidth="1"
          strokeDasharray="3 3"
        />
        <circle
          cx="50"
          cy="50"
          r="32"
          stroke="currentColor"
          strokeWidth="1.5"
        />
        <circle
          cx="50"
          cy="50"
          r="18"
          stroke="currentColor"
          strokeWidth="1"
          strokeDasharray="2 4"
        />
        <path
          d="M50 5 L50 95 M5 50 L95 50"
          stroke="currentColor"
          strokeWidth="0.75"
        />
        <path
          d="M50 50 L75 25"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <circle cx="75" cy="25" r="2.5" fill="currentColor" />
        <circle cx="50" cy="50" r="4" fill="currentColor" />
      </svg>

      {/* Top row: Badge & icon */}
      <div className="flex items-start justify-between gap-2 relative z-10">
        <div className="flex items-center gap-1.5">
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-primary/10 border border-primary/20 text-primary text-[10px] font-mono font-bold uppercase tracking-wider">
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>
            Upcoming
          </span>
          <span className="text-[10px] font-mono font-bold text-slate-400">
            #{id}
          </span>
        </div>

        <div className="w-6 h-6 rounded bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 group-hover:text-primary group-hover:bg-primary/10 transition-colors">
          <FaGraduationCap className="text-xs" />
        </div>
      </div>

      {/* Main Info */}
      <div>
        <h4 className="text-xs sm:text-sm font-bold text-slate-900 line-clamp-1 group-hover:text-primary transition-colors mb-1">
          {title}
        </h4>

        {/* Schedule Meta */}
        <div className="space-y-0.5">
          <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-600">
            <FaCalendarAlt className="text-primary shrink-0 text-[10px]" />
            <span className="truncate">{date}</span>
          </div>
          {time && (
            <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-500">
              <FaClock className="text-amber-500 shrink-0 text-[10px]" />
              <span>{time}</span>
            </div>
          )}
        </div>
      </div>

      {/* Action Button */}
      <div className="pt-2 border-t border-slate-100">
        <PrimaryBtn
          link={`/dashboard/exam-pack/exam-pack-details/${id}`}
          className="w-full !text-xs !py-1.5 !rounded shadow-2xs gap-1.5"
        >
          <FaPlay className="text-[9px]" />
          <span>Launch Exam</span>
        </PrimaryBtn>
      </div>
    </div>
  );
}
