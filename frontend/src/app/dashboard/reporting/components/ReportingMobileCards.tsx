"use client";

import React from "react";
import { OutlineBtn } from "../../../../components/ui/OutlineBtn";
import { formatDate } from "@/lib/date";
import { Report } from "../types";

interface ReportingMobileCardsProps {
  reports: Report[];
}

export const ReportingMobileCards = ({ reports }: ReportingMobileCardsProps) => {
  return (
    <div className="block md:hidden space-y-3">
      {reports.map((report) => {
        const dateFormatted = formatDate(
          report.createdAt,
          "MMM dd, yyyy",
          "Recent",
        );

        return (
          <div
            key={report.id}
            className="p-3.5 bg-white rounded border border-slate-200/80 shadow-2xs space-y-3"
          >
            {/* Attempt Ref & Date Row */}
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-1.5 font-mono">
                <span className="font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-200/80 text-[10px]">
                  #{report.id}
                </span>
                <span className="text-[10px] text-slate-400">
                  {report.examId}
                </span>
              </div>
              <span className="text-[11px] text-slate-500 font-medium">
                {dateFormatted}
              </span>
            </div>

            {/* Title & Pack */}
            <div>
              <h3 className="font-bold text-slate-900 text-sm tracking-tight leading-snug">
                {report.examName || "Mock Examination"}
              </h3>
              {report.packName && (
                <p className="text-[11px] text-slate-400 font-medium mt-0.5">
                  📦 {report.packName}
                </p>
              )}
              {report.warningCount > 0 && (
                <span className="inline-block mt-1 text-[10px] text-amber-700 font-bold bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                  ⚠️ {report.warningCount} Warning(s)
                </span>
              )}
            </div>

            {/* Question Breakdown Strip */}
            <div className="grid grid-cols-4 gap-1 p-2 rounded bg-slate-50 border border-slate-100 text-center font-mono text-[11px]">
              <div>
                <span className="text-[9px] text-slate-400 font-sans block">
                  Total
                </span>
                <strong className="text-slate-800">{report.total}</strong>
              </div>
              <div>
                <span className="text-[9px] text-emerald-600 font-sans block">
                  Correct
                </span>
                <strong className="text-emerald-700">
                  ✓ {report.correct}
                </strong>
              </div>
              <div>
                <span className="text-[9px] text-rose-500 font-sans block">
                  Wrong
                </span>
                <strong className="text-rose-600">
                  ✗ {report.wrong}
                </strong>
              </div>
              <div>
                <span className="text-[9px] text-slate-400 font-sans block">
                  Neg
                </span>
                <strong className="text-slate-600">
                  {report.negative > 0 ? `-${report.negative}` : "0"}
                </strong>
              </div>
            </div>

            {/* Score & Action Row */}
            <div className="flex items-center justify-between pt-1 border-t border-slate-100">
              <div className="flex items-center gap-2">
                <span className="text-lg font-black text-primary font-mono leading-none">
                  {Number(report.finalScore).toFixed(1)}
                </span>
                <span
                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase ${
                    report.passed
                      ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                      : "bg-rose-50 text-rose-700 border border-rose-200"
                  }`}
                >
                  {report.passed ? "Passed" : "Failed"}
                </span>
              </div>

              <OutlineBtn
                link={`/dashboard/reporting/${report.id}`}
                className="!text-xs !py-1.5 !px-3 font-mono font-bold"
              >
                <span>View Report</span>
              </OutlineBtn>
            </div>
          </div>
        );
      })}
    </div>
  );
};
