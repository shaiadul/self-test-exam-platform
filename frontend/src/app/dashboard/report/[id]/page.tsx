"use client";

import Image from "next/image";
import { useState, useEffect, useMemo } from "react";
import { useParams } from "next/navigation";
import { FaSearch, FaSortAmountDown, FaSortAmountUp, FaTrophy, FaChartLine, FaArrowDown, FaGraduationCap } from "react-icons/fa";
import { PageContainer } from "../../../../components/common/PageContainer";
import { getTeacherReportDetailsAction } from "../../../../lib/actions";

interface StudentAttempt {
  id: number;
  name: string;
  institution: string;
  time: string;
  score: number;
  negative: number;
  passed: boolean;
  meritRank?: number;
}

export default function SingleExamReportPage() {
  const params = useParams();
  const examId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [report, setReport] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<"merit" | "score" | "name" | "institution">("merit");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    async function loadReport() {
      if (!examId) return;
      setLoading(true);
      try {
        const res = await getTeacherReportDetailsAction(examId);
        if (res) {
          setReport(res);
        }
      } catch (err) {
        console.error("Failed to load teacher report details:", err);
      } finally {
        setLoading(false);
      }
    }
    loadReport();
  }, [examId]);

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

      return sortOrder === "asc"
        ? Number(valA) - Number(valB)
        : Number(valB) - Number(valA);
    });
  }, [report, searchTerm, sortBy, sortOrder]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#dd6b01]"></div>
      </div>
    );
  }

  if (!report) {
    return (
      <PageContainer className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-700 font-sans">Report Not Found</h2>
        <p className="text-gray-500 mt-2">Could not find exam report details.</p>
      </PageContainer>
    );
  }

  return (
    <PageContainer className="space-y-8 animate-fadeIn">
      {/* ---- Exam Header ---- */}
      <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-md">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          <div className="space-y-2">
            <span className="px-3 py-1 bg-orange-100 text-[#dd6b01] text-xs font-bold rounded-full border border-orange-200 uppercase tracking-wider">
              {report.level} - {report.batch}
            </span>
            <h1 className="text-2xl font-black text-gray-900 tracking-tight mt-1">{report.examName}</h1>
            <p className="text-gray-500 font-medium">{report.packName}</p>
            <p className="text-gray-400 text-xs font-semibold">
              {new Date(report.startDate).toLocaleString("en-US", {
                weekday: "short",
                month: "short",
                day: "numeric",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          </div>

          <div className="lg:col-span-2 grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-gray-50/50 border border-gray-100 rounded-2xl p-4 text-center">
              <span className="text-xs text-gray-400 font-bold uppercase tracking-wider block mb-1">Total Marks</span>
              <p className="text-xl font-black text-gray-800">{report.totalMarks}</p>
            </div>
            <div className="bg-gray-50/50 border border-gray-100 rounded-2xl p-4 text-center">
              <span className="text-xs text-gray-400 font-bold uppercase tracking-wider block mb-1">Mark / Q</span>
              <p className="text-xl font-black text-gray-800">{report.perQuestionMarks || 1.0}</p>
            </div>
            <div className="bg-gray-50/50 border border-gray-100 rounded-2xl p-4 text-center">
              <span className="text-xs text-gray-400 font-bold uppercase tracking-wider block mb-1">Pass Marks</span>
              <p className="text-xl font-black text-[#dd6b01]">{report.passingMarks}</p>
            </div>
            <div className="bg-gray-50/50 border border-gray-100 rounded-2xl p-4 text-center">
              <span className="text-xs text-gray-400 font-bold uppercase tracking-wider block mb-1">Negative Mark</span>
              <p className="text-xl font-black text-red-600">{report.negativeMarks}</p>
            </div>
          </div>
        </div>
      </div>

      {/* ---- Metrics Grid ---- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-[#dd6b01] to-[#f0b176] rounded-3xl p-6 text-white shadow-lg flex items-center justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-orange-100">Highest Score</span>
            <p className="text-3xl font-black mt-1">{report.highest?.toFixed(2) || "0.00"}</p>
          </div>
          <FaTrophy className="text-4xl opacity-35" />
        </div>
        <div className="bg-gradient-to-br from-indigo-600 to-blue-500 rounded-3xl p-6 text-white shadow-lg flex items-center justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-blue-100">Average Score</span>
            <p className="text-3xl font-black mt-1">{report.average?.toFixed(2) || "0.00"}</p>
          </div>
          <FaChartLine className="text-4xl opacity-35" />
        </div>
        <div className="bg-gradient-to-br from-rose-600 to-red-500 rounded-3xl p-6 text-white shadow-lg flex items-center justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-rose-100">Lowest Score</span>
            <p className="text-3xl font-black mt-1">{report.lowest?.toFixed(2) || "0.00"}</p>
          </div>
          <FaArrowDown className="text-4xl opacity-35" />
        </div>
      </div>

      {/* ---- Filter & Sort ---- */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center w-full md:w-1/3 border border-gray-200 bg-white rounded-2xl px-4 py-2.5 shadow-sm">
          <FaSearch className="text-[#dd6b01] mr-2" />
          <input
            type="text"
            placeholder="Search student by name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full outline-none text-sm font-medium"
          />
        </div>

        <div className="flex items-center gap-3 relative w-full md:w-auto justify-end">
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowDropdown(!showDropdown)}
              className="flex items-center justify-between min-w-[160px] bg-white border border-gray-200 text-gray-700 text-sm px-4 py-2.5 rounded-2xl hover:bg-gray-50 transition shadow-sm font-semibold cursor-pointer"
            >
              {sortBy === "merit"
                ? "Sort by Merit"
                : sortBy === "score"
                  ? "Sort by Score"
                  : sortBy === "name"
                    ? "Sort by Name"
                    : "Sort by College"}
              <FaSortAmountDown
                className={`ml-2 transition-transform text-[#dd6b01] ${
                  showDropdown ? "rotate-180" : ""
                }`}
              />
            </button>

            {showDropdown && (
              <ul className="absolute right-0 top-full mt-1.5 w-48 bg-white border border-gray-100 rounded-2xl shadow-xl z-20 overflow-hidden py-1">
                {[
                  { label: "Sort by Merit", value: "merit" },
                  { label: "Sort by Score", value: "score" },
                  { label: "Sort by Name", value: "name" },
                  { label: "Sort by College", value: "institution" },
                ].map((opt) => (
                  <li
                    key={opt.value}
                    onClick={() => {
                      setSortBy(opt.value as any);
                      setShowDropdown(false);
                    }}
                    className={`px-4 py-2.5 text-sm font-semibold cursor-pointer hover:bg-[#fff4ec] hover:text-[#dd6b01] transition ${
                      sortBy === opt.value ? "bg-[#fff4ec] text-[#dd6b01]" : "text-gray-700"
                    }`}
                  >
                    {opt.label}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <button
            onClick={() =>
              setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"))
            }
            className="flex items-center gap-2 bg-white border border-gray-200 px-4 py-2.5 rounded-2xl text-sm font-semibold text-gray-700 hover:bg-gray-50 transition shadow-sm cursor-pointer"
          >
            {sortOrder === "asc" ? (
              <>
                <FaSortAmountUp className="text-[#dd6b01]" /> Asc
              </>
            ) : (
              <>
                <FaSortAmountDown className="text-[#dd6b01]" /> Desc
              </>
            )}
          </button>
        </div>
      </div>

      {/* ---- Students Table ---- */}
      <div className="overflow-x-auto bg-white border border-gray-100 rounded-3xl shadow-lg">
        <table className="min-w-full border-collapse">
          <thead className="bg-[#fff4ec] text-[#dd6b01] border-b border-orange-100/50">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider">
                Merit
              </th>
              <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider">
                Name
              </th>
              <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider">
                Institution
              </th>
              <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider">
                Time Submitted
              </th>
              <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider">
                Score
              </th>
              <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider">
                Negative
              </th>
              <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {sortedStudents.map((s: StudentAttempt) => (
              <tr
                key={s.id}
                className="hover:bg-[#ffedd5]/25 transition"
              >
                <td className="px-6 py-4 text-sm font-bold text-gray-800">
                  {s.meritRank}
                </td>
                <td className="px-6 py-4 flex items-center gap-3">
                  <div className="w-9 h-9 flex items-center justify-center rounded-2xl bg-[#dd6b01]/10 text-[#dd6b01] font-bold text-sm">
                    {s.name ? s.name.charAt(0).toUpperCase() : "?"}
                  </div>
                  <span className="font-bold text-gray-900">{s.name}</span>
                </td>
                <td className="px-6 py-4 text-sm font-medium text-gray-600">
                  {s.institution}
                </td>
                <td className="px-6 py-4 text-xs font-semibold text-gray-400">
                  {new Date(s.time).toLocaleTimeString("en-US", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </td>
                <td className="px-6 py-4 text-sm font-black text-gray-850">
                  {s.score}
                </td>
                <td className="px-6 py-4 text-sm font-bold text-red-500">
                  {s.negative?.toFixed(2)}
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`px-3 py-1 text-[10px] font-bold rounded-full border ${
                      s.passed
                        ? "bg-green-50 text-green-700 border-green-200"
                        : "bg-red-50 text-red-700 border-red-200"
                    }`}
                  >
                    {s.passed ? "PASSED" : "FAILED"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {sortedStudents.length === 0 && (
          <div className="text-center text-gray-500 py-12 flex flex-col items-center justify-center space-y-2">
            <FaGraduationCap className="text-4xl text-gray-300" />
            <p className="font-semibold text-gray-600">No attempts logged yet</p>
            <p className="text-xs text-gray-400">Students attempts will show up here after submission.</p>
          </div>
        )}
      </div>
    </PageContainer>
  );
}
