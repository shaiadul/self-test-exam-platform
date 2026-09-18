"use client";

import React from "react";
import { FaFileAlt, FaCheckCircle, FaTimesCircle } from "react-icons/fa";
import { OutlineBtn } from "../../../../components/ui/OutlineBtn";
import { formatDate } from "@/lib/date";
import { Report } from "../types";

interface ReportingTableProps {
  reports: Report[];
}

export const ReportingTable = ({ reports }: ReportingTableProps) => {
  return (
    <div className="hidden md:block overflow-x-auto rounded-none border border-slate-200/80 bg-white shadow-xs">
      <table className="min-w-full text-left border-collapse">
        <thead>
          <tr className="bg-slate-50/90 border-b border-slate-200/80 text-[11px] font-mono font-bold uppercase tracking-wider text-slate-500">
            <th className="px-5 py-4">Attempt Ref</th>
            <th className="px-5 py-4">Exam Details</th>
            <th className="px-5 py-4">Date Attended</th>
            <th className="px-5 py-4">Question Breakdown</th>
            <th className="px-5 py-4">Score & Status</th>
            <th className="px-5 py-4 text-right">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 text-sm font-medium">
          {reports.map((report) => {
            const dateFormatted = formatDate(
              report.createdAt,
              "MMM dd, yyyy",
              "Recent",
            );

            return (
              <tr
                key={report.id}
                className="hover:bg-orange-50/30 transition-colors group"
              >
                {/* Attempt ID */}
                <td className="px-5 py-4 whitespace-nowrap">
                  <span className="font-mono text-xs font-bold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200/60">
                    #{report.id}
                  </span>
                  <span className="block text-[10px] text-slate-400 font-mono mt-1">
                    Code: {report.examId}
                  </span>
                </td>

                {/* Name & Pack */}
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded bg-primary/10 text-primary border border-primary/20 flex items-center justify-center shrink-0 group-hover:bg-primary group-hover:text-white transition-colors duration-200">
                      <FaFileAlt className="text-xs" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-slate-900 group-hover:text-primary transition-colors truncate max-w-xs sm:max-w-md">
                        {report.examName || "Mock Examination"}
                      </p>
                      {report.packName && (
                        <p className="text-[11px] text-slate-400 font-semibold truncate">
                          📦 {report.packName}
                        </p>
                      )}
                      {report.warningCount > 0 && (
                        <span className="inline-block mt-0.5 text-[10px] text-amber-700 font-bold bg-amber-50 px-1.5 py-0.2 rounded border border-amber-200">
                          ⚠️ {report.warningCount} Warning(s)
                        </span>
                      )}
                    </div>
                  </div>
                </td>

                {/* Date */}
                <td className="px-5 py-4 whitespace-nowrap text-xs text-slate-600 font-semibold">
                  {dateFormatted}
                </td>

                {/* Questions breakdown */}
                <td className="px-5 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-3 text-xs font-bold">
                    <span className="text-slate-600">
                      Total:{" "}
                      <strong className="text-slate-900">
                        {report.total}
                      </strong>
                    </span>
                    <span className="text-emerald-600">
                      ✓ {report.correct}
                    </span>
                    <span className="text-rose-500">
                      ✗ {report.wrong}
                    </span>
                    {report.negative > 0 && (
                      <span className="text-rose-400 text-[11px]">
                        (-{report.negative})
                      </span>
                    )}
                  </div>
                </td>

                {/* Score & Status */}
                <td className="px-5 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-2.5">
                    <span className="text-base font-black text-primary">
                      {Number(report.finalScore).toFixed(1)}
                    </span>
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                        report.passed
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : "bg-rose-50 text-rose-700 border border-rose-200"
                      }`}
                    >
                      {report.passed ? (
                        <>
                          <FaCheckCircle className="text-[9px]" /> Passed
                        </>
                      ) : (
                        <>
                          <FaTimesCircle className="text-[9px]" /> Failed
                        </>
                      )}
                    </span>
                  </div>
                </td>

                {/* Actions */}
                <td className="px-5 py-4 text-right whitespace-nowrap">
                  <OutlineBtn
                    link={`/dashboard/reporting/${report.id}`}
                    className="!text-xs !py-1.5 !px-3.5 gap-1.5 shadow-xs"
                  >
                    <span className="text-slate-700 font-bold">
                      View Report
                    </span>
                  </OutlineBtn>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
