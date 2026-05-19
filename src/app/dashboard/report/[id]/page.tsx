"use client";

import Image from "next/image";
import { useState, useMemo } from "react";
import { FaSearch, FaSortAmountDown, FaSortAmountUp } from "react-icons/fa";
import { PageContainer } from "@/components/common/PageContainer";

// ---- Mock Exam & Student Data ----
interface Student {
  id: string;
  merit: number;
  name: string;
  board: string;
  level: string;
  time: string;
  score: number;
  negative: number;
  image?: string;
}

const exam = {
  id: "EP-101",
  name: "Algebra Basics",
  pack: "Mathematics - HSC",
  startDate: "2025-10-05T10:30",
  totalMarks: 20,
  markPerQuestion: 1.25,
  passMarks: 15,
  negativeMark: 1.5,
};

const students: Student[] = [
  {
    id: "1",
    merit: 3,
    name: "Md Saidul Basar",
    board: "Dhaka",
    level: "BSC",
    time: "10:32 AM",
    score: 15,
    negative: -2.5,
    image: "/user/md-saidul.jpeg",
  },
  {
    id: "2",
    merit: 4,
    name: "Mahmudullah Ali",
    board: "Rajshahi",
    level: "HSC",
    time: "10:40 AM",
    score: 15,
    negative: -0.5,
  },
  {
    id: "3",
    merit: 1,
    name: "Jannatul Ferdaus",
    board: "Chattogram",
    level: "BA",
    time: "10:45 AM",
    score: 18,
    negative: -2.0,
  },
  {
    id: "4",
    merit: 2,
    name: "Tanzim Hasan",
    board: "Sylhet",
    level: "MA",
    time: "10:35 AM",
    score: 17,
    negative: -2.5,
  },
];

