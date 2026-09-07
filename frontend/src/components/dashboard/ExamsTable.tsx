"use client";

import React from "react";
import { Exam } from "../../lib/types";
import { FaFileAlt, FaEye, FaArrowRight, FaCheckCircle, FaTimesCircle } from "react-icons/fa";
import { PrimaryBtn } from "../ui/PrimaryBtn";
import { OutlineBtn } from "../ui/OutlineBtn";

interface ExamsTableProps {
  exams: Exam[];
}

export default function ExamsTable({ exams }: ExamsTableProps) {
  if (!exams || exams.length === 0) {
    return (
      <div className="py-12 px-4 text-center flex flex-col items-center justify-center">
        <div className="w-16 h-16 rounded-2xl bg-orange-50 border border-orange-100 flex items-center justify-center text-[#dd6b01] text-2xl mb-4 shadow-xs">
          <FaFileAlt />
        </div>
        <h4 className="text-base font-bold text-slate-800 mb-1">
          No Recent Attempts
        </h4>
        <p className="text-xs text-slate-500 max-w-sm mb-6">
          You haven&apos;t taken any mock exams yet. Start your first self-test to generate dynamic performance stats and merit ranking!
        </p>
        <PrimaryBtn
          link="/dashboard/exam-pack"
          className="!text-xs !py-2.5 !px-5 gap-2 shadow-xs"
        >
          <span>Explore Mock Exams</span>
          <FaArrowRight className="text-xs" />
        </PrimaryBtn>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="overflow-x-auto rounded-2xl border border-slate-200/80 bg-white">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/90 border-b border-slate-200/80 text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
              <th className="px-5 py-3.5">Exam Ref</th>
              <th className="px-5 py-3.5">Exam Name</th>
              <th className="px-5 py-3.5">Score</th>
              <th className="px-5 py-3.5">Negative</th>
              <th className="px-5 py-3.5 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm font-medium">
            {exams.map((exam, idx) => {
              // Parse score if possible (e.g. "14.5/20")
              const scoreParts = exam.score?.split("/") || [];
              const numScore = parseFloat(scoreParts[0]) || 0;
              const maxScore = parseFloat(scoreParts[1]) || 20;
              const ratio = maxScore > 0 ? (numScore / maxScore) * 100 : 0;
              const isPassed = ratio >= 50;

              return (
                <tr
                  key={idx}
                  className="hover:bg-orange-50/30 transition-colors group"
                >
                  {/* ID */}
                  <td className="px-5 py-4 whitespace-nowrap">
                    <span className="font-mono text-xs font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200/60">
                      {exam.id}
                    </span>
                  </td>

                  {/* Name */}
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-orange-50 text-[#dd6b01] border border-orange-100/80 flex items-center justify-center shrink-0 group-hover:bg-[#dd6b01] group-hover:text-white transition-colors duration-200">
                        <FaFileAlt className="text-xs" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-slate-900 group-hover:text-[#dd6b01] transition-colors truncate max-w-xs sm:max-w-md">
                          {exam.name}
                        </p>
                        <p className="text-[11px] text-slate-400 font-semibold">
                          Multiple Choice Evaluation
                        </p>
                      </div>
                    </div>
                  </td>

                  {/* Score */}
                  <td className="px-5 py-4 whitespace-nowrap">
                    <div className="flex flex-col gap-1 min-w-[110px]">
                      <div className="flex items-center gap-2">
                        <span
                          className={`font-black text-sm ${
                            isPassed ? "text-emerald-600" : "text-rose-600"
                          }`}
                        >
                          {exam.score || "0"}
                        </span>
                        <span
                          className={`inline-flex items-center gap-1 text-[10px] font-extrabold px-1.5 py-0.2 rounded border ${
                            isPassed
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                              : "bg-rose-50 text-rose-700 border-rose-200"
                          }`}
                        >
                          {isPassed ? (
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
                      {/* Mini visual progress bar */}
                      <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            isPassed ? "bg-emerald-500" : "bg-rose-500"
                          }`}
                          style={{ width: `${Math.min(100, Math.max(5, ratio))}%` }}
                        />
                      </div>
                    </div>
                  </td>

                  {/* Negative Marking */}
                  <td className="px-5 py-4 whitespace-nowrap">
                    <span
                      className={`text-xs font-bold px-2 py-0.5 rounded-md border ${
                        exam.negative && parseFloat(exam.negative) > 0
                          ? "bg-rose-50 text-rose-600 border-rose-100"
                          : "bg-slate-50 text-slate-600 border-slate-100"
                      }`}
                    >
                      {exam.negative && parseFloat(exam.negative) > 0
                        ? `-${exam.negative}`
                        : "0.0"}
                    </span>
                  </td>

                  {/* Actions */}
                  <td className="px-5 py-4 text-right whitespace-nowrap">
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
                          className="!text-xs !py-1.5 !px-3 gap-1.5 shadow-xs"
                        >
                          <FaEye className="text-xs text-[#dd6b01]" />
                          <span className="text-slate-700 font-bold">View Report</span>
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
