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

interface TeacherReportTableProps {
  students: StudentAttempt[];
}

export const TeacherReportTable = ({ students }: TeacherReportTableProps) => {
  return (
    <div className="hidden sm:block overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-slate-50/70 border-b border-slate-200/80 text-slate-500 font-mono font-bold text-[10px] uppercase tracking-wider">
            <th className="py-3 px-4">Rank</th>
            <th className="py-3 px-4">Student Name</th>
            <th className="py-3 px-4">Institution</th>
            <th className="py-3 px-4">Completion Time</th>
            <th className="py-3 px-4 text-center">Score Marks</th>
            <th className="py-3 px-4 text-right">Result Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 text-xs">
          {students.map((st) => (
            <tr key={st.id} className="hover:bg-slate-50/50 transition">
              <td className="py-3 px-4 font-mono font-bold text-slate-900">
                <span
                  className={`inline-flex items-center justify-center px-1.5 py-0.2 rounded text-[11px] font-mono font-bold border ${
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
              </td>
              <td className="py-3 px-4 font-bold text-slate-900">
                {st.name}
              </td>
              <td className="py-3 px-4 text-slate-500 text-[11px] font-medium">
                {st.institution || "—"}
              </td>
              <td className="py-3 px-4 text-slate-500 font-mono text-[11px]">
                {formatDateTime(
                  st.time,
                  "MMM dd, yyyy • hh:mm a",
                  st.time || "Recent",
                )}
              </td>
              <td className="py-3 px-4 text-center font-mono font-black text-slate-900 text-sm">
                {typeof st.score === "number"
                  ? Number(st.score).toFixed(1)
                  : st.score}
              </td>
              <td className="py-3 px-4 text-right">
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase border ${
                    st.passed
                      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                      : "bg-rose-50 text-rose-700 border-rose-200"
                  }`}
                >
                  {st.passed ? "PASSED" : "FAILED"}
                </span>
              </td>
            </tr>
          ))}

          {students.length === 0 && (
            <tr>
                <EmptyState
                  compact
                  type="reports"
                  title="No Submissions Found"
                  description="No student attempts match your criteria."
                  className="py-8"
                />
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};
