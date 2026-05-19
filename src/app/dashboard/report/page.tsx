"use client";

import Link from "next/link";
import { useState, useMemo } from "react";
import {
  FaSearch,
  FaSortAmountDown,
  FaSortAmountUp,
  FaEye,
  FaDownload,
  FaFilter,
} from "react-icons/fa";
import { PageContainer } from "@/components/common/PageContainer";

type Report = {
  id: string;
  examName: string;
  packName: string;
  startDate: string;
  highest: number;
  lowest: number;
  average: number;
  totalStudents: number;
};

const reportData: Report[] = [
  {
    id: "EP-101",
    examName: "Algebra Basics",
    packName: "Mathematics - HSC",
    startDate: "2025-10-05T10:30",
    highest: 19,
    lowest: 8,
    average: 13.5,
    totalStudents: 45,
  },
  {
    id: "EP-102",
    examName: "Physics Fundamentals",
    packName: "Science - SSC",
    startDate: "2025-09-25T09:00",
    highest: 20,
    lowest: 10,
    average: 15.6,
    totalStudents: 52,
  },
  {
    id: "EP-103",
    examName: "Chemistry Lab",
    packName: "Science - HSC",
    startDate: "2025-10-01T14:00",
    highest: 18,
    lowest: 6,
    average: 12.7,
    totalStudents: 48,
  },
  {
    id: "EP-104",
    examName: "Biology Concepts",
    packName: "Science - HSC",
    startDate: "2025-10-07T13:00",
    highest: 19,
    lowest: 11,
    average: 15.3,
    totalStudents: 50,
  },
  {
    id: "EP-105",
    examName: "Geography Basics",
    packName: "General Studies - SSC",
    startDate: "2025-09-28T09:00",
    highest: 17,
    lowest: 7,
    average: 11.8,
    totalStudents: 42,
  },
];

export default function TeacherReportPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<
    "highest" | "lowest" | "average" | "date"
  >("highest");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [showDropdown, setShowDropdown] = useState(false);

  // ---- Filter & Sort Logic ----
  const filteredReports = useMemo(() => {
    const filtered = reportData.filter(
      (r) =>
        r.examName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.packName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.id.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return filtered.sort((a, b) => {
      let valA, valB;
      if (sortBy === "date") {
        valA = new Date(a.startDate).getTime();
        valB = new Date(b.startDate).getTime();
      } else {
        valA = a[sortBy];
        valB = b[sortBy];
      }

      return sortOrder === "asc" ? valA - valB : valB - valA;
    });
  }, [searchTerm, sortBy, sortOrder]);

  // ---- Sort Options ----
  const sortOptions: {
    label: string;
    value: "highest" | "lowest" | "average" | "date";
  }[] = [
    { label: "Sort by Highest", value: "highest" },
    { label: "Sort by Lowest", value: "lowest" },
    { label: "Sort by Average", value: "average" },
    { label: "Sort by Date", value: "date" },
  ];

  return (
    <PageContainer className="space-y-6">
      <h1 className="text-3xl font-bold text-[#dd6b01] mb-6">
        Teacher Exam Reports
      </h1>

      {/* ---- Controls ---- */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-6">
        {/* Search */}
        <div className="flex items-center w-full md:w-1/3 border border-[#dd6b01] rounded-lg px-3 py-2">
          <FaSearch className="text-[#dd6b01] mr-2" />
          <input
            type="text"
            placeholder="Search by Exam, Pack or ID"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full outline-none text-sm"
          />
        </div>

        {/* Sort Controls */}
        <div className="flex items-center gap-3 relative">
          {/* Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowDropdown((p) => !p)}
              className="flex items-center justify-between min-w-[170px] border border-[#dd6b01] text-[#dd6b01] text-sm px-3 py-2 rounded-lg hover:bg-[#fff4ec] transition"
            >
              {sortBy === "highest"
                ? "Sort by Highest"
                : sortBy === "lowest"
                ? "Sort by Lowest"
                : sortBy === "average"
                ? "Sort by Average"
                : "Sort by Date"}
              <FaSortAmountDown
                className={`ml-2 transition-transform ${
                  showDropdown ? "rotate-180" : ""
                }`}
              />
            </button>

            {showDropdown && (
              <ul className="absolute top-full left-0 mt-1 w-full bg-white border border-[#dd6b01] rounded-lg shadow-md z-20">
                {sortOptions.map((opt) => (
                  <li
                    key={opt.value}
                    onClick={() => {
                      setSortBy(opt.value);
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

          {/* Sort Order */}
          <button
            onClick={() => setSortOrder((p) => (p === "asc" ? "desc" : "asc"))}
            className="flex items-center gap-2 border border-[#dd6b01] px-3 py-2 rounded-lg text-sm text-[#dd6b01] hover:bg-[#dd6b01] hover:text-white transition"
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
                Pack Name
              </th>
              <th className="px-6 py-4 text-left uppercase tracking-wide text-sm font-semibold">
                Start Date
              </th>
              <th className="px-6 py-4 text-left uppercase tracking-wide text-sm font-semibold">
                Highest
              </th>
              <th className="px-6 py-4 text-left uppercase tracking-wide text-sm font-semibold">
                Lowest
              </th>
              <th className="px-6 py-4 text-left uppercase tracking-wide text-sm font-semibold">
                Average
              </th>
              <th className="px-6 py-4 text-left uppercase tracking-wide text-sm font-semibold">
                Students
              </th>
            </tr>
          </thead>

          <tbody className="bg-white">
            {filteredReports.map((r) => (
              <tr
                key={r.id}
                className="border-b border-gray-200 hover:bg-[#ffedd5]/50 transition-colors"
              >
                <td className="px-6 py-4 font-mono text-sm text-gray-600 bg-amber-50">
                  {r.id}
                </td>

                <td className="px-6 py-4 text-[#dd6b01] font-semibold underline">
                  <Link href={`/dashboard/report/${r.id}`}>{r.examName}</Link>
                </td>

                <td className="px-6 py-4 text-gray-700">{r.packName}</td>

                <td className="px-6 py-4 text-gray-600 text-sm">
                  {new Date(r.startDate).toLocaleDateString("en-US", {
                    weekday: "short",
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </td>

                <td className="px-6 py-4 text-green-600 font-bold">
                  {r.highest}
                </td>

                <td className="px-6 py-4 text-red-600 font-semibold">
                  {r.lowest}
                </td>

                <td className="px-6 py-4 text-gray-800">{r.average}</td>

                <td className="px-6 py-4 text-gray-600 text-sm">
                  {r.totalStudents}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredReports.length === 0 && (
          <p className="text-center text-gray-500 py-6">No reports found.</p>
        )}
      </div>
    </PageContainer>
  );
}
