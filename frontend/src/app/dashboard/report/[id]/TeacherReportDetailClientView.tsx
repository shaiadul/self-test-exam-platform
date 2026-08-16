"use client";

import { useState, useMemo } from "react";
import { FaSearch, FaSortAmountDown, FaSortAmountUp, FaTrophy, FaChartLine, FaArrowDown, FaGraduationCap } from "react-icons/fa";
import { PageContainer } from "../../../../components/common/PageContainer";

interface TeacherReportDetailClientViewProps {
  examId: string;
  initialReport: any;
}

export default function TeacherReportDetailClientView({
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
        <div className="text-center py-16 text-gray-500 font-medium">
          Report details not found.
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer className="space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="border-b border-gray-100 pb-6">
        <div className="flex items-center gap-2 mb-1">
          <span className="px-3 py-1 bg-orange-100 text-[#dd6b01] font-bold text-xs rounded-full">
            {report.packName || "Exam Pack"}
          </span>
          <span className="text-xs text-gray-400 font-semibold">• Code: {report.id}</span>
        </div>
        <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight">
          {report.examName}
        </h1>
        <p className="text-sm text-gray-500 font-medium mt-1">
          Evaluated on {report.startDate || "Recent"} • Total Attended: {report.attempts?.length || 0} Students
        </p>
      </div>

      {/* Analytics Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-md flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center text-2xl font-bold">
            <FaTrophy />
          </div>
          <div>
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block">Highest Score</span>
            <p className="text-2xl font-black text-gray-900">{report.highestScore ?? 0}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-md flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center text-2xl font-bold">
            <FaChartLine />
          </div>
          <div>
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block">Average Score</span>
            <p className="text-2xl font-black text-blue-600">{report.averageScore ?? 0}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-md flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center text-2xl font-bold">
            <FaArrowDown />
          </div>
          <div>
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block">Lowest Score</span>
            <p className="text-2xl font-black text-rose-600">{report.lowestScore ?? 0}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-md flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-purple-100 text-purple-600 flex items-center justify-center text-2xl font-bold">
            <FaGraduationCap />
          </div>
          <div>
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block">Pass Rate</span>
            <p className="text-2xl font-black text-purple-600">{report.passRate || "100%"}</p>
          </div>
        </div>
      </div>

      {/* Filter and Table */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-md overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h3 className="text-lg font-extrabold text-gray-900">Merit List & Student Submissions</h3>

          <div className="flex items-center gap-3">
            <div className="flex items-center border border-gray-300 rounded-xl px-3 py-2 text-sm bg-white">
              <FaSearch className="text-gray-400 mr-2" />
              <input
                type="text"
                placeholder="Search student name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="outline-none text-xs font-semibold"
              />
            </div>

            <div className="relative">
              <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="flex items-center justify-between border border-gray-300 rounded-xl px-3 py-2 text-xs font-bold text-gray-700 bg-white hover:border-[#dd6b01]"
              >
                <span>Sort: {sortOptions.find((o) => o.value === sortBy)?.label}</span>
              </button>

              {showDropdown && (
                <div className="absolute right-0 mt-1 w-56 bg-white border border-gray-200 rounded-xl shadow-lg z-20 overflow-hidden">
                  {sortOptions.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => {
                        setSortBy(opt.value as any);
                        setShowDropdown(false);
                      }}
                      className="w-full text-left px-4 py-2 text-xs font-semibold hover:bg-orange-50 text-gray-700"
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <button
              onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
              className="p-2 border border-gray-300 rounded-xl text-gray-600 hover:border-[#dd6b01]"
            >
              {sortOrder === "asc" ? <FaSortAmountUp /> : <FaSortAmountDown />}
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
