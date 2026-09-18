import React, { useState, useMemo } from "react";
import { FaSearch, FaFilter, FaSortAmountDown, FaSortAmountUp } from "react-icons/fa";
import { PeerStudent } from "../types";

interface ReportingDetailMeritSectionProps {
  peers: PeerStudent[];
  currentAttemptId: string | number;
}

export const ReportingDetailMeritSection: React.FC<ReportingDetailMeritSectionProps> = ({
  peers,
  currentAttemptId,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<"score" | "name">("score");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [showDropdown, setShowDropdown] = useState(false);

  const sortOptions = [
    { label: "Marks Scored", value: "score" },
    { label: "Candidate Name", value: "name" },
  ];

  const filteredPeers = useMemo(() => {
    return peers
      .filter((p) => p.name.toLowerCase().includes(searchTerm.toLowerCase()))
      .sort((a, b) => {
        if (sortBy === "score") {
          return sortOrder === "asc" ? a.score - b.score : b.score - a.score;
        } else {
          return sortOrder === "asc"
            ? a.name.localeCompare(b.name)
            : b.name.localeCompare(a.name);
        }
      });
  }, [peers, searchTerm, sortBy, sortOrder]);

  return (
    <div className="bg-white rounded-none border border-slate-200/80 shadow-xs overflow-hidden">
      {/* Search & Sort Controls */}
      <div className="p-4 sm:p-6 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h3 className="text-xl font-black text-slate-900 tracking-tight">
            Exam Merit Leaderboard
          </h3>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Comparative standing among candidates who attended this mock exam.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-3 w-full sm:w-auto">
          <div className="flex items-center w-full sm:w-64 border border-slate-300 hover:border-slate-400 rounded px-3 py-2 bg-white transition">
            <FaSearch className="text-primary mr-2 text-xs" />
            <input
              type="text"
              placeholder="Filter candidate..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="outline-none text-xs font-medium bg-transparent w-full text-gray-700 placeholder-gray-400"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            {/* Custom Sort Dropdown */}
            <div className="relative w-full sm:w-44">
              <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="w-full flex items-center justify-between border border-slate-300 rounded px-3 py-2 text-xs bg-white hover:border-slate-400 transition text-slate-700 cursor-pointer"
              >
                <span className="flex items-center gap-1">
                  <FaFilter className="text-[10px] text-gray-400 mr-1" />
                  {sortOptions.find((o) => o.value === sortBy)?.label}
                </span>
                <span className="text-[10px] text-gray-400">▼</span>
              </button>

              {showDropdown && (
                <div className="absolute right-0 mt-1 w-full bg-white border border-slate-200 rounded shadow-lg z-20 overflow-hidden">
                  {sortOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => {
                        setSortBy(option.value as "score" | "name");
                        setShowDropdown(false);
                      }}
                      className={`w-full text-left px-3 py-2 text-xs hover:bg-primary/5 transition cursor-pointer ${
                        sortBy === option.value
                          ? "font-bold text-primary bg-primary/5"
                          : "text-slate-700"
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Order Toggle */}
            <button
              onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
              className="flex items-center justify-center border border-slate-300 rounded p-2.5 bg-white hover:border-slate-400 transition text-slate-700 cursor-pointer shrink-0"
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

      {/* Desktop Table View */}
      <div className="hidden sm:block overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/90 text-slate-500 font-extrabold text-[11px] uppercase tracking-wider border-b border-slate-200/80">
              <th className="py-3.5 px-6">Rank</th>
              <th className="py-3.5 px-6">Candidate</th>
              <th className="py-3.5 px-6">Score</th>
              <th className="py-3.5 px-6">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm font-medium">
            {filteredPeers.map((p) => (
              <tr
                key={p.id}
                className={`transition ${
                  p.id === currentAttemptId
                    ? "bg-orange-50/70 font-bold"
                    : "hover:bg-slate-50/50"
                }`}
              >
                <td className="py-4 px-6 font-black text-slate-900">
                  #{p.merit}
                </td>
                <td className="py-4 px-6 font-bold text-slate-900">
                  {p.name}{" "}
                  {p.id === currentAttemptId && (
                    <span className="text-primary text-[10px] font-mono font-bold ml-1 bg-primary/10 px-1.5 py-0.5 rounded border border-primary/20">
                      You
                    </span>
                  )}
                </td>
                <td className="py-4 px-6 font-black text-primary">
                  {p.score}
                </td>
                <td className="py-4 px-6 text-xs text-slate-500 font-semibold">
                  {p.time}
                </td>
              </tr>
            ))}

            {filteredPeers.length === 0 && (
              <tr>
                <td colSpan={4} className="py-10 text-center text-slate-400 font-medium text-xs">
                  No peer results match your search.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile Phone Peer Cards View */}
      <div className="block sm:hidden divide-y divide-slate-100">
        {filteredPeers.map((p) => (
          <div
            key={p.id}
            className={`p-3.5 flex items-center justify-between gap-3 ${
              p.id === currentAttemptId ? "bg-orange-50/60 font-bold" : "hover:bg-slate-50/50"
            }`}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <span
                className={`w-7 h-7 rounded flex items-center justify-center font-mono font-black text-xs shrink-0 ${
                  p.merit === 1
                    ? "bg-amber-100 text-amber-800 border border-amber-300"
                    : p.merit === 2
                    ? "bg-slate-200 text-slate-800 border border-slate-300"
                    : p.merit === 3
                    ? "bg-orange-100 text-orange-800 border border-orange-300"
                    : "bg-slate-100 text-slate-600 border border-slate-200"
                }`}
              >
                #{p.merit}
              </span>
              <div className="min-w-0">
                <p className="font-bold text-slate-900 text-xs truncate">
                  {p.name}
                </p>
                {p.id === currentAttemptId && (
                  <span className="inline-block text-primary text-[9px] font-mono font-bold bg-primary/10 px-1.5 py-0.2 rounded border border-primary/20">
                    Your Result
                  </span>
                )}
              </div>
            </div>

            <div className="text-right shrink-0">
              <span className="text-sm font-mono font-black text-primary block leading-none">
                {p.score}
              </span>
              <span className="text-[10px] text-slate-400 font-medium mt-0.5 block">
                {p.time}
              </span>
            </div>
          </div>
        ))}

        {filteredPeers.length === 0 && (
          <div className="py-8 text-center text-slate-400 font-medium text-xs">
            No peer results match your search.
          </div>
        )}
      </div>
    </div>
  );
};
