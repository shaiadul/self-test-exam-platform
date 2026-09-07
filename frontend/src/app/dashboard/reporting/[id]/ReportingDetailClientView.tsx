"use client";

import React, { useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  FaSearch,
  FaSortAmountDown,
  FaSortAmountUp,
  FaArrowLeft,
  FaPrint,
  FaCheckCircle,
  FaTimesCircle,
  FaQuestionCircle,
  FaLightbulb,
} from "react-icons/fa";
import { PageContainer } from "../../../../components/common/PageContainer";
import Scorecard from "../../../../components/dashboard/Scorecard";
import CertificatePrintLayout from "../../../../components/dashboard/CertificatePrintLayout";
import { PrimaryBtn } from "../../../../components/ui/PrimaryBtn";
import { OutlineBtn } from "../../../../components/ui/OutlineBtn";
import { useRouter } from "next/navigation";

interface InfoItemProps {
  label: string;
  value: string;
}

const InfoItem: React.FC<InfoItemProps> = ({ label, value }) => (
  <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-3.5">
    <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block mb-1">
      {label}
    </span>
    <p className="font-bold text-xs sm:text-sm text-slate-800 truncate">{value}</p>
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

  // Compute peers and rank from initialReportDetails
  const { peers, myRank } = useMemo(() => {
    if (!initialReportDetails?.attempts || !attempt) {
      return { peers: [], myRank: 1 };
    }

    const sorted = [...initialReportDetails.attempts].sort(
      (a, b) => b.score - a.score
    );
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
        time: att.time
          ? new Date(att.time).toLocaleTimeString("en-US", {
              hour: "2-digit",
              minute: "2-digit",
            })
          : "N/A",
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
          return sortOrder === "asc"
            ? a.name.localeCompare(b.name)
            : b.name.localeCompare(a.name);
        }
      });
  }, [peers, searchTerm, sortBy, sortOrder]);

  if (!attempt) {
    return (
      <PageContainer>
        <div className="text-center py-20 px-4 bg-white rounded-3xl border border-slate-200/80 shadow-sm max-w-lg mx-auto">
          <div className="w-16 h-16 rounded-3xl bg-rose-50 text-rose-500 border border-rose-100 flex items-center justify-center text-2xl mx-auto mb-4">
            <FaTimesCircle />
          </div>
          <h2 className="text-xl font-black text-slate-900 mb-2">
            Attempt Not Found
          </h2>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mb-6">
            We couldn&apos;t find an evaluation report matching Attempt #{attemptId}. It may have been archived or submitted under another account.
          </p>
          <PrimaryBtn
            link="/dashboard/reporting"
            className="!text-xs !py-2.5 !px-5 gap-2 shadow-sm"
          >
            <FaArrowLeft className="text-xs" />
            <span>Return to My Reports</span>
          </PrimaryBtn>
        </div>
      </PageContainer>
    );
  }

  // Parse user answers JSON
  let userAnswersMap: Record<string, any> = {};
  try {
    if (attempt.answers) {
      userAnswersMap =
        typeof attempt.answers === "string"
          ? JSON.parse(attempt.answers)
          : attempt.answers;
    }
  } catch (e) {
    console.error("Error parsing user answers:", e);
  }

  const candidateDisplayName =
    attempt.userName || attempt.name || "Student Candidate";

  return (
    <PageContainer className="space-y-8 animate-fadeIn">
      {/* Print Certificate View (Hidden on screen, visible during print) */}
      <div className="hidden print:block">
        <CertificatePrintLayout
          candidateName={candidateDisplayName}
          examName={attempt.examName || "Mock Exam"}
          examDate={
            attempt.createdAt
              ? new Date(attempt.createdAt).toLocaleDateString("en-US", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })
              : "Recent"
          }
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
        {/* Navigation & Title Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-6">
          <div className="flex items-center gap-3">
            <OutlineBtn
              link="/dashboard/reporting"
              className="!p-2.5 !rounded-xl !text-slate-600 hover:!text-[#dd6b01] shadow-xs"
              title="Back to Reports"
            >
              <FaArrowLeft className="text-xs" />
            </OutlineBtn>
            <div>
              <span className="text-[10px] font-mono font-bold text-slate-400 block mb-0.5">
                Evaluation Ref #{attempt.id}
              </span>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                {attempt.examName || "Mock Exam Evaluation"}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3 self-start sm:self-center">
            <PrimaryBtn
              onClick={() => window.print()}
              className="!text-xs !py-2.5 !px-5 gap-2 !from-purple-600 !to-indigo-600 shadow-md shadow-purple-500/15"
            >
              <FaPrint className="text-xs" />
              <span>Print Official Certificate</span>
            </PrimaryBtn>
          </div>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm">
          <InfoItem label="Exam Title" value={attempt.examName || "N/A"} />
          <InfoItem label="Exam Pack" value={attempt.packName || "General Pack"} />
          <InfoItem label="Exam Code" value={`#${attempt.examId || "N/A"}`} />
          <InfoItem
            label="Submitted At"
            value={
              attempt.createdAt
                ? new Date(attempt.createdAt).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })
                : "N/A"
            }
          />
        </div>

        {/* Scorecard Component */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm">
          <Scorecard
            result={{
              total: (attempt.correct || 0) + (attempt.wrong || 0),
              correct: attempt.correct || 0,
              wrong: attempt.wrong || 0,
              negative: attempt.negative || 0,
              finalScore: attempt.finalScore || 0,
              passed: attempt.passed || false,
            }}
            totalMarks={attempt.totalMarks || attempt.total || 100}
          />
        </div>

        {/* Detailed Question Solution Analysis */}
        {questions.length > 0 && (
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-6">
            <div className="border-b border-slate-100 pb-4">
              <h3 className="text-xl font-black text-slate-900 tracking-tight">
                Question Analysis & Detailed Solutions
              </h3>
              <p className="text-xs text-slate-500 font-medium mt-1">
                Inspect your responses, correct answers, and solution breakdowns.
              </p>
            </div>

            <div className="space-y-6">
              {questions.map((q, idx) => {
                const userSelected = userAnswersMap[q.id.toString()];
                const isUnanswered =
                  userSelected === undefined || userSelected === null || userSelected === "";

                // Determine if an option index/string matches the correct answer
                const isOptionCorrect = (opt: string, optIdx: number) => {
                  if (q.correctAnswer && opt === q.correctAnswer) return true;
                  if (q.options && q.correctAnswer && optIdx === q.options.indexOf(q.correctAnswer))
                    return true;
                  if (q.correctIndex !== undefined && optIdx === q.correctIndex) return true;
                  return false;
                };

                // Determine if user selected this option
                const isOptionUserSelected = (opt: string, optIdx: number) => {
                  if (isUnanswered) return false;
                  if (userSelected === opt) return true;
                  if (Number(userSelected) === optIdx) return true;
                  return false;
                };

                // Check overall question correctness
                const isCorrect = !isUnanswered && (
                  userSelected === q.correctAnswer ||
                  (q.options && Number(userSelected) === q.options.indexOf(q.correctAnswer)) ||
                  (q.correctIndex !== undefined && Number(userSelected) === q.correctIndex)
                );

                const questionTitle = q.questionText || q.text || `Question ${idx + 1}`;

                return (
                  <div
                    key={q.id || idx}
                    className={`p-5 rounded-2xl border transition-all ${
                      isCorrect
                        ? "bg-emerald-50/30 border-emerald-200"
                        : isUnanswered
                        ? "bg-slate-50/60 border-slate-200"
                        : "bg-rose-50/30 border-rose-200"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <h4 className="font-bold text-slate-900 text-sm sm:text-base leading-snug">
                        Q{idx + 1}. {questionTitle}
                      </h4>
                      <span
                        className={`shrink-0 px-3 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                          isCorrect
                            ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                            : isUnanswered
                            ? "bg-slate-100 text-slate-600 border border-slate-200"
                            : "bg-rose-100 text-rose-800 border border-rose-200"
                        }`}
                      >
                        {isCorrect
                          ? "✓ Correct"
                          : isUnanswered
                          ? "Not Answered"
                          : "✕ Incorrect"}
                      </span>
                    </div>

                    {/* Passage text if any */}
                    {q.passage && (
                      <div className="mb-4 p-3.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-700 leading-relaxed font-serif">
                        <strong className="block text-slate-900 font-sans font-bold text-[11px] uppercase tracking-wider mb-1">
                          Reference Passage:
                        </strong>
                        {q.passage}
                      </div>
                    )}

                    {/* Picture if any */}
                    {q.pictureUrl && (
                      <div className="relative w-full max-w-sm h-48 rounded-xl overflow-hidden mb-4 border border-slate-200">
                        <Image
                          src={q.pictureUrl}
                          alt="Question Illustration"
                          fill
                          className="object-cover"
                        />
                      </div>
                    )}

                    {/* Options list */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 my-3">
                      {q.options &&
                        q.options.map((opt: string, optIdx: number) => {
                          const optionIsCorrect = isOptionCorrect(opt, optIdx);
                          const optionIsChosen = isOptionUserSelected(opt, optIdx);

                          return (
                            <div
                              key={optIdx}
                              className={`p-3 rounded-xl text-xs font-semibold flex items-center justify-between gap-2 border transition ${
                                optionIsCorrect
                                  ? "bg-emerald-100 border-emerald-300 text-emerald-900 font-bold"
                                  : optionIsChosen
                                  ? "bg-rose-100 border-rose-300 text-rose-900 font-bold"
                                  : "bg-white border-slate-200 text-slate-700"
                              }`}
                            >
                              <span className="truncate">
                                {String.fromCharCode(65 + optIdx)}. {opt}
                              </span>
                              {optionIsCorrect && (
                                <span className="text-[10px] bg-emerald-600 text-white px-2 py-0.5 rounded-full font-bold shrink-0">
                                  Correct Answer
                                </span>
                              )}
                              {optionIsChosen && !optionIsCorrect && (
                                <span className="text-[10px] bg-rose-600 text-white px-2 py-0.5 rounded-full font-bold shrink-0">
                                  Your Choice
                                </span>
                              )}
                            </div>
                          );
                        })}
                    </div>

                    {/* Solution Explanation */}
                    {q.explanation && (
                      <div className="mt-3 p-3.5 bg-amber-50/70 border border-amber-200/80 rounded-xl text-xs text-amber-950 flex items-start gap-2">
                        <FaLightbulb className="text-amber-500 shrink-0 text-sm mt-0.5" />
                        <div>
                          <strong className="block font-bold text-amber-900 mb-0.5">
                            Solution Explanation:
                          </strong>
                          <p className="leading-relaxed">{q.explanation}</p>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Peer Leaderboard Table */}
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h3 className="text-xl font-black text-slate-900 tracking-tight">
                Exam Merit Leaderboard
              </h3>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Comparative standing among candidates who attended this mock exam.
              </p>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <div className="flex items-center w-full sm:w-64 border border-[#dd6b01] rounded-lg px-3 py-2 bg-white">
                <FaSearch className="text-[#dd6b01] mr-2 text-xs" />
                <input
                  type="text"
                  placeholder="Filter candidate..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="outline-none text-xs font-medium bg-transparent w-full text-gray-700 placeholder-gray-400"
                />
              </div>

              <button
                onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
                className="flex items-center justify-center border border-gray-300 rounded-lg p-2.5 bg-white hover:border-[#dd6b01] transition text-gray-700 cursor-pointer"
                title={`Sort Order: ${sortOrder === "asc" ? "Ascending" : "Descending"}`}
              >
                {sortOrder === "asc" ? <FaSortAmountUp className="text-[#dd6b01] text-xs" /> : <FaSortAmountDown className="text-[#dd6b01] text-xs" />}
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
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
                      p.id === attempt.id
                        ? "bg-orange-50/70 font-bold"
                        : "hover:bg-slate-50/50"
                    }`}
                  >
                    <td className="py-4 px-6 font-black text-slate-900">
                      #{p.merit}
                    </td>
                    <td className="py-4 px-6 font-bold text-slate-900">
                      {p.name}{" "}
                      {p.id === attempt.id && (
                        <span className="text-[#dd6b01] text-xs font-extrabold ml-1 bg-orange-100 px-2 py-0.5 rounded-full">
                          You
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-6 font-black text-[#dd6b01]">
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
        </div>
      </div>
    </PageContainer>
  );
}
