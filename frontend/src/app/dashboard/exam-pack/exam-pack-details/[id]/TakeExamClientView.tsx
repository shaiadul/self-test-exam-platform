"use client";

import Image from "next/image";
import React, { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { PageContainer } from "../../../../../components/common/PageContainer";
import Scorecard from "../../../../../components/dashboard/Scorecard";
import CertificatePrintLayout from "../../../../../components/dashboard/CertificatePrintLayout";
import { formatDate, DATE_FORMATS } from "@/lib/date";
import {
  submitExamAction,
  verifyExamPasscodeAction,
  getQuestionsAction,
  getExamDetailsAction,
} from "../../../../../lib/actions";
import {
  FaEye,
  FaLock,
  FaShieldAlt,
  FaExclamationTriangle,
  FaExpand,
  FaCompress,
  FaCheckCircle,
  FaSync,
  FaKey,
  FaFlag,
  FaThLarge,
  FaArrowLeft,
  FaArrowRight,
  FaEraser,
  FaBookOpen,
  FaFileImage,
  FaCheck,
  FaTimes,
} from "react-icons/fa";
import { PrimaryBtn } from "../../../../../components/ui/PrimaryBtn";
import { OutlineBtn } from "../../../../../components/ui/OutlineBtn";
import { Input } from "../../../../../components/ui/Input";
import { cn } from "../../../../../lib/utils";

// --- TYPES ---
type Answer = string;
interface QuestionData {
  id: number;
  type: "mcq" | "passage" | "picture";
  questionText: string;
  options: string[];
  correctAnswer: string;
  passage?: string;
  pictureUrl?: string;
}

// --- TIMER ---
interface TimerProps {
  duration: number;
  onTimeUp: () => void;
  isRunning: boolean;
}

const Timer = ({ duration, onTimeUp, isRunning }: TimerProps) => {
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
        "flex items-center gap-2 px-3 py-1.5 rounded border transition-all select-none",
        isCriticalTime
          ? "bg-rose-50 border-rose-300 text-rose-700 animate-pulse"
          : isLowTime
          ? "bg-amber-50 border-amber-300 text-amber-800"
          : "bg-slate-50 border-slate-200/90 text-slate-800"
      )}
    >
      <span className="text-sm">⏱️</span>
      <div>
        <p className="text-[9px] text-slate-400 font-extrabold uppercase tracking-wider leading-none">
          {isCriticalTime ? "Critical Time" : "Time Left"}
        </p>
        <p className="text-sm sm:text-base font-black font-mono leading-tight tracking-tight">
          {formatTime(timeLeft)}
        </p>
      </div>
    </div>
  );
};

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
  const normalizeQuestions = (list: any[]): QuestionData[] => {
    return (list || []).map((q: any, idx: number) => {
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
  };

  const [examMeta, setExamMeta] = useState({
    title: initialExam?.name || "Examination",
    subject: initialExam?.level || initialExam?.subject || "General",
    durationMinutes: initialExam?.durationMinutes || initialExam?.duration || 30,
    totalMarks: initialExam?.totalMarks || 100,
    passMarks: initialExam?.passingMarks || initialExam?.passMark || 33,
    negativeMarks: initialExam?.negativeMarks ? Math.abs(Number(initialExam.negativeMarks)) : 0,
    isPrivate: initialExam?.isPrivate ?? false,
    passcode: initialExam?.passcode || "",
  });

  const [questions, setQuestions] = useState<QuestionData[]>(() =>
    normalizeQuestions(initialQuestions)
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
  isRunningRef.current = examStatus === "running";

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
        }));
        if (!details.isPrivate) {
          setIsUnlocked(true);
        }
      }

      if (Array.isArray(qs) && qs.length > 0) {
        setQuestions(normalizeQuestions(qs));
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
      if (examStatus === "submitted" || isSubmitting) return;
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

        const res = await submitExamAction(examId, mappedAnswers, warnings, securityMsg, enteredPasscode);

        if (res.success && res.result) {
          setExamResult(res.result);
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
      if (!isRunningRef.current) return;

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
    await enterFullscreen();
    setExamStatus("running");
  };

  // --- ANTI-CHEATING LISTENERS ---
  useEffect(() => {
    if (examStatus !== "running") return;

    const handleVisibilityChange = () => {
      if (document.hidden && isRunningRef.current) {
        triggerSecurityWarning("Tab switched or browser minimized.");
      }
    };

    const handleBlur = () => {
      if (isRunningRef.current) {
        triggerSecurityWarning("Window lost focus or another application was opened.");
      }
    };

    const handleFullscreenChange = () => {
      const active = !!document.fullscreenElement;
      setIsFullscreen(active);
      if (!active && isRunningRef.current) {
        triggerSecurityWarning("Exited fullscreen proctored mode.");
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isRunningRef.current) return;

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

  // Filter questions for the sidebar palette
  const filteredQuestions = useMemo(() => {
    return questions.map((q, idx) => ({ q, idx })).filter(({ q }) => {
      const status = getQuestionStatus(q.id);
      if (filterStatus === "answered") return status === "answered";
      if (filterStatus === "review") return status === "review";
      if (filterStatus === "unanswered") return status === "unanswered" || status === "not-visited";
      return true;
    });
  }, [questions, filterStatus, getQuestionStatus]);

  // Calculated counters
  const answeredCount = Object.keys(userAnswers).length;
  const reviewCount = markedForReview.size;
  const answeredPercentage =
    questions.length > 0 ? Math.round((answeredCount / questions.length) * 100) : 0;

  // Active question and question type helpers
  const currentQ = questions[currentQuestionIdx];
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

  // --- 1. PASSWORD CHALLENGE SCREEN ---
  if (!isUnlocked) {
    return (
      <PageContainer className="max-w-md mx-auto py-8 sm:py-16 px-4">
        <div className="bg-white rounded p-4 sm:p-7 border border-slate-200/80 shadow-xs text-center space-y-4">
          <div className="w-12 h-12 bg-primary/10 text-primary rounded flex items-center justify-center text-xl mx-auto border border-primary/20">
            <FaLock />
          </div>

          <div className="space-y-1">
            <span className="px-2 py-0.5 bg-rose-50 text-rose-700 font-mono font-bold text-[10px] rounded uppercase tracking-wider border border-rose-200">
              Passcode Protected
            </span>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900">{examMeta.title}</h1>
            <p className="text-xs text-slate-500 font-medium leading-relaxed">
              This is a private examination. Enter your student access passcode provided by the instructor to proceed.
            </p>
          </div>

          <form onSubmit={handleUnlockPasscode} className="space-y-4 text-left pt-1">
            <Input
              label="Exam Access Passcode"
              type="password"
              icon={<FaKey />}
              placeholder="Enter passcode to unlock"
              value={enteredPasscode}
              onChange={(e) => {
                setEnteredPasscode(e.target.value);
                setPasscodeError("");
              }}
              error={passcodeError}
              autoFocus
            />

            <div className="flex gap-2.5 pt-2">
              <OutlineBtn
                type="button"
                onClick={() => router.back()}
                className="flex-1 !text-xs !py-2.5 !rounded"
              >
                Cancel
              </OutlineBtn>
              <PrimaryBtn
                type="submit"
                disabled={verifyingPasscode}
                className="flex-1 !text-xs !py-2.5 !rounded shadow-xs disabled:opacity-50"
              >
                {verifyingPasscode ? "Verifying..." : "Unlock Exam"}
              </PrimaryBtn>
            </div>
          </form>
        </div>
      </PageContainer>
    );
  }

  // --- 2. INSTRUCTIONS SCREEN ---
  if (examStatus === "instructions") {
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
                onClick={() => fetchQuestionsFallback(enteredPasscode)}
                className="inline-flex items-center gap-2 px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded text-xs font-bold transition cursor-pointer"
              >
                <FaSync className="text-xs" /> Refresh Question Bank
              </button>
            </div>
          )}

          {/* Actions */}
          <div className="pt-2 border-t border-slate-100 flex gap-3">
            <OutlineBtn
              onClick={() => router.back()}
              className="flex-1 !text-xs !py-2.5 !rounded"
            >
              Exit to Dashboard
            </OutlineBtn>
            <PrimaryBtn
              onClick={handleStartExam}
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
  }

  // --- 3. SUBMITTED RESULTS SCREEN ---
  if (examStatus === "submitted" && examResult) {
    return (
      <PageContainer className="max-w-4xl mx-auto py-10 px-4">
        <div className="hidden print:block">
          <CertificatePrintLayout
            candidateName={examResult.userName || "Student"}
            examName={examMeta.title}
            examDate={formatDate(new Date(), DATE_FORMATS.DATETIME_FULL)}
            result={{
              total: (examResult.correct || 0) + (examResult.wrong || 0),
              correct: examResult.correct || 0,
              wrong: examResult.wrong || 0,
              negative: examResult.negative || 0,
              finalScore: examResult.finalScore || 0,
              passed: examResult.passed || false,
            }}
            totalMarks={examMeta.totalMarks}
          />
        </div>

        <div className="print:hidden space-y-6">
          <div className="bg-white rounded p-6 sm:p-8 border border-slate-200/80 shadow-xs text-center space-y-5">
            <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded flex items-center justify-center text-3xl mx-auto border-2 border-emerald-200">
              <FaCheckCircle />
            </div>
            <div className="space-y-1">
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
                Exam Successfully Submitted!
              </h1>
              {examResult.securityMessage && (
                <p className="text-xs font-semibold text-slate-500">
                  Security Log: <span className="text-primary font-bold">{examResult.securityMessage}</span>
                </p>
              )}
            </div>

            <Scorecard
              result={{
                total: (examResult.correct || 0) + (examResult.wrong || 0),
                correct: examResult.correct || 0,
                wrong: examResult.wrong || 0,
                negative: examResult.negative || 0,
                finalScore: examResult.finalScore || 0,
                passed: examResult.passed || false,
              }}
              totalMarks={examMeta.totalMarks}
              passingPercent={examMeta.passMarks}
            />

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              {examResult.id && (
                <PrimaryBtn
                  link={`/dashboard/reporting/${examResult.id}`}
                  className="flex-1 !text-xs !py-2.5 !rounded shadow-xs gap-2"
                >
                  <FaEye className="text-xs" />
                  <span>Review Solutions & Report</span>
                </PrimaryBtn>
              )}
              <PrimaryBtn
                onClick={() => window.print()}
                className="flex-1 !text-xs !py-2.5 !rounded !bg-purple-600 hover:!bg-purple-500 !text-white shadow-xs"
              >
                Print Official Certificate
              </PrimaryBtn>
              <OutlineBtn link="/dashboard" className="flex-1 !text-xs !py-2.5 !rounded">
                Back to Dashboard
              </OutlineBtn>
            </div>
          </div>
        </div>
      </PageContainer>
    );
  }

  // --- 4. RUNNING PROCTORED CONSOLE ---
  return (
    <div className="select-none min-h-screen bg-slate-100/60 flex flex-col">
      {/* SECURITY VIOLATION MODAL */}
      <AnimatePresence>
        {showWarningModal && (
          <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.92, opacity: 0 }}
              className="bg-white max-w-md w-full rounded p-6 sm:p-7 border-2 border-rose-500 shadow-2xl text-center space-y-4"
            >
              <div className="w-12 h-12 bg-rose-100 text-rose-600 rounded flex items-center justify-center text-xl mx-auto border border-rose-200 animate-bounce">
                <FaExclamationTriangle />
              </div>

              <div className="space-y-1">
                <span className="px-2 py-0.5 bg-rose-100 text-rose-700 font-mono font-bold text-[10px] rounded uppercase tracking-wider">
                  Security Strike #{warnings} of 3
                </span>
                <h3 className="text-lg font-bold text-slate-900 pt-1">
                  Proctor Alert: Focus Lost!
                </h3>
                <p className="text-xs text-rose-600 font-bold">{currentWarningMsg}</p>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed font-medium">
                Leaving the exam window, switching applications, or exiting fullscreen violates testing integrity.
                {warnings >= 3 ? (
                  <span className="block font-bold text-rose-600 mt-1">
                    Maximum limit reached! Auto-submitting exam now.
                  </span>
                ) : (
                  <span className="block font-bold text-slate-900 mt-1">
                    You have {3 - warnings} warning(s) remaining before immediate disqualification.
                  </span>
                )}
              </p>

              {warnings < 3 ? (
                <PrimaryBtn
                  onClick={async () => {
                    await enterFullscreen();
                    setShowWarningModal(false);
                  }}
                  className="w-full !py-2 !text-xs !rounded !from-rose-600 !to-primary"
                >
                  I Understand & Resume Fullscreen
                </PrimaryBtn>
              ) : (
                <button
                  disabled
                  className="w-full py-2 bg-rose-600 text-white font-bold text-xs rounded opacity-80"
                >
                  Submitting Exam Now...
                </button>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* SUBMISSION CONFIRMATION MODAL */}
      <AnimatePresence>
        {showSubmitConfirm && (
          <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.94, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.94, opacity: 0 }}
              className="bg-white max-w-md w-full rounded p-6 border border-slate-200/80 shadow-2xl text-center space-y-4"
            >
              <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded flex items-center justify-center text-xl mx-auto border border-emerald-200">
                <FaCheckCircle />
              </div>

              <div className="space-y-1">
                <h3 className="text-lg font-bold text-slate-900">Confirm Exam Submission?</h3>
                <p className="text-xs text-slate-500 font-medium leading-relaxed">
                  You have answered <strong className="text-primary font-bold">{answeredCount}</strong> of{" "}
                  <strong className="text-slate-900 font-bold">{questions.length}</strong> questions.
                  {reviewCount > 0 && (
                    <span className="block text-review font-bold mt-1">
                      ⚠️ You still have {reviewCount} question(s) marked for review.
                    </span>
                  )}
                </p>
              </div>

              <div className="flex gap-2.5 pt-2">
                <OutlineBtn
                  type="button"
                  onClick={() => setShowSubmitConfirm(false)}
                  className="flex-1 !text-xs !py-2 !rounded"
                >
                  Keep Reviewing
                </OutlineBtn>
                <PrimaryBtn
                  onClick={() => handleFinish()}
                  disabled={isSubmitting}
                  className="flex-1 !text-xs !py-2 !rounded gap-1.5"
                >
                  {isSubmitting ? "Submitting..." : "Confirm & Submit"}
                </PrimaryBtn>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* PROCTORED TOP CONSOLE BAR */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/90 shadow-2xs px-3 sm:px-6 py-2.5">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
          {/* Left: Exam title & Proctor status */}
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-emerald-50 text-emerald-700 font-mono text-[10px] font-bold rounded border border-emerald-200 shrink-0">
              <span className="w-1.5 h-1.5 rounded bg-emerald-500 animate-ping" />
              <span className="hidden sm:inline">PROCTORED ACTIVE</span>
              <span className="sm:hidden">LIVE</span>
            </span>

            <span
              className={cn(
                "inline-flex items-center gap-1 px-2 py-0.5 rounded font-mono text-[10px] font-bold border shrink-0",
                warnings === 0
                  ? "bg-slate-50 text-slate-600 border-slate-200"
                  : warnings === 1
                  ? "bg-amber-50 text-amber-700 border-amber-300"
                  : "bg-rose-50 text-rose-700 border-rose-300 animate-pulse"
              )}
            >
              Strikes: {warnings}/3
            </span>

            <div className="hidden md:block min-w-0">
              <h2 className="text-xs font-bold text-slate-800 truncate">{examMeta.title}</h2>
              <p className="text-[10px] text-slate-400 font-semibold truncate">{examMeta.subject}</p>
            </div>
          </div>

          {/* Center: Countdown Timer */}
          <div className="shrink-0">
            <Timer
              duration={examMeta.durationMinutes * 60}
              onTimeUp={() => handleFinish("Time expired")}
              isRunning={examStatus === "running"}
            />
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-2">
            {/* Mobile Matrix Drawer Button */}
            <button
              onClick={() => setMobileDrawerOpen(true)}
              className="lg:hidden px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded flex items-center gap-1.5 transition cursor-pointer"
              title="Open Question Palette"
            >
              <FaThLarge className="text-xs text-primary" />
              <span className="font-mono">{currentQuestionIdx + 1}/{questions.length}</span>
            </button>

            {/* Fullscreen Toggle */}
            <button
              onClick={toggleFullscreen}
              className="hidden sm:flex p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded transition cursor-pointer"
              title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
            >
              {isFullscreen ? <FaCompress className="text-sm" /> : <FaExpand className="text-sm" />}
            </button>

            {/* Submit Button */}
            <button
              onClick={() => setShowSubmitConfirm(true)}
              disabled={isSubmitting}
              className="px-3 sm:px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded shadow-xs transition cursor-pointer disabled:opacity-50 shrink-0"
            >
              {isSubmitting ? "..." : "Submit"}
            </button>
          </div>
        </div>
      </header>

      {/* MOBILE HORIZONTAL QUICK-NAV STRIP (< lg only) */}
      <div className="lg:hidden bg-white border-b border-slate-200/80 px-3 py-2 overflow-x-auto custom-scrollbar">
        <div className="flex items-center gap-1 min-w-max">
          {questions.map((q, idx) => {
            const status = getQuestionStatus(q.id);
            const isActive = idx === currentQuestionIdx;
            return (
              <button
                key={q.id || idx}
                onClick={() => setCurrentQuestionIdx(idx)}
                className={cn(
                  "w-7 h-7 rounded font-mono text-xs font-bold transition-all flex items-center justify-center cursor-pointer shrink-0",
                  isActive
                    ? "bg-primary text-white ring-2 ring-primary/40 font-black scale-105"
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

      {/* MAIN EXAM STAGE: DUAL PANE LAYOUT */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-3 sm:px-6 py-4 flex flex-col justify-between">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
          {/* ========================================================
              LEFT COLUMN: MAIN QUESTION CONSOLE (Col 1-8 / 1-9)
              ======================================================== */}
          <div className="lg:col-span-8 xl:col-span-9 space-y-3">
            {currentQ ? (
              <div className="bg-white rounded border border-slate-200/80 shadow-xs overflow-hidden flex flex-col">
                {/* QUESTION META RIBBON */}
                <div className="px-3 sm:px-5 py-2.5 bg-slate-50/80 border-b border-slate-100 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded bg-primary text-white font-mono font-bold text-xs flex items-center justify-center shadow-xs">
                      {currentQuestionIdx + 1}
                    </span>
                    <div>
                      <span className="text-xs font-bold text-slate-900 tracking-tight block">
                        Question {currentQuestionIdx + 1} of {questions.length}
                      </span>
                      <span className="inline-flex items-center gap-1 text-[10px] text-primary font-bold">
                        {getTypeIcon(currentQ.type)}
                        <span>{getTypeLabel(currentQ.type)}</span>
                      </span>
                    </div>
                  </div>

                  {/* Indicators & Psychological Flag / Clear Actions */}
                  <div className="flex items-center gap-2">
                    <span className="hidden sm:inline-flex px-2 py-0.5 rounded font-mono text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200">
                      +1.0 Mark {examMeta.negativeMarks > 0 && `• -${examMeta.negativeMarks} Neg`}
                    </span>

                    <button
                      onClick={() => toggleMarkForReview(currentQ.id)}
                      className={cn(
                        "px-2 py-1 rounded text-xs font-bold transition flex items-center gap-1.5 border cursor-pointer",
                        markedForReview.has(currentQ.id)
                          ? "bg-indigo-50 text-indigo-700 border-indigo-300"
                          : "bg-white text-slate-600 border-slate-200 hover:border-indigo-300 hover:text-indigo-600"
                      )}
                    >
                      <FaFlag className="text-[10px]" />
                      <span>{markedForReview.has(currentQ.id) ? "Marked" : "Flag for Review"}</span>
                    </button>

                    {userAnswers[currentQ.id] !== undefined && (
                      <button
                        onClick={() => handleClearAnswer(currentQ.id)}
                        className="px-2 py-1 text-slate-400 hover:text-rose-600 text-xs font-bold transition cursor-pointer flex items-center gap-1"
                        title="Clear chosen option"
                      >
                        <FaEraser className="text-[10px]" />
                        <span className="hidden sm:inline">Clear</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* QUESTION BODY (ZERO WASTED GAP) */}
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
                      const isSelected = userAnswers[currentQ.id] === opt;
                      const optLetter = String.fromCharCode(65 + optIdx);

                      return (
                        <button
                          key={optIdx}
                          type="button"
                          onClick={() => handleSelectOption(currentQ.id, opt)}
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
                    onClick={() => {
                      if (currentQuestionIdx > 0) setCurrentQuestionIdx((i) => i - 1);
                    }}
                    disabled={currentQuestionIdx === 0}
                    className="px-2.5 sm:px-3 py-1.5 text-xs font-bold rounded border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-35 transition cursor-pointer flex items-center gap-1 sm:gap-1.5"
                  >
                    <FaArrowLeft className="text-[10px]" />
                    <span className="hidden sm:inline">Previous</span>
                  </button>

                  <div className="flex items-center gap-1.5 sm:gap-2">
                    <button
                      onClick={() => handleMarkAndNext(currentQ.id)}
                      className="px-2.5 sm:px-3 py-1.5 text-xs font-bold rounded bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 transition cursor-pointer flex items-center gap-1 sm:gap-1.5"
                    >
                      <FaFlag className="text-[10px]" />
                      <span className="hidden sm:inline">Mark & Next</span>
                      <span className="sm:hidden">Flag</span>
                    </button>

                    {currentQuestionIdx < questions.length - 1 ? (
                      <button
                        onClick={() => setCurrentQuestionIdx((i) => i + 1)}
                        className="px-3 sm:px-4 py-1.5 text-xs font-bold rounded bg-primary hover:bg-primary-dark text-white shadow-xs transition cursor-pointer flex items-center gap-1 sm:gap-1.5"
                      >
                        <span>Next</span>
                        <FaArrowRight className="text-[10px]" />
                      </button>
                    ) : (
                      <button
                        onClick={() => setShowSubmitConfirm(true)}
                        className="px-3 sm:px-4 py-1.5 text-xs font-bold rounded bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition cursor-pointer flex items-center gap-1 sm:gap-1.5"
                      >
                        <FaCheckCircle className="text-[10px]" />
                        <span>Finish</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white p-8 rounded border border-slate-200/80 text-center">
                <p className="text-xs text-slate-500 font-bold">Question not found.</p>
              </div>
            )}
          </div>

          {/* ========================================================
              RIGHT COLUMN: DESKTOP QUESTION MATRIX SIDEBAR
              ======================================================== */}
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
                  <span>Skipped ({visitedQuestions.size - answeredCount > 0 ? visitedQuestions.size - answeredCount : 0})</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded bg-slate-200 border border-slate-300" />
                  <span>Unvisited ({questions.length - visitedQuestions.size})</span>
                </div>
              </div>

              {/* FILTER TABS */}
              <div className="flex items-center p-0.5 bg-slate-100 rounded text-[10px] font-mono font-bold">
                {(["all", "answered", "unanswered", "review"] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setFilterStatus(tab)}
                    className={cn(
                      "flex-1 py-1 rounded capitalize transition cursor-pointer",
                      filterStatus === tab
                        ? "bg-white text-slate-900 shadow-2xs font-extrabold"
                        : "text-slate-500 hover:text-slate-800"
                    )}
                  >
                    {tab === "all" ? "All" : tab === "unanswered" ? "Skip" : tab}
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
                      onClick={() => setCurrentQuestionIdx(idx)}
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
                onClick={() => setShowSubmitConfirm(true)}
                className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded shadow-xs transition cursor-pointer font-mono"
              >
                Submit Exam Now
              </button>
            </div>
          </aside>
        </div>
      </main>

      {/* MOBILE QUESTION MATRIX SLIDE-UP DRAWER */}
      <AnimatePresence>
        {mobileDrawerOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileDrawerOpen(false)}
              className="lg:hidden fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-50"
            />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 26, stiffness: 240 }}
              className="lg:hidden fixed bottom-0 left-0 right-0 max-h-[80vh] bg-white rounded-t z-[60] shadow-2xl p-4 flex flex-col space-y-3"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <FaThLarge className="text-primary text-sm" />
                  <h4 className="text-xs font-bold text-slate-900 uppercase font-mono">Question Palette</h4>
                </div>
                <button
                  onClick={() => setMobileDrawerOpen(false)}
                  className="p-1.5 text-slate-400 hover:text-slate-700 rounded cursor-pointer"
                >
                  <FaTimes className="text-sm" />
                </button>
              </div>

              {/* Legend */}
              <div className="flex flex-wrap items-center gap-3 text-[10px] font-mono font-bold text-slate-600">
                <span className="flex items-center gap-1">🟢 Answered ({answeredCount})</span>
                <span className="flex items-center gap-1">🟣 Review ({reviewCount})</span>
                <span className="flex items-center gap-1">⚪ Total ({questions.length})</span>
              </div>

              {/* Mobile Grid */}
              <div className="grid grid-cols-5 gap-1.5 overflow-y-auto custom-scrollbar max-h-60 p-1">
                {questions.map((q, idx) => {
                  const status = getQuestionStatus(q.id);
                  const isCurrent = idx === currentQuestionIdx;
                  return (
                    <button
                      key={q.id || idx}
                      onClick={() => {
                        setCurrentQuestionIdx(idx);
                        setMobileDrawerOpen(false);
                      }}
                      className={cn(
                        "h-8 rounded font-mono text-xs font-bold transition flex items-center justify-center cursor-pointer",
                        isCurrent
                          ? "bg-primary text-white font-black scale-105 ring-2 ring-primary/30"
                          : status === "answered"
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-300"
                          : status === "review"
                          ? "bg-indigo-50 text-indigo-700 border border-indigo-300"
                          : "bg-slate-100 text-slate-600"
                      )}
                    >
                      {idx + 1}
                    </button>
                  );
                })}
              </div>

              <div className="pt-2">
                <button
                  onClick={() => {
                    setMobileDrawerOpen(false);
                    setShowSubmitConfirm(true);
                  }}
                  className="w-full py-2 bg-emerald-600 text-white font-bold text-xs rounded shadow-xs"
                >
                  Submit Final Answers
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
