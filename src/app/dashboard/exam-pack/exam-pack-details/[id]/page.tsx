"use client";

import Image from "next/image";
import React, { useState, useEffect } from "react";

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
const Timer = ({ duration }: { duration: number }) => {
  const [timeLeft, setTimeLeft] = useState(duration);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const formatTime = (seconds: number) => {
    const min = Math.floor(seconds / 60);
    const sec = seconds % 60;
    return `${min.toString().padStart(2, "0")}:${sec
      .toString()
      .padStart(2, "0")}`;
  };

  return (
    <div className="bg-[#fff4e6] text-[#dd6b01] font-semibold px-4 py-2 rounded-lg flex items-center">
      <svg
        className="w-5 h-5 mr-2"
        fill="none"
        stroke="#dd6b01"
        strokeWidth={2}
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
      <span>{formatTime(timeLeft)}</span>
    </div>
  );
};

// --- QUESTION CARD ---
interface QuestionCardProps {
  question: QuestionData;
  number: number;
  selected: Answer | null;
  onAnswerChange: (id: string, answer: Answer) => void;
}

const QuestionCard: React.FC<QuestionCardProps> = ({
  question,
  number,
  selected,
  onAnswerChange,
}) => {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm mt-4">
      {question.type === "picture" && question.pictureUrl && (
        <Image
        //   src={question.pictureUrl}
          src="/global/drought.jpg"
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

      <div className="space-y-3">
        {question.options.map((opt, idx) => (
          <label
            key={idx}
            className={`flex items-center space-x-3 cursor-pointer p-2 rounded-lg border ${
              selected === opt
                ? "border-[#dd6b01] bg-[#fff4e6]"
                : "border-gray-300 hover:border-[#dd6b01]"
            }`}
          >
            <input
              type="radio"
              name={question.id}
              value={opt}
              checked={selected === opt}
              onChange={() => onAnswerChange(question.id, opt)}
              className="hidden"
            />
            <span
              className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                selected === opt
                  ? "border-[#dd6b01] bg-[#dd6b01]"
                  : "border-gray-400"
              }`}
            >
              {selected === opt && <span className="w-2.5 h-2.5 rounded-full bg-white" />}
            </span>
            <span>{opt}</span>
          </label>
        ))}
      </div>
    </div>
  );
};

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
    passage:
      "The sun rises in the east and sets in the west. It completes one rotation around the earth every 24 hours.",
    options: ["Sun rises in west", "Sun rises in east", "Sun rises in north", "Sun rises in south"],
    correctAnswer: "Sun rises in east",
  },
  {
    id: "q3",
    type: "picture",
    questionText: "Identify this animal in the picture.",
    pictureUrl:
      "https://images.unsplash.com/photo-1592194996308-7b43878e84a6?auto=format&fit=crop&w=800&q=80",
    options: ["Cat", "Dog", "Elephant", "Tiger"],
    correctAnswer: "Dog",
  },
];

// --- MAIN EXAM PAGE ---
export default function ExamPage() {
  const [answers, setAnswers] = useState<Record<string, Answer | null>>({});

  const handleAnswerChange = (id: string, ans: Answer) => {
    setAnswers((prev) => ({ ...prev, [id]: ans }));
  };

  const handleSubmit = () => {
    console.log("Submitted answers:", answers);
    alert("Exam submitted! Check console for results.");
  };

  // --- SECURITY ---
  useEffect(() => {
    const preventCopy = (e: ClipboardEvent) => e.preventDefault();
    const preventRightClick = (e: MouseEvent) => e.preventDefault();
    const preventKeys = (e: KeyboardEvent) => {
      if (e.ctrlKey && ["c", "v", "x", "a"].includes(e.key.toLowerCase())) e.preventDefault();
    };

    document.addEventListener("contextmenu", preventRightClick);
    document.addEventListener("copy", preventCopy);
    document.addEventListener("keydown", preventKeys);

    return () => {
      document.removeEventListener("contextmenu", preventRightClick);
      document.removeEventListener("copy", preventCopy);
      document.removeEventListener("keydown", preventKeys);
    };
  }, []);

  return (
    <div className="bg-white min-h-screen font-sans">
      <main className="container mx-auto px-6 md:px-12 py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Exam Header */}
          <div className="bg-white border border-[#dd6b01] rounded-xl shadow-md p-5 flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-gray-800">Physics 1st Paper-02</h1>
              <p className="text-sm text-gray-500">Subjective | Chapter-02 | Set-A</p>
              <p className="text-xs text-gray-400 mt-1">Syllabus: ভেক্টর (Vector)</p>
            </div>
            <Timer duration={10 * 60} />
          </div>

          {/* Questions */}
          {examQuestions.map((q, idx) => (
            <QuestionCard
              key={q.id}
              question={q}
              number={idx + 1}
              selected={answers[q.id] || null}
              onAnswerChange={handleAnswerChange}
            />
          ))}

          {/* Submit Button */}
          <div className="flex justify-center pt-6">
            <button
              onClick={handleSubmit}
              className="bg-gradient-to-r from-[#dd6b01] to-[#f0b176] text-white font-bold py-3 px-16 rounded-lg shadow-lg cursor-pointer"
            >
              Submit Exam
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
