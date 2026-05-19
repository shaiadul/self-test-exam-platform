"use client";

import { useState } from "react";
import Image from "next/image";
import { FaSearch, FaSortAmountDown, FaSortAmountUp } from "react-icons/fa";
import { PageContainer } from "@/components/common/PageContainer";
import Scorecard from "@/components/dashboard/Scorecard";
import CertificatePrintLayout from "@/components/dashboard/CertificatePrintLayout";

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

  const myResult = {
    total: 20,
    correct: 15,
    wrong: 4,
    negative: 2.5,
    finalScore: 13,
    passed: true,
  };

  return (
    <PageContainer>
      <div className="print:hidden space-y-8">
      {/* ---- Header ---- */}
      <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          {/* Left Info */}
          <div className="lg:col-span-2 flex flex-col md:flex-row items-center gap-4">
            <Image
              src="/global/science.png"
              alt="subject image"
              width={200}
              height={38}
              priority
              className="rounded-xl object-cover w-full md:w-48"
            />
            <div>
              <h1 className="text-2xl font-bold text-[#dd6b01]">
                Science Explorer
              </h1>
              <p className="text-gray-400 max-w-md line-clamp-2 my-2 text-sm">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                Phasellus velit bibendum mi, eget risus. Nisi nisl tellus leo
                erat volutpat elementum.
              </p>
              <span className="font-semibold text-gray-600 text-xs bg-gray-100 px-2.5 py-1 rounded-md">
                10:30 AM | Sunday, 5th October 2025
              </span>
            </div>
          </div>

          {/* center Info */}
          <div className="lg:col-span-1 border-t lg:border-t-0 lg:border-l border-gray-100 pt-4 lg:pt-0 lg:pl-6">
            <div className="flex flex-wrap gap-2">
              <InfoItem label="Level" value="HSC" />
              <InfoItem label="Batch" value="2019 - 2020" />
              <InfoItem label="Exam Pack" value="Science Explorer" />
            </div>

            <div className="mt-4">
              <span className="text-xs font-bold text-[#dd6b01] uppercase tracking-wider">
                Exam Details
              </span>
              <div className="flex flex-wrap gap-2 mt-1.5">
                <InfoItem label="Total Marks" value="20" />
                <InfoItem label="Mark" value="1.25" />
                <InfoItem label="Pass Marks" value="15" />
                <InfoItem label="Negative Mark" value="1.50" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ---- Personal Performance Analysis ---- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left 2 Columns: Scorecard & Actions */}
        <div className="lg:col-span-2 bg-white border border-gray-100 rounded-3xl p-6 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Personal Scorecard</h2>
              <p className="text-xs text-gray-400 mt-1">Official candidate performance metrics summary.</p>
            </div>
            <button
              onClick={() => window.print()}
              className="flex items-center justify-center gap-2 bg-[#dd6b01] text-white px-5 py-2.5 rounded-xl shadow-md hover:bg-[#c35f00] transition font-semibold cursor-pointer text-sm"
            >
              📥 Download Score Certificate
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            {/* The radial progress and breakdown */}
            <Scorecard result={myResult} />
            
            {/* Additional transcript details */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Performance Details</h3>
              <div className="border border-gray-100 rounded-2xl p-4 bg-gray-50/50 space-y-3 font-sans">
                <div className="flex justify-between items-center text-sm py-1 border-b border-gray-100">
                  <span className="text-gray-500">Attempt Duration</span>
                  <span className="font-bold text-gray-800">00:07:48</span>
                </div>
                <div className="flex justify-between items-center text-sm py-1 border-b border-gray-100">
                  <span className="text-gray-500">Class Merit Rank</span>
                  <span className="font-bold text-[#dd6b01]">#03 <span className="text-xs font-normal text-gray-400">of {mockStudents.length}</span></span>
                </div>
                <div className="flex justify-between items-center text-sm py-1">
                  <span className="text-gray-500">Passing Status</span>
                  <span className="font-bold text-emerald-600">PASSED (75% Correct)</span>
                </div>
              </div>
              
              {/* Encouragement banner */}
              <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4 text-emerald-800 text-xs">
                🎉 <span className="font-bold">Excellent job Saidul!</span> Your accuracy rate is above average. You have qualified for certificate printing. Keep up the great work!
              </div>
            </div>
          </div>
        </div>

        {/* Right 1 Column: Mini Leaderboard Summary & Batch Stats */}
        <div className="lg:col-span-1 bg-white border border-gray-100 rounded-3xl p-6 shadow-sm space-y-6">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Leaderboard</h2>
            <p className="text-xs text-gray-400 mt-1">Top performing peers in this exam pack batch.</p>
          </div>
          <div className="space-y-3 font-sans">
            {mockStudents.slice(0, 3).map((st, i) => (
              <div key={st.id} className="flex items-center justify-between p-3 rounded-xl border border-gray-50 hover:bg-gray-50/50 transition">
                <div className="flex items-center gap-2.5">
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs ${
                    i === 0 ? "bg-amber-100 text-amber-700" :
                    i === 1 ? "bg-slate-100 text-slate-700" :
                    "bg-orange-100 text-orange-700"
                  }`}>
                    #{st.merit}
                  </span>
                  <span className="text-sm font-semibold text-gray-800">{st.name}</span>
                </div>
                <span className="text-sm font-bold text-[#dd6b01]">{st.score} Qs</span>
              </div>
            ))}
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
      </div>

      {/* Official Certificate & Transcript PDF/Print Layout */}
      <CertificatePrintLayout
        examName="Science Explorer"
        result={myResult}
      />
    </PageContainer>
  );
}
