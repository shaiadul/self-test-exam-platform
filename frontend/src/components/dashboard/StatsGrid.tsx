"use client";

import React from "react";
import { Stat } from "../../lib/types";
import {
  FaCheckCircle,
  FaTimesCircle,
  FaPercentage,
  FaHistory,
  FaBookOpen,
  FaAward,
} from "react-icons/fa";

interface StatsGridProps {
  stats: Stat[];
}

const getStatConfig = (label: string) => {
  const norm = label.toLowerCase();

  if (norm.includes("completed") || norm.includes("attempt")) {
    return {
      icon: <FaHistory className="text-base" />,
      badge: "Lifetime Activity",
      badgeColor: "text-blue-600 bg-blue-50/70",
      iconBg: "bg-blue-50 text-blue-600",
    };
  }

  if (norm.includes("average") || norm.includes("accuracy") || norm.includes("rating")) {
    return {
      icon: <FaPercentage className="text-base" />,
      badge: "Target: 80%+",
      badgeColor: "text-[#dd6b01] bg-orange-50/70",
      iconBg: "bg-orange-50 text-[#dd6b01]",
    };
  }

  if (norm.includes("passed") || norm.includes("registered") || norm.includes("active")) {
    return {
      icon: <FaCheckCircle className="text-base" />,
      badge: "Positive Ratio",
      badgeColor: "text-emerald-600 bg-emerald-50/70",
      iconBg: "bg-emerald-50 text-emerald-600",
    };
  }

  if (norm.includes("failed") || norm.includes("pending")) {
    return {
      icon: <FaTimesCircle className="text-base" />,
      badge: "To Retake",
      badgeColor: "text-rose-600 bg-rose-50/70",
      iconBg: "bg-rose-50 text-rose-600",
    };
  }

  if (norm.includes("question") || norm.includes("pack")) {
    return {
      icon: <FaBookOpen className="text-base" />,
      badge: "Curriculum",
      badgeColor: "text-indigo-600 bg-indigo-50/70",
      iconBg: "bg-indigo-50 text-indigo-600",
    };
  }

  return {
    icon: <FaAward className="text-base" />,
    badge: "Metric",
    badgeColor: "text-slate-600 bg-slate-50/70",
    iconBg: "bg-slate-50 text-slate-600",
  };
};

export default function StatsGrid({ stats }: StatsGridProps) {
  return (
    <div className="h-full rounded bg-white border border-slate-200/80 shadow-2xs flex flex-col justify-between overflow-hidden">
      {/* Subheader */}
      <div className="px-3.5 py-2.5 border-b border-slate-100 flex items-center justify-between">
        <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">
          Telemetry Quadrants
        </span>
        <span className="text-[10px] font-mono font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
          Active Node
        </span>
      </div>

      {/* Unified 2x2 Metric Quadrants */}
      <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-slate-100 flex-1">
        {/* Left Column (items 0 and 1) */}
        <div className="divide-y divide-slate-100 flex flex-col">
          {stats.slice(0, 2).map((stat, idx) => {
            const config = getStatConfig(stat.label);
            return (
              <div
                key={idx}
                className="relative overflow-hidden p-3 sm:p-3.5 flex-1 flex flex-col justify-between hover:bg-slate-50/60 transition-colors group"
              >
                {/* Micro Telemetry Watermark */}
                <svg
                  className="absolute right-1 bottom-1 w-12 h-12 text-slate-600 opacity-[0.025] group-hover:opacity-[0.05] transition-opacity pointer-events-none"
                  viewBox="0 0 40 40"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <circle cx="20" cy="20" r="16" stroke="currentColor" strokeWidth="1" strokeDasharray="2 2" />
                  <path d="M20 4 V36 M4 20 H36" stroke="currentColor" strokeWidth="0.8" />
                  <circle cx="20" cy="20" r="4" fill="currentColor" />
                </svg>

                <div className="relative z-10 flex items-center justify-between gap-2 mb-1.5">
                  <span className="text-xs font-semibold text-slate-500">
                    {stat.label}
                  </span>
                  <div
                    className={`w-6 h-6 rounded flex items-center justify-center ${config.iconBg}`}
                  >
                    {config.icon}
                  </div>
                </div>

                <div className="relative z-10">
                  <p className="text-lg sm:text-xl font-mono font-black text-slate-900 tracking-tight">
                    {stat.value}
                  </p>
                  <span
                    className={`inline-block text-[10px] font-mono font-bold px-1.5 py-0.2 rounded mt-1 ${config.badgeColor}`}
                  >
                    {config.badge}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right Column (items 2 and 3) */}
        <div className="divide-y divide-slate-100 flex flex-col">
          {stats.slice(2, 4).map((stat, idx) => {
            const config = getStatConfig(stat.label);
            return (
              <div
                key={idx + 2}
                className="relative overflow-hidden p-3 sm:p-3.5 flex-1 flex flex-col justify-between hover:bg-slate-50/60 transition-colors group"
              >
                {/* Micro Telemetry Watermark */}
                <svg
                  className="absolute right-1 bottom-1 w-12 h-12 text-slate-600 opacity-[0.025] group-hover:opacity-[0.05] transition-opacity pointer-events-none"
                  viewBox="0 0 40 40"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <circle cx="20" cy="20" r="16" stroke="currentColor" strokeWidth="1" strokeDasharray="2 2" />
                  <path d="M20 4 V36 M4 20 H36" stroke="currentColor" strokeWidth="0.8" />
                  <circle cx="20" cy="20" r="4" fill="currentColor" />
                </svg>

                <div className="relative z-10 flex items-center justify-between gap-2 mb-1.5">
                  <span className="text-xs font-semibold text-slate-500">
                    {stat.label}
                  </span>
                  <div
                    className={`w-6 h-6 rounded flex items-center justify-center ${config.iconBg}`}
                  >
                    {config.icon}
                  </div>
                </div>

                <div className="relative z-10">
                  <p className="text-lg sm:text-xl font-mono font-black text-slate-900 tracking-tight">
                    {stat.value}
                  </p>
                  <span
                    className={`inline-block text-[10px] font-mono font-bold px-1.5 py-0.2 rounded mt-1 ${config.badgeColor}`}
                  >
                    {config.badge}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
