"use client";

import Link from "next/link";
import { useState, useMemo, useEffect } from "react";
import {
  FaSearch,
  FaSortAmountDown,
  FaSortAmountUp,
  FaEye,
  FaDownload,
} from "react-icons/fa";
import { PageContainer } from "../../../components/common/PageContainer";
import { getUserAttemptsAction } from "../../../lib/actions";

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

export default function ExamReportPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<"score" | "date">("score");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [showDropdown, setShowDropdown] = useState(false);
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch attempts on mount
  useEffect(() => {
    async function loadReports() {
      setLoading(true);
      try {
        const data = await getUserAttemptsAction();
        setReports(data || []);
      } catch (err) {
        console.error("Failed to load reports:", err);
      } finally {
        setLoading(false);
      }
    }
    loadReports();
  }, []);

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

  if (loading) {
    return (
      <PageContainer>
        <div className="flex flex-col items-center justify-center min-h-[400px]">
          <div className="w-12 h-12 border-4 border-[#dd6b01] border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-600 font-medium">Loading reports...</p>
        </div>
      </PageContainer>
    );
  }

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

        {/* Sort Controls (Custom Select Inline) */}
        <div className="flex items-center gap-3 relative">
          {/* Custom Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowDropdown((prev) => !prev)}
              className="flex items-center justify-between min-w-[160px] border border-[#dd6b01] text-[#dd6b01] text-sm px-3 py-2 rounded-lg hover:bg-[#fff4ec] transition cursor-pointer"
            >
              {sortBy === "score" ? "Sort by Score" : "Sort by Date"}
              <FaSortAmountDown
                className={`ml-2 transition-transform ${
                  showDropdown ? "rotate-180" : ""
                }`}
              />
            </button>

            {showDropdown && (
              <ul className="absolute top-full left-0 mt-1 w-full bg-white border border-[#dd6b01] rounded-lg shadow-md z-20 cursor-pointer">
                {[
                  { label: "Sort by Score", value: "score" },
                  { label: "Sort by Date", value: "date" },
                ].map((opt) => (
                  <li
                    key={opt.value}
                    onClick={() => {
                      setSortBy(opt.value as "score" | "date");
                      setShowDropdown(false);
                    }}
                    className={`px-3 py-2 cursor-pointer text-sm hover:bg-[#dd6b01] hover:text-white ${
                      sortBy === opt.value ? "bg-[#dd6b01] text-white" : ""
                    }`}
                  >
                    {opt.label}
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Sort Order Button */}
          <button
            onClick={() =>
              setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"))
            }
            className="flex items-center text-sm gap-2 border border-[#dd6b01] px-3 py-2 rounded-lg text-[#dd6b01] hover:bg-[#dd6b01] hover:text-white transition"
          >
            {sortOrder === "asc" ? (
              <>
                <FaSortAmountUp /> Asc
              </>
            ) : (
              <>
                <FaSortAmountDown /> Desc
              </>
            )}
          </button>
        </div>
      </div>

      {/* ---- Table ---- */}
      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse shadow-lg rounded-xl overflow-hidden">
          <thead className="bg-amber-50 text-gray-400">
            <tr>
              <th className="px-6 py-4 text-left uppercase tracking-wide text-sm font-semibold">
                Attempt ID
              </th>
              <th className="px-6 py-4 text-left uppercase tracking-wide text-sm font-semibold">
                Exam Name
              </th>
              <th className="px-6 py-4 text-left uppercase tracking-wide text-sm font-semibold">
                Attempt Date & Time
              </th>
              <th className="px-6 py-4 text-left uppercase tracking-wide text-sm font-semibold">
                Your Score
              </th>
              <th className="px-6 py-4 text-left uppercase tracking-wide text-sm font-semibold">
                Negative Mark
              </th>
              <th className="px-6 py-4 text-left uppercase tracking-wide text-sm font-semibold">
                Final Score
              </th>
              <th className="px-6 py-4 text-left uppercase tracking-wide text-sm font-semibold">
                Action
              </th>
            </tr>
          </thead>

          <tbody className="bg-white">
            {filteredReports.map((r) => (
              <tr
                key={r.id}
                className="border-b border-gray-200 hover:bg-[#ffedd5]/50 transition-colors"
              >
                {/* Attempt ID */}
                <td className="px-6 py-4 font-mono text-sm text-gray-600 bg-amber-50">
                  ATT-{r.id}
                </td>

                {/* Exam Name */}
                <td className="px-6 py-4 text-[#dd6b01] font-semibold underline cursor-pointer">
                  <Link href={`/dashboard/reporting/${r.id}`}> {r.examName}</Link>
                </td>

                {/* Attempt Date */}
                <td className="px-6 py-4 text-gray-700 text-sm">
                  <div className="flex flex-col">
                    <span className="font-semibold">
                      {new Date(r.createdAt).toLocaleDateString("en-US", {
                        weekday: "short",
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                    <span className="text-gray-500 text-xs">
                      {new Date(r.createdAt).toLocaleTimeString("en-US", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                </td>

                {/* Score / Total */}
                <td
                  className={`px-6 py-4 font-bold ${
                    (r.correct / r.total) * 100 >= 80
                      ? "text-green-600"
                      : (r.correct / r.total) * 100 >= 60
                        ? "text-yellow-600"
                        : "text-red-600"
                  }`}
                >
                  {r.correct}/{r.total}
                </td>

                {/* Negative Mark */}
                <td className="px-6 py-4 text-red-600 font-semibold">
                  {r.negative}
                </td>

                {/* Final Score */}
                <td className="px-6 py-4 text-gray-700 font-bold">{r.finalScore} / {r.total * 1}</td>

                {/* Actions */}
                <td className="px-6 py-4 flex items-center gap-3">
                  <Link
                    href={`/dashboard/reporting/${r.id}`}
                    className="flex items-center gap-1 border border-[#dd6b01] text-[#dd6b01] px-3 py-1.5 rounded-lg text-sm hover:bg-[#dd6b01] hover:text-white transition cursor-pointer"
                  >
                    <FaEye /> View
                  </Link>
                  <Link
                    href={`/dashboard/reporting/${r.id}`}
                    className="flex items-center gap-1 border border-green-600 text-green-600 px-3 py-1.5 rounded-lg text-sm hover:bg-green-600 hover:text-white transition cursor-pointer"
                  >
                    <FaDownload /> Certificate
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredReports.length === 0 && (
          <p className="text-center text-gray-500 py-6">No results found.</p>
        )}
      </div>
    </PageContainer>
  );
}
