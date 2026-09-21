"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import {
  submitExamAction,
  verifyExamPasscodeAction,
  getQuestionsAction,
  getExamDetailsAction,
} from "../../../../../lib/actions";
import { Answer, QuestionData, ExamMeta } from "./types";
import { ExamPasscodeModal } from "./components/ExamPasscodeModal";
import { ExamInstructionsScreen } from "./components/ExamInstructionsScreen";
import { ExamSubmittedScreen } from "./components/ExamSubmittedScreen";
import { ExamSecurityModal } from "./components/ExamSecurityModal";
import { ExamSubmitConfirmModal } from "./components/ExamSubmitConfirmModal";
import { ExamTopBar } from "./components/ExamTopBar";
import { ExamQuestionCard } from "./components/ExamQuestionCard";
import { ExamQuestionMatrix, MobileQuestionNavStrip } from "./components/ExamQuestionMatrix";
import { formatDateTime, DATE_FORMATS } from "@/lib/date";

interface TakeExamClientViewProps {
  examId: string;
  initialExam: any;
  initialQuestions: any[];
}

export default function TakeExamClientView({
  examId,
  initialExam,
  initialQuestions,
}: TakeExamClientViewProps) {
  const router = useRouter();

  // Helper to parse question items safely
  // Helper to parse question items safely with optional randomization
  const normalizeQuestions = (list: any[], randomize = false): QuestionData[] => {
    let result = (list || []).map((q: any, idx: number) => {
      let parsedOptions: string[] = [];
      if (Array.isArray(q.options)) {
        parsedOptions = q.options;
      } else if (typeof q.options === "string") {
        parsedOptions = q.options
          .replace(/[{}]/g, "")
          .split(",")
          .map((s: string) => s.trim())
          .filter(Boolean);
      }

      return {
        id: q.id || idx + 1,
        type: q.type || "mcq",
        questionText: q.questionText || q.text || q.prompt || `Question ${idx + 1}`,
        options: parsedOptions,
        correctAnswer: q.correctAnswer || (parsedOptions.length ? parsedOptions[q.correctIndex || 0] : ""),
        passage: q.passage || undefined,
        pictureUrl: q.pictureUrl || undefined,
      };
    });

    if (randomize && result.length > 1) {
      result = [...result].sort(() => Math.random() - 0.5);
    }

    return result;
  };

  const isRandomized = initialExam?.randomization ?? false;
  const hasFeedback = initialExam?.feedback ?? true;

  const [examMeta, setExamMeta] = useState<ExamMeta>({
    title: initialExam?.name || "Examination",
    subject: initialExam?.level || initialExam?.subject || "General",
    durationMinutes: initialExam?.durationMinutes || initialExam?.duration || 30,
    totalMarks: initialExam?.totalMarks || 100,
    passMarks: initialExam?.passingMarks || initialExam?.passMark || 33,
    negativeMarks: initialExam?.negativeMarks ? Math.abs(Number(initialExam.negativeMarks)) : 0,
    isPrivate: initialExam?.isPrivate ?? false,
    passcode: initialExam?.passcode || "",
    randomization: isRandomized,
    feedback: hasFeedback,
    startDate: initialExam?.startDate || "",
    endDate: initialExam?.endDate || "",
  });

  const [questions, setQuestions] = useState<QuestionData[]>(() =>
    normalizeQuestions(initialQuestions, isRandomized)
  );
  const [loadingQuestions, setLoadingQuestions] = useState(false);

  // Password Unlock State
  const requiresPassword = examMeta.isPrivate;
  const [isUnlocked, setIsUnlocked] = useState<boolean>(!requiresPassword);
  const [enteredPasscode, setEnteredPasscode] = useState("");
  const [passcodeError, setPasscodeError] = useState("");
  const [verifyingPasscode, setVerifyingPasscode] = useState(false);

  // Exam Progress State
  const [userAnswers, setUserAnswers] = useState<Record<number, Answer>>({});
  const [examStatus, setExamStatus] = useState<"instructions" | "running" | "submitted">("instructions");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [examResult, setExamResult] = useState<any>(null);
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);
  const [examStartTime, setExamStartTime] = useState<Date | null>(null);
  const examStartTimeRef = useRef<Date | null>(null);

  // Focus Navigation & Question State
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState<number>(0);
  const [markedForReview, setMarkedForReview] = useState<Set<number>>(new Set());
  const [visitedQuestions, setVisitedQuestions] = useState<Set<number>>(new Set());
  const [filterStatus, setFilterStatus] = useState<"all" | "answered" | "unanswered" | "review">("all");
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  // Security & Anti-cheating State
  const [warnings, setWarnings] = useState<number>(0);
  const [showWarningModal, setShowWarningModal] = useState(false);
  const [currentWarningMsg, setCurrentWarningMsg] = useState("");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const isRunningRef = useRef(false);
  const isFinishingRef = useRef(false);
  isRunningRef.current = examStatus === "running" && !isFinishingRef.current;

  // Mark current question as visited
  useEffect(() => {
    if (questions.length > 0 && examStatus === "running") {
      const currentQ = questions[currentQuestionIdx];
      if (currentQ) {
        setVisitedQuestions((prev) => {
          if (prev.has(currentQ.id)) return prev;
          const next = new Set(prev);
          next.add(currentQ.id);
          return next;
        });
      }
    }
  }, [currentQuestionIdx, questions, examStatus]);

  // Client-side fallback fetch for questions & exam details
  const fetchQuestionsFallback = useCallback(async (passcode?: string) => {
    setLoadingQuestions(true);
    try {
      const [qs, details] = await Promise.all([
        getQuestionsAction(examId, passcode),
        getExamDetailsAction(examId),
      ]);

      if (details) {
        setExamMeta((prev) => ({
          ...prev,
          title: details.name || prev.title,
          subject: details.level || prev.subject,
          durationMinutes: details.durationMinutes || details.duration || prev.durationMinutes,
          totalMarks: details.totalMarks || prev.totalMarks,
          passMarks: details.passingMarks || details.passMark || prev.passMarks,
          negativeMarks: details.negativeMarks ? Math.abs(Number(details.negativeMarks)) : prev.negativeMarks,
          isPrivate: details.isPrivate ?? prev.isPrivate,
          passcode: details.passcode || prev.passcode,
          randomization: details.randomization ?? prev.randomization,
          feedback: details.feedback ?? prev.feedback,
          startDate: details.startDate || prev.startDate,
          endDate: details.endDate || prev.endDate,
        }));
        if (!details.isPrivate) {
          setIsUnlocked(true);
        }
      }

      if (Array.isArray(qs) && qs.length > 0) {
        setQuestions(normalizeQuestions(qs, details?.randomization ?? isRandomized));
      }
    } catch {
      toast.error("Failed to load live question bank.");
    } finally {
      setLoadingQuestions(false);
    }
  }, [examId]);

  useEffect(() => {
    if (isUnlocked && (!initialQuestions || initialQuestions.length === 0)) {
      fetchQuestionsFallback(enteredPasscode);
    }
  }, [initialQuestions, fetchQuestionsFallback, isUnlocked, enteredPasscode]);

  // Handle Passcode Unlock
  const handleUnlockPasscode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!enteredPasscode.trim()) {
      setPasscodeError("Please enter the exam passcode.");
      return;
    }
    setVerifyingPasscode(true);
    try {
      const res = await verifyExamPasscodeAction(examId, enteredPasscode.trim());
      if (res.success) {
        setIsUnlocked(true);
        setPasscodeError("");
        toast.success("Exam unlocked! Please review instructions before starting.");
      } else {
        setPasscodeError(res.error || "Incorrect passcode. Please verify with your instructor.");
        toast.error(res.error || "Incorrect passcode.");
      }
    } finally {
      setVerifyingPasscode(false);
    }
  };

  // Submit Exam Handler
  const handleFinish = useCallback(
    async (reason?: string) => {
      if (examStatus === "submitted" || isSubmitting || isFinishingRef.current) return;
      isFinishingRef.current = true;
      isRunningRef.current = false;
      setIsSubmitting(true);
      setShowSubmitConfirm(false);

      if (document.fullscreenElement) {
        try {
          await document.exitFullscreen();
        } catch {
          // ignore
        }
      }

      try {
        const mappedAnswers: Record<string, string> = {};
        questions.forEach((q) => {
          const selectedText = userAnswers[q.id];
          if (selectedText !== undefined) {
            mappedAnswers[q.id.toString()] = selectedText;
          }
        });

        const securityMsg =
          reason || (warnings > 0 ? `Completed with ${warnings} security warning(s)` : "Normal Clean Submission");

        const started = examStartTimeRef.current || new Date();
        const durationSeconds = Math.max(
          1,
          Math.round((Date.now() - started.getTime()) / 1000)
        );

        const res = await submitExamAction(
          examId,
          mappedAnswers,
          warnings,
          securityMsg,
          enteredPasscode,
          durationSeconds,
          started.toISOString()
        );

        if (res.success && res.result) {
          const resultData = {
            ...res.result,
            feedback:
              res.result.feedback !== undefined
                ? res.result.feedback
                : (examMeta.feedback ?? true),
          };
          setExamResult(resultData);
          setExamStatus("submitted");
          setShowWarningModal(false);
          toast.success("Exam submitted successfully!");
        } else {
          toast.error(res.error || "Failed to submit exam.");
        }
      } catch {
        toast.error("An error occurred during exam submission.");
      } finally {
        setIsSubmitting(false);
      }
    },
    [examId, examStatus, isSubmitting, questions, userAnswers, warnings, enteredPasscode]
  );

  // Trigger security violation warning
  const triggerSecurityWarning = useCallback(
    (reason: string) => {
      if (!isRunningRef.current || isFinishingRef.current) return;

      setWarnings((prev) => {
        const next = prev + 1;
        setCurrentWarningMsg(reason);
        setShowWarningModal(true);

        if (next >= 3) {
          toast.error("Maximum violations reached (3/3). Forced automatic submission triggered.");
          setTimeout(() => {
            handleFinish("Terminated: Exceeded maximum allowed security violations (3/3)");
          }, 1200);
        } else {
          toast.warning(`Security Warning (${next}/3): ${reason}`);
        }
        return next;
      });
    },
    [handleFinish]
  );

  // Fullscreen Management
  const enterFullscreen = async () => {
    try {
      if (document.documentElement.requestFullscreen) {
        await document.documentElement.requestFullscreen();
      }
      setIsFullscreen(true);
    } catch {
      toast.info("Proceeding in standard view. Note: Avoid switching windows.");
    }
  };

  const toggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
        setIsFullscreen(true);
      } else {
        await document.exitFullscreen();
        setIsFullscreen(false);
      }
    } catch {
      // ignore
    }
  };

  // Start Exam
  const handleStartExam = async () => {
    if (questions.length === 0) {
      toast.error("No questions available for this exam yet.");
      return;
    }
    const currentTime = new Date();
    if (examMeta.startDate && currentTime < new Date(examMeta.startDate)) {
      toast.error(
        `Exam has not started yet. Scheduled start: ${formatDateTime(
          examMeta.startDate,
          DATE_FORMATS.DATETIME_COMMA
        )}`
      );
      return;
    }
    if (examMeta.endDate && currentTime > new Date(examMeta.endDate)) {
      toast.error(
        `Exam window is closed. Ended on ${formatDateTime(
          examMeta.endDate,
          DATE_FORMATS.DATETIME_COMMA
        )}`
      );
      return;
    }
    await enterFullscreen();
    const startedAt = new Date();
    setExamStartTime(startedAt);
    examStartTimeRef.current = startedAt;
    setExamStatus("running");
  };

  // --- ANTI-CHEATING LISTENERS ---
  useEffect(() => {
    if (examStatus !== "running") return;

    const handleVisibilityChange = () => {
      if (document.hidden && isRunningRef.current && !isFinishingRef.current) {
        triggerSecurityWarning("Tab switched or browser minimized.");
      }
    };

    const handleBlur = () => {
      if (isRunningRef.current && !isFinishingRef.current) {
        triggerSecurityWarning("Window lost focus or another application was opened.");
      }
    };

    const handleFullscreenChange = () => {
      const active = !!document.fullscreenElement;
      setIsFullscreen(active);
      if (!active && isRunningRef.current && !isFinishingRef.current) {
        triggerSecurityWarning("Exited fullscreen proctored mode.");
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isRunningRef.current || isFinishingRef.current) return;

      // F12
      if (e.key === "F12") {
        e.preventDefault();
        triggerSecurityWarning("Developer Tools key (F12) intercepted.");
        return;
      }

      // Ctrl+Shift+I / Ctrl+Shift+J / Ctrl+Shift+C
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && ["I", "i", "J", "j", "C", "c"].includes(e.key)) {
        e.preventDefault();
        triggerSecurityWarning("Inspect Element shortcut blocked.");
        return;
      }

      // Ctrl+U
      if ((e.ctrlKey || e.metaKey) && ["U", "u"].includes(e.key)) {
        e.preventDefault();
        triggerSecurityWarning("View Source shortcut blocked.");
        return;
      }

      // Keyboard option selection: A, B, C, D (or 1, 2, 3, 4)
      const currentQ = questions[currentQuestionIdx];
      if (currentQ && !e.ctrlKey && !e.metaKey && !e.altKey) {
        const key = e.key.toUpperCase();
        let targetOptIdx = -1;
        if (key === "A" || key === "1") targetOptIdx = 0;
        else if (key === "B" || key === "2") targetOptIdx = 1;
        else if (key === "C" || key === "3") targetOptIdx = 2;
        else if (key === "D" || key === "4") targetOptIdx = 3;

        if (targetOptIdx >= 0 && targetOptIdx < currentQ.options.length) {
          e.preventDefault();
          const chosen = currentQ.options[targetOptIdx];
          setUserAnswers((prev) => ({ ...prev, [currentQ.id]: chosen }));
          return;
        }

        // Arrow keys for Next / Previous question
        if (e.key === "ArrowRight") {
          e.preventDefault();
          if (currentQuestionIdx < questions.length - 1) {
            setCurrentQuestionIdx((i) => i + 1);
          }
          return;
        }
        if (e.key === "ArrowLeft") {
          e.preventDefault();
          if (currentQuestionIdx > 0) {
            setCurrentQuestionIdx((i) => i - 1);
          }
          return;
        }
      }
    };

    const preventContextMenu = (e: MouseEvent) => e.preventDefault();
    const preventCopyCutPaste = (e: ClipboardEvent) => {
      e.preventDefault();
      toast.error("Copying or pasting exam content is disabled.");
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("blur", handleBlur);
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    window.addEventListener("keydown", handleKeyDown);
    document.addEventListener("contextmenu", preventContextMenu);
    document.addEventListener("copy", preventCopyCutPaste);
    document.addEventListener("cut", preventCopyCutPaste);
    document.addEventListener("paste", preventCopyCutPaste);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("blur", handleBlur);
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      window.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("contextmenu", preventContextMenu);
      document.removeEventListener("copy", preventCopyCutPaste);
      document.removeEventListener("cut", preventCopyCutPaste);
      document.removeEventListener("paste", preventCopyCutPaste);
    };
  }, [examStatus, triggerSecurityWarning, currentQuestionIdx, questions]);

  // Option selection
  const handleSelectOption = (questionId: number, option: Answer) => {
    setUserAnswers((prev) => ({
      ...prev,
      [questionId]: option,
    }));
  };

  // Clear answer
  const handleClearAnswer = (questionId: number) => {
    setUserAnswers((prev) => {
      const next = { ...prev };
      delete next[questionId];
      return next;
    });
  };

  // Toggle mark for review
  const toggleMarkForReview = (questionId: number) => {
    setMarkedForReview((prev) => {
      const next = new Set(prev);
      if (next.has(questionId)) {
        next.delete(questionId);
      } else {
        next.add(questionId);
      }
      return next;
    });
  };

  // Mark for review and proceed to next
  const handleMarkAndNext = (questionId: number) => {
    setMarkedForReview((prev) => {
      const next = new Set(prev);
      next.add(questionId);
      return next;
    });
    if (currentQuestionIdx < questions.length - 1) {
      setCurrentQuestionIdx((i) => i + 1);
    }
  };

  // Psychological status of each question
  const getQuestionStatus = useCallback(
    (qId: number): "answered" | "review" | "unanswered" | "not-visited" => {
      if (markedForReview.has(qId)) return "review";
      if (userAnswers[qId] !== undefined) return "answered";
      if (visitedQuestions.has(qId)) return "unanswered";
      return "not-visited";
    },
    [markedForReview, userAnswers, visitedQuestions]
  );

  // Calculated counters
  const answeredCount = Object.keys(userAnswers).length;
  const reviewCount = markedForReview.size;

  // Active question
  const currentQ = questions[currentQuestionIdx];

  // --- 1. PASSWORD CHALLENGE SCREEN ---
  if (!isUnlocked) {
    return (
      <ExamPasscodeModal
        title={examMeta.title}
        enteredPasscode={enteredPasscode}
        passcodeError={passcodeError}
        verifyingPasscode={verifyingPasscode}
        onPasscodeChange={(val) => {
          setEnteredPasscode(val);
          setPasscodeError("");
        }}
        onSubmit={handleUnlockPasscode}
        onCancel={() => router.back()}
      />
    );
  }

  // --- 2. INSTRUCTIONS SCREEN ---
  if (examStatus === "instructions") {
    return (
      <ExamInstructionsScreen
        examMeta={examMeta}
        questions={questions}
        loadingQuestions={loadingQuestions}
        onStartExam={handleStartExam}
        onExit={() => router.back()}
        onRefreshQuestions={() => fetchQuestionsFallback(enteredPasscode)}
      />
    );
  }

  // --- 3. SUBMITTED RESULTS SCREEN ---
  if (examStatus === "submitted" && examResult) {
    return (
      <ExamSubmittedScreen
        examMeta={examMeta}
        examResult={examResult}
      />
    );
  }

  // --- 4. RUNNING PROCTORED CONSOLE ---
  return (
    <div className="select-none min-h-screen bg-slate-100/60 flex flex-col">
      {/* SECURITY VIOLATION MODAL */}
      <ExamSecurityModal
        isOpen={showWarningModal}
        warnings={warnings}
        currentWarningMsg={currentWarningMsg}
        onResumeFullscreen={async () => {
          await enterFullscreen();
          setShowWarningModal(false);
        }}
      />

      {/* SUBMISSION CONFIRMATION MODAL */}
      <ExamSubmitConfirmModal
        isOpen={showSubmitConfirm}
        answeredCount={answeredCount}
        totalCount={questions.length}
        reviewCount={reviewCount}
        isSubmitting={isSubmitting}
        onCancel={() => setShowSubmitConfirm(false)}
        onConfirm={() => handleFinish()}
      />

      {/* PROCTORED TOP CONSOLE BAR */}
      <ExamTopBar
        examMeta={examMeta}
        warnings={warnings}
        totalQuestions={questions.length}
        currentQuestionIdx={currentQuestionIdx}
        isSubmitting={isSubmitting}
        isFullscreen={isFullscreen}
        onTimeUp={() => handleFinish("Time expired")}
        onOpenMobileDrawer={() => setMobileDrawerOpen(true)}
        onToggleFullscreen={toggleFullscreen}
        onOpenSubmitConfirm={() => setShowSubmitConfirm(true)}
      />

      {/* MAIN EXAM STAGE: DUAL PANE LAYOUT */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-2 sm:px-6 py-2 sm:py-4 flex flex-col justify-between">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-2.5 sm:gap-4 items-start">
          {/* LEFT COLUMN: MAIN QUESTION CONSOLE */}
          <div className="lg:col-span-8 xl:col-span-9 space-y-2 sm:space-y-3">
            {currentQ ? (
              <ExamQuestionCard
                currentQ={currentQ}
                currentQuestionIdx={currentQuestionIdx}
                totalQuestions={questions.length}
                negativeMarks={examMeta.negativeMarks}
                userAnswer={userAnswers[currentQ.id]}
                isMarkedForReview={markedForReview.has(currentQ.id)}
                onSelectOption={handleSelectOption}
                onClearAnswer={handleClearAnswer}
                onToggleMarkForReview={toggleMarkForReview}
                onMarkAndNext={handleMarkAndNext}
                onPrevQuestion={() => {
                  if (currentQuestionIdx > 0) setCurrentQuestionIdx((i) => i - 1);
                }}
                onNextQuestion={() => {
                  if (currentQuestionIdx < questions.length - 1) {
                    setCurrentQuestionIdx((i) => i + 1);
                  }
                }}
                onOpenSubmitConfirm={() => setShowSubmitConfirm(true)}
              />
            ) : (
              <div className="bg-white p-8 rounded border border-slate-200/80 text-center">
                <p className="text-xs text-slate-500 font-bold">Question not found.</p>
              </div>
            )}

            {/* Mobile Horizontal Quick-Nav Strip (< lg only, directly below exam question) */}
            <MobileQuestionNavStrip
              questions={questions}
              currentQuestionIdx={currentQuestionIdx}
              getQuestionStatus={getQuestionStatus}
              onSelectQuestion={setCurrentQuestionIdx}
            />
          </div>

          {/* RIGHT COLUMN: DESKTOP QUESTION MATRIX SIDEBAR & MOBILE DRAWER */}
          <ExamQuestionMatrix
            questions={questions}
            currentQuestionIdx={currentQuestionIdx}
            answeredCount={answeredCount}
            reviewCount={reviewCount}
            visitedQuestions={visitedQuestions}
            markedForReview={markedForReview}
            filterStatus={filterStatus}
            mobileDrawerOpen={mobileDrawerOpen}
            onSelectQuestion={setCurrentQuestionIdx}
            onSetFilterStatus={setFilterStatus}
            onOpenMobileDrawer={() => setMobileDrawerOpen(true)}
            onCloseMobileDrawer={() => setMobileDrawerOpen(false)}
            onOpenSubmitConfirm={() => setShowSubmitConfirm(true)}
            getQuestionStatus={getQuestionStatus}
          />
        </div>
      </main>
    </div>
  );
}
