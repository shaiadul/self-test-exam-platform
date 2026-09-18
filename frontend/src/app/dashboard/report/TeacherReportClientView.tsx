"use client";

import Link from "next/link";
import { useState, useMemo } from "react";
import {
  FaSearch,
  FaSortAmountDown,
  FaSortAmountUp,
  FaFilter,
  FaChartLine,
  FaArrowRight,
} from "react-icons/fa";
import { PageContainer } from "../../../components/common/PageContainer";
import EmptyState from "../../../components/common/EmptyState";

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
    <PageContainer className="space-y-6 animate-fadeIn pb-12">
      {/* Header Command Strip */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded bg-blue-50 text-blue-600 flex items-center justify-center text-base border border-blue-200/60 shadow-2xs">
            <FaChartLine />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Teacher Exam Evaluation Reports
            </h1>
          </div>
        </div>

        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-100 text-slate-600 border border-slate-200 text-xs font-mono font-bold">
          {filteredReports.length} EXAMS EVALUATED
        </span>
      </div>

      {/* ---- Controls Toolbar ---- */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Search Input */}
        <div className="flex items-center w-full md:w-1/2 border border-slate-200/80 rounded px-3 py-2 bg-white shadow-2xs focus-within:border-primary transition">
          <FaSearch className="text-slate-400 mr-2 text-xs" />
          <input
            type="text"
            placeholder="Search by exam, pack name or code..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full outline-none text-xs font-medium text-slate-800 placeholder-slate-400 bg-transparent"
          />
        </div>

        {/* Sort & Order */}
        <div className="flex items-center gap-2 w-full md:w-auto justify-end">
          {/* Custom Dropdown */}
          <div className="relative w-full md:w-48">
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="w-full flex items-center justify-between border border-slate-200/80 rounded px-3 py-2 text-xs bg-white hover:border-primary/50 transition text-slate-700 cursor-pointer shadow-2xs font-medium"
            >
              <span className="flex items-center gap-1.5">
                <FaFilter className="text-[10px] text-slate-400" />
                {sortOptions.find((o) => o.value === sortBy)?.label}
              </span>
              <span className="text-[10px] text-slate-400">▼</span>
            </button>

            {showDropdown && (
              <div className="absolute right-0 mt-1 w-full bg-white border border-slate-200 rounded shadow-lg z-20 overflow-hidden">
                {sortOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => {
                      setSortBy(option.value);
                      setShowDropdown(false);
                    }}
                    className={`w-full text-left px-3.5 py-2 text-xs hover:bg-slate-50 transition cursor-pointer ${
                      sortBy === option.value
                        ? "font-bold text-primary bg-primary/5 font-mono"
                        : "text-slate-700"
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
            className="flex items-center justify-center border border-slate-200/80 rounded p-2.5 bg-white hover:border-primary/50 transition text-slate-700 cursor-pointer shadow-2xs"
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

      {/* ---- Cards Grid ---- */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredReports.map((report) => (
          <Link
            key={report.id}
            href={`/dashboard/teacher-reports/${report.id}`}
            className="group relative overflow-hidden bg-white rounded border border-slate-200/80 p-4 shadow-2xs hover:border-primary/40 hover:shadow-xs transition flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded bg-orange-50 text-orange-700 border border-orange-200/60 uppercase">
                  {report.packName}
                </span>
                <span className="text-[11px] font-mono text-slate-400 font-medium">
                  {report.startDate}
                </span>
              </div>

              <h3 className="text-sm font-bold text-slate-900 group-hover:text-primary transition-colors line-clamp-1 mb-3">
                {report.examName}
              </h3>

              {/* Stats Summary Grid */}
              <div className="grid grid-cols-3 gap-1 bg-slate-50/70 p-2 rounded border border-slate-200/60 mb-3 text-center font-mono">
                <div>
                  <p className="text-[9px] text-slate-400 font-bold uppercase">
                    HIGHEST
                  </p>
                  <p className="text-xs font-black text-emerald-600">
                    {report.highest}
                  </p>
                </div>
                <div className="border-x border-slate-200">
                  <p className="text-[9px] text-slate-400 font-bold uppercase">
                    AVERAGE
                  </p>
                  <p className="text-xs font-black text-blue-600">
                    {report.average}
                  </p>
                </div>
                <div>
                  <p className="text-[9px] text-slate-400 font-bold uppercase">
                    LOWEST
                  </p>
                  <p className="text-xs font-black text-rose-500">
                    {report.lowest}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2.5 border-t border-slate-100 text-[11px] text-slate-500">
              <span className="font-mono">ATTENDEES</span>
              <div className="flex items-center gap-1 font-bold text-slate-800 font-mono">
                <span>{report.totalStudents} STUDENTS</span>
                <FaArrowRight className="text-[9px] text-slate-400 group-hover:text-primary group-hover:translate-x-0.5 transition-transform" />
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* ---- Empty State ---- */}
      {filteredReports.length === 0 && (
        <div className="rounded bg-white border border-slate-200/80 shadow-2xs">
          <EmptyState
            compact
            type="reports"
            title="No Reports Found"
            description="No evaluation reports match your current search and filter criteria."
            actionLabel="Clear Filter"
            onAction={() => setSearchTerm("")}
          />
        </div>
      )}
    </PageContainer>
  );
}
