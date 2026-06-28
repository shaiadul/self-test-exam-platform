"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { FaSearch, FaSortAmountDown, FaSortAmountUp, FaArrowLeft } from "react-icons/fa";
import { PageContainer } from "../../../../components/common/PageContainer";
import Scorecard from "../../../../components/dashboard/Scorecard";
import CertificatePrintLayout from "../../../../components/dashboard/CertificatePrintLayout";
import { getAttemptDetailsAction, getTeacherReportDetailsAction } from "../../../../lib/actions";
import { useParams, useRouter } from "next/navigation";

// ---- Reusable Info Item ----
interface InfoItemProps {
  label: string;
  value: string;
}

const InfoItem: React.FC<InfoItemProps> = ({ label, value }) => (
  <div>
    <span className="text-sm font-semibold text-gray-500">{label}</span>
    <p className="border border-[#dd6b01] rounded text-sm px-3 py-1 bg-orange-50/20 text-gray-800">{value}</p>
  </div>
);

interface PeerStudent {
  id: string | number;
  merit: number;
  name: string;
  board: string;
  time: string;
  score: number;
  negative: number;
  image?: string;
  institution?: string;
}

export default function ExamInfoPage() {
  const params = useParams();
  const router = useRouter();
  const attemptId = Number(params.id);

  const [loading, setLoading] = useState(true);
  const [attempt, setAttempt] = useState<any>(null);
  const [peers, setPeers] = useState<PeerStudent[]>([]);
  const [myRank, setMyRank] = useState<number>(1);

  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<"score" | "name">("score");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    async function loadData() {
      if (!attemptId) return;
      setLoading(true);
      try {
        const attemptData = await getAttemptDetailsAction(attemptId);
        if (attemptData) {
          setAttempt(attemptData);
          
          // Fetch other students' attempts for this exam to build leaderboard
          const reportDetails = await getTeacherReportDetailsAction(attemptData.examId);
          if (reportDetails && reportDetails.attempts) {
            // Sort attempts descending to assign merits
            const sorted = [...reportDetails.attempts].sort((a, b) => b.score - a.score);
            
            let rank = 1;
            const formattedPeers: PeerStudent[] = sorted.map((att, idx) => {
              if (idx > 0 && att.score < sorted[idx - 1].score) {
                rank = idx + 1;
              }
              if (att.id === attemptData.id) {
                setMyRank(rank);
              }
              return {
                id: att.id,
                merit: rank,
                name: att.name,
                board: "Online",
                time: new Date(att.time).toLocaleTimeString("en-US", {
                  hour: "2-digit",
                  minute: "2-digit",
                }),
                score: att.score,
                negative: att.negative,
                institution: att.institution,
              };
            });
            setPeers(formattedPeers);
          }
        }
      } catch (err) {
        console.error("Failed to load attempt details:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [attemptId]);

  // Sort and filter leaderboard peers
  const filteredStudents = [...peers]
    .filter((s) => s.name.toLowerCase().includes(searchTerm.toLowerCase()))
    .sort((a, b) => {
      const factor = sortOrder === "asc" ? 1 : -1;
      let primarySort = 0;
      if (sortBy === "score") primarySort = (a.score - b.score) * factor;
      if (sortBy === "name") primarySort = a.name.localeCompare(b.name) * factor;

      if (primarySort !== 0) return primarySort;
      return a.merit - b.merit;
    });

  if (loading) {
    return (
      <PageContainer>
        <div className="flex flex-col items-center justify-center min-h-[400px]">
          <div className="w-12 h-12 border-4 border-[#dd6b01] border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-600 font-medium">Loading scorecard details...</p>
        </div>
      </PageContainer>
    );
  }

  if (!attempt) {
    return (
      <PageContainer>
        <div className="text-center py-12">
          <h2 className="text-xl font-bold text-red-600">Attempt details not found.</h2>
          <button onClick={() => router.back()} className="mt-4 text-[#dd6b01] font-semibold underline">
            Go Back
          </button>
        </div>
      </PageContainer>
    );
  }

  const myResult = {
    total: attempt.total || 10,
    correct: attempt.correct || 0,
    wrong: attempt.wrong || 0,
    negative: Math.abs(attempt.negative) || 0,
    finalScore: attempt.finalScore || 0,
    passed: attempt.passed || false,
  };

  const formattedDate = new Date(attempt.createdAt).toLocaleDateString("en-US", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }) + " | " + new Date(attempt.createdAt).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <PageContainer>
      <div className="print:hidden space-y-8">
        {/* ---- Header ---- */}
        <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm">
          <div className="flex items-center gap-2 text-gray-500 hover:text-[#dd6b01] font-bold transition mb-4 cursor-pointer" onClick={() => router.back()}>
            <FaArrowLeft /> Back to Reports
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
            {/* Left Info */}
            <div className="lg:col-span-2 flex flex-col md:flex-row items-center gap-4">
              <div className="relative w-full md:w-48 h-32 rounded-xl overflow-hidden border">
                <Image
                  src="/global/science.png"
                  alt="subject image"
                  fill
                  priority
                  className="object-cover"
                />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-[#dd6b01]">
                  {attempt.examName}
                </h1>
                <p className="text-gray-400 max-w-md line-clamp-2 my-2 text-sm">
                  Candidate performance and score statistics audit.
                </p>
                <span className="font-semibold text-gray-600 text-xs bg-gray-100 px-2.5 py-1 rounded-md">
                  Completed on: {formattedDate}
                </span>
              </div>
            </div>

            {/* right Info */}
            <div className="lg:col-span-1 border-t lg:border-t-0 lg:border-l border-gray-100 pt-4 lg:pt-0 lg:pl-6">
              <div className="flex flex-wrap gap-2">
                <InfoItem label="Level" value={attempt.level || "HSC"} />
                <InfoItem label="Batch" value={attempt.batch || "2025"} />
                <InfoItem label="Exam Pack" value={attempt.packName || "General"} />
              </div>

              <div className="mt-4">
                <span className="text-xs font-bold text-[#dd6b01] uppercase tracking-wider">
                  Exam Parameters
                </span>
                <div className="flex flex-wrap gap-2 mt-1.5">
                  <InfoItem label="Total Marks" value={attempt.totalMarks.toString()} />
                  <InfoItem label="Per Question" value={attempt.perQuestionMarks.toString()} />
                  <InfoItem label="Pass Marks" value={attempt.passingMarks.toString()} />
                  <InfoItem label="Negative Mark" value={attempt.negativeMarks.toString()} />
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
                <h2 className="text-xl font-bold text-gray-900">
                  Personal Scorecard
                </h2>
                <p className="text-xs text-gray-400 mt-1">
                  Official candidate performance metrics summary.
                </p>
              </div>
              <button
                onClick={() => window.print()}
                className="flex items-center justify-center gap-2 bg-[#dd6b01] text-white px-5 py-2.5 rounded-xl shadow-md hover:bg-[#c35f00] transition font-semibold cursor-pointer text-sm"
              >
                📥 Download Score Certificate
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
              {/* Radial progress and breakdown */}
              <Scorecard result={myResult} />

              {/* Additional transcript details */}
              <div className="space-y-4">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                  Performance Details
                </h3>
                <div className="border border-gray-100 rounded-2xl p-4 bg-gray-50/50 space-y-3 font-sans">
                  <div className="flex justify-between items-center text-sm py-1 border-b border-gray-100">
                    <span className="text-gray-500">Security Warnings</span>
                    <span className={`font-bold ${attempt.warningCount >= 3 ? "text-red-600" : "text-gray-800"}`}>
                      {attempt.warningCount} / 3 Warnings
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-sm py-1 border-b border-gray-100">
                    <span className="text-gray-500">Class Merit Rank</span>
                    <span className="font-bold text-[#dd6b01]">
                      #{myRank.toString().padStart(2, "0")}{" "}
                      <span className="text-xs font-normal text-gray-400">
                        of {peers.length || 1}
                      </span>
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-sm py-1">
                    <span className="text-gray-500">Passing Status</span>
                    <span className={`font-bold ${attempt.passed ? "text-emerald-600" : "text-red-600"}`}>
                      {attempt.passed ? "PASSED" : "FAILED"}
                    </span>
                  </div>
                </div>

                {/* Encouragement banner */}
                {attempt.passed ? (
                  <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4 text-emerald-800 text-xs">
                    🎉 <span className="font-bold">Excellent job!</span> Your accuracy rate qualifies you for certificate printing. Keep up the great work!
                  </div>
                ) : (
                  <div className="bg-red-50 border border-red-100 rounded-2xl p-4 text-red-800 text-xs">
                    💡 <span className="font-bold">Don't lose heart!</span> Review the materials and attempt the exam again to boost your score.
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right 1 Column: Mini Leaderboard Summary */}
          <div className="lg:col-span-1 bg-white border border-gray-100 rounded-3xl p-6 shadow-sm space-y-6">
            <div>
              <h2 className="text-lg font-bold text-gray-900">Leaderboard</h2>
              <p className="text-xs text-gray-400 mt-1">
                Top performing peers in this exam pack batch.
              </p>
            </div>
            <div className="space-y-3 font-sans">
              {peers.slice(0, 3).map((st, i) => (
                <div
                  key={st.id}
                  className="flex items-center justify-between p-3 rounded-xl border border-gray-50 hover:bg-gray-50/50 transition"
                >
                  <div className="flex items-center gap-2.5">
                    <span
                      className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs ${
                        i === 0
                          ? "bg-amber-100 text-amber-700"
                          : i === 1
                            ? "bg-slate-100 text-slate-700"
                            : "bg-orange-100 text-orange-700"
                      }`}
                    >
                      #{st.merit}
                    </span>
                    <span className="text-sm font-semibold text-gray-800">
                      {st.name}
                    </span>
                  </div>
                  <span className="text-sm font-bold text-[#dd6b01]">
                    {st.score} Marks
                  </span>
                </div>
              ))}
              {peers.length === 0 && (
                <p className="text-center text-xs text-gray-400 py-3 italic">No other candidates yet.</p>
              )}
            </div>
          </div>
        </div>

        {/* ---- Filter & Sort for Table ---- */}
        {peers.length > 0 && (
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              {/* Search */}
              <div className="flex items-center w-full md:w-1/3 border border-[#dd6b01] rounded-lg px-3 py-2 bg-white">
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
                    className="flex items-center justify-between min-w-[160px] border border-[#dd6b01] text-[#dd6b01] text-sm px-3 py-2 rounded-lg bg-white hover:bg-[#fff4ec] transition cursor-pointer"
                  >
                    {sortBy === "score" ? "Sort by Score" : "Sort by Name"}
                    <FaSortAmountDown
                      className={`ml-2 transition-transform ${
                        showDropdown ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  {showDropdown && (
                    <ul className="absolute top-full left-0 mt-1 w-full bg-white border border-[#dd6b01] rounded-lg shadow-md z-20 cursor-pointer">
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
                  className="flex items-center gap-2 border border-[#dd6b01] px-3 py-2 rounded-lg text-sm text-[#dd6b01] bg-white hover:bg-[#dd6b01] hover:text-white transition"
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
                      Institution
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
                      className={`border-b border-gray-200 hover:bg-[#ffedd5]/50 transition ${
                        s.id === attempt.id ? "bg-orange-50/40" : ""
                      }`}
                    >
                      <td className="px-6 py-4 font-semibold text-gray-700">
                        {s.merit}
                      </td>

                      <td className="px-6 py-4 flex items-center gap-3">
                        <div className="w-10 h-10 flex items-center justify-center rounded-full bg-[#dd6b01] text-white font-bold text-lg">
                          {s.name.charAt(0)}
                        </div>
                        <span className="font-semibold text-[#dd6b01]">
                          {s.name} {s.id === attempt.id && "(You)"}
                        </span>
                      </td>

                      <td className="px-6 py-4">{s.institution || "Self Study"}</td>
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
            </div>
          </div>
        )}
      </div>

      {/* Official Certificate & Transcript PDF/Print Layout */}
      <CertificatePrintLayout examName={attempt.examName} result={myResult} />
    </PageContainer>
  );
}
