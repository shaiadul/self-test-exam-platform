"use client";

import React, { useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  FaEye,
  FaPlay,
  FaCalendarAlt,
  FaCheckCircle,
  FaSpinner,
  FaArrowLeft,
} from "react-icons/fa";
import { PageContainer } from "../../../../components/common/PageContainer";
import EmptyState from "../../../../components/common/EmptyState";
import { PrimaryBtn } from "../../../../components/ui/PrimaryBtn";
import { OutlineBtn } from "../../../../components/ui/OutlineBtn";
import DynamicPagination from "../../../../components/common/DynamicPagination";
import { PaginationMeta } from "../../../../lib/actions";
import { formatDateTime, DATE_FORMATS } from "@/lib/date";

type Exam = {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  status: "Start Exam" | "Complete" | "Expire" | "Upcoming";
  link: string;
  attemptId?: number;
};

interface ExamPackDetailsClientViewProps {
  packId?: number;
  initialPack: any;
  initialExams: any[];
  initialMeta?: PaginationMeta;
  initialStats: any;
  initialAttempts?: any[];
}

export default function ExamPackDetailsClientView({
  packId,
  initialPack,
  initialExams = [],
  initialMeta,
  initialStats,
  initialAttempts = [],
}: ExamPackDetailsClientViewProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const packTitle = initialPack?.title || "Exam Pack";

  // If initial exams are empty (e.g. from cold client transition), revalidate with router.refresh()
  useEffect(() => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("token");
      if (token && !document.cookie.includes("token=")) {
        document.cookie = `token=${token}; path=/; max-age=86400; SameSite=Lax`;
      }
    }

    if (packId && (!initialExams || initialExams.length === 0)) {
      startTransition(() => {
        router.refresh();
      });
    }
  }, [packId, initialExams, router]);

  // Map of examId to user's latest attempt
  const attemptMap = new Map<string, any>();
  initialAttempts.forEach((a: any) => {
    if (!attemptMap.has(a.examId)) {
      attemptMap.set(a.examId, a);
    }
  });

  // Fallback check from initialStats.recentExams
  if (initialStats?.recentExams) {
    initialStats.recentExams.forEach((item: any) => {
      const cleanId =
        item.examId ||
        (item.id.startsWith("#") ? item.id.substring(1) : item.id);
      if (!attemptMap.has(cleanId)) {
        attemptMap.set(cleanId, { id: item.attemptId, examId: cleanId });
      }
    });
  }

  const now = new Date();
  const exams: Exam[] = (initialExams || []).map((e: any) => {
    const start = new Date(e.startDate);
    const end = new Date(e.endDate);
    const userAttempt = attemptMap.get(e.id);
    let status: "Start Exam" | "Complete" | "Expire" | "Upcoming" =
      "Start Exam";

    if (userAttempt) {
      status = "Complete";
    } else if (now > end) {
      status = "Expire";
    } else if (now < start) {
      status = "Upcoming";
    }

    return {
      id: e.id,
      name: e.name,
      startDate: formatDateTime(e.startDate, DATE_FORMATS.DATETIME_MEDIUM),
      endDate: formatDateTime(e.endDate, DATE_FORMATS.DATETIME_MEDIUM),
      status,
      link: `/dashboard/exam-pack/exam-pack-details/${e.id}`,
      attemptId: userAttempt?.id,
    };
  });

  return (
    <PageContainer className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-4">
        <div className="flex items-center gap-3">
          <OutlineBtn
            link="/dashboard/exam-pack"
            className="!p-2 !rounded !text-slate-600 hover:!text-primary shadow-2xs border-slate-200"
            title="Back to All Packs"
          >
            <FaArrowLeft className="text-xs" />
          </OutlineBtn>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              {packTitle}
            </h1>
          </div>
        </div>
      </div>

      {/* Desktop Table View (100% untouched) */}
      <div className="hidden sm:block overflow-x-auto bg-white border border-slate-200/80 rounded-none shadow-xs">
        <table className="min-w-full border-collapse">
          <thead>
            <tr className="bg-slate-50/90 border-b border-slate-200/80 text-slate-500 font-extrabold text-[11px] uppercase tracking-wider">
              <th className="px-5 py-3.5 text-left">Exam Name</th>
              <th className="px-5 py-3.5 text-left">Start Date</th>
              <th className="px-5 py-3.5 text-left">End Date</th>
              <th className="px-5 py-3.5 text-center">
                Status / Evaluation Report
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm font-medium">
            {exams.map((exam) => (
              <tr
                key={exam.id}
                className="hover:bg-slate-50/50 transition-colors"
              >
                <td className="px-5 py-3.5 font-bold text-slate-900 text-xs sm:text-sm">
                  {exam.name}
                </td>
                <td className="px-5 py-3.5 text-xs text-slate-600 font-semibold">
                  {exam.startDate}
                </td>
                <td className="px-5 py-3.5 text-xs text-slate-600 font-semibold">
                  {exam.endDate}
                </td>
                <td className="px-5 py-3.5 text-center">
                  {exam.status === "Start Exam" && (
                    <PrimaryBtn
                      link={exam.link}
                      className="!text-xs !py-1.5 !px-3 gap-1.5 shadow-xs !rounded"
                    >
                      <FaPlay className="text-[9px]" />
                      <span>Start Exam</span>
                    </PrimaryBtn>
                  )}
                  {exam.status === "Complete" && (
                    <div className="flex items-center justify-center gap-2">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-50 text-emerald-700 font-bold text-xs rounded-full border border-emerald-200">
                        <FaCheckCircle className="text-[10px]" />
                        <span>Completed</span>
                      </span>
                      {exam.attemptId ? (
                        <OutlineBtn
                          link={`/dashboard/reporting/${exam.attemptId}`}
                          className="!text-xs !py-1.5 !px-3 gap-1.5 shadow-xs !rounded"
                        >
                          <span className="text-slate-700 font-bold">
                            View Report
                          </span>
                        </OutlineBtn>
                      ) : (
                        <OutlineBtn
                          link="/dashboard/reporting"
                          className="!text-xs !py-1.5 !px-3 gap-1.5 shadow-xs !rounded"
                        >
                          <FaEye className="text-xs text-primary" />
                          <span className="text-slate-700 font-bold">
                            Reports
                          </span>
                        </OutlineBtn>
                      )}
                    </div>
                  )}
                  {exam.status === "Expire" && (
                    <span className="inline-block px-3.5 py-1 bg-slate-100 text-slate-500 font-bold text-xs rounded-full border border-slate-200">
                      Expired
                    </span>
                  )}
                  {exam.status === "Upcoming" && (
                    <span className="inline-block px-3.5 py-1 bg-amber-50 text-amber-700 font-bold text-xs rounded-full border border-amber-200">
                      Upcoming
                    </span>
                  )}
                </td>
              </tr>
            ))}

            {isPending && (
              <tr>
                <td
                  colSpan={5}
                  className="py-12 text-center text-slate-500 font-medium text-xs"
                >
                  <div className="flex flex-col items-center justify-center gap-2">
                    <FaSpinner className="animate-spin text-xl text-primary" />
                    <span>Loading exams...</span>
                  </div>
                </td>
              </tr>
            )}

            {!isPending && exams.length === 0 && (
              <tr>
                <td colSpan={5} className="py-6 text-center">
                  <EmptyState
                    compact
                    type="exam"
                    title="No Active Exams"
                    description="No active exams are available in this pack at this time."
                  />
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile Phone Card View */}
      <div className="block sm:hidden space-y-3">
        {exams.map((exam) => (
          <div
            key={exam.id}
            className="p-3.5 bg-white rounded border border-slate-200/80 shadow-2xs space-y-3"
          >
            {/* Header: Title & Code */}
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <h3 className="font-bold text-slate-900 text-sm tracking-tight leading-snug">
                  {exam.name}
                </h3>
                <span className="text-[10px] font-mono text-slate-400">
                  ID: #{exam.id}
                </span>
              </div>
              <span
                className={`shrink-0 text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${
                  exam.status === "Start Exam"
                    ? "bg-primary/10 text-primary border-primary/20"
                    : exam.status === "Complete"
                      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                      : "bg-slate-100 text-slate-500 border-slate-200"
                }`}
              >
                {exam.status === "Start Exam" ? "Available" : exam.status}
              </span>
            </div>

            {/* Dates Grid */}
            <div className="grid grid-cols-2 gap-2 p-2 rounded bg-slate-50 border border-slate-100 text-[11px] font-mono">
              <div>
                <span className="text-[9px] text-slate-400 block uppercase font-sans font-semibold">
                  Start:
                </span>
                <span className="text-slate-700 font-medium truncate block">
                  {exam.startDate}
                </span>
              </div>
              <div>
                <span className="text-[9px] text-slate-400 block uppercase font-sans font-semibold">
                  Deadline:
                </span>
                <span className="text-slate-700 font-medium truncate block">
                  {exam.endDate}
                </span>
              </div>
            </div>

            {/* Action Button */}
            {exam.status === "Start Exam" && (
              <PrimaryBtn
                link={exam.link}
                className="w-full !text-xs !py-2.5 gap-1.5 shadow-xs !rounded justify-center"
              >
                <FaPlay className="text-[10px]" />
                <span>Start Assessment Exam</span>
              </PrimaryBtn>
            )}

            {exam.status === "Complete" && (
              <div className="flex items-center gap-2">
                {exam.attemptId ? (
                  <OutlineBtn
                    link={`/dashboard/reporting/${exam.attemptId}`}
                    className="w-full !text-xs !py-2 shadow-xs !rounded justify-center font-bold font-mono"
                  >
                    <span>View Evaluation Report</span>
                  </OutlineBtn>
                ) : (
                  <OutlineBtn
                    link="/dashboard/reporting"
                    className="w-full !text-xs !py-2 shadow-xs !rounded justify-center font-bold font-mono"
                  >
                    <span>View Results</span>
                  </OutlineBtn>
                )}
              </div>
            )}

            {exam.status === "Expire" && (
              <div className="w-full py-2 bg-slate-100 text-slate-500 rounded text-center text-xs font-mono font-bold border border-slate-200">
                Exam Expired
              </div>
            )}

            {exam.status === "Upcoming" && (
              <div className="w-full py-2 bg-amber-50 text-amber-700 rounded text-center text-xs font-mono font-bold border border-amber-200">
                Upcoming Exam
              </div>
            )}
          </div>
        ))}

        {isPending && (
          <div className="py-8 text-center text-slate-500 font-medium text-xs bg-white rounded border border-slate-200/80">
            <div className="flex flex-col items-center justify-center gap-2">
              <FaSpinner className="animate-spin text-xl text-primary" />
              <span>Loading exams...</span>
            </div>
          </div>
        )}

        {!isPending && exams.length === 0 && (
          <div className="py-6 text-center bg-white rounded border border-slate-200/80">
            <EmptyState
              compact
              type="exam"
              title="No Active Exams"
              description="No active exams are available in this pack at this time."
            />
          </div>
        )}
      </div>

      <DynamicPagination meta={initialMeta} />
    </PageContainer>
  );
}
