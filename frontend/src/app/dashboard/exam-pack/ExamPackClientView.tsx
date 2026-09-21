"use client";

import React, { useState, useMemo } from "react";
import {
  FaSearch,
  FaSortAmountDown,
  FaSortAmountUp,
  FaTags,
} from "react-icons/fa";
import ExamPackCard from "../../../components/dashboard/ExamPackCard";
import { PageContainer } from "../../../components/common/PageContainer";

interface ExamPackClientViewProps {
  initialPacks: any[];
}

export default function ExamPackClientView({ initialPacks }: ExamPackClientViewProps) {
  const [examPacks] = useState<any[]>(initialPacks || []);

  // ---- State Management ----
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<"name" | "totalExams">("name");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [showDropdown, setShowDropdown] = useState(false);
  const [filterCategory, setFilterCategory] = useState("All");
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);

  // ---- Derived Data (Filtered + Sorted) ----
  const filteredAndSorted = useMemo(() => {
    let data = [...examPacks].map(item => ({
      ...item,
      link: `/dashboard/exam-pack/exam-pack-details?packId=${item.id}`
    }));

    // Filter by Category
    if (filterCategory !== "All") {
      data = data.filter((item) => item.category === filterCategory);
    }

    // Search Filter
    if (searchTerm.trim()) {
      const lower = searchTerm.toLowerCase();
      data = data.filter(
        (item) =>
          item.title.toLowerCase().includes(lower) ||
          item.description.toLowerCase().includes(lower),
      );
    }

    // Sorting
    data.sort((a, b) => {
      const valA = sortBy === "name" ? a.title : a.totalExams;
      const valB = sortBy === "name" ? b.title : b.totalExams;
      if (valA < valB) return sortOrder === "asc" ? -1 : 1;
      if (valA > valB) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });

    return data;
  }, [examPacks, searchTerm, sortBy, sortOrder, filterCategory]);

  const categories = [
    "All",
    "Math",
    "Science",
    "English",
    "History",
    "Programming",
    "Geography",
    "Business",
    "General",
  ];

  return (
    <PageContainer className="space-y-6">
      {/* Page Header Ribbon */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200/80 pb-4">
        <div>
          <span className="text-[10px] font-extrabold text-primary uppercase tracking-wider block mb-0.5">
            Test Repository
          </span>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Curriculum Exam Packs
          </h1>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-500 font-semibold">
          <span className="px-2.5 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-700">
            Total Available: <strong className="text-slate-900">{examPacks.length}</strong>
          </span>
        </div>
      </div>

      {/* ---- Controls Ribbon ---- */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-3 bg-white p-3 rounded border border-slate-200/80 shadow-2xs">
        <div className="flex flex-col sm:flex-row gap-3 w-full">
          {/* Search */}
          <div className="flex items-center w-full sm:w-1/2 lg:w-1/3 border border-slate-200/80 rounded px-3 py-2 bg-slate-50 hover:bg-slate-100/60 focus-within:bg-white focus-within:border-primary transition-all">
            <FaSearch className="text-slate-400 mr-2 text-xs" />
            <input
              type="text"
              placeholder="Search by Exam Name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full outline-none text-xs font-medium text-slate-800 placeholder:text-slate-400 bg-transparent"
            />
          </div>

          {/* Category Filter */}
          <div className="relative w-full sm:w-1/3 lg:w-1/4">
            <button
              onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
              className="w-full flex items-center justify-between border border-slate-200/80 rounded px-3 py-2 text-xs bg-white hover:border-primary/50 transition cursor-pointer"
            >
              <span className="flex items-center gap-1.5 truncate">
                <FaTags className="text-slate-400 text-[10px]" />
                <span className="text-slate-600">Category:</span> <strong className="text-primary font-bold truncate">{filterCategory}</strong>
              </span>
              <span className="text-[10px] text-slate-400">▼</span>
            </button>

            {showCategoryDropdown && (
              <div className="absolute left-0 mt-1 w-full bg-white border border-slate-200/80 rounded shadow-xl z-20 max-h-48 overflow-y-auto custom-scrollbar p-1">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => {
                      setFilterCategory(cat);
                      setShowCategoryDropdown(false);
                    }}
                    className={`w-full text-left px-3 py-1.5 text-xs rounded hover:bg-primary/5 cursor-pointer ${
                      filterCategory === cat
                        ? "font-bold text-primary bg-primary/10"
                        : "text-slate-700"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Sort By Dropdown */}
          <div className="relative w-full sm:w-1/3 lg:w-1/4">
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="w-full flex items-center justify-between border border-slate-200/80 rounded px-3 py-2 text-xs bg-white hover:border-primary/50 transition cursor-pointer"
            >
              <span className="truncate">
                <span className="text-slate-600">Sort:</span>{" "}
                <strong className="text-primary font-bold">
                  {sortBy === "name" ? "Name" : "Total Exams"}
                </strong>
              </span>
              <span className="text-[10px] text-slate-400">▼</span>
            </button>

            {showDropdown && (
              <div className="absolute left-0 mt-1 w-full bg-white border border-slate-200/80 rounded shadow-xl z-20 p-1">
                <button
                  onClick={() => {
                    setSortBy("name");
                    setShowDropdown(false);
                  }}
                  className="w-full text-left px-3 py-1.5 text-xs rounded hover:bg-primary/5 text-slate-700 cursor-pointer"
                >
                  Exam Name
                </button>
                <button
                  onClick={() => {
                    setSortBy("totalExams");
                    setShowDropdown(false);
                  }}
                  className="w-full text-left px-3 py-1.5 text-xs rounded hover:bg-primary/5 text-slate-700 cursor-pointer"
                >
                  Total Exams
                </button>
              </div>
            )}
          </div>

          {/* Sort Order Toggle */}
          <button
            onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
            className="flex items-center justify-center border border-slate-200/80 rounded px-3 py-2 text-xs bg-white hover:border-primary/50 transition min-w-[38px] cursor-pointer text-slate-600"
            title={`Sort ${sortOrder === "asc" ? "Ascending" : "Descending"}`}
          >
            {sortOrder === "asc" ? (
              <FaSortAmountUp className="text-primary" />
            ) : (
              <FaSortAmountDown className="text-primary" />
            )}
          </button>
        </div>
      </div>

      {/* ---- Cards Grid (Tight, Professional Spacing) ---- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-5">
        {filteredAndSorted.map((pack) => (
          <ExamPackCard
            key={pack.id}
            title={pack.title}
            description={pack.description}
            totalExams={pack.totalExams || pack.examCount || 0}
            link={pack.link}
            image={pack.image || "/global/logo2.png"}
            category={pack.category}
          />
        ))}

        {filteredAndSorted.length === 0 && (
          <div className="col-span-full text-center py-12 bg-white rounded border border-slate-200/80 shadow-2xs">
            <p className="text-slate-500 font-semibold text-xs">
              No exam packs match your search or filter.
            </p>
          </div>
        )}
      </div>
    </PageContainer>
  );
}
