"use client";

import React, { useState, useEffect } from "react";
import { FaEye, FaPlay, FaCalendarAlt, FaCheckCircle, FaSpinner } from "react-icons/fa";
import { PageContainer } from "../../../../components/common/PageContainer";
import { PrimaryBtn } from "../../../../components/ui/PrimaryBtn";
import { OutlineBtn } from "../../../../components/ui/OutlineBtn";
import { getExamsAction } from "../../../../lib/actions";

type Exam = {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  status: "Start Exam" | "Complete" | "Expire";
  link: string;
  attemptId?: number;
};

interface ExamPackDetailsClientViewProps {
  packId?: number;
  initialPack: any;
  initialExams: any[];
  initialStats: any;
  initialAttempts?: any[];
}

export default function ExamPackDetailsClientView({
  packId,
  initialPack,
  initialExams,
  initialStats,
  initialAttempts = [],
}: ExamPackDetailsClientViewProps) {
  const packTitle = initialPack?.title || "Exam Pack";
  const [examsData, setExamsData] = useState<any[]>(initialExams || []);
  const [loading, setLoading] = useState<boolean>(false);

  // Synchronize when initialExams changes from SSR
  useEffect(() => {
    if (initialExams && initialExams.length > 0) {
      setExamsData(initialExams);
    }
  }, [initialExams]);

  // Client-side self-healing fallback:
  // If SSR provided empty exams (e.g. during client-side router cache transition),
  // immediately fetch fresh exams from server action using token
  useEffect(() => {
    if (packId && (!initialExams || initialExams.length === 0)) {
      setLoading(true);
      const token = typeof window !== "undefined" ? localStorage.getItem("token") || undefined : undefined;
      getExamsAction(packId, token)
        .then((fetched) => {
          if (fetched && Array.isArray(fetched) && fetched.length > 0) {
            setExamsData(fetched);
          }
        })
        .catch((err) => {
          console.error("Failed to load exams client-side:", err);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [packId, initialExams]);

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
      const cleanId = item.examId || (item.id.startsWith("#") ? item.id.substring(1) : item.id);
      if (!attemptMap.has(cleanId)) {
        attemptMap.set(cleanId, { id: item.attemptId, examId: cleanId });
      }
    });
  }

  const now = new Date();
  const exams: Exam[] = (examsData || []).map((e: any) => {
    const end = new Date(e.endDate);
    const userAttempt = attemptMap.get(e.id);
    let status: "Start Exam" | "Complete" | "Expire" = "Start Exam";

    if (userAttempt) {
      status = "Complete";
    } else if (now > end) {
      status = "Expire";
    }

    return {
      id: e.id,
      name: e.name,
      startDate: e.startDate,
      endDate: e.endDate,
      status,
      link: `/dashboard/exam-pack/exam-pack-details/${e.id}`,
      attemptId: userAttempt?.id,
    };
  });


  return (
    <PageContainer className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <span className="text-xs font-extrabold text-[#dd6b01] uppercase tracking-wider block mb-1">
            Exam Pack Modules
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            {packTitle}
          </h1>
        </div>
        <OutlineBtn
          link="/dashboard/exam-pack"
          className="!text-xs !py-1.5 !px-3.5 gap-1 shadow-xs"
        >
          ← Back to All Packs
        </OutlineBtn>
      </div>

      <div className="overflow-x-auto bg-white border border-slate-200/80 rounded-3xl shadow-sm">
        <table className="min-w-full border-collapse">
          <thead>
            <tr className="bg-slate-50/90 border-b border-slate-200/80 text-slate-500 font-extrabold text-[11px] uppercase tracking-wider">
              <th className="px-6 py-4 text-left">Exam Name</th>
              <th className="px-6 py-4 text-left">Exam Code</th>
              <th className="px-6 py-4 text-left">Start Date</th>
              <th className="px-6 py-4 text-left">End Date</th>
              <th className="px-6 py-4 text-center">Status / Evaluation Report</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm font-medium">
            {exams.map((exam) => (
              <tr key={exam.id} className="hover:bg-slate-50/50 transition-colors">
                <td className="px-6 py-4 font-bold text-slate-900">{exam.name}</td>
                <td className="px-6 py-4 font-mono text-xs text-slate-500">#{exam.id}</td>
                <td className="px-6 py-4 text-xs text-slate-600 font-semibold">{exam.startDate}</td>
                <td className="px-6 py-4 text-xs text-slate-600 font-semibold">{exam.endDate}</td>
                <td className="px-6 py-4 text-center">
                  {exam.status === "Start Exam" && (
                    <PrimaryBtn
                      link={exam.link}
                      className="!text-xs !py-1.5 !px-3 gap-1.5 shadow-xs"
                    >
                      <FaPlay className="text-[10px]" />
                      <span>Start Exam</span>
                    </PrimaryBtn>
                  )}
                  {exam.status === "Complete" && (
                    <div className="flex items-center justify-center gap-2">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-50 text-emerald-700 font-bold text-xs rounded-full border border-emerald-200">
                        <FaCheckCircle className="text-[11px]" />
                        <span>Completed</span>
                      </span>
                      {exam.attemptId ? (
                        <OutlineBtn
                          link={`/dashboard/reporting/${exam.attemptId}`}
                          className="!text-xs !py-1.5 !px-3 gap-1.5 shadow-xs"
                        >
                          <FaEye className="text-xs text-[#dd6b01]" />
                          <span className="text-slate-700 font-bold">View Report</span>
                        </OutlineBtn>
                      ) : (
                        <OutlineBtn
                          link="/dashboard/reporting"
                          className="!text-xs !py-1.5 !px-3 gap-1.5 shadow-xs"
                        >
                          <FaEye className="text-xs text-[#dd6b01]" />
                          <span className="text-slate-700 font-bold">Reports</span>
                        </OutlineBtn>
                      )}
                    </div>
                  )}
                  {exam.status === "Expire" && (
                    <span className="inline-block px-4 py-1.5 bg-slate-100 text-slate-500 font-bold text-xs rounded-full border border-slate-200">
                      Expired
                    </span>
                  )}
                </td>
              </tr>
            ))}

            {loading && (
              <tr>
                <td colSpan={5} className="py-12 text-center text-slate-500 font-medium text-xs">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <FaSpinner className="animate-spin text-xl text-[#dd6b01]" />
                    <span>Loading exams...</span>
                  </div>
                </td>
              </tr>
            )}

            {!loading && exams.length === 0 && (
              <tr>
                <td colSpan={5} className="py-10 text-center text-slate-400 font-medium text-xs">
                  No active exams available in this pack.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </PageContainer>
  );
}
