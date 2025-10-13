"use client";

import React, { useState, useMemo } from "react";
import {
  FaSearch,
  FaSortAmountDown,
  FaSortAmountUp,
  FaTags,
} from "react-icons/fa";
import ExamPackCard from "@/components/dashboard/ExamPackCard";

export default function ExamPackPage() {
  // ---- Mock Exam Pack Data ----
  const examPacks = [
    {
      id: 1,
      image: "/global/test.png",
      title: "Math Beginner Pack",
      description:
        "Covers algebra, geometry, and basic arithmetic concepts for beginners.",
      totalExams: 12,
      link: "/dashboard/exam-pack/exam-pack-details",
      category: "Math",
    },
    {
      id: 2,
      image: "/global/test.png",
      title: "Science Explorer Pack",
      description:
        "Includes physics, chemistry, and biology practice exams for learners.",
      totalExams: 15,
      link: "/dashboard/exam-pack/exam-pack-details",
      category: "Science",
    },
    {
      id: 3,
      image: "/global/test.png",
      title: "English Grammar Pack",
      description:
        "Grammar, vocabulary, and comprehension practice questions in English.",
      totalExams: 10,
      link: "/dashboard/exam-pack/exam-pack-details",
      category: "English",
    },
    {
      id: 4,
      image: "/global/test.png",
      title: "History Master Pack",
      description:
        "Learn world history through multiple exams covering ancient to modern era.",
      totalExams: 8,
      link: "/exam-pack/history-master",
      category: "History",
    },
    {
      id: 5,
      image: "/global/test.png",
      title: "Programming Basics Pack",
      description:
        "Practice coding and logic questions in Python, C++, and JavaScript.",
      totalExams: 20,
      link: "/dashboard/exam-pack/exam-pack-details",
      category: "Programming",
    },
    {
      id: 6,
      image: "/global/no-picture.jpg",
      title: "Geography Explorer Pack",
      description:
        "Covers maps, continents, countries, and geographical features.",
      totalExams: 9,
      link: "/dashboard/exam-pack/exam-pack-details",
      category: "Geography",
    },
    {
      id: 7,
      image: "/global/test.png",
      title: "Business Studies Pack",
      description:
        "Learn economics, management, and entrepreneurship with practice exams.",
      totalExams: 14,
      link: "/dashboard/exam-pack/exam-pack-details",
      category: "Business",
    },
    {
      id: 8,
      image: "/global/no-picture.jpg",
      title: "General Knowledge Pack",
      description:
        "Enhance your GK skills covering current affairs, history, and science.",
      totalExams: 18,
      link: "/dashboard/exam-pack/exam-pack-details",
      category: "General",
    },
  ];

  // ---- State Management ----
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<"name" | "totalExams">("name");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [showDropdown, setShowDropdown] = useState(false);
  const [filterCategory, setFilterCategory] = useState("All");
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);

  // ---- Derived Data (Filtered + Sorted) ----
  const filteredAndSorted = useMemo(() => {
    let data = [...examPacks];

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
          item.description.toLowerCase().includes(lower)
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
  }, [searchTerm, sortBy, sortOrder, filterCategory]);

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
    <main className="p-6 md:p-10">
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
      {filteredAndSorted.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredAndSorted.map((item) => (
            <ExamPackCard key={item.id} {...item} />
          ))}
        </div>
      ) : (
        <p className="text-center text-gray-500 mt-10">No exam packs found.</p>
      )}
    </main>
  );
}
