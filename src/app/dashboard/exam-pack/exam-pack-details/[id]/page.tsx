"use client";

import Image from "next/image";
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PageContainer } from "@/components/common/PageContainer";

// --- TYPES ---
type Answer = string;
interface QuestionData {
  id: string;
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
  isRunning: boolean; // new prop
}

const Timer = ({ duration, onTimeUp, isRunning }: TimerProps) => {
  const [timeLeft, setTimeLeft] = useState(duration);

  useEffect(() => {
    if (!isRunning) return; // stop timer if not running

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
  }, [isRunning, onTimeUp]); // depend on isRunning

  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, "0")}:${mins
      .toString()
      .padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="flex items-center justify-between">
      <Image src="/global/logo2.png" alt="logo" width={250} height={100} />
      <div className="bg-gradient-to-r from-[#dd6b01] to-[#f0b176] min-w-[200px] text-white font-semibold p-5 rounded-lg flex flex-col items-center shadow-md">
        <span className="text-xs text-gray-100 mb-1">Time Remaining</span>
        <span className="text-3xl tracking-wider">{formatTime(timeLeft)}</span>
      </div>
    </div>
  );
};


// --- QUESTION CARD ---
interface QuestionCardProps {
  question: QuestionData;
  number: number;
  selected: Answer | null;
  onAnswerChange: (id: string, answer: Answer) => void;
  isLocked: boolean;
}

