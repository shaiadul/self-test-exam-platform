"use client";

import React, { useState, useMemo } from "react";
import Image from "next/image";
import { FaSearch, FaSortAmountDown, FaSortAmountUp, FaArrowLeft } from "react-icons/fa";
import { PageContainer } from "../../../../components/common/PageContainer";
import Scorecard from "../../../../components/dashboard/Scorecard";
import CertificatePrintLayout from "../../../../components/dashboard/CertificatePrintLayout";
import { useRouter } from "next/navigation";

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

interface ReportingDetailClientViewProps {
  attemptId: number;
  initialAttempt: any;
  initialQuestions: any[];
  initialReportDetails: any;
}

export default function ReportingDetailClientView({
  attemptId,
  initialAttempt,
  initialQuestions,
  initialReportDetails,
}: ReportingDetailClientViewProps) {
  const router = useRouter();
  const attempt = initialAttempt;
  const questions = initialQuestions || [];

  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<"score" | "name">("score");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [showDropdown, setShowDropdown] = useState(false);

  // Compute peers and rank from initialReportDetails
  const { peers, myRank } = useMemo(() => {
    if (!initialReportDetails?.attempts || !attempt) {
      return { peers: [], myRank: 1 };
    }

    const sorted = [...initialReportDetails.attempts].sort((a, b) => b.score - a.score);
    let rank = 1;
    let foundMyRank = 1;

    const formattedPeers: PeerStudent[] = sorted.map((att, idx) => {
      if (idx > 0 && att.score < sorted[idx - 1].score) {
        rank = idx + 1;
      }
      if (att.id === attempt.id) {
        foundMyRank = rank;
      }
      return {
        id: att.id,
        merit: rank,
        name: att.name,
        board: "Online",
        time: att.time ? new Date(att.time).toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
        }) : "N/A",
        score: att.score,
        negative: att.negative,
        institution: att.institution,
      };
    });

    return { peers: formattedPeers, myRank: foundMyRank };
  }, [initialReportDetails, attempt]);

  const filteredPeers = useMemo(() => {
    return peers
      .filter((p) => p.name.toLowerCase().includes(searchTerm.toLowerCase()))
      .sort((a, b) => {
        if (sortBy === "score") {
          return sortOrder === "asc" ? a.score - b.score : b.score - a.score;
        } else {
          return sortOrder === "asc" ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name);
        }
      });
  }, [peers, searchTerm, sortBy, sortOrder]);

  if (!attempt) {
    return (
      <PageContainer>
        <div className="text-center py-16 text-gray-500 font-medium">
          Attempt details not found.
        </div>
      </PageContainer>
    );
  }

  // Parse user answers JSON
  let userAnswersMap: Record<string, number> = {};
  try {
    if (attempt.answers) {
      userAnswersMap = typeof attempt.answers === "string" ? JSON.parse(attempt.answers) : attempt.answers;
    }
  } catch (e) {
    console.error("Error parsing user answers:", e);
  }

  return (
    <PageContainer className="space-y-8 animate-fadeIn">
      {/* Print Certificate View (Hidden on screen, visible during print) */}
      <div className="hidden print:block">
        <CertificatePrintLayout
          candidateName={attempt.userName || "Student"}
          examName={attempt.examName || "Mock Exam"}
          examDate={attempt.createdAt ? new Date(attempt.createdAt).toLocaleDateString("en-US", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          }) : "Recent"}
          result={{
            total: (attempt.correct || 0) + (attempt.wrong || 0),
            correct: attempt.correct || 0,
            wrong: attempt.wrong || 0,
            negative: attempt.negative || 0,
            finalScore: attempt.finalScore || 0,
            passed: attempt.passed || false,
          }}
          totalMarks={attempt.total || 100}
        />
      </div>

      {/* Screen View (Hidden when printing) */}
      <div className="print:hidden space-y-8">
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-2 text-sm font-bold text-[#dd6b01] hover:underline cursor-pointer"
        >
          <FaArrowLeft /> Back to Reports
        </button>

        {/* Info Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-white p-6 rounded-3xl border border-gray-100 shadow-md">
          <InfoItem label="Exam Title" value={attempt.examName || "N/A"} />
          <InfoItem label="Exam Pack" value={attempt.packName || "N/A"} />
          <InfoItem label="Code" value={attempt.examId || "N/A"} />
          <InfoItem label="Date" value={attempt.createdAt ? new Date(attempt.createdAt).toLocaleDateString() : "N/A"} />
        </div>

        {/* Scorecard */}
        <Scorecard
          result={{
            total: (attempt.correct || 0) + (attempt.wrong || 0),
            correct: attempt.correct || 0,
            wrong: attempt.wrong || 0,
            negative: attempt.negative || 0,
            finalScore: attempt.finalScore || 0,
            passed: attempt.passed || false,
          }}
          totalMarks={attempt.total || 100}
        />

        {/* Detailed Question Solution Analysis */}
        {questions.length > 0 && (
          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-md space-y-6">
            <h3 className="text-xl font-black text-gray-900 border-b border-gray-100 pb-4">
              Detailed Question Analysis & Explanations
            </h3>

            <div className="space-y-6">
              {questions.map((q, idx) => {
                const userSelected = userAnswersMap[q.id.toString()];
                const isUnanswered = userSelected === undefined || userSelected === null;
                const isCorrect = userSelected === q.correctIndex;

                return (
                  <div
                    key={q.id || idx}
                    className={`p-5 rounded-2xl border transition ${
                      isCorrect
                        ? "bg-emerald-50/30 border-emerald-200"
                        : isUnanswered
                        ? "bg-gray-50 border-gray-200"
                        : "bg-rose-50/30 border-rose-200"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <h4 className="font-bold text-gray-900 text-base">
                        Q{idx + 1}. {q.text}
                      </h4>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-black uppercase ${
                          isCorrect
                            ? "bg-emerald-100 text-emerald-800"
                            : isUnanswered
                            ? "bg-gray-200 text-gray-700"
                            : "bg-rose-100 text-rose-800"
                        }`}
                      >
                        {isCorrect ? "Correct" : isUnanswered ? "Not Answered" : "Incorrect"}
                      </span>
                    </div>

                    {/* Options list */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 my-4">
                      {q.options && q.options.map((opt: string, optIdx: number) => {
                        const isOptionCorrect = optIdx === q.correctIndex;
                        const isOptionUserSelected = optIdx === userSelected;

                        return (
                          <div
                            key={optIdx}
                            className={`p-3 rounded-xl text-xs font-semibold flex items-center justify-between border ${
                              isOptionCorrect
                                ? "bg-emerald-100 border-emerald-300 text-emerald-900 font-bold"
                                : isOptionUserSelected
                                ? "bg-rose-100 border-rose-300 text-rose-900 font-bold"
                                : "bg-white border-gray-200 text-gray-700"
                            }`}
                          >
                            <span>
                              {String.fromCharCode(65 + optIdx)}. {opt}
                            </span>
                            {isOptionCorrect && (
                              <span className="text-[10px] bg-emerald-600 text-white px-2 py-0.5 rounded-full font-bold">
                                Correct Answer
                              </span>
                            )}
                            {isOptionUserSelected && !isOptionCorrect && (
                              <span className="text-[10px] bg-rose-600 text-white px-2 py-0.5 rounded-full font-bold">
                                Your Choice
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {/* Explanation */}
                    {q.explanation && (
                      <div className="mt-3 p-3 bg-amber-50/60 border border-amber-200 rounded-xl text-xs text-amber-900">
                        <strong className="block text-amber-950 mb-1">💡 Solution Explanation:</strong>
                        <p>{q.explanation}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Peer Leaderboard Table */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-md overflow-hidden">
          <div className="p-6 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h3 className="text-xl font-black text-gray-900">Exam Merit Leaderboard</h3>
              <p className="text-xs text-gray-500 font-medium">Rankings across all participating students.</p>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center border border-gray-300 rounded-xl px-3 py-2 text-xs bg-white">
                <FaSearch className="text-gray-400 mr-2" />
                <input
                  type="text"
                  placeholder="Filter student..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="outline-none text-xs font-semibold"
                />
              </div>

              <button
                onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
                className="p-2 border border-gray-300 rounded-xl text-gray-600 hover:border-[#dd6b01]"
              >
                {sortOrder === "asc" ? <FaSortAmountUp /> : <FaSortAmountDown />}
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 text-gray-400 font-bold text-xs uppercase tracking-wider border-b border-gray-100">
                  <th className="py-4 px-6">Rank</th>
                  <th className="py-4 px-6">Student</th>
                  <th className="py-4 px-6">Score</th>
                  <th className="py-4 px-6">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {filteredPeers.map((p) => (
                  <tr
                    key={p.id}
                    className={`transition ${p.id === attempt.id ? "bg-orange-50/60 font-bold" : "hover:bg-gray-50/50"}`}
                  >
                    <td className="py-4 px-6 font-black text-gray-900">#{p.merit}</td>
                    <td className="py-4 px-6 font-bold text-gray-900">
                      {p.name} {p.id === attempt.id && <span className="text-[#dd6b01] text-xs font-black">(You)</span>}
                    </td>
                    <td className="py-4 px-6 font-extrabold text-[#dd6b01]">{p.score}</td>
                    <td className="py-4 px-6 text-xs text-gray-500">{p.time}</td>
                  </tr>
                ))}

                {filteredPeers.length === 0 && (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-gray-500 font-medium">
                      No peer results match your search.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
