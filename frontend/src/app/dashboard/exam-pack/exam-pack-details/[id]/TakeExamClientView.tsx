"use client";

import Image from "next/image";
import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { PageContainer } from "../../../../../components/common/PageContainer";
import Scorecard from "../../../../../components/dashboard/Scorecard";
import CertificatePrintLayout from "../../../../../components/dashboard/CertificatePrintLayout";
import { submitExamAction } from "../../../../../lib/actions";

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

  return (
    <div className="flex items-center gap-2 bg-[#fff4ec] px-4 py-2 rounded-xl border border-orange-200 shadow-inner">
      <span className="text-xl">⏱️</span>
      <div>
        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Remaining Time</p>
        <p className="text-lg font-black text-[#dd6b01] font-mono leading-none">
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

  const [examMeta] = useState({
    title: initialExam?.name || "Mock Exam",
    subject: initialExam?.subject || "General Exam",
    durationMinutes: initialExam?.duration || 30,
    totalMarks: initialExam?.totalMarks || 100,
    passMarks: initialExam?.passMarks || 40,
    negativeMarks: initialExam?.negativeMarks || 0.25,
  });

  const [questions] = useState<QuestionData[]>(
    (initialQuestions || []).map((q: any, idx: number) => ({
      id: q.id || idx + 1,
      type: q.type || "mcq",
      questionText: q.text || q.questionText,
      options: q.options || [],
      correctAnswer: q.options?.[q.correctIndex] || q.correctAnswer || "",
      passage: q.passage,
      pictureUrl: q.pictureUrl,
    }))
  );

  const [userAnswers, setUserAnswers] = useState<Record<number, Answer>>({});
  const [warnings, setWarnings] = useState<number>(0);
  const [examStatus, setExamStatus] = useState<"instructions" | "running" | "submitted">("instructions");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [examResult, setExamResult] = useState<any>(null);

  const handleSelectOption = (questionId: number, option: Answer) => {
    setUserAnswers((prev) => ({
      ...prev,
      [questionId]: option,
    }));
  };

  const handleFinish = async () => {
    if (examStatus === "submitted" || isSubmitting) return;
    setIsSubmitting(true);

    try {
      // Map user answers format: { questionId: selectedIndex }
      const mappedAnswers: Record<string, number> = {};
      questions.forEach((q) => {
        const selectedText = userAnswers[q.id];
        if (selectedText !== undefined) {
          const index = q.options.indexOf(selectedText);
          if (index !== -1) {
            mappedAnswers[q.id.toString()] = index;
          }
        }
      });

      const res = await submitExamAction(
        examId,
        mappedAnswers,
        warnings,
        warnings >= 3 ? "Terminated due to multiple security warnings" : "Normal Submission"
      );

      if (res.success && res.result) {
        setExamResult(res.result);
        setExamStatus("submitted");
        toast.success("Exam submitted successfully!");
      } else {
        toast.error(res.error || "Failed to submit exam.");
      }
    } catch {
      toast.error("An error occurred during submission.");
    } finally {
      setIsSubmitting(false);
    }
  };

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
              Please review instructions carefully before starting the exam.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-orange-50/40 border border-orange-100 rounded-2xl text-center">
            <div>
              <p className="text-[10px] text-gray-400 font-extrabold uppercase">Total Questions</p>
              <p className="text-xl font-black text-gray-900">{questions.length}</p>
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
              <p className="text-xl font-black text-rose-500">-{examMeta.negativeMarks}</p>
            </div>
          </div>

          <div className="space-y-3 pt-4">
            <h3 className="font-bold text-gray-900 text-sm">Strict Security Rules & System Monitoring:</h3>
            <ul className="text-xs text-gray-600 space-y-2 list-disc list-inside font-semibold">
              <li>Do not switch tabs or minimize the browser window during the test.</li>
              <li>Timer will run continuously and submit automatically upon reaching zero.</li>
              <li>Multiple security warnings will result in forced automatic submission.</li>
            </ul>
          </div>

          <div className="pt-6 border-t border-gray-100 flex gap-4">
            <button
              onClick={() => router.back()}
              className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-sm rounded-2xl transition"
            >
              Back
            </button>
            <button
              onClick={() => setExamStatus("running")}
              className="flex-1 py-3 bg-[#dd6b01] hover:bg-orange-600 text-white font-bold text-sm rounded-2xl shadow-lg shadow-orange-500/20 transition cursor-pointer"
            >
              Start Exam Now
            </button>
          </div>
        </div>
      </PageContainer>
    );
  }

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

        <div className="print:hidden space-y-8 animate-fadeIn">
          <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-xl text-center space-y-6">
            <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-4xl mx-auto border-4 border-green-200">
              ✓
            </div>
            <h1 className="text-3xl font-black text-gray-900">Exam Successfully Submitted!</h1>

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

            <div className="flex gap-4 pt-4">
              <button
                onClick={() => window.print()}
                className="flex-1 py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold text-sm rounded-2xl shadow transition"
              >
                Print Official Certificate
              </button>
              <button
                onClick={() => router.push("/dashboard")}
                className="flex-1 py-3 bg-[#dd6b01] hover:bg-orange-600 text-white font-bold text-sm rounded-2xl shadow transition"
              >
                Back to Dashboard
              </button>
            </div>
          </div>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer className="space-y-6 max-w-5xl mx-auto">
      {/* Running Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-gray-100 shadow-md">
        <div>
          <h1 className="text-2xl font-black text-gray-900">{examMeta.title}</h1>
          <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">{examMeta.subject}</p>
        </div>

        <div className="flex items-center gap-4">
          <Timer
            duration={examMeta.durationMinutes * 60}
            onTimeUp={handleFinish}
            isRunning={examStatus === "running"}
          />
          <button
            onClick={handleFinish}
            disabled={isSubmitting}
            className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow transition cursor-pointer"
          >
            {isSubmitting ? "Submitting..." : "Submit Exam"}
          </button>
        </div>
      </div>

      {/* Questions list */}
      <div className="space-y-6">
        {questions.map((q, idx) => (
          <div key={q.id} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-md space-y-4">
            <div className="flex items-start gap-3">
              <span className="w-8 h-8 rounded-xl bg-orange-100 text-[#dd6b01] font-black text-sm flex items-center justify-center flex-shrink-0">
                {idx + 1}
              </span>
              <h3 className="text-lg font-bold text-gray-900 pt-0.5">{q.questionText}</h3>
            </div>

            {q.passage && (
              <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200 text-xs text-gray-700 leading-relaxed">
                {q.passage}
              </div>
            )}

            {q.pictureUrl && (
              <Image
                src={q.pictureUrl}
                alt="Question diagram"
                width={400}
                height={250}
                className="rounded-2xl border border-gray-200 object-cover max-h-60"
              />
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              {q.options.map((opt, optIdx) => {
                const selected = userAnswers[q.id] === opt;
                return (
                  <button
                    key={optIdx}
                    onClick={() => handleSelectOption(q.id, opt)}
                    className={`p-4 rounded-2xl text-xs font-bold text-left border transition flex items-center justify-between cursor-pointer ${
                      selected
                        ? "bg-orange-50 border-[#dd6b01] text-[#dd6b01] shadow-sm"
                        : "bg-white border-gray-200 hover:border-orange-200 text-gray-700"
                    }`}
                  >
                    <span>
                      {String.fromCharCode(65 + optIdx)}. {opt}
                    </span>
                    {selected && <span className="text-sm">✓</span>}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </PageContainer>
  );
}
