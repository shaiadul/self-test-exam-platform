"use client";

import { useState, useMemo } from "react";
import { FaArrowRight } from "react-icons/fa";
import { PageContainer } from "../../../components/common/PageContainer";
import EmptyState from "../../../components/common/EmptyState";
import { PrimaryBtn } from "../../../components/ui/PrimaryBtn";
import { Report, ReportingSummary } from "./types";
import { ReportingSummaryCards } from "./components/ReportingSummaryCards";
import { ReportingFilterBar } from "./components/ReportingFilterBar";
import { ReportingTable } from "./components/ReportingTable";
import { ReportingMobileCards } from "./components/ReportingMobileCards";
import DynamicPagination from "../../../components/common/DynamicPagination";
import { PaginationMeta } from "../../../lib/actions";

interface ReportingClientViewProps {
  initialReports: Report[];
  initialMeta?: PaginationMeta;
}

export default function ReportingClientView({
  initialReports,
  initialMeta,
}: ReportingClientViewProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<"score" | "date">("date");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [showDropdown, setShowDropdown] = useState(false);
  const reports = initialReports || [];

  // Summary Metrics
  const summary: ReportingSummary = useMemo(() => {
    const totalExams = reports.length;
    const passedExams = reports.filter((r) => r.passed).length;
    const failedExams = totalExams - passedExams;
    const totalScore = reports.reduce(
      (acc, r) => acc + (Number(r.finalScore) || 0),
      0,
    );
    const avgScore =
      totalExams > 0 ? (totalScore / totalExams).toFixed(1) : "0.0";
    const passRate =
      totalExams > 0 ? Math.round((passedExams / totalExams) * 100) : 0;

    return { totalExams, passedExams, failedExams, avgScore, passRate };
  }, [reports]);

  // Filtered & Sorted Data
  const filteredReports = useMemo(() => {
    const filtered = reports.filter(
      (r) =>
        r.examName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.examId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.id.toString().includes(searchTerm),
    );

    return filtered.sort((a, b) => {
      if (sortBy === "score") {
        return sortOrder === "asc"
          ? a.finalScore - b.finalScore
          : b.finalScore - a.finalScore;
      } else {
        return sortOrder === "asc"
          ? new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          : new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
    });
  }, [reports, searchTerm, sortBy, sortOrder]);

  return (
    <PageContainer className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <span className="text-[10px] font-mono font-bold text-primary uppercase tracking-wider block mb-1">
            Candidate Analytics
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            My Exam Reports & Results
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Browse and review comprehensive solutions for all mock exams you
            have attended.
          </p>
        </div>

        <PrimaryBtn
          link="/dashboard/exam-pack"
          className="!text-xs !py-2.5 !px-5 gap-2 shadow-sm self-start sm:self-center"
        >
          <span>Take More Mocks</span>
          <FaArrowRight className="text-[10px]" />
        </PrimaryBtn>
      </div>

      {/* Summary Cards */}
      {reports.length > 0 && <ReportingSummaryCards summary={summary} />}

      {/* Controls Toolbar */}
      <ReportingFilterBar
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        sortBy={sortBy}
        onSortChange={setSortBy}
        sortOrder={sortOrder}
        onOrderToggle={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
        showDropdown={showDropdown}
        setShowDropdown={setShowDropdown}
      />

      {/* Data Views (Desktop Table & Mobile Cards) */}
      {filteredReports.length > 0 && (
        <>
          <ReportingTable reports={filteredReports} />
          <ReportingMobileCards reports={filteredReports} />
        </>
      )}

      {/* Empty State */}
      {filteredReports.length === 0 && (
        <div className="bg-white rounded-none border border-slate-200/80 shadow-xs max-w-2xl mx-auto">
          <EmptyState
            type="reports"
            title="No Exam Reports Found"
            description="You haven't attended any exams matching your search criteria. Take a self-test or mock exam to generate detailed performance analytics and certificate!"
            actionLabel="Explore Exam Packs"
            actionHref="/dashboard/exam-pack"
          />
        </div>
      )}

      <DynamicPagination meta={initialMeta} />
    </PageContainer>
  );
}
