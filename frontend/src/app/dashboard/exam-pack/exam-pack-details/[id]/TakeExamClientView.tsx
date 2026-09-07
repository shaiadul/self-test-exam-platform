"use client";

import Image from "next/image";
import React, { useState, useEffect, useCallback, useRef } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { PageContainer } from "../../../../../components/common/PageContainer";
import Scorecard from "../../../../../components/dashboard/Scorecard";
import CertificatePrintLayout from "../../../../../components/dashboard/CertificatePrintLayout";
import { submitExamAction, getQuestionsAction, getExamDetailsAction } from "../../../../../lib/actions";
import {
  FaEye,
  FaLock,
  FaShieldAlt,
  FaExclamationTriangle,
  FaExpand,
  FaCheckCircle,
  FaSync,
  FaKey,
} from "react-icons/fa";
import { PrimaryBtn } from "../../../../../components/ui/PrimaryBtn";
import { OutlineBtn } from "../../../../../components/ui/OutlineBtn";
import { Input } from "../../../../../components/ui/Input";

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

  const isLowTime = timeLeft < 300; // less than 5 minutes

  return (
    <div
      className={`flex items-center gap-2.5 px-4 py-2 rounded-xl border shadow-inner transition-colors ${
        isLowTime
          ? "bg-rose-50 border-rose-200 text-rose-700 animate-pulse"
          : "bg-[#fff4ec] border-orange-200 text-[#dd6b01]"
      }`}
    >
      <span className="text-xl">⏱️</span>
      <div>
        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Remaining Time</p>
        <p className="text-lg font-black font-mono leading-none">
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
    passMarks: initialExam?.passingMarks || initialExam?.passMark || 40,
    negativeMarks: initialExam?.negativeMarks ? Math.abs(Number(initialExam.negativeMarks)) : 0,
    isPrivate: initialExam?.isPrivate ?? false,
    passcode: initialExam?.passcode || "",
  });

  const [questions, setQuestions] = useState<QuestionData[]>(() =>
    normalizeQuestions(initialQuestions)
  );
  const [loadingQuestions, setLoadingQuestions] = useState(false);

  // Password Unlock State
  const requiresPassword = examMeta.isPrivate && !!examMeta.passcode;
  const [isUnlocked, setIsUnlocked] = useState<boolean>(!requiresPassword);
  const [enteredPasscode, setEnteredPasscode] = useState("");
  const [passcodeError, setPasscodeError] = useState("");

  // Exam Progress State
  const [userAnswers, setUserAnswers] = useState<Record<number, Answer>>({});
  const [examStatus, setExamStatus] = useState<"instructions" | "running" | "submitted">("instructions");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [examResult, setExamResult] = useState<any>(null);

  // Security & Anti-cheating State
  const [warnings, setWarnings] = useState<number>(0);
  const [showWarningModal, setShowWarningModal] = useState(false);
  const [currentWarningMsg, setCurrentWarningMsg] = useState("");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const isRunningRef = useRef(false);
  isRunningRef.current = examStatus === "running";

  // Client-side fallback fetch for questions & exam details
  const fetchQuestionsFallback = useCallback(async () => {
    setLoadingQuestions(true);
    try {
      const [qs, details] = await Promise.all([
        getQuestionsAction(examId),
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
        if (!details.isPrivate || !details.passcode) {
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
    if (!initialQuestions || initialQuestions.length === 0) {
      fetchQuestionsFallback();
    }
  }, [initialQuestions, fetchQuestionsFallback]);

  // Handle Passcode Unlock
  const handleUnlockPasscode = (e: React.FormEvent) => {
    e.preventDefault();
    if (!enteredPasscode.trim()) {
      setPasscodeError("Please enter the exam passcode.");
      return;
    }
    if (enteredPasscode.trim() === examMeta.passcode.trim()) {
      setIsUnlocked(true);
      setPasscodeError("");
      toast.success("Exam unlocked! Please review instructions before starting.");
    } else {
      setPasscodeError("Incorrect passcode. Please verify with your instructor.");
      toast.error("Incorrect passcode.");
    }
  };

  // Submit Exam Handler
  const handleFinish = useCallback(
    async (reason?: string) => {
      if (examStatus === "submitted" || isSubmitting) return;
      setIsSubmitting(true);

      // Exit fullscreen if active
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

        const securityMsg = reason || (warnings > 0 ? `Completed with ${warnings} security warning(s)` : "Normal Clean Submission");

        const res = await submitExamAction(examId, mappedAnswers, warnings, securityMsg);

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
    [examId, examStatus, isSubmitting, questions, userAnswers, warnings]
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

    // 1. Tab visibility change (switching tabs or minimizing)
    const handleVisibilityChange = () => {
      if (document.hidden && isRunningRef.current) {
        triggerSecurityWarning("Tab switched or browser minimized.");
      }
    };

    // 2. Window blur (alt-tabbing or clicking outside window)
    const handleBlur = () => {
      if (isRunningRef.current) {
        triggerSecurityWarning("Window lost focus or another application was opened.");
      }
    };

    // 3. Fullscreen change
    const handleFullscreenChange = () => {
      const active = !!document.fullscreenElement;
      setIsFullscreen(active);
      if (!active && isRunningRef.current) {
        triggerSecurityWarning("Exited fullscreen proctored mode.");
      }
    };

    // 4. Keyboard Shortcuts Interception (DevTools, View Source, Print, Save)
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isRunningRef.current) return;

      // F12
      if (e.key === "F12") {
        e.preventDefault();
        triggerSecurityWarning("Developer Tools key (F12) intercepted.");
        return;
      }

      // Ctrl+Shift+I / Ctrl+Shift+J / Ctrl+Shift+C (Inspect)
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && ["I", "i", "J", "j", "C", "c"].includes(e.key)) {
        e.preventDefault();
        triggerSecurityWarning("Inspect Element shortcut blocked.");
        return;
      }

      // Ctrl+U (View Source)
      if ((e.ctrlKey || e.metaKey) && ["U", "u"].includes(e.key)) {
        e.preventDefault();
        triggerSecurityWarning("View Source shortcut blocked.");
        return;
      }

      // Ctrl+P (Print)
      if ((e.ctrlKey || e.metaKey) && ["P", "p"].includes(e.key)) {
        e.preventDefault();
        return;
      }

      // Ctrl+S (Save)
      if ((e.ctrlKey || e.metaKey) && ["S", "s"].includes(e.key)) {
        e.preventDefault();
        return;
      }
    };

    // 5. Prevent copy, cut, paste, context menu
    const preventContextMenu = (e: MouseEvent) => {
      e.preventDefault();
    };
    const preventCopyCutPaste = (e: ClipboardEvent) => {
      e.preventDefault();
      toast.error("Copying or pasting exam content is strictly disabled.");
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
  }, [examStatus, triggerSecurityWarning]);

  const handleSelectOption = (questionId: number, option: Answer) => {
    setUserAnswers((prev) => ({
      ...prev,
      [questionId]: option,
    }));
  };

  // --- 1. PASSWORD CHALLENGE SCREEN ---
  if (!isUnlocked) {
    return (
      <PageContainer className="max-w-xl mx-auto py-16">
        <div className="bg-white rounded-3xl p-8 md:p-10 border border-gray-100 shadow-xl text-center space-y-6">
          <div className="w-16 h-16 bg-orange-100 text-[#dd6b01] rounded-2xl flex items-center justify-center text-3xl mx-auto shadow-inner border border-orange-200">
            <FaLock />
          </div>

          <div className="space-y-2">
            <span className="px-3 py-1 bg-rose-50 text-rose-700 font-extrabold text-[11px] rounded-full uppercase tracking-wider border border-rose-200">
              Protected Exam
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-gray-900">{examMeta.title}</h1>
            <p className="text-xs text-gray-500 font-semibold">
              This examination is private and password-protected. Please enter the access passcode provided by your instructor.
            </p>
          </div>

          <form onSubmit={handleUnlockPasscode} className="space-y-4 text-left pt-2">
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

            <div className="flex gap-3 pt-2">
              <OutlineBtn type="button" onClick={() => router.back()} className="flex-1 !text-sm !py-3">
                Cancel
              </OutlineBtn>
              <PrimaryBtn type="submit" className="flex-1 !text-sm !py-3 shadow-lg shadow-orange-500/20">
                Unlock Exam
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
      <PageContainer className="max-w-4xl mx-auto py-12">
        <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-xl space-y-6">
          <div className="border-b border-gray-100 pb-6 text-center space-y-2">
            <span className="px-3.5 py-1.5 bg-orange-100 text-[#dd6b01] font-extrabold text-xs rounded-full uppercase tracking-wider">
              {examMeta.subject}
            </span>
            <h1 className="text-3xl md:text-4xl font-black text-gray-900 tracking-tight">
              {examMeta.title}
            </h1>
            <p className="text-sm text-gray-500 font-semibold">
              Please review all exam parameters and security rules carefully before starting.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-orange-50/40 border border-orange-100 rounded-2xl text-center">
            <div>
              <p className="text-[10px] text-gray-400 font-extrabold uppercase">Total Questions</p>
              <p className="text-xl font-black text-gray-900">
                {loadingQuestions ? "..." : questions.length}
              </p>
            </div>
            <div>
              <p className="text-[10px] text-gray-400 font-extrabold uppercase">Duration</p>
              <p className="text-xl font-black text-[#dd6b01]">{examMeta.durationMinutes} Mins</p>
            </div>
            <div>
              <p className="text-[10px] text-gray-400 font-extrabold uppercase">Total Marks</p>
              <p className="text-xl font-black text-blue-600">{examMeta.totalMarks}</p>
            </div>
            <div>
              <p className="text-[10px] text-gray-400 font-extrabold uppercase">Negative Marking</p>
              <p className="text-xl font-black text-rose-500">
                {examMeta.negativeMarks > 0 ? `-${examMeta.negativeMarks}` : "None"}
              </p>
            </div>
          </div>

          {/* Security Rules Notice */}
          <div className="space-y-3 pt-2 bg-slate-50 border border-slate-200/80 rounded-2xl p-5">
            <div className="flex items-center gap-2 text-rose-600 font-extrabold text-sm">
              <FaShieldAlt className="text-lg" />
              <span>Strict Anti-Cheating & Proctored Guidelines:</span>
            </div>
            <ul className="text-xs text-gray-600 space-y-2 list-disc list-inside font-semibold">
              <li>
                <span className="font-bold text-gray-800">Fullscreen Enforcement:</span> The exam runs in fullscreen mode. Exiting triggers an immediate warning.
              </li>
              <li>
                <span className="font-bold text-gray-800">Tab Switch & Blur Tracking:</span> Switching tabs, minimizing, or clicking other applications will increment your warning count.
              </li>
              <li>
                <span className="font-bold text-gray-800">3-Strike Automatic Termination:</span> Accumulating 3 security warnings will instantly terminate and submit your exam for review.
              </li>
              <li>
                <span className="font-bold text-gray-800">Copy & Right-Click Disabled:</span> Copying, inspecting elements, or capturing shortcuts are strictly blocked.
              </li>
              <li>
                <span className="font-bold text-gray-800">Continuous Timer:</span> The countdown timer runs server-synchronized and submits automatically at zero.
              </li>
            </ul>
          </div>

          {/* No Questions Warning */}
          {!loadingQuestions && questions.length === 0 && (
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl text-center space-y-3">
              <p className="text-sm font-bold text-amber-800">
                ⚠️ No questions found in this exam yet.
              </p>
              <p className="text-xs text-amber-600">
                If questions were recently added, click refresh to synchronize the bank.
              </p>
              <button
                onClick={fetchQuestionsFallback}
                className="inline-flex items-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold transition cursor-pointer"
              >
                <FaSync /> Refresh Questions
              </button>
            </div>
          )}

          <div className="pt-4 border-t border-gray-100 flex gap-4">
            <OutlineBtn onClick={() => router.back()} className="flex-1 !text-sm !py-3">
              Back to Dashboard
            </OutlineBtn>
            <PrimaryBtn
              onClick={handleStartExam}
              disabled={loadingQuestions || questions.length === 0}
              className="flex-1 !text-sm !py-3 shadow-lg shadow-orange-500/20 gap-2 disabled:opacity-50"
            >
              <FaExpand className="text-xs" />
              <span>{loadingQuestions ? "Loading..." : "Enter Proctored Exam"}</span>
            </PrimaryBtn>
          </div>
        </div>
      </PageContainer>
    );
  }

  // --- 3. SUBMITTED SCREEN ---
  if (examStatus === "submitted" && examResult) {
    return (
      <PageContainer className="max-w-4xl mx-auto py-12">
        <div className="hidden print:block">
          <CertificatePrintLayout
            candidateName={examResult.userName || "Student"}
            examName={examMeta.title}
            examDate={new Date().toLocaleDateString("en-US", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
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

        <div className="print:hidden space-y-8">
          <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-xl text-center space-y-6">
            <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-4xl mx-auto border-4 border-green-200">
              <FaCheckCircle />
            </div>
            <h1 className="text-3xl font-black text-gray-900">Exam Successfully Submitted!</h1>

            {examResult.securityMessage && (
              <p className="text-xs font-bold text-gray-500">
                Audit Record: <span className="text-[#dd6b01]">{examResult.securityMessage}</span>
              </p>
            )}

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
            />

            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              {examResult.id && (
                <PrimaryBtn
                  link={`/dashboard/reporting/${examResult.id}`}
                  className="flex-1 !text-sm !py-3.5 shadow-lg shadow-orange-500/20 gap-2"
                >
                  <FaEye className="text-sm" />
                  <span>View Detailed Report & Solutions</span>
                </PrimaryBtn>
              )}
              <PrimaryBtn
                onClick={() => window.print()}
                className="flex-1 !text-sm !py-3.5 !from-purple-600 !to-indigo-600 shadow-lg shadow-purple-500/20"
              >
                Print Official Certificate
              </PrimaryBtn>
              <OutlineBtn link="/dashboard" className="flex-1 !text-sm !py-3.5">
                Back to Dashboard
              </OutlineBtn>
            </div>
          </div>
        </div>
      </PageContainer>
    );
  }

  // --- 4. RUNNING PROCTORED EXAM SCREEN ---
  return (
    <div className="select-none min-h-screen bg-slate-50/50 pb-20">
      {/* SECURITY VIOLATION MODAL (POPUP ON TAB SWITCH / BLUR) */}
      <AnimatePresence>
        {showWarningModal && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white max-w-md w-full rounded-3xl p-6 md:p-8 border-2 border-rose-500 shadow-2xl text-center space-y-4"
            >
              <div className="w-16 h-16 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center text-3xl mx-auto border-2 border-rose-200 animate-bounce">
                <FaExclamationTriangle />
              </div>

              <div className="space-y-1">
                <span className="px-3 py-1 bg-rose-100 text-rose-700 font-black text-xs rounded-full uppercase tracking-wider">
                  Security Warning #{warnings} of 3
                </span>
                <h3 className="text-xl font-black text-gray-900 pt-1">
                  Proctor Violation Detected!
                </h3>
                <p className="text-xs text-rose-600 font-bold">{currentWarningMsg}</p>
              </div>

              <p className="text-xs text-gray-600 leading-relaxed font-semibold">
                Leaving the exam window, switching tabs, or exiting fullscreen is prohibited.
                {warnings >= 3 ? (
                  <span className="block font-bold text-rose-600 mt-2">
                    Maximum limit exceeded! Your exam is being automatically submitted.
                  </span>
                ) : (
                  <span className="block font-bold text-gray-800 mt-2">
                    You have {3 - warnings} warning(s) remaining before automatic disqualification.
                  </span>
                )}
              </p>

              {warnings < 3 ? (
                <PrimaryBtn
                  onClick={async () => {
                    await enterFullscreen();
                    setShowWarningModal(false);
                  }}
                  className="w-full !py-3 !text-sm !from-rose-600 !to-orange-600"
                >
                  I Understand & Resume Fullscreen
                </PrimaryBtn>
              ) : (
                <button
                  disabled
                  className="w-full py-3 bg-rose-600 text-white font-bold text-sm rounded-xl opacity-75"
                >
                  Submitting Exam Now...
                </button>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Floating Proctored Security Header */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-sm px-4 sm:px-8 py-3.5">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-black rounded-full border border-emerald-200">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              <span>PROCTORED ACTIVE</span>
            </span>

            <span
              className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-extrabold border ${
                warnings === 0
                  ? "bg-slate-50 text-slate-700 border-slate-200"
                  : warnings === 1
                  ? "bg-amber-50 text-amber-700 border-amber-300"
                  : "bg-rose-50 text-rose-700 border-rose-300 animate-pulse"
              }`}
            >
              <span>Warnings: {warnings}/3</span>
            </span>
          </div>

          <div className="flex items-center gap-4">
            <Timer
              duration={examMeta.durationMinutes * 60}
              onTimeUp={() => handleFinish("Time expired")}
              isRunning={examStatus === "running"}
            />
            <button
              onClick={() => {
                if (confirm("Are you ready to submit your answers? This action cannot be undone.")) {
                  handleFinish();
                }
              }}
              disabled={isSubmitting}
              className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-xl shadow-md transition cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? "Submitting..." : "Submit Exam"}
            </button>
          </div>
        </div>
      </header>

      {/* Main Examination Questions Container */}
      <PageContainer className="space-y-6 max-w-4xl mx-auto pt-6">
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
          <div>
            <h1 className="text-xl font-black text-gray-900">{examMeta.title}</h1>
            <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">
              {examMeta.subject} • {questions.length} Questions Total
            </p>
          </div>
          <div className="text-right">
            <span className="text-xs font-extrabold text-gray-400 block">Answered</span>
            <span className="text-lg font-black text-[#dd6b01]">
              {Object.keys(userAnswers).length} / {questions.length}
            </span>
          </div>
        </div>

        {/* Questions list */}
        <div className="space-y-6">
          {questions.map((q, idx) => (
            <div
              key={q.id || idx}
              className="bg-white p-6 md:p-8 rounded-3xl border border-gray-100 shadow-sm space-y-4 hover:border-orange-200/60 transition"
            >
              <div className="flex items-start gap-3">
                <span className="w-8 h-8 rounded-xl bg-orange-100 text-[#dd6b01] font-black text-sm flex items-center justify-center flex-shrink-0">
                  {idx + 1}
                </span>
                <h3 className="text-base sm:text-lg font-bold text-gray-900 pt-0.5 leading-snug">
                  {q.questionText}
                </h3>
              </div>

              {q.passage && (
                <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200 text-xs text-gray-700 leading-relaxed font-medium">
                  {q.passage}
                </div>
              )}

              {q.pictureUrl && (
                <div className="overflow-hidden rounded-2xl border border-gray-200">
                  <Image
                    src={q.pictureUrl}
                    alt="Question visual context"
                    width={500}
                    height={300}
                    className="object-cover max-h-72 w-full"
                  />
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                {q.options.map((opt, optIdx) => {
                  const isSelected = userAnswers[q.id] === opt;
                  const optLetter = String.fromCharCode(65 + optIdx);

                  return (
                    <button
                      key={optIdx}
                      type="button"
                      onClick={() => handleSelectOption(q.id, opt)}
                      className={`p-4 rounded-2xl text-xs font-bold text-left border-2 transition flex items-center justify-between cursor-pointer ${
                        isSelected
                          ? "bg-orange-50/70 border-[#dd6b01] text-[#dd6b01] shadow-sm"
                          : "bg-white border-gray-200 hover:border-orange-300 text-gray-700"
                      }`}
                    >
                      <span className="flex items-center gap-2.5">
                        <span
                          className={`w-6 h-6 rounded-lg text-xs font-black flex items-center justify-center ${
                            isSelected
                              ? "bg-[#dd6b01] text-white"
                              : "bg-gray-100 text-gray-500"
                          }`}
                        >
                          {optLetter}
                        </span>
                        <span>{opt}</span>
                      </span>
                      {isSelected && <span className="text-sm font-black text-[#dd6b01]">✓</span>}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}

          {questions.length === 0 && (
            <div className="bg-white p-12 rounded-3xl border border-gray-100 text-center space-y-3">
              <p className="text-gray-500 font-bold text-sm">No questions available in this exam.</p>
              <PrimaryBtn onClick={fetchQuestionsFallback} className="!text-xs">
                Refresh Questions
              </PrimaryBtn>
            </div>
          )}
        </div>

        {/* Bottom Submission Strip */}
        <div className="p-6 bg-white rounded-3xl border border-gray-100 shadow-sm flex items-center justify-between">
          <span className="text-xs text-gray-500 font-semibold">
            Make sure to review all answers before submitting.
          </span>
          <button
            onClick={() => {
              if (confirm("Are you ready to submit your exam now?")) {
                handleFinish();
              }
            }}
            disabled={isSubmitting}
            className="px-8 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-xl shadow-md transition cursor-pointer disabled:opacity-50"
          >
            {isSubmitting ? "Submitting..." : "Submit Final Answers"}
          </button>
        </div>
      </PageContainer>
    </div>
  );
}
