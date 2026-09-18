"use client";

import { useState, useMemo } from "react";
import { FaArrowLeft } from "react-icons/fa";
import { PageContainer } from "../../../../components/common/PageContainer";
import EmptyState from "../../../../components/common/EmptyState";
import { OutlineBtn } from "../../../../components/ui/OutlineBtn";
import { formatDate } from "@/lib/date";
import { TeacherReportMetrics } from "./components/TeacherReportMetrics";
import { TeacherReportFilterBar } from "./components/TeacherReportFilterBar";
import { TeacherReportTable } from "./components/TeacherReportTable";
import { TeacherReportMobileCards } from "./components/TeacherReportMobileCards";

interface TeacherReportDetailClientViewProps {
  examId: string;
  initialReport: any;
}

export default function TeacherReportDetailClientView({
  initialReport,
}: TeacherReportDetailClientViewProps) {
  const [report] = useState<any>(initialReport);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<
    "merit" | "score" | "name" | "institution"
  >("merit");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [showDropdown, setShowDropdown] = useState(false);

  const sortedStudents = useMemo(() => {
    if (!report?.attempts) return [];

    // Map attempts and assign rank based on score descending
    const list = [...report.attempts];
    const ranked = list
      .sort((a, b) => b.score - a.score)
      .map((att, idx) => ({
        ...att,
        meritRank: idx + 1,
      }));

    // Resolve ties
    let currentRank = 1;
    for (let i = 0; i < ranked.length; i++) {
      if (i > 0 && ranked[i].score < ranked[i - 1].score) {
        currentRank = i + 1;
      }
      ranked[i].meritRank = currentRank;
    }

    // Apply filter
    const filtered = ranked.filter((s) =>
      s.name.toLowerCase().includes(searchTerm.toLowerCase()),
    );

    // Apply user sort
    return filtered.sort((a, b) => {
      let valA: any = 0;
      let valB: any = 0;

      if (sortBy === "score") {
        valA = a.score;
        valB = b.score;
      } else if (sortBy === "merit") {
        valA = a.meritRank;
        valB = b.meritRank;
      } else if (sortBy === "name") {
        valA = a.name;
        valB = b.name;
      } else if (sortBy === "institution") {
        valA = a.institution;
        valB = b.institution;
      }

      if (typeof valA === "string" && typeof valB === "string") {
        return sortOrder === "asc"
          ? valA.localeCompare(valB)
          : valB.localeCompare(valA);
      }

      return sortOrder === "asc" ? valA - valB : valB - valA;
    });
  }, [report, searchTerm, sortBy, sortOrder]);

  const totalAttempts = report?.attempts?.length || 0;
  const passedAttempts =
    report?.attempts?.filter((a: any) => a.passed).length || 0;
  const passRate =
    totalAttempts > 0
      ? `${Math.round((passedAttempts / totalAttempts) * 100)}%`
      : "0%";

  if (!report) {
    return (
      <PageContainer className="py-12">
        <div className="text-center py-16 px-4 bg-white rounded border border-slate-200/80 shadow-2xs max-w-lg mx-auto">
          <EmptyState
            compact
            type="reports"
            title="Exam Report Not Found"
            description="We couldn't load the evaluation report for this exam. It may have been archived or removed."
            actionLabel="Return to Exam Reports"
            actionHref="/dashboard/teacher-reports"
          />
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer className="space-y-6 animate-fadeIn pb-12">
      {/* Header Command Strip */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-4">
        <div className="flex items-center gap-3">
          <OutlineBtn
            link="/dashboard/teacher-reports"
            className="!p-2 !rounded !text-slate-600 hover:!text-primary shadow-2xs border-slate-200"
            title="Back to Reports"
          >
            <FaArrowLeft className="text-xs" />
          </OutlineBtn>
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              {report.packName && (
                <span className="text-xs font-semibold text-slate-500">
                  {report.packName}
                </span>
              )}
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              {report.examName}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2 font-mono text-xs text-slate-500">
          <span className="px-2 py-0.5 rounded bg-slate-100 border border-slate-200">
            DATE: {formatDate(report.startDate) || "RECENT"}
          </span>
          <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200 font-bold">
            {report.attempts?.length || 0} SUBMISSIONS
          </span>
        </div>
      </div>

      {/* Unified Summary Strip */}
      <TeacherReportMetrics
        highest={report.highest ?? 0}
        average={report.average ?? 0}
        lowest={report.lowest ?? 0}
        passRate={passRate}
      />

      {/* Filter and Table Container */}
      <div className="bg-white rounded-none border border-slate-200/80 shadow-2xs overflow-hidden">
        <TeacherReportFilterBar
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          sortBy={sortBy}
          onSortChange={setSortBy}
          sortOrder={sortOrder}
          onOrderToggle={() =>
            setSortOrder(sortOrder === "asc" ? "desc" : "asc")
          }
          showDropdown={showDropdown}
          setShowDropdown={setShowDropdown}
        />

        <TeacherReportTable students={sortedStudents} />
        <TeacherReportMobileCards students={sortedStudents} />
      </div>
    </PageContainer>
  );
}
