"use client";

import React from "react";
import {
  FaClipboardList,
  FaCheckDouble,
  FaTimesCircle,
  FaChartBar,
} from "react-icons/fa";
import { ReportingSummary } from "../types";

interface ReportingSummaryCardsProps {
  summary: ReportingSummary;
}

export const ReportingSummaryCards = ({ summary }: ReportingSummaryCardsProps) => {
  return (
    <div className="rounded border border-slate-200/80 bg-white shadow-2xs overflow-hidden">
      <div className="grid grid-cols-2 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-slate-100">
        <div className="p-4 sm:p-5 flex items-center gap-3">
          <div className="w-10 h-10 rounded bg-orange-50 text-primary border border-orange-200/60 flex items-center justify-center text-sm font-bold shrink-0">
            <FaClipboardList />
          </div>
          <div>
            <p className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">
              Total Attended
            </p>
            <p className="text-xl font-black font-mono text-slate-900">
              {summary.totalExams}
            </p>
          </div>
        </div>

        <div className="p-4 sm:p-5 flex items-center gap-3">
          <div className="w-10 h-10 rounded bg-emerald-50 text-emerald-600 border border-emerald-200/60 flex items-center justify-center text-sm font-bold shrink-0">
            <FaCheckDouble />
          </div>
          <div>
            <p className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">
              Passed Tests
            </p>
            <p className="text-xl font-black font-mono text-emerald-600">
              {summary.passedExams}{" "}
              <span className="text-xs font-semibold text-slate-400">
                ({summary.passRate}%)
              </span>
            </p>
          </div>
        </div>

        <div className="p-4 sm:p-5 flex items-center gap-3">
          <div className="w-10 h-10 rounded bg-rose-50 text-rose-500 border border-rose-200/60 flex items-center justify-center text-sm font-bold shrink-0">
            <FaTimesCircle />
          </div>
          <div>
            <p className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">
              Failed Tests
            </p>
            <p className="text-xl font-black font-mono text-rose-500">
              {summary.failedExams}
            </p>
          </div>
        </div>

        <div className="p-4 sm:p-5 flex items-center gap-3">
          <div className="w-10 h-10 rounded bg-amber-50 text-amber-600 border border-amber-200/60 flex items-center justify-center text-sm font-bold shrink-0">
            <FaChartBar />
          </div>
          <div>
            <p className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">
              Average Score
            </p>
            <p className="text-xl font-black font-mono text-primary">
              {summary.avgScore}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
