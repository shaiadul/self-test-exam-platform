"use client";

import Link from "next/link";
import { useState, useMemo } from "react";
import {
  FaSearch,
  FaSortAmountDown,
  FaSortAmountUp,
  FaEye,
  FaDownload,
} from "react-icons/fa";
import { PageContainer } from "../../../components/common/PageContainer";

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
  const [sortBy, setSortBy] = useState<"score" | "date">("score");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [showDropdown, setShowDropdown] = useState(false);
  const [reports] = useState<Report[]>(initialReports || []);

  // ---- Filtered & Sorted Data ----
  const filteredReports = useMemo(() => {
    const filtered = reports.filter(
      (r) =>
        r.examName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.examId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.id.toString().includes(searchTerm),
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

  return (
    <PageContainer className="space-y-6">
      <h1 className="text-3xl font-bold text-[#dd6b01] mb-6">
        Exam Report Summary
      </h1>

      {/* ---- Controls ---- */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-6">
        {/* Search */}
        <div className="flex items-center w-full md:w-1/3 border border-[#dd6b01] rounded-lg px-3 py-2">
          <FaSearch className="text-[#dd6b01] mr-2" />
          <input
            type="text"
            placeholder="Search by Exam Name, ID or Attempt ID"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full outline-none text-sm"
          />
        </div>

        {/* Sort & Order */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          {/* Custom Dropdown */}
          <div className="relative w-full md:w-48">
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="w-full flex items-center justify-between border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white hover:border-[#dd6b01] transition"
            >
              <span>
                Sort by:{" "}
                <strong className="text-[#dd6b01]">
                  {sortBy === "score" ? "Final Score" : "Date"}
                </strong>
              </span>
              <span className="text-xs text-gray-400">▼</span>
            </button>

            {showDropdown && (
              <div className="absolute left-0 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg z-20">
                <button
                  onClick={() => {
                    setSortBy("score");
                    setShowDropdown(false);
                  }}
                  className="w-full text-left px-4 py-2 text-sm hover:bg-orange-50 text-gray-700"
                >
                  Final Score
                </button>
                <button
                  onClick={() => {
                    setSortBy("date");
                    setShowDropdown(false);
                  }}
                  className="w-full text-left px-4 py-2 text-sm hover:bg-orange-50 text-gray-700"
                >
                  Date
                </button>
              </div>
            )}
          </div>

          {/* Toggle Order Button */}
          <button
            onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
            className="flex items-center justify-center border border-gray-300 rounded-lg p-2 bg-white hover:border-[#dd6b01] transition"
            title={`Sort ${sortOrder === "asc" ? "Ascending" : "Descending"}`}
          >
            {sortOrder === "asc" ? (
              <FaSortAmountUp className="text-[#dd6b01]" />
            ) : (
              <FaSortAmountDown className="text-[#dd6b01]" />
            )}
          </button>
        </div>
      </div>

      {/* ---- Cards Grid ---- */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredReports.map((report) => (
          <div
            key={report.id}
            className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col justify-between hover:shadow-md transition"
          >
            <div>
              {/* Header */}
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-lg font-bold text-gray-800 line-clamp-1">
                  {report.examName}
                </h3>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold ${
                    report.passed
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  {report.passed ? "PASSED" : "FAILED"}
                </span>
              </div>

              <p className="text-xs text-gray-400 mb-4">
                Code: {report.examId} • Attempt ID: #{report.id}
              </p>

              {/* Stats breakdown */}
              <div className="grid grid-cols-2 gap-3 text-sm text-gray-600 mb-4">
                <div>
                  <p className="text-gray-400 text-xs">Total Questions</p>
                  <p className="font-bold">{report.total}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-xs">Correct Answers</p>
                  <p className="font-bold text-green-600">{report.correct}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-xs">Wrong Answers</p>
                  <p className="font-bold text-red-500">{report.wrong}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-xs">Negative Deduction</p>
                  <p className="font-bold text-red-400">-{report.negative}</p>
                </div>
              </div>

              {/* Warning box if warnings occurred */}
              {report.warningCount > 0 && (
                <div className="mb-4 p-2 bg-yellow-50 border border-yellow-200 rounded-lg text-xs text-yellow-800">
                  ⚠️ Warnings: {report.warningCount} ({report.securityMessage})
                </div>
              )}
            </div>

            {/* Bottom Actions & Final Score */}
            <div>
              <div className="flex justify-between items-center pt-4 border-t border-gray-100 mb-4">
                <span className="text-sm font-semibold text-gray-500">
                  Final Score:
                </span>
                <span className="text-xl font-extrabold text-[#dd6b01]">
                  {report.finalScore} / {report.total}
                </span>
              </div>

              <div className="flex gap-2">
                <Link
                  href={`/dashboard/reporting/${report.id}`}
                  className="flex-1 flex items-center justify-center gap-2 py-2 px-3 bg-[#dd6b01] text-white font-semibold rounded-lg text-sm hover:bg-orange-600 transition"
                >
                  <FaEye /> View Report
                </Link>
                <button
                  onClick={() => alert("Downloading PDF summary...")}
                  className="flex items-center justify-center p-2 border border-gray-300 text-gray-600 rounded-lg hover:border-[#dd6b01] hover:text-[#dd6b01] transition"
                  title="Download PDF"
                >
                  <FaDownload />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredReports.length === 0 && (
        <div className="text-center py-12 text-gray-500 bg-white rounded-2xl border border-gray-100">
          No exam reports match your search criteria.
        </div>
      )}
    </PageContainer>
  );
}
