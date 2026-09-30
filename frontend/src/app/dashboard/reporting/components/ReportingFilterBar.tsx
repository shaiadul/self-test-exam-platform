"use client";

import React from "react";
import {
  FaSearch,
  FaFilter,
  FaSortAmountDown,
  FaSortAmountUp,
} from "react-icons/fa";

interface ReportingFilterBarProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  sortBy: "score" | "date";
  onSortChange: (value: "score" | "date") => void;
  sortOrder: "asc" | "desc";
  onOrderToggle: () => void;
  showDropdown: boolean;
  setShowDropdown: (show: boolean) => void;
}

const sortOptions: {
  label: string;
  value: "score" | "date";
}[] = [
  { label: "Sort by Date", value: "date" },
  { label: "Sort by Score", value: "score" },
];

export const ReportingFilterBar = ({
  searchTerm,
  onSearchChange,
  sortBy,
  onSortChange,
  sortOrder,
  onOrderToggle,
  showDropdown,
  setShowDropdown,
}: ReportingFilterBarProps) => {
  return (
    <div className="flex flex-col md:flex-row items-center justify-between gap-3 mb-6">
      {/* Search Input */}
      <div className="flex items-center w-full md:w-1/2 border border-slate-200/80 rounded px-3 py-2 bg-white shadow-2xs focus-within:border-primary transition">
        <FaSearch className="text-slate-400 mr-2 text-xs" />
        <input
          type="text"
          placeholder="Search by exam, pack name or attempt ID..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
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
                    onSortChange(option.value);
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
          onClick={onOrderToggle}
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
  );
};
