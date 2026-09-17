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
import EmptyState from "../../../../components/common/EmptyState";
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
    { label: "Merit Position", value: "merit" },
    { label: "Marks Scored", value: "score" },
    { label: "Student Name", value: "name" },
    { label: "Institution", value: "institution" },
  ];

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
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">
                EVALUATION // {report.packName || "EXAM_PACK"}
              </span>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 border border-slate-200 font-bold">
                #{report.id || examId}
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              {report.examName}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2 font-mono text-xs text-slate-500">
          <span className="px-2 py-0.5 rounded bg-slate-100 border border-slate-200">
            DATE: {report.startDate || "RECENT"}
          </span>
          <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200 font-bold">
            {report.attempts?.length || 0} SUBMISSIONS
          </span>
        </div>
      </div>

      {/* Unified Summary Strip */}
      <div className="rounded border border-slate-200/80 bg-white shadow-2xs overflow-hidden">
        <div className="grid grid-cols-2 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-slate-100">
          <div className="p-4 flex items-center gap-3">
            <div className="w-9 h-9 rounded bg-amber-50 text-amber-600 border border-amber-200/60 flex items-center justify-center text-sm font-bold shrink-0">
              <FaTrophy />
            </div>
            <div>
              <p className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">
                HIGHEST SCORE
              </p>
              <p className="text-lg font-black font-mono text-slate-900">{report.highest ?? 0}</p>
            </div>
          </div>

          <div className="p-4 flex items-center gap-3">
            <div className="w-9 h-9 rounded bg-blue-50 text-blue-600 border border-blue-200/60 flex items-center justify-center text-sm font-bold shrink-0">
              <FaChartLine />
            </div>
            <div>
              <p className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">
                AVERAGE SCORE
              </p>
              <p className="text-lg font-black font-mono text-blue-600">{report.average ?? 0}</p>
            </div>
          </div>

          <div className="p-4 flex items-center gap-3">
            <div className="w-9 h-9 rounded bg-rose-50 text-rose-500 border border-rose-200/60 flex items-center justify-center text-sm font-bold shrink-0">
              <FaArrowDown />
            </div>
            <div>
              <p className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">
                LOWEST SCORE
              </p>
              <p className="text-lg font-black font-mono text-rose-500">{report.lowest ?? 0}</p>
            </div>
          </div>

          <div className="p-4 flex items-center gap-3">
            <div className="w-9 h-9 rounded bg-purple-50 text-purple-600 border border-purple-200/60 flex items-center justify-center text-sm font-bold shrink-0">
              <FaGraduationCap />
            </div>
            <div>
              <p className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">
                PASS RATE
              </p>
              <p className="text-lg font-black font-mono text-purple-600">{passRate}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Table */}
      <div className="bg-white rounded-none border border-slate-200/80 shadow-2xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-3 bg-slate-50/50">
          <div>
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-600">
              MERIT LIST &amp; CANDIDATE SUBMISSIONS
            </span>
            <p className="text-[11px] text-slate-400 font-medium">
              Ranked candidate scores and evaluated answer sheets.
            </p>
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto">
            {/* Standard Search Input */}
            <div className="flex items-center w-full md:w-60 border border-slate-200/80 rounded px-2.5 py-1.5 bg-white shadow-2xs focus-within:border-primary transition">
              <FaSearch className="text-slate-400 mr-2 text-xs" />
              <input
                type="text"
                placeholder="Search student or institution..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="outline-none text-xs font-medium bg-transparent w-full text-slate-700 placeholder-slate-400"
              />
            </div>

            {/* Reusable Dropdown */}
            <div className="relative w-full md:w-44">
              <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="w-full flex items-center justify-between border border-slate-200/80 rounded px-2.5 py-1.5 text-xs bg-white hover:border-primary/50 transition text-slate-700 cursor-pointer shadow-2xs font-medium"
              >
                <span className="flex items-center gap-1">
                  <FaFilter className="text-[10px] text-slate-400 mr-1" />
                  {sortOptions.find((o) => o.value === sortBy)?.label}
                </span>
                <span className="text-[10px] text-slate-400">▼</span>
              </button>

              {showDropdown && (
                <div className="absolute right-0 mt-1 w-full bg-white border border-slate-200 rounded shadow-lg z-20 overflow-hidden">
                  {sortOptions.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => {
                        setSortBy(opt.value as any);
                        setShowDropdown(false);
                      }}
                      className={`w-full text-left px-3 py-2 text-xs hover:bg-slate-50 transition cursor-pointer ${
                        sortBy === opt.value
                          ? "font-bold text-primary bg-primary/5 font-mono"
                          : "text-slate-700"
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
              className="flex items-center justify-center border border-slate-200/80 rounded p-2 bg-white hover:border-primary/50 transition text-slate-700 cursor-pointer shrink-0 shadow-2xs"
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

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/70 border-b border-slate-200/80 text-slate-500 font-mono font-bold text-[10px] uppercase tracking-wider">
                <th className="py-3 px-4">Rank</th>
                <th className="py-3 px-4">Student Name</th>
                <th className="py-3 px-4">Institution</th>
                <th className="py-3 px-4">Completion Time</th>
                <th className="py-3 px-4 text-center">Score Marks</th>
                <th className="py-3 px-4 text-right">Result Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {sortedStudents.map((st) => (
                <tr key={st.id} className="hover:bg-slate-50/50 transition">
                  <td className="py-3 px-4 font-mono font-bold text-slate-900">
                    <span className={`inline-flex items-center justify-center px-1.5 py-0.2 rounded text-[11px] font-mono font-bold border ${
                      st.meritRank === 1 ? "bg-amber-100 text-amber-800 border-amber-200" :
                      st.meritRank === 2 ? "bg-slate-200 text-slate-800 border-slate-300" :
                      st.meritRank === 3 ? "bg-orange-100 text-orange-800 border-orange-200" :
                      "bg-slate-100 text-slate-600 border-slate-200"
                    }`}>
                      #{st.meritRank}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-bold text-slate-900">{st.name}</td>
                  <td className="py-3 px-4 text-slate-500 text-[11px] font-medium">{st.institution || "—"}</td>
                  <td className="py-3 px-4 text-slate-500 font-mono text-[11px]">{st.time || "Recent"}</td>
                  <td className="py-3 px-4 text-center font-mono font-black text-slate-900 text-sm">{st.score}</td>
                  <td className="py-3 px-4 text-right">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase border ${
                      st.passed ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-rose-50 text-rose-700 border-rose-200"
                    }`}>
                      {st.passed ? "PASSED" : "FAILED"}
                    </span>
                  </td>
                </tr>
              ))}

              {sortedStudents.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-8 text-center">
                    <EmptyState
                      compact
                      type="reports"
                      title="No Submissions Found"
                      description="No student attempts match your criteria."
                    />
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