export default function SingleExamReportPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<
    "merit" | "score" | "name" | "board" | "level"
  >("merit");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [showDropdown, setShowDropdown] = useState(false);

  const filteredStudents = useMemo(() => {
    const filtered = students.filter((s) =>
      s.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return filtered.sort((a, b) => {
      let valA: number | string = 0;
      let valB: number | string = 0;

      if (sortBy === "score") {
        valA = a.score;
        valB = b.score;
      } else if (sortBy === "merit") {
        valA = a.merit;
        valB = b.merit;
      } else if (sortBy === "name") {
        valA = a.name;
        valB = b.name;
      } else if (sortBy === "board") {
        valA = a.board;
        valB = b.board;
      } else if (sortBy === "level") {
        valA = a.level;
        valB = b.level;
      }

      if (typeof valA === "string" && typeof valB === "string") {
        return sortOrder === "asc"
          ? valA.localeCompare(valB)
          : valB.localeCompare(valA);
      }

      return sortOrder === "asc"
        ? Number(valA) - Number(valB)
        : Number(valB) - Number(valA);
    });
  }, [searchTerm, sortBy, sortOrder]);

  return (
    <PageContainer className="space-y-8">
      {/* ---- Exam Header ---- */}
      <div className="">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 items-start">
          <div>
            <h1 className="text-2xl font-bold text-[#dd6b01]">{exam.name}</h1>
            <p className="text-gray-500">{exam.pack}</p>
            <p className="text-gray-500">
              {new Date(exam.startDate).toLocaleString("en-US", {
                weekday: "short",
                month: "short",
                day: "numeric",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          </div>

          <div className="flex flex-wrap gap-3 md:col-span-2">
            <div>
              <span className="text-sm">Total Marks</span>
              <p className="border border-[#dd6b01] rounded text-sm px-3 py-1">
                {exam.totalMarks}
              </p>
            </div>
            <div>
              <span className="text-sm">Mark per Question</span>
              <p className="border border-[#dd6b01] rounded text-sm px-3 py-1">
                {exam.markPerQuestion}
              </p>
            </div>
            <div>
              <span className="text-sm">Pass Marks</span>
              <p className="border border-[#dd6b01] rounded text-sm px-3 py-1">
                {exam.passMarks}
              </p>
            </div>
            <div>
              <span className="text-sm">Negative Mark</span>
              <p className="border border-[#dd6b01] rounded text-sm px-3 py-1">
                {exam.negativeMark}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ---- Filter & Sort ---- */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center w-full md:w-1/3 border border-[#dd6b01] rounded-lg px-3 py-2">
          <FaSearch className="text-[#dd6b01] mr-2" />
          <input
            type="text"
            placeholder="Search student by name"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full outline-none text-sm"
          />
        </div>

        <div className="flex items-center gap-3 relative">
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowDropdown(!showDropdown)}
              className="flex items-center justify-between min-w-[160px] border border-[#dd6b01] text-[#dd6b01] text-sm px-3 py-2 rounded-lg hover:bg-[#fff4ec] transition cursor-pointer"
            >
              {sortBy === "merit"
                ? "Sort by Merit"
                : sortBy === "score"
                ? "Sort by Score"
                : "Sort by Name"}
              <FaSortAmountDown
                className={`ml-2 transition-transform ${
                  showDropdown ? "rotate-180" : ""
                }`}
              />
            </button>

            {showDropdown && (
              <ul className="absolute top-full left-0 mt-1 w-full bg-white border border-[#dd6b01] rounded-lg shadow-md z-20">
                {[
                  { label: "Sort by Merit", value: "merit" },
                  { label: "Sort by Score", value: "score" },
                  { label: "Sort by Name", value: "name" },
                ].map((opt) => (
                  <li
                    key={opt.value}
                    onClick={() => {
                      setSortBy(opt.value as "merit" | "score" | "name");
                      setShowDropdown(false);
                    }}
                    className={`px-3 py-2 text-sm cursor-pointer hover:bg-[#dd6b01] hover:text-white ${
                      sortBy === opt.value ? "bg-[#dd6b01] text-white" : ""
                    }`}
                  >
                    {opt.label}
                  </li>
                ))}
              </ul>
            )}
          </div>

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

      {/* ---- Students Table ---- */}
      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse shadow-lg rounded-xl overflow-hidden">
          <thead className="bg-amber-50 text-gray-500">
            <tr>
              <th className="px-6 py-4 text-left text-sm font-semibold uppercase">
                Merit
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold uppercase">
                Name
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold uppercase">
                Board
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold uppercase">
                Level
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold uppercase">
                Time
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold uppercase">
                Score
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold uppercase">
                Negative
              </th>
            </tr>
          </thead>
          <tbody className="bg-white">
            {filteredStudents.map((s) => (
              <tr
                key={s.id}
                className="border-b border-gray-200 hover:bg-[#ffedd5]/50 transition"
              >
                <td className="px-6 py-4 font-semibold text-gray-700">
                  {s.merit}
                </td>
                <td className="px-6 py-4 flex items-center gap-3">
                  {s.image ? (
                    <Image
                      src={s.image}
                      alt={s.name}
                      width={40}
                      height={40}
                      className="rounded-full"
                    />
                  ) : (
                    <div className="w-10 h-10 flex items-center justify-center rounded-full bg-[#dd6b01] text-white font-bold text-lg">
                      {s.name.charAt(0)}
                    </div>
                  )}
                  <span className="font-semibold text-[#dd6b01]">{s.name}</span>
                </td>
                <td className="px-6 py-4">{s.board}</td>
                <td className="px-6 py-4">{s.level}</td>
                <td className="px-6 py-4 text-sm text-gray-600">{s.time}</td>
                <td className="px-6 py-4 font-bold text-green-600">
                  {s.score}
                </td>
                <td className="px-6 py-4 text-red-600 font-semibold">
                  {s.negative}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredStudents.length === 0 && (
          <p className="text-center text-gray-500 py-6">No students found.</p>
        )}
      </div>
    </PageContainer>
  );
}
