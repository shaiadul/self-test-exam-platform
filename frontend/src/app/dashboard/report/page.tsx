"use client";

import Link from "next/link";
import { useState, useMemo, useEffect } from "react";
import {
  FaSearch,
  FaSortAmountDown,
  FaSortAmountUp,
  FaFilter,
} from "react-icons/fa";
import { PageContainer } from "../../../components/common/PageContainer";
import { getTeacherReportsAction } from "../../../lib/actions";

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

export default function TeacherReportPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<
    "highest" | "lowest" | "average" | "date"
  >("highest");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [showDropdown, setShowDropdown] = useState(false);
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadReports() {
      setLoading(true);
      try {
        const data = await getTeacherReportsAction();
        setReports(data || []);
      } catch (err) {
        console.error("Failed to load teacher reports:", err);
      } finally {
        setLoading(false);
      }
    }
    loadReports();
  }, []);

  // ---- Filter & Sort Logic ----
  const filteredReports = useMemo(() => {
    const filtered = reports.filter(
      (r) =>
        r.examName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.packName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.id.toLowerCase().includes(searchTerm.toLowerCase()),
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
  }, [reports, searchTerm, sortBy, sortOrder]);

  const sortOptions: {
    label: string;
    value: "highest" | "lowest" | "average" | "date";
  }[] = [
    { label: "Sort by Highest", value: "highest" },
    { label: "Sort by Lowest", value: "lowest" },
    { label: "Sort by Average", value: "average" },
    { label: "Sort by Date", value: "date" },
  ];

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
              className="flex items-center justify-between min-w-[170px] border border-[#dd6b01] text-[#dd6b01] text-sm px-3 py-2 rounded-lg bg-white hover:bg-[#fff4ec] transition cursor-pointer"
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
              <ul className="absolute top-full left-0 mt-1 w-full bg-white border border-[#dd6b01] rounded-lg shadow-md z-20 cursor-pointer">
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
            className="flex items-center gap-2 border border-[#dd6b01] px-3 py-2 rounded-lg text-sm text-[#dd6b01] bg-white hover:bg-[#dd6b01] hover:text-white transition cursor-pointer"
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

                <td className="px-6 py-4 text-gray-800">{r.average.toFixed(1)}</td>

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
