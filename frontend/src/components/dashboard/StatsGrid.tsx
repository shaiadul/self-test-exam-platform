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
  FaArrowUp,
  FaBullseye,
} from "react-icons/fa";

interface StatsGridProps {
  stats: Stat[];
}

const getStatConfig = (label: string) => {
  const norm = label.toLowerCase();

  if (norm.includes("completed") || norm.includes("attempt")) {
    return {
      icon: <FaHistory className="text-lg" />,
      badge: "Lifetime Activity",
      badgeColor: "bg-blue-50 text-blue-700 border-blue-200/80",
      iconBg: "bg-blue-50 text-blue-600 border-blue-100",
      accentBorder: "group-hover:border-blue-300",
    };
  }

  if (norm.includes("average") || norm.includes("accuracy") || norm.includes("rating")) {
    return {
      icon: <FaPercentage className="text-lg" />,
      badge: "Target: 80%+",
      badgeColor: "bg-orange-50 text-[#dd6b01] border-orange-200/80",
      iconBg: "bg-orange-50 text-[#dd6b01] border-orange-100",
      accentBorder: "group-hover:border-orange-300",
    };
  }

  if (norm.includes("passed") || norm.includes("registered") || norm.includes("active")) {
    return {
      icon: <FaCheckCircle className="text-lg" />,
      badge: "Positive Ratio",
      badgeColor: "bg-emerald-50 text-emerald-700 border-emerald-200/80",
      iconBg: "bg-emerald-50 text-emerald-600 border-emerald-100",
      accentBorder: "group-hover:border-emerald-300",
    };
  }

  if (norm.includes("failed") || norm.includes("pending")) {
    return {
      icon: <FaTimesCircle className="text-lg" />,
      badge: "To Retake",
      badgeColor: "bg-rose-50 text-rose-700 border-rose-200/80",
      iconBg: "bg-rose-50 text-rose-600 border-rose-100",
      accentBorder: "group-hover:border-rose-300",
    };
  }

  if (norm.includes("question") || norm.includes("pack")) {
    return {
      icon: <FaBookOpen className="text-lg" />,
      badge: "Curriculum",
      badgeColor: "bg-indigo-50 text-indigo-700 border-indigo-200/80",
      iconBg: "bg-indigo-50 text-indigo-600 border-indigo-100",
      accentBorder: "group-hover:border-indigo-300",
    };
  }

  return {
    icon: <FaAward className="text-lg" />,
    badge: "Metric",
    badgeColor: "bg-slate-50 text-slate-700 border-slate-200/80",
    iconBg: "bg-slate-50 text-slate-600 border-slate-100",
    accentBorder: "group-hover:border-slate-300",
  };
};

export default function StatsGrid({ stats }: StatsGridProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 h-full">
      {stats.map((stat, idx) => {
        const config = getStatConfig(stat.label);

        return (
          <div
            key={idx}
            className={`relative overflow-hidden rounded-3xl bg-white border border-slate-200/80 p-5 flex flex-col justify-between shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group ${config.accentBorder}`}
          >
            {/* Ambient corner flare */}
            <div className="absolute -top-10 -right-10 w-24 h-24 bg-slate-50 rounded-full blur-xl group-hover:scale-150 transition-transform duration-500 pointer-events-none" />

            <div className="relative z-10 flex items-start justify-between gap-3 mb-4">
              <div
                className={`w-11 h-11 rounded-2xl flex items-center justify-center border shadow-xs transition-transform duration-300 group-hover:scale-110 ${config.iconBg}`}
              >
                {config.icon}
              </div>

              <span
                className={`text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-full border ${config.badgeColor}`}
              >
                {config.badge}
              </span>
            </div>

            <div className="relative z-10">
              <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">
                {stat.label}
              </p>
              <p className="text-3xl font-black text-slate-900 tracking-tight">
                {stat.value}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
