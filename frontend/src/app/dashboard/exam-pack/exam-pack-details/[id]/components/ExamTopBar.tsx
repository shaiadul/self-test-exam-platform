import React, { useState, useEffect } from "react";
import { FaThLarge, FaExpand, FaCompress } from "react-icons/fa";
import { cn } from "../../../../../../lib/utils";
import { ExamMeta } from "../types";

interface TimerProps {
  duration: number;
  onTimeUp: () => void;
  isRunning: boolean;
}

const Timer: React.FC<TimerProps> = ({ duration, onTimeUp, isRunning }) => {
  const [timeLeft, setTimeLeft] = useState(duration);

  useEffect(() => {
    setTimeLeft(duration);
  }, [duration]);

  useEffect(() => {
    if (!isRunning) return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          onTimeUp();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isRunning, onTimeUp]);

  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, "0")}:${mins
      .toString()
      .padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const isCriticalTime = timeLeft < 180; // less than 3 minutes
  const isLowTime = timeLeft < 600; // less than 10 minutes

  return (
    <div
      className={cn(
        "flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1 sm:py-1.5 rounded border transition-all select-none shrink-0",
        isCriticalTime
          ? "bg-rose-50 border-rose-300 text-rose-700 animate-pulse"
          : isLowTime
          ? "bg-amber-50 border-amber-300 text-amber-800"
          : "bg-slate-50 border-slate-200/90 text-slate-800"
      )}
    >
      <span className="text-xs sm:text-sm">⏱️</span>
      <div>
        <p className="hidden sm:block text-[9px] text-slate-400 font-extrabold uppercase tracking-wider leading-none mb-0.5">
          {isCriticalTime ? "Critical Time" : "Time Left"}
        </p>
        <p className="text-xs sm:text-base font-black font-mono leading-none tracking-tight">
          {formatTime(timeLeft)}
        </p>
      </div>
    </div>
  );
};

interface ExamTopBarProps {
  examMeta: ExamMeta;
  warnings: number;
  totalQuestions: number;
  currentQuestionIdx: number;
  isSubmitting: boolean;
  isFullscreen: boolean;
  onTimeUp: () => void;
  onOpenMobileDrawer: () => void;
  onToggleFullscreen: () => void;
  onOpenSubmitConfirm: () => void;
}

export const ExamTopBar: React.FC<ExamTopBarProps> = ({
  examMeta,
  warnings,
  totalQuestions,
  currentQuestionIdx,
  isSubmitting,
  isFullscreen,
  onTimeUp,
  onOpenMobileDrawer,
  onToggleFullscreen,
  onOpenSubmitConfirm,
}) => {
  // Bounded timer: cannot exceed the remaining time until the exam window closes
  const effectiveDurationSeconds = React.useMemo(() => {
    const configured = Math.max(1, (examMeta.durationMinutes || 30) * 60);
    if (!examMeta.endDate) return configured;
    const endMs = new Date(examMeta.endDate).getTime();
    if (isNaN(endMs)) return configured;
    const windowRemaining = Math.max(0, Math.floor((endMs - Date.now()) / 1000));
    return Math.min(configured, windowRemaining);
  }, [examMeta.durationMinutes, examMeta.endDate]);

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/90 shadow-2xs px-2.5 sm:px-6 py-2 sm:py-2.5">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-2 sm:gap-3">
        {/* Left: Exam title & Proctor status */}
        <div className="flex items-center gap-1.5 sm:gap-3 min-w-0">
          <span className="inline-flex items-center gap-1 px-1.5 sm:px-2 py-0.5 bg-emerald-50 text-emerald-700 font-mono text-[9px] sm:text-[10px] font-bold rounded border border-emerald-200 shrink-0">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
            <span className="hidden sm:inline">PROCTORED</span>
            <span>LIVE</span>
          </span>

          <span
            className={cn(
              "inline-flex items-center gap-1 px-1.5 sm:px-2 py-0.5 rounded font-mono text-[9px] sm:text-[10px] font-bold border shrink-0",
              warnings === 0
                ? "bg-slate-50 text-slate-500 border-slate-200"
                : warnings === 1
                ? "bg-amber-50 text-amber-700 border-amber-300"
                : "bg-rose-50 text-rose-700 border-rose-300 animate-pulse"
            )}
            title="Security warnings strike counter"
          >
            <span className="hidden sm:inline">Strikes: </span>
            <span>{warnings}/3</span>
          </span>

          <div className="hidden md:block min-w-0">
            <h2 className="text-xs font-bold text-slate-800 truncate">{examMeta.title}</h2>
            <p className="text-[10px] text-slate-400 font-semibold truncate">{examMeta.subject}</p>
          </div>
        </div>

        {/* Center: Countdown Timer */}
        <Timer
          duration={effectiveDurationSeconds}
          onTimeUp={onTimeUp}
          isRunning={true}
        />

        {/* Right: Actions */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Mobile Matrix Drawer Button */}
          <button
            type="button"
            onClick={onOpenMobileDrawer}
            className="lg:hidden px-2 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[11px] rounded flex items-center gap-1 transition cursor-pointer border border-slate-200"
            title="Open Question Palette"
          >
            <FaThLarge className="text-[10px] text-primary" />
            <span className="font-mono">
              {currentQuestionIdx + 1}/{totalQuestions}
            </span>
          </button>

          {/* Fullscreen Toggle */}
          <button
            type="button"
            onClick={onToggleFullscreen}
            className="hidden sm:flex p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded transition cursor-pointer"
            title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
          >
            {isFullscreen ? <FaCompress className="text-sm" /> : <FaExpand className="text-sm" />}
          </button>

          {/* Submit Button */}
          <button
            type="button"
            onClick={onOpenSubmitConfirm}
            disabled={isSubmitting}
            className="px-2.5 sm:px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded shadow-xs transition cursor-pointer disabled:opacity-50 shrink-0"
          >
            {isSubmitting ? "..." : "Submit"}
          </button>
        </div>
      </div>
    </header>
  );
};
