"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  FaSearch,
  FaSortAmountDown,
  FaSortAmountUp,
  FaTags,
} from "react-icons/fa";
import ExamPackCard from "../../../components/dashboard/ExamPackCard";
import { PageContainer } from "../../../components/common/PageContainer";
import { getExamPacksAction } from "../../../lib/actions";

export default function ExamPackPage() {
  const [examPacks, setExamPacks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // ---- State Management ----
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<"name" | "totalExams">("name");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [showDropdown, setShowDropdown] = useState(false);
  const [filterCategory, setFilterCategory] = useState("All");
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);

  useEffect(() => {
    async function loadPacks() {
      try {
        const packs = await getExamPacksAction();
        setExamPacks(packs || []);
      } catch (err) {
        console.error("Failed to load exam packs:", err);
      } finally {
        setLoading(false);
      }
    }
    loadPacks();
  }, []);

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

          {/* ---- Category Filter Dropdown ---- */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowCategoryDropdown((prev) => !prev)}
              className="flex items-center justify-between min-w-[180px] border border-[#dd6b01] text-[#dd6b01] text-sm px-3 py-2 rounded-lg hover:bg-[#fff4ec] transition cursor-pointer"
            >
              <span className="flex items-center gap-2">
                <FaTags />
                {filterCategory === "All" ? "All Categories" : filterCategory}
              </span>
              <FaSortAmountDown
                className={`ml-2 transition-transform ${
                  showCategoryDropdown ? "rotate-180" : ""
                }`}
              />
            </button>

            {showCategoryDropdown && (
              <ul className="absolute top-full left-0 mt-1 w-full bg-white border border-[#dd6b01] rounded-lg shadow-md z-20 cursor-pointer max-h-60 overflow-y-auto">
                {categories.map((cat) => (
                  <li
                    key={cat}
                    onClick={() => {
                      setFilterCategory(cat);
                      setShowCategoryDropdown(false);
                    }}
                    className={`px-3 py-2 text-sm hover:bg-[#dd6b01] hover:text-white ${
                      filterCategory === cat ? "bg-[#dd6b01] text-white" : ""
                    }`}
                  >
                    {cat === "All" ? "All Categories" : cat}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Sort Controls */}
        <div className="flex items-center gap-3 relative">
          {/* Sort Type Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowDropdown((prev) => !prev)}
              className="flex items-center justify-between min-w-[160px] border border-[#dd6b01] text-[#dd6b01] text-sm px-3 py-2 rounded-lg hover:bg-[#fff4ec] transition cursor-pointer"
            >
              {sortBy === "name" ? "Sort by Name" : "Sort by Exams"}
              <FaSortAmountDown
                className={`ml-2 transition-transform ${
                  showDropdown ? "rotate-180" : ""
                }`}
              />
            </button>

            {showDropdown && (
              <ul className="absolute top-full left-0 mt-1 w-full bg-white border border-[#dd6b01] rounded-lg shadow-md z-20 cursor-pointer">
                {[
                  { label: "Sort by Name", value: "name" },
                  { label: "Sort by Exams", value: "totalExams" },
                ].map((opt) => (
                  <li
                    key={opt.value}
                    onClick={() => {
                      setSortBy(opt.value as "name" | "totalExams");
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

      {/* ---- Exam Pack Grid ---- */}
      {loading ? (
        <div className="min-h-[40vh] flex items-center justify-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#dd6b01]"></div>
        </div>
      ) : filteredAndSorted.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredAndSorted.map((item) => (
            <ExamPackCard key={item.id} {...item} />
          ))}
        </div>
      ) : (
        <p className="text-center text-gray-500 mt-10">No exam packs found.</p>
      )}
    </PageContainer>
  );
}
