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

    // Map attempts and assign rank based on standardized leaderboard tie-breakers:
    // 1. Highest Score
    // 2. Lower Duration / Less time taken
    // 3. Attempt Number (original attempt before retakes)
    // 4. Started earlier (earlier start/submission date-time)
    const list = [...report.attempts].sort((a, b) => {
      if (b.score !== a.score) {
        return b.score - a.score;
      }
      const durA =
        a.durationSeconds && a.durationSeconds > 0
          ? a.durationSeconds
          : Infinity;
      const durB =
        b.durationSeconds && b.durationSeconds > 0
          ? b.durationSeconds
          : Infinity;
      if (durA !== durB) {
        return durA - durB;
      }
      const attNumA =
        a.attemptNumber && a.attemptNumber > 0 ? a.attemptNumber : 1;
      const attNumB =
        b.attemptNumber && b.attemptNumber > 0 ? b.attemptNumber : 1;
      if (attNumA !== attNumB) {
        return attNumA - attNumB;
      }
      const timeA = new Date(a.startedAt || a.time).getTime() || 0;
      const timeB = new Date(b.startedAt || b.time).getTime() || 0;
      return timeA - timeB;
    });

    let currentRank = 1;
    const ranked = list.map((att, idx) => {
      if (idx > 0) {
        const prev = list[idx - 1];
        const prevDur =
          prev.durationSeconds && prev.durationSeconds > 0
            ? prev.durationSeconds
            : Infinity;
        const curDur =
          att.durationSeconds && att.durationSeconds > 0
            ? att.durationSeconds
            : Infinity;
        const prevAttNum =
          prev.attemptNumber && prev.attemptNumber > 0 ? prev.attemptNumber : 1;
        const curAttNum =
          att.attemptNumber && att.attemptNumber > 0 ? att.attemptNumber : 1;
        const prevTime = new Date(prev.startedAt || prev.time).getTime() || 0;
        const curTime = new Date(att.startedAt || att.time).getTime() || 0;

        const isExactTie =
          att.score === prev.score &&
          curDur === prevDur &&
          curAttNum === prevAttNum &&
          curTime === prevTime;

        if (!isExactTie) {
          currentRank = idx + 1;
        }
      }
      return {
        ...att,
        meritRank: currentRank,
      };
    });

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
        <EmptyState
          compact
          type="reports"
          title="Exam Report Not Found"
          description="We couldn't load the evaluation report for this exam. It may have been archived or removed."
          actionLabel="Return to Exam Reports"
          actionHref="/dashboard/teacher-reports"
        />
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

        {sortedStudents.length > 0 ? (
          <>
            <TeacherReportTable students={sortedStudents} />
            <TeacherReportMobileCards students={sortedStudents} />
          </>
        ) : (
          <EmptyState
            compact
            type="reports"
            title="No Submissions Found"
            description="No student attempts match your search or filter."
            actionLabel={searchTerm ? "Clear Search Filter" : undefined}
            onAction={searchTerm ? () => setSearchTerm("") : undefined}
          />
        )}
      </div>
    </PageContainer>
  );
}
