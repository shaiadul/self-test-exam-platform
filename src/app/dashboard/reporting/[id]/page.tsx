"use client";

import { useState } from "react";
import Image from "next/image";
import { FaSearch, FaSortAmountDown, FaSortAmountUp } from "react-icons/fa";
import { PageContainer } from "@/components/common/PageContainer";

// ---- Reusable Info Item ----
interface InfoItemProps {
  label: string;
  value: string;
}

const InfoItem: React.FC<InfoItemProps> = ({ label, value }) => (
  <div>
    <span className="text-sm">{label}</span>
    <p className="border border-[#dd6b01] rounded text-sm px-3 py-1">{value}</p>
  </div>
);

// ---- Mock Data ----
interface Student {
  id: string;
  merit: number;
  name: string;
  board: string;
  time: string;
  score: number;
  negative: number;
  image?: string;
}

const mockStudents: Student[] = [
  {
    id: "1",
    merit: 3,
    name: "Md Saidul Basar",
    board: "Dhaka",
    time: "10:32 AM",
    score: 15,
    negative: -2.5,
    image: "/user/md-saidul.jpeg",
  },
  {
    id: "2",
    merit: 4,
    name: "Rafid Khan",
    board: "Rajshahi",
    time: "10:40 AM",
    score: 15,
    negative: -0.5,
  },
  {
    id: "3",
    merit: 1,
    name: "Jannatul Ferdaus",
    board: "Chattogram",
    time: "10:45 AM",
    score: 18,
    negative: -2.0,
  },
  {
    id: "4",
    merit: 2,
    name: "Tanzim Hasan",
    board: "Sylhet",
    time: "10:35 AM",
    score: 17,
    negative: -2.5,
  },
];

export default function ExamInfoPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<"score" | "name">("score");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [showDropdown, setShowDropdown] = useState(false);

  // Sort by merit first, then apply search and optional score/name sorting
  const filteredStudents = [...mockStudents]
    .filter((s) => s.name.toLowerCase().includes(searchTerm.toLowerCase()))
    .sort((a, b) => {
      const factor = sortOrder === "asc" ? 1 : -1;

      // Sort by selected column first
      let primarySort = 0;
      if (sortBy === "score") primarySort = (a.score - b.score) * factor;
      if (sortBy === "name")
        primarySort = a.name.localeCompare(b.name) * factor;

      if (primarySort !== 0) return primarySort;

      // If primary sort is equal, then sort by merit
      return a.merit - b.merit;
    });

  return (
    <PageContainer className="space-y-8">
      {/* ---- Header ---- */}
      <div className="bg-white p-5">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 items-start justify-between">
          {/* Left Info */}
          <div className="flex items-center gap-3">
            <Image
              src="/global/science.png"
              alt="subject image"
              width={200}
              height={38}
              priority
              className="rounded-md"
            />
            <div>
              <h1 className="text-2xl font-bold text-[#dd6b01]">
                Science Explorer
              </h1>
              <p className="text-gray-400 max-w-md line-clamp-3 my-2">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                Phasellus velit bibendum mi, eget risus. Nisi nisl tellus leo
                erat volutpat elementum.
              </p>
              <span className="font-semibold text-gray-600">
                10:30 AM | Sunday, 5th October 2025
              </span>
            </div>
          </div>

          {/* center Info */}
          <div className="md:col-span-2 lg:col-span-1 flex mx-auto">
            <div>
              <div className="flex items-center gap-3">
                <InfoItem label="Level" value="HSC" />
                <InfoItem label="Batch" value="2019 - 2020" />
                <InfoItem label="Exam Pack" value="Science Explorer" />
              </div>

              <div className="mt-3">
                <span className="text-md font-semibold text-[#dd6b01]">
                  Result
                </span>
                <div className="flex items-center gap-3 mt-1">
                  <InfoItem label="Total Marks" value="20" />
                  <InfoItem label="Mark" value="1.25" />
                  <InfoItem label="Pass Marks" value="15" />
                  <InfoItem label="Negative Mark" value="1.50" />
                </div>
              </div>
            </div>
          </div>
          {/* Right info */}
          <div className="flex mx-auto">
            <div>
              <h4 className="text-2xl font-bold text-[#dd6b01]">
                Your Performance
              </h4>
              <div className="mt-3 font-semibold">
                <p className="">Score: 15/20</p>
                <p className="">Timestamp: 00:07:48</p>
                <p className="">Merit: 03</p>
                <p className="">Negative Marks: -4</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ---- Filter & Sort ---- */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Search */}
        <div className="flex items-center w-full md:w-1/3 border border-[#dd6b01] rounded-lg px-3 py-2">
          <FaSearch className="text-[#dd6b01] mr-2" />
          <input
            type="text"
            placeholder="Search by name"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full outline-none text-sm"
          />
        </div>

        {/* Sort */}
        <div className="flex items-center gap-3 relative">
          {/* Custom Sort Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowDropdown(!showDropdown)}
              className="flex items-center justify-between min-w-[160px] border border-[#dd6b01] text-[#dd6b01] text-sm px-3 py-2 rounded-lg hover:bg-[#fff4ec] transition cursor-pointer"
            >
              {sortBy === "score" ? "Sort by Score" : "Sort by Name"}
              <FaSortAmountDown
                className={`ml-2 transition-transform ${
                  showDropdown ? "rotate-180" : ""
                }`}
              />
            </button>

            {showDropdown && (
              <ul className="absolute top-full left-0 mt-1 w-full bg-white border border-[#dd6b01] rounded-lg shadow-md z-20">
                {[
                  { label: "Sort by Score", value: "score" },
                  { label: "Sort by Name", value: "name" },
                ].map((opt) => (
                  <li
                    key={opt.value}
                    onClick={() => {
                      setSortBy(opt.value as "score" | "name");
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

          {/* Sort Order */}
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

      {/* ---- Table ---- */}
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
