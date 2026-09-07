"use client";

import Image from "next/image";
import Link from "next/link";
import { FaCalendarAlt, FaClock, FaPlay, FaGraduationCap } from "react-icons/fa";

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
    <div className="relative overflow-hidden rounded-2xl bg-white border border-slate-200/80 p-5 shadow-sm hover:shadow-lg hover:border-orange-200 transition-all duration-300 flex flex-col justify-between gap-4 group">
      {/* Top row: Badge & icon */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-orange-50 border border-orange-200/80 text-[#dd6b01] text-[10px] font-extrabold uppercase tracking-wider">
            <span className="w-1.5 h-1.5 rounded-full bg-[#dd6b01] animate-pulse"></span>
            Upcoming
          </span>
          <span className="text-[11px] font-mono font-bold text-slate-400">
            #{id}
          </span>
        </div>

        <div className="w-8 h-8 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 group-hover:text-[#dd6b01] group-hover:bg-orange-50 transition-colors">
          <FaGraduationCap className="text-sm" />
        </div>
      </div>

      {/* Main Info */}
      <div>
        <h4 className="text-base font-black text-slate-900 line-clamp-1 group-hover:text-[#dd6b01] transition-colors mb-2">
          {title}
        </h4>

        {/* Schedule Meta */}
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-600">
            <FaCalendarAlt className="text-[#dd6b01] shrink-0 text-[11px]" />
            <span className="truncate">{date}</span>
          </div>
          {time && (
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
              <FaClock className="text-amber-500 shrink-0 text-[11px]" />
              <span>{time}</span>
            </div>
          )}
        </div>
      </div>

      {/* Action Button */}
      <div className="pt-2 border-t border-slate-100">
        <Link
          href={`/dashboard/exam-pack/exam-pack-details/${id}`}
          className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-[#dd6b01] hover:bg-orange-600 text-white font-bold text-xs rounded-xl shadow-md shadow-orange-500/10 hover:shadow-orange-500/20 transition-all cursor-pointer"
        >
          <FaPlay className="text-[10px]" />
          <span>Launch Exam</span>
        </Link>
      </div>
    </div>
  );
}