const QuestionCard: React.FC<QuestionCardProps> = ({
  question,
  number,
  selected,
  onAnswerChange,
  isLocked,
}) => {
  const isAnswered = selected !== null;
  const isCorrect = selected === question.correctAnswer;
  const isSubmitted = isLocked; // same meaning: after exam submit

  return (
    <div
      className={`bg-white border rounded-xl p-6 shadow-sm mt-4 transition-all duration-300 ${
        isSubmitted
          ? isCorrect
            ? "border-green-400 bg-green-50"
            : "border-red-400 bg-red-50"
          : "border-gray-200"
      }`}
    >
      {question.type === "picture" && question.pictureUrl && (
        <Image
          src={question.pictureUrl}
          alt={`Question ${number}`}
          width={500}
          height={500}
          className="rounded-lg mb-4 w-full max-h-64 object-cover"
        />
      )}

      {question.type === "passage" && question.passage && (
        <div className="bg-gray-50 border border-dashed rounded-lg p-4 mb-4">
          <p className="text-gray-700">{question.passage}</p>
        </div>
      )}

      <p className="text-gray-800 font-semibold mb-3">
        {number}. {question.questionText}
      </p>

      {/* Options */}
      <div className="space-y-3">
        {question.options.map((opt, idx) => {
          const isUserChoice = selected === opt;
          const isRightAnswer = question.correctAnswer === opt;
          const showAnswerColors = isSubmitted;

          return (
            <label
              key={idx}
              className={`flex items-center space-x-3 cursor-pointer p-2 rounded-lg border transition-all duration-200
                ${
                  showAnswerColors
                    ? isRightAnswer
                      ? "border-green-500 bg-green-50"
                      : isUserChoice && !isRightAnswer
                      ? "border-red-400 bg-red-50"
                      : "border-gray-300"
                    : isUserChoice
                    ? "border-[#dd6b01] bg-[#fff4e6]"
                    : "border-gray-300 hover:border-[#dd6b01]"
                }
                ${isAnswered || isLocked ? "opacity-80 cursor-not-allowed" : ""}
              `}
            >
              <input
                type="radio"
                name={question.id}
                value={opt}
                checked={isUserChoice}
                onChange={() =>
                  !isAnswered && !isLocked && onAnswerChange(question.id, opt)
                }
                className="hidden"
                disabled={isAnswered || isLocked}
              />
              <span
                className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                  isUserChoice
                    ? "border-[#dd6b01] bg-[#dd6b01]"
                    : "border-gray-400"
                }`}
              >
                {isUserChoice && (
                  <span className="w-2.5 h-2.5 rounded-full bg-white" />
                )}
              </span>
              <span>{opt}</span>
            </label>
          );
        })}
      </div>

      {/* --- Show answers after submission --- */}
      {isSubmitted && (
        <div className="mt-4 text-sm border-t border-gray-200 pt-3">
          <p className="font-medium text-gray-700">
            Correct Answer:{" "}
            <span className="text-green-700 font-semibold">
              {question.correctAnswer}
            </span>
          </p>
          <p className="font-medium text-gray-700 mt-1">
            Your Answer:{" "}
            {selected ? (
              <span
                className={`font-semibold ${
                  isCorrect ? "text-green-700" : "text-red-600"
                }`}
              >
                {selected}
              </span>
            ) : (
              <span className="text-gray-500 italic">Not answered</span>
            )}
          </p>
        </div>
      )}
    </div>
  );
};

// --- INFO ITEM ---
const InfoItem = ({ label, value }: { label: string; value: string }) => (
  <div>
    <span className="text-sm">{label}</span>
    <p className="border border-[#dd6b01] rounded text-sm px-3 py-1">{value}</p>
  </div>
);

// --- MOCK DATA ---
const examQuestions: QuestionData[] = [
  {
    id: "q1",
    type: "mcq",
    questionText: "What is the capital of France?",
    options: ["Paris", "London", "Berlin", "Madrid"],
    correctAnswer: "Paris",
  },
  {
    id: "q2",
    type: "passage",
    questionText: "According to the passage, which is true?",
    passage: "The sun rises in the east and sets in the west.",
    options: [
      "Sun rises in west",
      "Sun rises in east",
      "Sun rises in north",
      "Sun rises in south",
    ],
    correctAnswer: "Sun rises in east",
  },
  {
    id: "q3",
    type: "picture",
    questionText: "Identify this animal in the picture.",
    pictureUrl: "/global/drought.jpg",
    options: ["Cat", "Dog", "Elephant", "Tiger"],
    correctAnswer: "Dog",
  },
  {
    id: "q4",
    type: "passage",
    questionText: "According to the passage, which is true?",
    passage: "The sun rises in the east and sets in the west.",
    options: [
      "Sun rises in west",
      "Sun rises in east",
      "Sun rises in north",
      "Sun rises in south",
    ],
    correctAnswer: "Sun rises in east",
  },
  {
    id: "q5",
    type: "picture",
    questionText: "Identify this animal in the picture.",
    pictureUrl: "/global/drought.jpg",
    options: ["Cat", "Dog", "Elephant", "Tiger"],
    correctAnswer: "Dog",
  },
];

// --- RESULT MODAL ---
const ResultModal = ({
  show,
  result,
  message,
  onClose,
}: {
  show: boolean;
  result: {
    total: number;
    correct: number;
    wrong: number;
    negative: number;
    finalScore: number;
    passed: boolean;
  };
  message: string;
  onClose: () => void;
}) => {
  if (!show) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          className="bg-white rounded-3xl shadow-2xl p-8 sm:p-10 w-[90%] max-w-md text-center relative"
          initial={{ scale: 0.85, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
        >
          {/* Header */}
          <h2 className="text-3xl font-bold text-[#dd6b01] mb-2">
            Exam Result
          </h2>
          <div className="h-1 w-16 bg-[#dd6b01] mx-auto mb-5 rounded-full" />

          {/* Message */}
          {message && (
            <p className="text-red-500 font-medium mb-4 bg-red-50 px-3 py-1 rounded-md inline-block">
              {message}
            </p>
          )}

          {/* Result Summary */}
          <div className="space-y-2 text-gray-700 text-sm sm:text-base">
            <p>
              <span className="font-semibold text-gray-800">
                Total Questions:
              </span>{" "}
              {result.total}
            </p>
            <p>
              <span className="font-semibold text-gray-800">
                Correct Answers:
              </span>{" "}
              {result.correct}
            </p>
            <p>
              <span className="font-semibold text-gray-800">
                Wrong Answers:
              </span>{" "}
              {result.wrong}
            </p>
            <p>
              <span className="font-semibold text-gray-800">
                Negative Marks:
              </span>{" "}
              {result.negative.toFixed(2)}
            </p>
          </div>

          {/* Divider */}
          <div className="border-t border-gray-200 my-5" />

          {/* Final Score */}
          <p className="font-semibold text-lg sm:text-xl text-gray-800 mb-1">
            Final Score:{" "}
            <span className="text-[#dd6b01]">
              {result.finalScore.toFixed(2)} / {result.total}
            </span>
          </p>

          {/* Pass/Fail Status */}
          <p
            className={`font-bold text-lg ${
              result.passed ? "text-green-600" : "text-red-600"
            }`}
          >
            {result.passed ? "🎉 Passed" : "Failed"}
          </p>

          {/* Buttons */}
          <div className="mt-8 flex flex-col sm:flex-row justify-center gap-3 sm:gap-5">
            <button
              className="bg-[#dd6b01] text-white px-5 py-2.5 rounded-lg shadow hover:bg-[#c35f00] transition-all duration-200"
              onClick={() => window.print()}
            >
              Download Result
            </button>
            <button
              className="border border-[#dd6b01] text-[#dd6b01] px-5 py-2.5 rounded-lg hover:bg-[#fff4e6] transition-all duration-200"
              onClick={onClose}
            >
              Close
            </button>
          </div>

          {/* Auto Redirect Note */}
          <p className="text-xs text-gray-500 mt-5 italic">
            Redirecting to dashboard in 10 seconds...
          </p>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

// --- MAIN EXAM PAGE ---
export default function ExamPage() {
  const [answers, setAnswers] = useState<Record<string, Answer | null>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [securityMessage, setSecurityMessage] = useState("");

  const handleAnswerChange = (id: string, ans: Answer) => {
    setAnswers((prev) => ({ ...prev, [id]: ans }));
  };

  const calculateResult = () => {
    const total = examQuestions.length;
    const correct = examQuestions.filter(
      (q) => answers[q.id] === q.correctAnswer
    ).length;
    const wrong = total - correct;
    const negative = wrong * 0.5;
    const finalScore = correct * 1 - negative;
    const passed = finalScore >= 1.5; // for example
    return { total, correct, wrong, negative, finalScore, passed };
  };

  const handleSubmit = (message?: string) => {
    setIsSubmitted(true);
    setSecurityMessage(message || "");
    setShowModal(true);
  };

  // ---- Security Events ----
  useEffect(() => {
    const triggerSecurity = (msg: string) => !isSubmitted && handleSubmit(msg);

    const preventKeys = (e: KeyboardEvent) => {
      if (
        (e.ctrlKey &&
          ["c", "v", "x", "a", "u"].includes(e.key.toLowerCase())) ||
        e.key === "F12"
      ) {
        e.preventDefault();
        triggerSecurity("Developer tools or copy action detected!");
      }
    };

    const visibilityChange = () => {
      if (document.hidden) triggerSecurity("You left the exam tab!");
    };

    const resize = () => {
      if (window.innerWidth < 800 || window.innerHeight < 600)
        triggerSecurity("Screen resize detected!");
    };

    window.addEventListener("keydown", preventKeys);
    window.addEventListener("resize", resize);
    document.addEventListener("visibilitychange", visibilityChange);

    return () => {
      window.removeEventListener("keydown", preventKeys);
      window.removeEventListener("resize", resize);
      document.removeEventListener("visibilitychange", visibilityChange);
    };
  }, [isSubmitted]);

  return (
    <PageContainer className="space-y-6">
      <Timer
  duration={3 * 60}
  onTimeUp={() => handleSubmit("Time up!")}
  isRunning={!isSubmitted}
/>

          {/* Exam Header */}
          <div className="bg-white border border-[#dd6b01] rounded-xl shadow-md p-5 flex items-center justify-between">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="flex items-center gap-3">
                <Image
                  src="/global/no-picture.jpg"
                  alt="subject image"
                  width={200}
                  height={38}
                  className="rounded-md"
                />
                <div>
                  <h1 className="text-2xl font-bold text-[#dd6b01]">
                    Science Explorer
                  </h1>
                  <p className="text-gray-400 max-w-md line-clamp-3 my-2">
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                  </p>
                  <span className="font-semibold">
                    10:30 AM | Sunday 5th, 2025
                  </span>
                </div>
              </div>
              <div>
                <div className="flex items-center gap-3">
                  <InfoItem label="Level" value="HSC" />
                  <InfoItem label="Batch" value="2019 - 2020" />
                  <InfoItem label="Exam Pack" value="Science Explorer" />
                </div>
                <p className="text-sm mt-3 text-[#dd6b01]">Marks</p>
                <div className="flex items-center gap-3">
                  <InfoItem label="Total Marks" value="10" />
                  <InfoItem label="Per Question" value="01" />
                  <InfoItem label="Passing Marks" value="05" />
                  <InfoItem label="Negative Marks" value="-0.5" />
                </div>
              </div>
            </div>
          </div>

          {/* Questions */}
          {examQuestions.map((q, idx) => (
            <QuestionCard
              key={q.id}
              question={q}
              number={idx + 1}
              selected={answers[q.id] || null}
              onAnswerChange={handleAnswerChange}
              isLocked={isSubmitted}
            />
          ))}

          {/* Submit */}
          {!isSubmitted && (
            <div className="flex justify-center pt-6">
              <button
                onClick={() => handleSubmit()}
                className="bg-gradient-to-r from-[#dd6b01] to-[#f0b176] text-white font-bold py-3 px-16 rounded-lg shadow-lg cursor-pointer"
              >
                Submit Exam
              </button>
            </div>
          )}
      {/* Modal */}
      <ResultModal
        show={showModal}
        result={calculateResult()}
        message={securityMessage}
        onClose={() => setShowModal(false)}
      />
    </PageContainer>
  );
}
