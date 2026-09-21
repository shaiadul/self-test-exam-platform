import React, { useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaBookOpen, FaFileImage, FaCheckCircle, FaCheck, FaThLarge, FaTimes } from "react-icons/fa";
import { cn } from "../../../../../../lib/utils";
import { QuestionData } from "../types";

export interface MobileQuestionNavStripProps {
  questions: QuestionData[];
  currentQuestionIdx: number;
  getQuestionStatus: (qId: number) => "answered" | "review" | "unanswered" | "not-visited";
  onSelectQuestion: (idx: number) => void;
}

export const MobileQuestionNavStrip: React.FC<MobileQuestionNavStripProps> = ({
  questions,
  currentQuestionIdx,
  getQuestionStatus,
  onSelectQuestion,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      const activeBtn = containerRef.current.children[currentQuestionIdx] as HTMLElement;
      if (activeBtn) {
        activeBtn.scrollIntoView({
          behavior: "smooth",
          inline: "center",
          block: "nearest",
        });
      }
    }
  }, [currentQuestionIdx]);

  return (
    <div className="lg:hidden w-full bg-white border border-slate-200/80 rounded-lg sm:rounded shadow-2xs px-2 py-1.5 overflow-x-auto custom-scrollbar">
      <div ref={containerRef} className="flex items-center gap-1.5 min-w-max">
        {questions.map((q, idx) => {
          const status = getQuestionStatus(q.id);
          const isActive = idx === currentQuestionIdx;
          return (
            <button
              key={q.id || idx}
              type="button"
              onClick={() => onSelectQuestion(idx)}
              className={cn(
                "w-8 h-8 rounded font-mono text-xs font-bold transition-all flex items-center justify-center cursor-pointer shrink-0",
                isActive
                  ? "bg-primary text-white ring-2 ring-primary/40 font-black scale-105 shadow-xs"
                  : status === "answered"
                  ? "bg-emerald-50 text-emerald-700 border border-emerald-300"
                  : status === "review"
                  ? "bg-indigo-50 text-indigo-700 border border-indigo-300"
                  : status === "unanswered"
                  ? "bg-amber-50 text-amber-700 border border-amber-300"
                  : "bg-slate-100 text-slate-500 border border-slate-200"
              )}
            >
              {idx + 1}
            </button>
          );
        })}
      </div>
    </div>
  );
};

interface ExamQuestionMatrixProps {
  questions: QuestionData[];
  currentQuestionIdx: number;
  answeredCount: number;
  reviewCount: number;
  visitedQuestions: Set<number>;
  markedForReview: Set<number>;
  filterStatus: "all" | "answered" | "unanswered" | "review";
  mobileDrawerOpen: boolean;
  onSelectQuestion: (idx: number) => void;
  onSetFilterStatus: (status: "all" | "answered" | "unanswered" | "review") => void;
  onOpenMobileDrawer: () => void;
  onCloseMobileDrawer: () => void;
  onOpenSubmitConfirm: () => void;
  getQuestionStatus: (qId: number) => "answered" | "review" | "unanswered" | "not-visited";
}

