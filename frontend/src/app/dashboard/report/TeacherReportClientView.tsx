"use client";

import Link from "next/link";
import { useState, useMemo } from "react";
import {
  FaSearch,
  FaSortAmountDown,
  FaSortAmountUp,
  FaFilter,
} from "react-icons/fa";
import { PageContainer } from "../../../components/common/PageContainer";

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

interface TeacherReportClientViewProps {
  initialReports: Report[];
}

export default function TeacherReportClientView({ initialReports }: TeacherReportClientViewProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<
    "highest" | "lowest" | "average" | "date"
  >("highest");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [showDropdown, setShowDropdown] = useState(false);
  const [reports] = useState<Report[]>(initialReports || []);

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

  return (
    <PageContainer className="space-y-6">
      <h1 className="text-3xl font-bold text-[#dd6b01] mb-6">
        Teacher Exam Reports
      </h1>

      {/* ---- Controls ---- */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-6">
        {/* Search Input */}
        <div className="flex items-center w-full md:w-1/2 border border-[#dd6b01] rounded-lg px-3 py-2 bg-white">
          <FaSearch className="text-[#dd6b01] mr-2" />
          <input
            type="text"
            placeholder="Search by Exam, Pack Name or Code..."
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

      {/* ---- Cards Grid ---- */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredReports.map((report) => (
          <Link
            key={report.id}
            href={`/dashboard/report/${report.id}`}
            className="group bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-orange-50 text-[#dd6b01] border border-orange-100">
                  {report.packName}
                </span>
                <span className="text-xs text-gray-400 font-medium">
                  {report.startDate}
                </span>
              </div>

              <h3 className="text-lg font-bold text-gray-800 group-hover:text-[#dd6b01] transition-colors line-clamp-1 mb-4">
                {report.examName}
              </h3>

              {/* Stats Summary Grid */}
              <div className="grid grid-cols-3 gap-2 bg-gray-50 p-3 rounded-xl mb-4 text-center border border-gray-100">
                <div>
                  <p className="text-[10px] text-gray-500 font-medium uppercase">
                    Highest
                  </p>
                  <p className="text-sm font-black text-emerald-600">
                    {report.highest}
                  </p>
                </div>
                <div className="border-x border-gray-200">
                  <p className="text-[10px] text-gray-500 font-medium uppercase">
                    Average
                  </p>
                  <p className="text-sm font-black text-blue-600">
                    {report.average}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] text-gray-500 font-medium uppercase">
                    Lowest
                  </p>
                  <p className="text-sm font-black text-rose-500">
                    {report.lowest}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-gray-50 text-xs text-gray-500">
              <span>Total Students</span>
              <span className="font-bold text-gray-700">
                {report.totalStudents} Attended
              </span>
            </div>
          </Link>
        ))}
      </div>

      {/* ---- Empty State ---- */}
      {filteredReports.length === 0 && (
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-100 shadow-sm">
          <p className="text-gray-500 font-medium text-base">
            No reports found matching your criteria.
          </p>
          <button
            onClick={() => setSearchTerm("")}
            className="mt-3 text-sm text-[#dd6b01] font-bold hover:underline cursor-pointer"
          >
            Clear Search
          </button>
        </div>
      )}
    </PageContainer>
  );
}
