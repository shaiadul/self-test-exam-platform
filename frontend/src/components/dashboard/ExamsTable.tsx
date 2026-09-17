"use client";

import React from "react";
import { Exam } from "../../lib/types";
import { FaFileAlt, FaCheckCircle, FaTimesCircle } from "react-icons/fa";
import { OutlineBtn } from "../ui/OutlineBtn";
import EmptyState from "../common/EmptyState";

interface ExamsTableProps {
  exams: Exam[];
}

export default function ExamsTable({ exams }: ExamsTableProps) {
  if (!exams || exams.length === 0) {
    return (
      <EmptyState
        type="exam"
        title="No Assessment Attempts Yet"
        description="You haven't completed any mock examinations yet. Take your first exam to see live scores, ranking analysis, and metrics."
        actionLabel="Explore Mock Exams"
        actionHref="/dashboard/exam-pack"
      />
    );
  }

  return (
    <div className="w-full">
      <div className="overflow-x-auto border border-slate-200/80 bg-white rounded-none">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/90 border-b border-slate-200/80 text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500">
              <th className="px-3.5 py-2.5">Ref</th>
              <th className="px-3.5 py-2.5">Exam Name</th>
              <th className="px-3.5 py-2.5">Score Ratio</th>
              <th className="px-3.5 py-2.5">Negative</th>
              <th className="px-3.5 py-2.5 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs font-medium">
            {exams.map((exam, idx) => {
              // Parse score if possible (e.g. "14.5/20")
              const scoreParts = exam.score?.split("/") || [];
              const numScore = parseFloat(scoreParts[0]) || 0;
              const maxScore = parseFloat(scoreParts[1]) || 20;
              const ratio = maxScore > 0 ? (numScore / maxScore) * 100 : 0;
              const isPassed = typeof exam.passed === "boolean" ? exam.passed : ratio >= 33;

              return (
                <tr
                  key={idx}
                  className="hover:bg-slate-50/60 transition-colors group"
                >
                  {/* ID */}
                  <td className="px-3.5 py-2 whitespace-nowrap">
                    <span className="font-mono text-[10px] font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                      {exam.id}
                    </span>
                  </td>

                  {/* Name */}
                  <td className="px-3.5 py-2">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded bg-primary/10 text-primary border border-primary/20 flex items-center justify-center shrink-0 text-xs">
                        <FaFileAlt />
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-slate-900 group-hover:text-primary transition-colors truncate max-w-xs sm:max-w-md text-xs">
                          {exam.name}
                        </p>
                        <p className="text-[10px] font-mono text-slate-400">
                          MCQ Standard Exam
                        </p>
                      </div>
                    </div>
                  </td>

                  {/* Score */}
                  <td className="px-3.5 py-2 whitespace-nowrap font-mono">
                    <div className="flex flex-col gap-0.5 min-w-[90px]">
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`font-bold text-xs ${
                            isPassed ? "text-emerald-600" : "text-rose-600"
                          }`}
                        >
                          {exam.score || "0"}
                        </span>
                        <span
                          className={`inline-flex items-center gap-0.5 text-[9px] font-bold px-1.5 py-0.2 rounded border ${
                            isPassed
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                              : "bg-rose-50 text-rose-700 border-rose-200"
                          }`}
                        >
                          {isPassed ? (
                            <>
                              <FaCheckCircle className="text-[7px]" /> Passed
                            </>
                          ) : (
                            <>
                              <FaTimesCircle className="text-[7px]" /> Failed
                            </>
                          )}
                        </span>
                      </div>
                      {/* Mini visual progress bar */}
                      <div className="w-full h-1 bg-slate-100 rounded overflow-hidden">
                        <div
                          className={`h-full rounded ${
                            isPassed ? "bg-emerald-500" : "bg-rose-500"
                          }`}
                          style={{ width: `${Math.min(100, Math.max(5, ratio))}%` }}
                        />
                      </div>
                    </div>
                  </td>

                  {/* Negative Marking */}
                  <td className="px-3.5 py-2 whitespace-nowrap">
                    <span
                      className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded border ${
                        exam.negative && parseFloat(exam.negative) > 0
                          ? "bg-rose-50 text-rose-600 border-rose-200"
                          : "bg-slate-50 text-slate-600 border-slate-200"
                      }`}
                    >
                      {exam.negative && parseFloat(exam.negative) > 0
                        ? `-${exam.negative}`
                        : "0.0"}
                    </span>
                  </td>

                  {/* Actions */}
                  <td className="px-3.5 py-2 text-right whitespace-nowrap">
                    {(() => {
                      const reportLink =
                        exam.answerSheet && exam.answerSheet !== "#"
                          ? exam.answerSheet
                          : exam.attemptId
                          ? `/dashboard/reporting/${exam.attemptId}`
                          : `/dashboard/reporting/${exam.id.replace("#", "")}`;

                      return (
                        <OutlineBtn
                          link={reportLink}
                          className="!text-[11px] !py-1 !px-2 shadow-xs !rounded font-mono"
                        >
                          <span>Review</span>
                        </OutlineBtn>
                      );
                    })()}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
