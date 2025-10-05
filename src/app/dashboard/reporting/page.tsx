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

type Report = {
  id: string;
  name: string;
  startDate: string;
  score: number;
  total: number;
  average: number;
  negativeMark: number; // 🆕 new field
};

const reportData: Report[] = [
  {
    id: "HSC2341",
    name: "Algebra Basics",
    startDate: "2025-10-05T10:30",
    score: 14,
    total: 20,
    average: 65,
    negativeMark: -2,
  },
  {
    id: "SSC2341",
    name: "Physics Fundamentals",
    startDate: "2025-09-25T09:00",
    score: 18,
    total: 20,
    average: 85,
    negativeMark: -1,
  },
  {
    id: "BCSS2341",
    name: "Chemistry Lab",
    startDate: "2025-10-01T14:00",
    score: 12,
    total: 20,
    average: 70,
    negativeMark: -3,
  },
  {
    id: "HSC2342",
    name: "Biology Concepts",
    startDate: "2025-10-07T13:00",
    score: 19,
    total: 20,
    average: 80,
    negativeMark: -1,
  },
  {
    id: "SSC2342",
    name: "Geography Basics",
    startDate: "2025-09-28T09:00",
    score: 16,
    total: 20,
    average: 77,
    negativeMark: -2,
  },
  {
    id: "BCSS2342",
    name: "Physics Lab",
    startDate: "2025-10-03T15:00",
    score: 13,
    total: 20,
    average: 72,
    negativeMark: -3,
  },
];

export default function ExamReportPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<"score" | "date">("score");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [showDropdown, setShowDropdown] = useState(false);

  // ---- Filtered & Sorted Data ----
  const filteredReports = useMemo(() => {
    const filtered = reportData.filter(
      (r) =>
        r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.id.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return filtered.sort((a, b) => {
      if (sortBy === "score") {
        return sortOrder === "asc" ? a.score - b.score : b.score - a.score;
      } else {
        return sortOrder === "asc"
          ? new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
          : new Date(b.startDate).getTime() - new Date(a.startDate).getTime();
      }
    });
  }, [searchTerm, sortBy, sortOrder]);

  return (
    <div className="p-6 md:p-10">
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
            placeholder="Search by Exam Name or ID"
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
            className="flex items-center gap-2 border border-[#dd6b01] px-3 py-2 rounded-lg text-[#dd6b01] hover:bg-[#dd6b01] hover:text-white transition"
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
                Exam ID
              </th>
              <th className="px-6 py-4 text-left uppercase tracking-wide text-sm font-semibold">
                Exam Name
              </th>
              <th className="px-6 py-4 text-left uppercase tracking-wide text-sm font-semibold">
                Start Date & Time
              </th>
              <th className="px-6 py-4 text-left uppercase tracking-wide text-sm font-semibold">
                Your Score
              </th>
              <th className="px-6 py-4 text-left uppercase tracking-wide text-sm font-semibold">
                Negative Mark
              </th>
              <th className="px-6 py-4 text-left uppercase tracking-wide text-sm font-semibold">
                Average Mark
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
                {/* Exam ID */}
                <td className="px-6 py-4 font-mono text-sm text-gray-600 bg-amber-50">
                  {r.id}
                </td>

                {/* Exam Name */}
                <td className="px-6 py-4 text-[#dd6b01] font-semibold underline cursor-pointer">
                 <Link href={`/dashboard/reporting/${r.id}`}> {r.name}</Link>
                </td>

                {/* Start Date */}
                <td className="px-6 py-4 text-gray-700 text-sm">
                  <div className="flex flex-col">
                    <span className="font-semibold">
                      {new Date(r.startDate).toLocaleDateString("en-US", {
                        weekday: "short",
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                    <span className="text-gray-500 text-xs">
                      {new Date(r.startDate).toLocaleTimeString("en-US", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                </td>

                {/* Score / Total */}
                <td
                  className={`px-6 py-4 font-bold ${
                    (r.score / r.total) * 100 >= 80
                      ? "text-green-600"
                      : (r.score / r.total) * 100 >= 60
                      ? "text-yellow-600"
                      : "text-red-600"
                  }`}
                >
                  {r.score}/{r.total}
                </td>

                {/* Negative Mark */}
                <td className="px-6 py-4 text-red-600 font-semibold">
                  {r.negativeMark}
                </td>

                {/* Average */}
                <td className="px-6 py-4 text-gray-700">{r.average}%</td>

                {/* Actions */}
                <td className="px-6 py-4 flex items-center gap-3">
                  <button className="flex items-center gap-1 border border-[#dd6b01] text-[#dd6b01] px-3 py-1.5 rounded-lg text-sm hover:bg-[#dd6b01] hover:text-white transition cursor-pointer">
                    <FaEye /> View
                  </button>
                  <button className="flex items-center gap-1 border border-green-600 text-green-600 px-3 py-1.5 rounded-lg text-sm hover:bg-green-600 hover:text-white transition cursor-pointer">
                    <FaDownload /> Download
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredReports.length === 0 && (
          <p className="text-center text-gray-500 py-6">No results found.</p>
        )}
      </div>
    </div>
  );
}
