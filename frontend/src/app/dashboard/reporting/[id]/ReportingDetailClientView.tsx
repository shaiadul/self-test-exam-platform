"use client";

import React, { useMemo } from "react";
import { FaArrowLeft, FaPrint, FaTimesCircle } from "react-icons/fa";
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

  // Compute peers and rank from initialReportDetails
  const { peers } = useMemo(() => {
    if (!initialReportDetails?.attempts || !attempt) {
      return { peers: [] };
    }

    const sorted = [...initialReportDetails.attempts].sort(
      (a, b) => b.score - a.score
    );
    let rank = 1;

    const formattedPeers: PeerStudent[] = sorted.map((att, idx) => {
      if (idx > 0 && att.score < sorted[idx - 1].score) {
        rank = idx + 1;
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
        <ReportingDetailInfoGrid attempt={attempt} />

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

        {/* Detailed Question Solution Analysis */}
        <ReportingDetailQuestionsList
          questions={questions}
          userAnswersMap={userAnswersMap}
        />

        {/* Peer Leaderboard Table & Mobile Cards */}
        <ReportingDetailMeritSection
          peers={peers}
          currentAttemptId={attempt.id}
        />
      </div>
    </PageContainer>
  );
}
