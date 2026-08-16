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
      {/* ---- Controls ---- */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4 w-full">
          {/* Search */}
          <div className="flex items-center w-full md:w-1/3 border border-[#dd6b01] rounded-lg px-3 py-2">
            <FaSearch className="text-[#dd6b01] mr-2" />
            <input
              type="text"
              placeholder="Search by Exam Name"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full outline-none text-sm"
            />
          </div>

          {/* Category Filter */}
          <div className="relative w-full md:w-1/4">
            <button
              onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
              className="w-full flex items-center justify-between border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white hover:border-[#dd6b01] transition cursor-pointer"
            >
              <span className="flex items-center gap-2">
                <FaTags className="text-gray-500" />
                Category: <strong className="text-[#dd6b01]">{filterCategory}</strong>
              </span>
              <span className="text-xs text-gray-400">▼</span>
            </button>

            {showCategoryDropdown && (
              <div className="absolute left-0 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg z-20 max-h-48 overflow-y-auto">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => {
                      setFilterCategory(cat);
                      setShowCategoryDropdown(false);
                    }}
                    className={`w-full text-left px-4 py-2 text-sm hover:bg-orange-50 cursor-pointer ${
                      filterCategory === cat
                        ? "font-bold text-[#dd6b01] bg-orange-50"
                        : "text-gray-700"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Sort By Dropdown */}
          <div className="relative w-full md:w-1/4">
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="w-full flex items-center justify-between border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white hover:border-[#dd6b01] transition cursor-pointer"
            >
              <span>
                Sort by:{" "}
                <strong className="text-[#dd6b01]">
                  {sortBy === "name" ? "Exam Name" : "Total Exams"}
                </strong>
              </span>
              <span className="text-xs text-gray-400">▼</span>
            </button>

            {showDropdown && (
              <div className="absolute left-0 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg z-20">
                <button
                  onClick={() => {
                    setSortBy("name");
                    setShowDropdown(false);
                  }}
                  className="w-full text-left px-4 py-2 text-sm hover:bg-orange-50 text-gray-700 cursor-pointer"
                >
                  Exam Name
                </button>
                <button
                  onClick={() => {
                    setSortBy("totalExams");
                    setShowDropdown(false);
                  }}
                  className="w-full text-left px-4 py-2 text-sm hover:bg-orange-50 text-gray-700 cursor-pointer"
                >
                  Total Exams
                </button>
              </div>
            )}
          </div>

          {/* Sort Order Toggle */}
          <button
            onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
            className="flex items-center justify-center border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white hover:border-[#dd6b01] transition min-w-[40px] cursor-pointer"
            title={`Sort ${sortOrder === "asc" ? "Ascending" : "Descending"}`}
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
        {filteredAndSorted.map((pack) => (
          <ExamPackCard
            key={pack.id}
            title={pack.title}
            description={pack.description}
            totalExams={pack.totalExams || pack.examCount || 0}
            link={pack.link}
            image={pack.image || "/global/logo2.png"}
          />
        ))}

        {filteredAndSorted.length === 0 && (
          <div className="col-span-full text-center py-12 bg-white rounded-2xl border border-gray-100 shadow-sm">
            <p className="text-gray-500 font-semibold text-sm">
              No exam packs match your search or filter.
            </p>
          </div>
        )}
      </div>
    </PageContainer>
  );
}