export const ExamQuestionMatrix: React.FC<ExamQuestionMatrixProps> = ({
  questions,
  currentQuestionIdx,
  answeredCount,
  reviewCount,
  visitedQuestions,
  markedForReview,
  filterStatus,
  mobileDrawerOpen,
  onSelectQuestion,
  onSetFilterStatus,
  onCloseMobileDrawer,
  onOpenSubmitConfirm,
  getQuestionStatus,
}) => {
  const answeredPercentage =
    questions.length > 0 ? Math.round((answeredCount / questions.length) * 100) : 0;

  const nextQ = questions[currentQuestionIdx + 1];

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

  const filteredQuestions = questions
    .map((q, idx) => ({ q, idx }))
    .filter(({ q }) => {
      const status = getQuestionStatus(q.id);
      if (filterStatus === "answered") return status === "answered";
      if (filterStatus === "review") return status === "review";
      if (filterStatus === "unanswered") return status === "unanswered" || status === "not-visited";
      return true;
    });

  const skippedCount =
    visitedQuestions.size - answeredCount > 0 ? visitedQuestions.size - answeredCount : 0;
  const unvisitedCount = questions.length - visitedQuestions.size;

  return (
    <>
      {/* DESKTOP QUESTION MATRIX SIDEBAR */}
      <aside className="hidden lg:block lg:col-span-4 xl:col-span-3 space-y-3 sticky top-16">
        <div className="bg-white rounded border border-slate-200/80 shadow-xs p-3.5 space-y-3">
          {/* Palette Header */}
          <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
            <div>
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider font-mono">
                Question Matrix
              </h4>
              <p className="text-[10px] font-mono text-slate-400">
                {answeredCount} / {questions.length} answered ({answeredPercentage}%)
              </p>
            </div>
            <div className="w-10 h-1.5 rounded bg-slate-100 overflow-hidden">
              <div
                className="h-full bg-primary rounded transition-all duration-300"
                style={{ width: `${answeredPercentage}%` }}
              />
            </div>
          </div>

          {/* NEXT EXAM TYPE INDICATOR */}
          <div className="p-2 rounded bg-primary/5 border border-primary/20 flex items-center justify-between">
            <div>
              <span className="text-[9px] font-mono font-bold uppercase text-primary tracking-wider block">
                Next In Sequence
              </span>
              <p className="text-xs font-bold text-slate-800">
                {nextQ
                  ? `Q${currentQuestionIdx + 2}: ${getTypeLabel(nextQ.type)}`
                  : "Final Question (Ready)"}
              </p>
            </div>
            <div className="w-5 h-5 rounded bg-primary/10 text-primary flex items-center justify-center text-xs">
              {nextQ ? getTypeIcon(nextQ.type) : <FaCheck />}
            </div>
          </div>

          {/* PSYCHOLOGICAL STATUS LEGEND */}
          <div className="grid grid-cols-2 gap-1.5 text-[10px] font-mono text-slate-600">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded bg-emerald-500 text-white flex items-center justify-center text-[7px]">✓</span>
              <span>Answered ({answeredCount})</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded bg-indigo-500 text-white flex items-center justify-center text-[7px]">⚑</span>
              <span>Review ({reviewCount})</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded bg-amber-400 text-white flex items-center justify-center text-[7px]">•</span>
              <span>Skipped ({skippedCount})</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded bg-slate-200 border border-slate-300" />
              <span>Unvisited ({unvisitedCount})</span>
            </div>
          </div>

          {/* FILTER TABS */}
          <div className="flex items-center p-0.5 bg-slate-100 rounded text-[10px] font-mono font-bold">
            {(["all", "answered", "unanswered", "review"] as const).map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => onSetFilterStatus(tab)}
                className={cn(
                  "flex-1 py-1 rounded capitalize transition cursor-pointer",
                  filterStatus === tab
                    ? "bg-white text-slate-900 shadow-2xs font-extrabold"
                    : "text-slate-500 hover:text-slate-800"
                )}
              >
                {tab === "all" ? "All" : tab === "unanswered" ? "Skip" : tab === "review" ? "Review" : "Answered"}
              </button>
            ))}
          </div>

          {/* 5-COLUMN QUESTION NUMBER BUTTON MATRIX */}
          <div className="grid grid-cols-5 gap-1 max-h-52 overflow-y-auto custom-scrollbar p-0.5">
            {filteredQuestions.map(({ q, idx }) => {
              const status = getQuestionStatus(q.id);
              const isCurrent = idx === currentQuestionIdx;

              return (
                <button
                  key={q.id || idx}
                  type="button"
                  onClick={() => onSelectQuestion(idx)}
                  className={cn(
                    "h-7 rounded font-mono text-xs font-bold transition-all relative flex items-center justify-center cursor-pointer",
                    isCurrent
                      ? "bg-primary text-white ring-2 ring-primary/40 shadow-xs font-black scale-105 z-10"
                      : status === "answered"
                      ? "bg-emerald-50 text-emerald-700 border border-emerald-300 hover:bg-emerald-100"
                      : status === "review"
                      ? "bg-indigo-50 text-indigo-700 border border-indigo-300 hover:bg-indigo-100"
                      : status === "unanswered"
                      ? "bg-amber-50 text-amber-700 border border-amber-300 hover:bg-amber-100"
                      : "bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100"
                  )}
                  title={`Q${idx + 1} • ${getTypeLabel(q.type)} • ${status}`}
                >
                  {idx + 1}
                  {markedForReview.has(q.id) && (
                    <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded bg-indigo-600 text-[6px] text-white flex items-center justify-center">
                      ⚑
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Submit Quick CTA */}
          <button
            type="button"
            onClick={onOpenSubmitConfirm}
            className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded shadow-xs transition cursor-pointer font-mono"
          >
            Submit Exam Now
          </button>
        </div>
      </aside>

      {/* MOBILE QUESTION MATRIX SLIDE-UP DRAWER */}
      <AnimatePresence>
        {mobileDrawerOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onCloseMobileDrawer}
              className="lg:hidden fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-50"
            />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 26, stiffness: 240 }}
              className="lg:hidden fixed bottom-0 left-0 right-0 max-h-[85vh] bg-white rounded-t-2xl z-[60] shadow-2xl p-4 flex flex-col space-y-3 pb-[calc(env(safe-area-inset-bottom)+1rem)]"
            >
              {/* Drag Handle Indicator */}
              <div className="w-10 h-1 bg-slate-300 rounded-full mx-auto -mt-1" />

              <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded bg-primary/10 text-primary flex items-center justify-center text-xs">
                    <FaThLarge />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 uppercase font-mono">
                      Question Palette
                    </h4>
                    <p className="text-[10px] text-slate-400 font-mono">
                      {answeredCount} / {questions.length} answered ({answeredPercentage}%)
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={onCloseMobileDrawer}
                  className="p-1.5 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100 cursor-pointer"
                  aria-label="Close drawer"
                >
                  <FaTimes className="text-sm" />
                </button>
              </div>

              {/* Progress bar */}
              <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full transition-all duration-300"
                  style={{ width: `${answeredPercentage}%` }}
                />
              </div>

              {/* Legend Badges */}
              <div className="grid grid-cols-4 gap-1.5 text-[9px] font-mono font-bold text-center">
                <span className="px-1.5 py-1 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                  ✓ {answeredCount} Done
                </span>
                <span className="px-1.5 py-1 rounded bg-indigo-50 text-indigo-700 border border-indigo-200">
                  ⚑ {reviewCount} Review
                </span>
                <span className="px-1.5 py-1 rounded bg-amber-50 text-amber-700 border border-amber-200">
                  • {skippedCount} Skip
                </span>
                <span className="px-1.5 py-1 rounded bg-slate-100 text-slate-600 border border-slate-200">
                  {unvisitedCount} Left
                </span>
              </div>

              {/* Mobile Filter Tabs */}
              <div className="flex items-center p-0.5 bg-slate-100 rounded text-[11px] font-mono font-bold">
                {(["all", "answered", "unanswered", "review"] as const).map((tab) => (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => onSetFilterStatus(tab)}
                    className={cn(
                      "flex-1 py-1 rounded capitalize transition cursor-pointer text-center",
                      filterStatus === tab
                        ? "bg-white text-slate-900 shadow-2xs font-black"
                        : "text-slate-500 hover:text-slate-800"
                    )}
                  >
                    {tab === "all"
                      ? "All"
                      : tab === "unanswered"
                      ? "Skipped"
                      : tab === "review"
                      ? "Flagged"
                      : "Answered"}
                  </button>
                ))}
              </div>

              {/* Mobile Question Buttons Grid */}
              <div className="grid grid-cols-5 sm:grid-cols-6 gap-2 overflow-y-auto custom-scrollbar max-h-56 p-1">
                {filteredQuestions.map(({ q, idx }) => {
                  const status = getQuestionStatus(q.id);
                  const isCurrent = idx === currentQuestionIdx;
                  return (
                    <button
                      key={q.id || idx}
                      type="button"
                      onClick={() => {
                        onSelectQuestion(idx);
                        onCloseMobileDrawer();
                      }}
                      className={cn(
                        "h-9 rounded-lg font-mono text-xs font-bold transition flex items-center justify-center cursor-pointer relative",
                        isCurrent
                          ? "bg-primary text-white font-black scale-105 ring-2 ring-primary/40 shadow-xs"
                          : status === "answered"
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-300"
                          : status === "review"
                          ? "bg-indigo-50 text-indigo-700 border border-indigo-300"
                          : status === "unanswered"
                          ? "bg-amber-50 text-amber-700 border border-amber-300"
                          : "bg-slate-100 text-slate-600 border border-slate-200"
                      )}
                    >
                      {idx + 1}
                      {markedForReview.has(q.id) && (
                        <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-indigo-600 text-[6px] text-white flex items-center justify-center">
                          ⚑
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Submit Final CTA */}
              <div className="pt-1">
                <button
                  type="button"
                  onClick={() => {
                    onCloseMobileDrawer();
                    onOpenSubmitConfirm();
                  }}
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded shadow-xs cursor-pointer font-mono"
                >
                  Submit Final Answers
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};
