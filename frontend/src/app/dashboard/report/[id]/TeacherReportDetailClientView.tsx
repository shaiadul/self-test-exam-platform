"use client";

import { useState, useMemo } from "react";
import {
  FaSearch,
  FaSortAmountDown,
  FaSortAmountUp,
  FaTrophy,
  FaChartLine,
  FaArrowDown,
  FaGraduationCap,
  FaArrowLeft,
  FaFilter,
} from "react-icons/fa";
import { PageContainer } from "../../../../components/common/PageContainer";
import { OutlineBtn } from "../../../../components/ui/OutlineBtn";
import { PrimaryBtn } from "../../../../components/ui/PrimaryBtn";

interface TeacherReportDetailClientViewProps {
  examId: string;
  initialReport: any;
}

export default function TeacherReportDetailClientView({
  examId,
  initialReport,
}: TeacherReportDetailClientViewProps) {
  const [report] = useState<any>(initialReport);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<"merit" | "score" | "name" | "institution">("merit");
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
      s.name.toLowerCase().includes(searchTerm.toLowerCase())
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

  const sortOptions = [
    { label: "Merit Position (1st → Last)", value: "merit" },
    { label: "Marks Scored", value: "score" },
    { label: "Student Name", value: "name" },
    { label: "Institution", value: "institution" },
  ];

  if (!report) {
    return (
      <PageContainer>
        <div className="text-center py-20 px-4 bg-white rounded-3xl border border-slate-200/80 shadow-sm max-w-lg mx-auto">
          <h2 className="text-xl font-black text-slate-900 mb-2">
            Exam Report Not Found
          </h2>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mb-6">
            We couldn&apos;t load the evaluation report for this exam. It may have been archived or removed.
          </p>
          <PrimaryBtn
            link="/dashboard/report"
            className="!text-xs !py-2.5 !px-5 gap-2 shadow-sm"
          >
            <FaArrowLeft className="text-xs" />
            <span>Return to Exam Reports</span>
          </PrimaryBtn>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer className="space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div className="flex items-center gap-3">
          <OutlineBtn
            link="/dashboard/report"
            className="!p-2.5 !rounded-xl !text-slate-600 hover:!text-[#dd6b01] shadow-xs"
            title="Back to Reports"
          >
            <FaArrowLeft className="text-xs" />
          </OutlineBtn>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 bg-orange-100 text-[#dd6b01] font-extrabold text-[11px] rounded-full">
                {report.packName || "Exam Pack"}
              </span>
              <span className="text-xs text-gray-400 font-semibold">• Code: #{report.id || examId}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              {report.examName}
            </h1>
            <p className="text-xs text-slate-500 font-medium mt-1">
              Evaluated on {report.startDate || "Recent"} • Total Attended: {report.attempts?.length || 0} Students
            </p>
          </div>
        </div>
      </div>

      {/* Unified Summary Strip (Cohesive metrics replacing bulky cards) */}
      <div className="rounded-2xl border border-slate-200/80 bg-white shadow-xs overflow-hidden">
        <div className="grid grid-cols-2 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-slate-100">
          <div className="p-4 sm:p-5 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center text-sm font-bold shrink-0">
              <FaTrophy />
            </div>
            <div>
              <p className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
                Highest Score
              </p>
              <p className="text-xl font-black text-slate-900">{report.highestScore ?? 0}</p>
            </div>
          </div>

          <div className="p-4 sm:p-5 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center text-sm font-bold shrink-0">
              <FaChartLine />
            </div>
            <div>
              <p className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
                Average Score
              </p>
              <p className="text-xl font-black text-blue-600">{report.averageScore ?? 0}</p>
            </div>
          </div>

          <div className="p-4 sm:p-5 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-500 flex items-center justify-center text-sm font-bold shrink-0">
              <FaArrowDown />
            </div>
            <div>
              <p className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
                Lowest Score
              </p>
              <p className="text-xl font-black text-rose-500">{report.lowestScore ?? 0}</p>
            </div>
          </div>

          <div className="p-4 sm:p-5 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center text-sm font-bold shrink-0">
              <FaGraduationCap />
            </div>
            <div>
              <p className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
                Pass Rate
              </p>
              <p className="text-xl font-black text-purple-600">{report.passRate || "100%"}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h3 className="text-xl font-black text-slate-900 tracking-tight">
              Merit List & Student Submissions
            </h3>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Ranked candidate scores and evaluated answer sheets.
            </p>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            {/* Standard Search Input */}
            <div className="flex items-center w-full md:w-64 border border-[#dd6b01] rounded-lg px-3 py-2 bg-white">
              <FaSearch className="text-[#dd6b01] mr-2 text-xs" />
              <input
                type="text"
                placeholder="Search student or institution..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="outline-none text-xs font-medium bg-transparent w-full text-gray-700 placeholder-gray-400"
              />
            </div>

            {/* Reusable Dropdown */}
            <div className="relative w-full md:w-48">
              <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="w-full flex items-center justify-between border border-gray-300 rounded-lg px-3 py-2 text-xs bg-white hover:border-[#dd6b01] transition text-gray-700 cursor-pointer"
              >
                <span className="flex items-center gap-1">
                  <FaFilter className="text-[10px] text-gray-400 mr-1" />
                  {sortOptions.find((o) => o.value === sortBy)?.label}
                </span>
                <span className="text-[10px] text-gray-400">▼</span>
              </button>

              {showDropdown && (
                <div className="absolute right-0 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg z-20 overflow-hidden">
                  {sortOptions.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => {
                        setSortBy(opt.value as any);
                        setShowDropdown(false);
                      }}
                      className={`w-full text-left px-3 py-2 text-xs hover:bg-orange-50 transition cursor-pointer ${
                        sortBy === opt.value
                          ? "font-bold text-[#dd6b01] bg-orange-50/50"
                          : "text-gray-700"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Toggle Order Button */}
            <button
              onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
              className="flex items-center justify-center border border-gray-300 rounded-lg p-2.5 bg-white hover:border-[#dd6b01] transition text-gray-700 cursor-pointer shrink-0"
              title={`Sort Order: ${sortOrder === "asc" ? "Ascending" : "Descending"}`}
            >
              {sortOrder === "asc" ? (
                <FaSortAmountUp className="text-[#dd6b01] text-xs" />
              ) : (
                <FaSortAmountDown className="text-[#dd6b01] text-xs" />
              )}
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-gray-400 font-bold text-xs uppercase tracking-wider border-b border-gray-100">
                <th className="py-4 px-6">Rank</th>
                <th className="py-4 px-6">Student Name</th>
                <th className="py-4 px-6">Institution</th>
                <th className="py-4 px-6">Completion Time</th>
                <th className="py-4 px-6 text-center">Score Marks</th>
                <th className="py-4 px-6 text-right">Result Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {sortedStudents.map((st) => (
                <tr key={st.id} className="hover:bg-gray-50/50 transition">
                  <td className="py-4 px-6 font-black text-gray-900">
                    <span className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold ${
                      st.meritRank === 1 ? "bg-amber-100 text-amber-800" :
                      st.meritRank === 2 ? "bg-gray-200 text-gray-800" :
                      st.meritRank === 3 ? "bg-orange-100 text-orange-800" :
                      "bg-gray-100 text-gray-600"
                    }`}>
                      #{st.meritRank}
                    </span>
                  </td>
                  <td className="py-4 px-6 font-bold text-gray-900">{st.name}</td>
                  <td className="py-4 px-6 text-gray-600 text-xs font-semibold">{st.institution || "N/A"}</td>
                  <td className="py-4 px-6 text-gray-500 text-xs">{st.time || "Recent"}</td>
                  <td className="py-4 px-6 text-center font-extrabold text-gray-900">{st.score}</td>
                  <td className="py-4 px-6 text-right">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-black uppercase ${
                      st.passed ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"
                    }`}>
                      {st.passed ? "PASSED" : "FAILED"}
                    </span>
                  </td>
                </tr>
              ))}

              {sortedStudents.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-gray-500 font-medium">
                    No student submissions found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </PageContainer>
  );
}
