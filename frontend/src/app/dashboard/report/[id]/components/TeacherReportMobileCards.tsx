"use client";

import React from "react";
import EmptyState from "../../../../../components/common/EmptyState";
import { formatDateTime } from "@/lib/date";

interface StudentAttempt {
  id: string | number;
  meritRank: number;
  name: string;
  institution?: string;
  time?: string;
  score: number | string;
  passed: boolean;
}

interface TeacherReportMobileCardsProps {
  students: StudentAttempt[];
}

export const TeacherReportMobileCards = ({
  students,
}: TeacherReportMobileCardsProps) => {
  return (
    <div className="block sm:hidden divide-y divide-slate-100">
      {students.map((st) => (
        <div
          key={st.id}
          className="p-3.5 space-y-2 hover:bg-slate-50/50 transition"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span
                className={`inline-flex items-center justify-center px-1.5 py-0.5 rounded text-[10px] font-mono font-bold border ${
                  st.meritRank === 1
                    ? "bg-amber-100 text-amber-800 border-amber-200"
                    : st.meritRank === 2
                      ? "bg-slate-200 text-slate-800 border-slate-300"
                      : st.meritRank === 3
                        ? "bg-orange-100 text-orange-800 border-orange-200"
                        : "bg-slate-100 text-slate-600 border-slate-200"
                }`}
              >
                #{st.meritRank}
              </span>
              <span className="font-bold text-xs text-slate-900">
                {st.name}
              </span>
            </div>
            <span
              className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase border ${
                st.passed
                  ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                  : "bg-rose-50 text-rose-700 border-rose-200"
              }`}
            >
              {st.passed ? "PASSED" : "FAILED"}
            </span>
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
            <span className="truncate max-w-[180px]">
              {st.institution || "—"}
            </span>
            <span className="font-mono text-[10px] text-slate-400">
              {formatDateTime(
                st.time,
                "MMM dd, yyyy • hh:mm a",
                st.time || "Recent",
              )}
            </span>
          </div>

          <div className="flex items-center justify-between bg-slate-50 px-2.5 py-1.5 rounded border border-slate-100 text-xs">
            <span className="font-mono text-[10px] font-bold text-slate-400 uppercase">
              Score Marks
            </span>
            <span className="font-mono font-black text-slate-900">
              {st.score}
            </span>
          </div>
        </div>
      ))}

      {students.length === 0 && (
        <div className="py-8 px-4 text-center">
          <EmptyState
            compact
            type="reports"
            title="No Submissions Found"
            description="No student attempts match your search or filter."
          />
        </div>
      )}
    </div>
  );
};
