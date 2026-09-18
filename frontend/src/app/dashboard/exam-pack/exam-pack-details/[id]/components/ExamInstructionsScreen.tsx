import React from "react";
import { FaShieldAlt, FaSync, FaExpand } from "react-icons/fa";
import { PageContainer } from "../../../../../../components/common/PageContainer";
import { PrimaryBtn } from "../../../../../../components/ui/PrimaryBtn";
import { OutlineBtn } from "../../../../../../components/ui/OutlineBtn";
import { ExamMeta, QuestionData } from "../types";

interface ExamInstructionsScreenProps {
  examMeta: ExamMeta;
  questions: QuestionData[];
  loadingQuestions: boolean;
  onStartExam: () => void;
  onExit: () => void;
  onRefreshQuestions: () => void;
}

export const ExamInstructionsScreen: React.FC<ExamInstructionsScreenProps> = ({
  examMeta,
  questions,
  loadingQuestions,
  onStartExam,
  onExit,
  onRefreshQuestions,
}) => {
  return (
    <PageContainer className="max-w-3xl mx-auto py-10 px-4">
      <div className="bg-white rounded p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-6">
        {/* Header */}
        <div className="border-b border-slate-100 pb-5 text-center space-y-2">
          <span className="px-2.5 py-0.5 bg-primary/10 text-primary font-mono font-bold text-[10px] rounded uppercase tracking-wider border border-primary/20">
            {examMeta.subject}
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            {examMeta.title}
          </h1>
          <p className="text-xs text-slate-500 font-medium">
            Please review all proctored parameters and security protocols before launching.
          </p>
        </div>

        {/* Exam Parameters Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 bg-slate-50 border border-slate-200/80 rounded text-center">
          <div className="p-2">
            <p className="text-[10px] font-mono text-slate-400 uppercase">Questions</p>
            <p className="text-xl font-mono font-black text-slate-900">
              {loadingQuestions ? "..." : questions.length}
            </p>
          </div>
          <div className="p-2 border-l border-slate-200/80">
            <p className="text-[10px] font-mono text-slate-400 uppercase">Duration</p>
            <p className="text-xl font-mono font-black text-primary">{examMeta.durationMinutes} Mins</p>
          </div>
          <div className="p-2 border-t sm:border-t-0 sm:border-l border-slate-200/80">
            <p className="text-[10px] font-mono text-slate-400 uppercase">Total Marks</p>
            <p className="text-xl font-mono font-black text-slate-900">{examMeta.totalMarks}</p>
          </div>
          <div className="p-2 border-t sm:border-t-0 border-l border-slate-200/80">
            <p className="text-[10px] font-mono text-slate-400 uppercase">Negative Marks</p>
            <p className="text-xl font-mono font-black text-rose-500">
              {examMeta.negativeMarks > 0 ? `-${examMeta.negativeMarks}` : "None"}
            </p>
          </div>
        </div>

        {/* Psychological Guidelines */}
        <div className="space-y-3 bg-slate-50/70 border border-slate-200/80 rounded p-4 sm:p-5">
          <div className="flex items-center gap-2 text-rose-600 font-mono font-bold text-xs uppercase tracking-wider">
            <FaShieldAlt className="text-sm" />
            <span>Strict Proctored Examination Rules:</span>
          </div>
          <ul className="text-xs text-slate-600 space-y-2 list-disc list-inside font-medium leading-relaxed">
            <li>
              <strong className="text-slate-900 font-bold">Proctored Fullscreen:</strong> Exam launches in fullscreen. Exiting generates an audit violation.
            </li>
            <li>
              <strong className="text-slate-900 font-bold">Focus Tracking:</strong> Tab switching, minimizing browser, or opening developer tools increments your security warning count.
            </li>
            <li>
              <strong className="text-slate-900 font-bold">3-Violation Auto-Submit:</strong> Accumulating 3 security strikes will automatically submit your exam.
            </li>
            <li>
              <strong className="text-slate-900 font-bold">Question Palette:</strong> Use the right-hand Question Matrix to flag, jump, or review items anytime.
            </li>
          </ul>
        </div>

        {/* Empty Warning */}
        {!loadingQuestions && questions.length === 0 && (
          <div className="p-4 bg-amber-50 border border-amber-200 rounded text-center space-y-2">
            <p className="text-xs font-bold text-amber-800">
              ⚠️ No questions found in this exam module yet.
            </p>
            <button
              onClick={onRefreshQuestions}
              className="inline-flex items-center gap-2 px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded text-xs font-bold transition cursor-pointer"
            >
              <FaSync className="text-xs" /> Refresh Question Bank
            </button>
          </div>
        )}

        {/* Actions */}
        <div className="pt-2 border-t border-slate-100 flex gap-3">
          <OutlineBtn
            onClick={onExit}
            className="flex-1 !text-xs !py-2.5 !rounded"
          >
            Exit to Dashboard
          </OutlineBtn>
          <PrimaryBtn
            onClick={onStartExam}
            disabled={loadingQuestions || questions.length === 0}
            className="flex-1 !text-xs !py-2.5 !rounded shadow-xs gap-2 disabled:opacity-50"
          >
            <FaExpand className="text-xs" />
            <span>{loadingQuestions ? "Synchronizing..." : "Start Examination"}</span>
          </PrimaryBtn>
        </div>
      </div>
    </PageContainer>
  );
};
