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
import { PrimaryBtn } from "../../../components/ui/PrimaryBtn";
import { OutlineBtn } from "../../../components/ui/OutlineBtn";

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
          <span className="text-xs font-extrabold text-[#dd6b01] uppercase tracking-wider block mb-1">
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

      {/* Unified Summary Strip (Reduces disjointed card boxes into cohesive enterprise metrics) */}
      {reports.length > 0 && (
        <div className="rounded-2xl border border-slate-200/80 bg-white shadow-xs overflow-hidden">
          <div className="grid grid-cols-2 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-slate-100">
            <div className="p-4 sm:p-5 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-orange-50 text-[#dd6b01] flex items-center justify-center text-sm font-bold shrink-0">
                <FaClipboardList />
              </div>
              <div>
                <p className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
                  Total Attended
                </p>
                <p className="text-xl font-black text-slate-900">{summary.totalExams}</p>
              </div>
            </div>

            <div className="p-4 sm:p-5 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-sm font-bold shrink-0">
                <FaCheckDouble />
              </div>
              <div>
                <p className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
                  Passed Tests
                </p>
                <p className="text-xl font-black text-emerald-600">
                  {summary.passedExams}{" "}
                  <span className="text-xs font-semibold text-slate-400">
                    ({summary.passRate}%)
                  </span>
                </p>
              </div>
            </div>

            <div className="p-4 sm:p-5 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-500 flex items-center justify-center text-sm font-bold shrink-0">
                <FaTimesCircle />
              </div>
              <div>
                <p className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
                  Failed Tests
                </p>
                <p className="text-xl font-black text-rose-500">{summary.failedExams}</p>
              </div>
            </div>

            <div className="p-4 sm:p-5 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center text-sm font-bold shrink-0">
                <FaChartBar />
              </div>
              <div>
                <p className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
                  Average Score
                </p>
                <p className="text-xl font-black text-[#dd6b01]">{summary.avgScore}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ---- Controls (Matching other dashboard pages) ---- */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-6">
        {/* Search Input */}
        <div className="flex items-center w-full md:w-1/2 border border-[#dd6b01] rounded-lg px-3 py-2 bg-white">
          <FaSearch className="text-[#dd6b01] mr-2" />
          <input
            type="text"
            placeholder="Search by Exam, Pack Name or Attempt ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full outline-none text-sm text-gray-700 placeholder-gray-400"
          />
        </div>

        {/* Sort & Order */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-end">
          {/* Custom Dropdown */}
          <div className="relative w-full md:w-48">
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="w-full flex items-center justify-between border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white hover:border-[#dd6b01] transition text-gray-700 cursor-pointer"
            >
              <span className="flex items-center gap-1">
                <FaFilter className="text-xs text-gray-400 mr-1" />
                {sortOptions.find((o) => o.value === sortBy)?.label}
              </span>
              <span className="text-xs text-gray-400">▼</span>
            </button>

            {showDropdown && (
              <div className="absolute right-0 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg z-20 overflow-hidden">
                {sortOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => {
                      setSortBy(option.value);
                      setShowDropdown(false);
                    }}
                    className={`w-full text-left px-4 py-2 text-sm hover:bg-orange-50 transition cursor-pointer ${
                      sortBy === option.value
                        ? "font-bold text-[#dd6b01] bg-orange-50/50"
                        : "text-gray-700"
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
            className="flex items-center justify-center border border-gray-300 rounded-lg p-2.5 bg-white hover:border-[#dd6b01] transition text-gray-700 cursor-pointer"
            title={`Sort Order: ${sortOrder === "asc" ? "Ascending" : "Descending"}`}
          >
            {sortOrder === "asc" ? (
              <FaSortAmountUp className="text-[#dd6b01]" />
            ) : (
              <FaSortAmountDown className="text-[#dd6b01]" />
            )}
          </button>
        </div>
      </div>

      {/* Unified Enterprise Evaluation Data Table (Clean, reduced card-type design) */}
      {filteredReports.length > 0 && (
        <div className="overflow-x-auto rounded-2xl border border-slate-200/80 bg-white shadow-xs">
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
                const dateFormatted = report.createdAt
                  ? new Date(report.createdAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })
                  : "Recent";

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
                        <div className="w-9 h-9 rounded-xl bg-orange-50 text-[#dd6b01] border border-orange-100/80 flex items-center justify-center shrink-0 group-hover:bg-[#dd6b01] group-hover:text-white transition-colors duration-200">
                          <FaFileAlt className="text-xs" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-slate-900 group-hover:text-[#dd6b01] transition-colors truncate max-w-xs sm:max-w-md">
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
                        <span className="text-base font-black text-[#dd6b01]">
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

                    {/* Actions: Reusable UI Component */}
                    <td className="px-5 py-4 text-right whitespace-nowrap">
                      <OutlineBtn
                        link={`/dashboard/reporting/${report.id}`}
                        className="!text-xs !py-1.5 !px-3.5 gap-1.5 shadow-xs"
                      >
                        <FaEye className="text-xs text-[#dd6b01]" />
                        <span className="text-slate-700 font-bold">View Report</span>
                      </OutlineBtn>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Empty State */}
      {filteredReports.length === 0 && (
        <div className="text-center py-16 px-4 bg-white rounded-2xl border border-slate-200/80 shadow-xs max-w-lg mx-auto">
          <div className="w-16 h-16 rounded-2xl bg-orange-50 border border-orange-100 flex items-center justify-center text-[#dd6b01] text-2xl mx-auto mb-4">
            <FaFileAlt />
          </div>
          <h3 className="text-lg font-black text-slate-800 mb-1">
            No Exam Reports Found
          </h3>
          <p className="text-xs text-slate-500 leading-relaxed max-w-sm mx-auto mb-6">
            You haven&apos;t attended any exams matching your search criteria. Take a self-test or mock exam to generate detailed performance analytics and certificate!
          </p>
          <PrimaryBtn
            link="/dashboard/exam-pack"
            className="!text-xs !py-2.5 !px-5 gap-2 shadow-sm"
          >
            <span>Explore Exam Packs</span>
            <FaArrowRight className="text-xs" />
          </PrimaryBtn>
        </div>
      )}
    </PageContainer>
  );
}

