"use client";

import React from "react";
import {
  FaSearch,
  FaFilter,
  FaSortAmountDown,
  FaSortAmountUp,
} from "react-icons/fa";

interface TeacherReportFilterBarProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  sortBy: "merit" | "score" | "name" | "institution";
  onSortChange: (value: "merit" | "score" | "name" | "institution") => void;
  sortOrder: "asc" | "desc";
  onOrderToggle: () => void;
  showDropdown: boolean;
  setShowDropdown: (show: boolean) => void;
}

const sortOptions = [
  { label: "Merit Position", value: "merit" },
  { label: "Marks Scored", value: "score" },
  { label: "Student Name", value: "name" },
  { label: "Institution", value: "institution" },
];

export const TeacherReportFilterBar = ({
  searchTerm,
  onSearchChange,
  sortBy,
  onSortChange,
  sortOrder,
  onOrderToggle,
  showDropdown,
  setShowDropdown,
}: TeacherReportFilterBarProps) => {
  return (
    <div className="p-4 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-3 bg-slate-50/50">
      <div>
        <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-600">
          MERIT LIST &amp; CANDIDATE SUBMISSIONS
        </span>
        <p className="text-[11px] text-slate-400 font-medium">
          Ranked candidate scores and evaluated answer sheets.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full md:w-auto">
        {/* Standard Search Input */}
        <div className="flex items-center w-full md:w-60 border border-slate-200/80 rounded px-2.5 py-1.5 bg-white shadow-2xs focus-within:border-primary transition">
          <FaSearch className="text-slate-400 mr-2 text-xs" />
          <input
            type="text"
            placeholder="Search student or institution..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="outline-none text-xs font-medium bg-transparent w-full text-slate-700 placeholder-slate-400"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          {/* Reusable Dropdown */}
          <div className="relative flex-1 sm:w-44">
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
                      onSortChange(opt.value as any);
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
            onClick={onOrderToggle}
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
    </div>
  );
};
