import React from "react";
import Image from "next/image";
import {
  FaBookOpen,
  FaFileImage,
  FaCheckCircle,
  FaFlag,
  FaEraser,
  FaCheck,
  FaArrowLeft,
  FaArrowRight,
} from "react-icons/fa";
import { cn } from "../../../../../../lib/utils";
import { Answer, QuestionData } from "../types";

interface ExamQuestionCardProps {
  currentQ: QuestionData;
  currentQuestionIdx: number;
  totalQuestions: number;
  negativeMarks: number;
  userAnswer?: Answer;
  isMarkedForReview: boolean;
  onSelectOption: (questionId: number, option: Answer) => void;
  onClearAnswer: (questionId: number) => void;
  onToggleMarkForReview: (questionId: number) => void;
  onMarkAndNext: (questionId: number) => void;
  onPrevQuestion: () => void;
  onNextQuestion: () => void;
  onOpenSubmitConfirm: () => void;
}

export const ExamQuestionCard: React.FC<ExamQuestionCardProps> = ({
  currentQ,
  currentQuestionIdx,
  totalQuestions,
  negativeMarks,
  userAnswer,
  isMarkedForReview,
  onSelectOption,
  onClearAnswer,
  onToggleMarkForReview,
  onMarkAndNext,
  onPrevQuestion,
  onNextQuestion,
  onOpenSubmitConfirm,
}) => {
  const getTypeLabel = (type?: string) => {
    if (type === "passage") return "Passage Comprehension";
    if (type === "picture") return "Visual Context / Diagram";
    return "Multiple Choice (MCQ)";
  };

  const getTypeIcon = (type?: string) => {
    if (type === "passage") return <FaBookOpen className="text-xs" />;
    if (type === "picture") return <FaFileImage className="text-xs" />;
    return <FaCheckCircle className="text-xs" />;
  };

  return (
    <div className="bg-white rounded border border-slate-200/80 shadow-xs overflow-hidden flex flex-col">
      {/* QUESTION META RIBBON */}
      <div className="px-3 sm:px-5 py-2.5 bg-slate-50/80 border-b border-slate-100 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="w-6 h-6 rounded bg-primary text-white font-mono font-bold text-xs flex items-center justify-center shadow-xs">
            {currentQuestionIdx + 1}
          </span>
          <div>
            <span className="text-xs font-bold text-slate-900 tracking-tight block">
              Question {currentQuestionIdx + 1} of {totalQuestions}
            </span>
            <span className="inline-flex items-center gap-1 text-[10px] text-primary font-bold">
              {getTypeIcon(currentQ.type)}
              <span>{getTypeLabel(currentQ.type)}</span>
            </span>
          </div>
        </div>

        {/* Indicators & Flag / Clear Actions */}
        <div className="flex items-center gap-2">
          <span className="hidden sm:inline-flex px-2 py-0.5 rounded font-mono text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200">
            +1.0 Mark {negativeMarks > 0 && `• -${negativeMarks} Neg`}
          </span>

          <button
            onClick={() => onToggleMarkForReview(currentQ.id)}
            className={cn(
              "px-2 py-1 rounded text-xs font-bold transition flex items-center gap-1.5 border cursor-pointer",
              isMarkedForReview
                ? "bg-indigo-50 text-indigo-700 border-indigo-300"
                : "bg-white text-slate-600 border-slate-200 hover:border-indigo-300 hover:text-indigo-600"
            )}
          >
            <FaFlag className="text-[10px]" />
            <span>{isMarkedForReview ? "Marked" : "Flag for Review"}</span>
          </button>

          {userAnswer !== undefined && (
            <button
              onClick={() => onClearAnswer(currentQ.id)}
              className="px-2 py-1 text-slate-400 hover:text-rose-600 text-xs font-bold transition cursor-pointer flex items-center gap-1"
              title="Clear chosen option"
            >
              <FaEraser className="text-[10px]" />
              <span className="hidden sm:inline">Clear</span>
            </button>
          )}
        </div>
      </div>

      {/* QUESTION BODY */}
      <div className="p-3 sm:p-5 space-y-3.5">
        {/* Passage Text (if applicable) */}
        {currentQ.passage && (
          <div className="p-3 bg-slate-50 rounded border border-slate-200 text-xs text-slate-700 leading-relaxed max-h-48 overflow-y-auto custom-scrollbar font-medium">
            <div className="flex items-center gap-1.5 text-[10px] font-mono font-bold uppercase text-slate-400 mb-1">
              <FaBookOpen /> Reference Passage
            </div>
            {currentQ.passage}
          </div>
        )}

        {/* Context Image (if applicable) */}
        {currentQ.pictureUrl && (
          <div className="overflow-hidden rounded border border-slate-200 bg-slate-50 flex items-center justify-center max-h-64">
            <Image
              src={currentQ.pictureUrl}
              alt="Question context"
              width={500}
              height={260}
              className="object-contain max-h-60 w-auto"
            />
          </div>
        )}

        {/* Question Stem */}
        <h3 className="text-sm sm:text-base font-bold text-slate-900 leading-snug">
          {currentQ.questionText}
        </h3>

        {/* Options Matrix */}
        <div className="space-y-2 pt-1">
          {currentQ.options.map((opt, optIdx) => {
            const isSelected = userAnswer === opt;
            const optLetter = String.fromCharCode(65 + optIdx);

            return (
              <button
                key={optIdx}
                type="button"
                onClick={() => onSelectOption(currentQ.id, opt)}
                className={cn(
                  "w-full p-2.5 sm:p-3 rounded text-xs font-medium text-left border transition-all flex items-center justify-between cursor-pointer group",
                  isSelected
                    ? "bg-primary/10 border-primary text-primary shadow-2xs font-bold"
                    : "bg-white border-slate-200/90 hover:border-primary/40 hover:bg-slate-50/70 text-slate-700"
                )}
              >
                <span className="flex items-center gap-2.5 min-w-0 pr-2">
                  <span
                    className={cn(
                      "w-5 h-5 rounded font-mono text-[11px] font-bold flex items-center justify-center shrink-0 transition-colors",
                      isSelected
                        ? "bg-primary text-white"
                        : "bg-slate-100 text-slate-500 group-hover:bg-primary/10 group-hover:text-primary"
                    )}
                  >
                    {optLetter}
                  </span>
                  <span className="break-words leading-relaxed">{opt}</span>
                </span>
                {isSelected && (
                  <span className="w-4 h-4 rounded bg-primary text-white flex items-center justify-center text-[9px] shrink-0 font-bold">
                    <FaCheck />
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* BOTTOM STICKY CONSOLE ACTION STRIP */}
      <div className="px-3 sm:px-5 py-2 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-1.5 sm:gap-2">
        <button
          onClick={onPrevQuestion}
          disabled={currentQuestionIdx === 0}
          className="px-2.5 sm:px-3 py-1.5 text-xs font-bold rounded border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-35 transition cursor-pointer flex items-center gap-1 sm:gap-1.5"
        >
          <FaArrowLeft className="text-[10px]" />
          <span className="hidden sm:inline">Previous</span>
        </button>

        <div className="flex items-center gap-1.5 sm:gap-2">
          <button
            onClick={() => onMarkAndNext(currentQ.id)}
            className="px-2.5 sm:px-3 py-1.5 text-xs font-bold rounded bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 transition cursor-pointer flex items-center gap-1 sm:gap-1.5"
          >
            <FaFlag className="text-[10px]" />
            <span className="hidden sm:inline">Mark & Next</span>
            <span className="sm:hidden">Flag</span>
          </button>

          {currentQuestionIdx < totalQuestions - 1 ? (
            <button
              onClick={onNextQuestion}
              className="px-3 sm:px-4 py-1.5 text-xs font-bold rounded bg-primary hover:bg-primary-dark text-white shadow-xs transition cursor-pointer flex items-center gap-1 sm:gap-1.5"
            >
              <span>Next</span>
              <FaArrowRight className="text-[10px]" />
            </button>
          ) : (
            <button
              onClick={onOpenSubmitConfirm}
              className="px-3 sm:px-4 py-1.5 text-xs font-bold rounded bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition cursor-pointer flex items-center gap-1 sm:gap-1.5"
            >
              <FaCheckCircle className="text-[10px]" />
              <span>Finish</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
