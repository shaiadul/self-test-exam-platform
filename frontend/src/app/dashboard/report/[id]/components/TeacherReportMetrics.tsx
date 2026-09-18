"use client";

import React from "react";
import { FaTrophy, FaChartLine, FaArrowDown, FaGraduationCap } from "react-icons/fa";

interface TeacherReportMetricsProps {
  highest: number;
  average: number;
  lowest: number;
  passRate: string;
}

export const TeacherReportMetrics = ({
  highest,
  average,
  lowest,
  passRate,
}: TeacherReportMetricsProps) => {
  return (
    <div className="rounded border border-slate-200/80 bg-white shadow-2xs overflow-hidden">
      <div className="grid grid-cols-2 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-slate-100">
        <div className="p-4 flex items-center gap-3">
          <div className="w-9 h-9 rounded bg-amber-50 text-amber-600 border border-amber-200/60 flex items-center justify-center text-sm font-bold shrink-0">
            <FaTrophy />
          </div>
          <div>
            <p className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">
              HIGHEST SCORE
            </p>
            <p className="text-lg font-black font-mono text-slate-900">
              {highest ?? 0}
            </p>
          </div>
        </div>

        <div className="p-4 flex items-center gap-3">
          <div className="w-9 h-9 rounded bg-blue-50 text-blue-600 border border-blue-200/60 flex items-center justify-center text-sm font-bold shrink-0">
            <FaChartLine />
          </div>
          <div>
            <p className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">
              AVERAGE SCORE
            </p>
            <p className="text-lg font-black font-mono text-blue-600">
              {average ?? 0}
            </p>
          </div>
        </div>

        <div className="p-4 flex items-center gap-3">
          <div className="w-9 h-9 rounded bg-rose-50 text-rose-500 border border-rose-200/60 flex items-center justify-center text-sm font-bold shrink-0">
            <FaArrowDown />
          </div>
          <div>
            <p className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">
              LOWEST SCORE
            </p>
            <p className="text-lg font-black font-mono text-rose-500">
              {lowest ?? 0}
            </p>
          </div>
        </div>

        <div className="p-4 flex items-center gap-3">
          <div className="w-9 h-9 rounded bg-purple-50 text-purple-600 border border-purple-200/60 flex items-center justify-center text-sm font-bold shrink-0">
            <FaGraduationCap />
          </div>
          <div>
            <p className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">
              PASS RATE
            </p>
            <p className="text-lg font-black font-mono text-purple-600">
              {passRate}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
