"use client";

import { useState, useMemo } from "react";
import {
  FaSearch,
  FaSortAmountDown,
  FaSortAmountUp,
  FaEye,
  FaCheckCircle,
  FaTimesCircle,
  FaArrowRight,
  FaFileAlt,
  FaClipboardList,
  FaCheckDouble,
  FaChartBar,
  FaFilter,
} from "react-icons/fa";
import { PageContainer } from "../../../components/common/PageContainer";
import EmptyState from "../../../components/common/EmptyState";
import { PrimaryBtn } from "../../../components/ui/PrimaryBtn";
import { OutlineBtn } from "../../../components/ui/OutlineBtn";
import { formatDate } from "@/lib/date";

type Report = {
  id: number;
  examId: string;
  examName: string;
  packName: string;
  answers: string;
  total: number;
  correct: number;
  wrong: number;
  negative: number;
  finalScore: number;
  passed: boolean;
  warningCount: number;
  securityMessage: string;
  createdAt: string;
};

interface ReportingClientViewProps {
  initialReports: Report[];
}

export default function ReportingClientView({ initialReports }: ReportingClientViewProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<"score" | "date">("date");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [showDropdown, setShowDropdown] = useState(false);
  const reports = initialReports || [];

  // Summary Metrics
  const summary = useMemo(() => {
    const totalExams = reports.length;
    const passedExams = reports.filter((r) => r.passed).length;
    const failedExams = totalExams - passedExams;
    const totalScore = reports.reduce((acc, r) => acc + (Number(r.finalScore) || 0), 0);
    const avgScore = totalExams > 0 ? (totalScore / totalExams).toFixed(1) : "0.0";
    const passRate = totalExams > 0 ? Math.round((passedExams / totalExams) * 100) : 0;

    return { totalExams, passedExams, failedExams, avgScore, passRate };
  }, [reports]);

  // Filtered & Sorted Data
  const filteredReports = useMemo(() => {
    const filtered = reports.filter(
      (r) =>
        r.examName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.examId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.id.toString().includes(searchTerm)
    );

    return filtered.sort((a, b) => {
      if (sortBy === "score") {
        return sortOrder === "asc" ? a.finalScore - b.finalScore : b.finalScore - a.finalScore;
      } else {
        return sortOrder === "asc"
          ? new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          : new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
    });
  }, [reports, searchTerm, sortBy, sortOrder]);

  const sortOptions: {
    label: string;
    value: "score" | "date";
  }[] = [
    { label: "Sort by Date", value: "date" },
    { label: "Sort by Score", value: "score" },
  ];

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
            Browse and review comprehensive solutions for all mock exams you have attended.
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

      {/* Unified Summary Strip */}
      {reports.length > 0 && (
        <div className="rounded border border-slate-200/80 bg-white shadow-2xs overflow-hidden">
          <div className="grid grid-cols-2 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-slate-100">
            <div className="p-4 sm:p-5 flex items-center gap-3">
              <div className="w-10 h-10 rounded bg-orange-50 text-primary border border-orange-200/60 flex items-center justify-center text-sm font-bold shrink-0">
                <FaClipboardList />
              </div>
              <div>
                <p className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">
                  Total Attended
                </p>
                <p className="text-xl font-black font-mono text-slate-900">{summary.totalExams}</p>
              </div>
            </div>

            <div className="p-4 sm:p-5 flex items-center gap-3">
              <div className="w-10 h-10 rounded bg-emerald-50 text-emerald-600 border border-emerald-200/60 flex items-center justify-center text-sm font-bold shrink-0">
                <FaCheckDouble />
              </div>
              <div>
                <p className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">
                  Passed Tests
                </p>
                <p className="text-xl font-black font-mono text-emerald-600">
                  {summary.passedExams}{" "}
                  <span className="text-xs font-semibold text-slate-400">
                    ({summary.passRate}%)
                  </span>
                </p>
              </div>
            </div>

            <div className="p-4 sm:p-5 flex items-center gap-3">
              <div className="w-10 h-10 rounded bg-rose-50 text-rose-500 border border-rose-200/60 flex items-center justify-center text-sm font-bold shrink-0">
                <FaTimesCircle />
              </div>
              <div>
                <p className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">
                  Failed Tests
                </p>
                <p className="text-xl font-black font-mono text-rose-500">{summary.failedExams}</p>
              </div>
            </div>

            <div className="p-4 sm:p-5 flex items-center gap-3">
              <div className="w-10 h-10 rounded bg-amber-50 text-amber-600 border border-amber-200/60 flex items-center justify-center text-sm font-bold shrink-0">
                <FaChartBar />
              </div>
              <div>
                <p className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">
                  Average Score
                </p>
                <p className="text-xl font-black font-mono text-primary">{summary.avgScore}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ---- Controls Toolbar ---- */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-3 mb-6">
        {/* Search Input */}
        <div className="flex items-center w-full md:w-1/2 border border-slate-200/80 rounded px-3 py-2 bg-white shadow-2xs focus-within:border-primary transition">
          <FaSearch className="text-slate-400 mr-2 text-xs" />
          <input
            type="text"
            placeholder="Search by exam, pack name or attempt ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full outline-none text-xs font-medium text-slate-800 placeholder-slate-400 bg-transparent"
          />
        </div>

        {/* Sort & Order */}
        <div className="flex items-center gap-2 w-full md:w-auto justify-end">
          {/* Custom Dropdown */}
          <div className="relative w-full md:w-48">
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="w-full flex items-center justify-between border border-slate-200/80 rounded px-3 py-2 text-xs bg-white hover:border-primary/50 transition text-slate-700 cursor-pointer shadow-2xs font-medium"
            >
              <span className="flex items-center gap-1.5">
                <FaFilter className="text-[10px] text-slate-400" />
                {sortOptions.find((o) => o.value === sortBy)?.label}
              </span>
              <span className="text-[10px] text-slate-400">▼</span>
            </button>

            {showDropdown && (
              <div className="absolute right-0 mt-1 w-full bg-white border border-slate-200 rounded shadow-lg z-20 overflow-hidden">
                {sortOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => {
                      setSortBy(option.value);
                      setShowDropdown(false);
                    }}
                    className={`w-full text-left px-3.5 py-2 text-xs hover:bg-slate-50 transition cursor-pointer ${
                      sortBy === option.value
                        ? "font-bold text-primary bg-primary/5 font-mono"
                        : "text-slate-700"
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Toggle Order Button */}
          <button
            onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
            className="flex items-center justify-center border border-slate-200/80 rounded p-2.5 bg-white hover:border-primary/50 transition text-slate-700 cursor-pointer shadow-2xs"
            title={`Sort Order: ${sortOrder === "asc" ? "Ascending" : "Descending"}`}
          >
            {sortOrder === "asc" ? (
              <FaSortAmountUp className="text-primary text-xs" />
            ) : (
              <FaSortAmountDown className="text-primary text-xs" />
            )}
          </button>
        </div>
      </div>

      {/* Unified Enterprise Evaluation Data Table (Desktop View: 100% untouched) */}
      {filteredReports.length > 0 && (
        <>
          <div className="hidden md:block overflow-x-auto rounded-none border border-slate-200/80 bg-white shadow-xs">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/90 border-b border-slate-200/80 text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
                  <th className="px-5 py-4">Attempt Ref</th>
                  <th className="px-5 py-4">Exam Details</th>
                  <th className="px-5 py-4">Date Attended</th>
                  <th className="px-5 py-4">Question Breakdown</th>
                  <th className="px-5 py-4">Score & Status</th>
                  <th className="px-5 py-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm font-medium">
                {filteredReports.map((report) => {
                  const dateFormatted = formatDate(report.createdAt, "MMM dd, yyyy", "Recent");

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
                            Total: <strong className="text-slate-900">{report.total}</strong>
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
                          <span className="text-slate-700 font-bold">View Report</span>
                        </OutlineBtn>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile Phone Card View */}
          <div className="block md:hidden space-y-3">
            {filteredReports.map((report) => {
              const dateFormatted = formatDate(report.createdAt, "MMM dd, yyyy", "Recent");

              return (
                <div
                  key={report.id}
                  className="p-3.5 bg-white rounded border border-slate-200/80 shadow-2xs space-y-3"
                >
                  {/* Attempt Ref & Date Row */}
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5 font-mono">
                      <span className="font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-200/80 text-[10px]">
                        #{report.id}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {report.examId}
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-500 font-medium">
                      {dateFormatted}
                    </span>
                  </div>

                  {/* Title & Pack */}
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm tracking-tight leading-snug">
                      {report.examName || "Mock Examination"}
                    </h3>
                    {report.packName && (
                      <p className="text-[11px] text-slate-400 font-medium mt-0.5">
                        📦 {report.packName}
                      </p>
                    )}
                    {report.warningCount > 0 && (
                      <span className="inline-block mt-1 text-[10px] text-amber-700 font-bold bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                        ⚠️ {report.warningCount} Warning(s)
                      </span>
                    )}
                  </div>

                  {/* Question Breakdown Strip */}
                  <div className="grid grid-cols-4 gap-1 p-2 rounded bg-slate-50 border border-slate-100 text-center font-mono text-[11px]">
                    <div>
                      <span className="text-[9px] text-slate-400 font-sans block">Total</span>
                      <strong className="text-slate-800">{report.total}</strong>
                    </div>
                    <div>
                      <span className="text-[9px] text-emerald-600 font-sans block">Correct</span>
                      <strong className="text-emerald-700">✓ {report.correct}</strong>
                    </div>
                    <div>
                      <span className="text-[9px] text-rose-500 font-sans block">Wrong</span>
                      <strong className="text-rose-600">✗ {report.wrong}</strong>
                    </div>
                    <div>
                      <span className="text-[9px] text-slate-400 font-sans block">Neg</span>
                      <strong className="text-slate-600">
                        {report.negative > 0 ? `-${report.negative}` : "0"}
                      </strong>
                    </div>
                  </div>

                  {/* Score & Action Row */}
                  <div className="flex items-center justify-between pt-1 border-t border-slate-100">
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-black text-primary font-mono leading-none">
                        {Number(report.finalScore).toFixed(1)}
                      </span>
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase ${
                          report.passed
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : "bg-rose-50 text-rose-700 border border-rose-200"
                        }`}
                      >
                        {report.passed ? "Passed" : "Failed"}
                      </span>
                    </div>

                    <OutlineBtn
                      link={`/dashboard/reporting/${report.id}`}
                      className="!text-xs !py-1.5 !px-3 font-mono font-bold"
                    >
                      <span>View Report</span>
                    </OutlineBtn>
                  </div>
                </div>
              );
            })}
          </div>
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
    </PageContainer>
  );
}

