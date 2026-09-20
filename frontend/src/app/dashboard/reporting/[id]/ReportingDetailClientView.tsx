"use client";

import React, { useMemo } from "react";
import { FaArrowLeft, FaEyeSlash, FaPrint, FaTimesCircle } from "react-icons/fa";
import { PageContainer } from "../../../../components/common/PageContainer";
import Scorecard from "../../../../components/dashboard/Scorecard";
import CertificatePrintLayout from "../../../../components/dashboard/CertificatePrintLayout";
import { PrimaryBtn } from "../../../../components/ui/PrimaryBtn";
import { OutlineBtn } from "../../../../components/ui/OutlineBtn";
import { formatDate, formatTime, DATE_FORMATS } from "@/lib/date";
import { PeerStudent } from "./types";
import { ReportingDetailInfoGrid } from "./components/ReportingDetailInfoGrid";
import { ReportingDetailQuestionsList } from "./components/ReportingDetailQuestionsList";
import { ReportingDetailMeritSection } from "./components/ReportingDetailMeritSection";

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
  const attempt = initialAttempt;
  const questions = initialQuestions || [];

  // Helper to format duration in minutes and seconds
  const formatDuration = (seconds?: number): string => {
    if (!seconds || seconds <= 0) return "N/A";
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    if (mins === 0) return `${secs}s`;
    if (secs === 0) return `${mins}m`;
    return `${mins}m ${secs}s`;
  };

  // Compute peers and rank from initialReportDetails with multi-tier tie-breakers:
  // 1. Highest Score / Points
  // 2. Less time taken (lower duration)
  // 3. Attempt Number (first attempt before retakes)
  // 4. Started earlier (earlier start/submission date-time)
  const { peers } = useMemo(() => {
    if (!initialReportDetails?.attempts || !attempt) {
      return { peers: [] };
    }

    const sorted = [...initialReportDetails.attempts].sort((a, b) => {
      // 1. Score (higher score wins)
      if (b.score !== a.score) {
        return b.score - a.score;
      }

      // 2. Who took less time (lower durationSeconds wins)
      const durA = a.durationSeconds && a.durationSeconds > 0 ? a.durationSeconds : Infinity;
      const durB = b.durationSeconds && b.durationSeconds > 0 ? b.durationSeconds : Infinity;
      if (durA !== durB) {
        return durA - durB;
      }

      // 3. Attempt Number (1st attempt before retakes / who started again)
      const attNumA = a.attemptNumber && a.attemptNumber > 0 ? a.attemptNumber : 1;
      const attNumB = b.attemptNumber && b.attemptNumber > 0 ? b.attemptNumber : 1;
      if (attNumA !== attNumB) {
        return attNumA - attNumB;
      }

      // 4. Who started earlier
      const timeA = new Date(a.startedAt || a.time).getTime() || 0;
      const timeB = new Date(b.startedAt || b.time).getTime() || 0;
      return timeA - timeB;
    });

    let rank = 1;

    const formattedPeers: PeerStudent[] = sorted.map((att, idx) => {
      if (idx > 0) {
        const prev = sorted[idx - 1];
        const prevDur = prev.durationSeconds && prev.durationSeconds > 0 ? prev.durationSeconds : Infinity;
        const curDur = att.durationSeconds && att.durationSeconds > 0 ? att.durationSeconds : Infinity;
        const prevAttNum = prev.attemptNumber && prev.attemptNumber > 0 ? prev.attemptNumber : 1;
        const curAttNum = att.attemptNumber && att.attemptNumber > 0 ? att.attemptNumber : 1;
        const prevTime = new Date(prev.startedAt || prev.time).getTime() || 0;
        const curTime = new Date(att.startedAt || att.time).getTime() || 0;

        const isExactTie =
          att.score === prev.score &&
          curDur === prevDur &&
          curAttNum === prevAttNum &&
          curTime === prevTime;

        if (!isExactTie) {
          rank = idx + 1;
        }
      }

      return {
        id: att.id,
        merit: rank,
        name: att.name,
        board: "Online",
        time: formatTime(att.time, DATE_FORMATS.TIME_12H, "N/A"),
        score: att.score,
        negative: att.negative,
        institution: att.institution,
        durationSeconds: att.durationSeconds,
        durationFormatted: formatDuration(att.durationSeconds),
        startedAt: att.startedAt,
        attemptNumber: att.attemptNumber || 1,
      };
    });

    return { peers: formattedPeers };
  }, [initialReportDetails, attempt]);

  if (!attempt) {
    return (
      <PageContainer>
        <div className="text-center py-20 px-4 bg-white rounded border border-slate-200/80 shadow-sm max-w-lg mx-auto">
          <div className="w-16 h-16 rounded bg-rose-50 text-rose-500 border border-rose-100 flex items-center justify-center text-2xl mx-auto mb-4">
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
      {attempt.feedback !== false && (
        <div className="hidden print:block">
          <CertificatePrintLayout
            candidateName={candidateDisplayName}
            examName={attempt.examName || "Mock Exam"}
            examDate={formatDate(attempt.createdAt, DATE_FORMATS.DATETIME_FULL, "Recent")}
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
      )}

      {/* Screen View (Hidden when printing) */}
      <div className="print:hidden space-y-8">
        {/* Navigation & Title Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-4">
          <div className="flex items-center gap-3">
            <OutlineBtn
              link="/dashboard/reporting"
              className="!p-2 !rounded !text-slate-600 hover:!text-primary shadow-2xs border-slate-200"
              title="Back to Reports"
            >
              <FaArrowLeft className="text-xs" />
            </OutlineBtn>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                {attempt.examName || "Mock Exam Evaluation"}
              </h1>
            </div>
          </div>

          {attempt.feedback !== false && (
            <div className="flex items-center gap-3 self-start sm:self-center">
              <PrimaryBtn
                onClick={() => window.print()}
                className="!text-xs !py-2.5 !px-5 gap-2 !from-purple-600 !to-indigo-600 shadow-md shadow-purple-500/15"
              >
                <FaPrint className="text-xs" />
                <span>Print Official Certificate</span>
              </PrimaryBtn>
            </div>
          )}
        </div>

        {/* Info Grid */}
        <ReportingDetailInfoGrid attempt={attempt} />

        {attempt.feedback === false && (
          <div className="bg-amber-50/80 border border-amber-200/90 rounded-xl p-4 sm:p-5 flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center shrink-0 text-base mt-0.5">
              <FaEyeSlash />
            </div>
            <div>
              <h3 className="text-sm font-bold text-amber-950 mb-0.5">
                Instant Feedback Disabled by Instructor
              </h3>
              <p className="text-xs text-amber-800 leading-relaxed">
                The instructor has turned off instant feedback for this examination. Correct answer keys, question-by-question solution analysis, and detailed explanations are withheld from students.
              </p>
            </div>
          </div>
        )}

        {/* Scorecard Component */}
        <div className="bg-white rounded border border-slate-200/80 p-4 sm:p-6 shadow-2xs">
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
            passingPercent={attempt.passingMarks || 33}
          />
        </div>

        {/* Detailed Question Solution Analysis - Only visible if feedback is enabled */}
        {attempt.feedback !== false ? (
          <ReportingDetailQuestionsList
            questions={questions}
            userAnswersMap={userAnswersMap}
          />
        ) : null}

        {/* Peer Leaderboard Table & Mobile Cards */}
        <ReportingDetailMeritSection
          peers={peers}
          currentAttemptId={attempt.id}
        />
      </div>
    </PageContainer>
  );
}
