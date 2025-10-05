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
interface TimerProps {
  duration: number; // in seconds
}

const Timer = ({ duration }: TimerProps) => {
  const [timeLeft, setTimeLeft] = useState(duration);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

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
      <div>
        <Image
          src="/global/logo2.png"
          alt="site logo"
          width={250}
          height={100}
        />
      </div>
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
}

const QuestionCard: React.FC<QuestionCardProps> = ({
  question,
  number,
  selected,
  onAnswerChange,
}) => {
  const isAnswered = selected !== null;

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm mt-4">
      {question.type === "picture" && question.pictureUrl && (
        <Image
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
            } ${isAnswered ? "opacity-70 cursor-not-allowed" : ""}`}
          >
            <input
              type="radio"
              name={question.id}
              value={opt}
              checked={selected === opt}
              onChange={() => !isAnswered && onAnswerChange(question.id, opt)}
              className="hidden"
              disabled={isAnswered}
            />
            <span
              className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                selected === opt
                  ? "border-[#dd6b01] bg-[#dd6b01]"
                  : "border-gray-400"
              }`}
            >
              {selected === opt && (
                <span className="w-2.5 h-2.5 rounded-full bg-white" />
              )}
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
      "The sun rises in the east and sets in the west. It completes one rotation around the earth every 24 hours. The sun is the center of the solar system. The sun is the only star that is visible to the naked eye. The sun is the only star that is visible to the naked eye. The sun is the only star that is visible to the naked eye.",
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
    pictureUrl:
      "https://images.unsplash.com/photo-1592194996308-7b43878e84a6?auto=format&fit=crop&w=800&q=80",
    options: ["Cat", "Dog", "Elephant", "Tiger"],
    correctAnswer: "Dog",
  },
];

// ---- heading details ---
interface InfoItemProps {
  label: string;
  value: string;
}

const InfoItem: React.FC<InfoItemProps> = ({ label, value }) => {
  return (
    <div>
      <span className="text-sm">{label}</span>
      <p className="border border-[#dd6b01] rounded text-sm px-3 py-1">
        {value}
      </p>
    </div>
  );
};

// --- MAIN EXAM PAGE ---
export default function ExamPage() {
  const [answers, setAnswers] = useState<Record<string, Answer | null>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleAnswerChange = (id: string, ans: Answer) => {
    setAnswers((prev) => ({ ...prev, [id]: ans }));
  };

  const handleSubmit = () => {
    setIsSubmitted(true);
    console.log("Submitted answers:", answers);
    alert("Exam submitted! Check console for results.");
  };

  // --- SECURITY ---
  useEffect(() => {
    const preventCopy = (e: ClipboardEvent) => e.preventDefault();
    const preventRightClick = (e: MouseEvent) => e.preventDefault();
    const preventKeys = (e: KeyboardEvent) => {
      if (e.ctrlKey && ["c", "v", "x", "a"].includes(e.key.toLowerCase()))
        e.preventDefault();
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

  useEffect(() => {
    // Prevent page refresh
    const beforeUnloadHandler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "You cannot refresh or leave during the exam!";
    };
    window.addEventListener("beforeunload", beforeUnloadHandler);

    // Prevent back/forward navigation
    history.pushState(null, "", location.href);
    window.onpopstate = function () {
      history.pushState(null, "", location.href);
      alert("You cannot go back or forward during the exam!");
    };

    return () => {
      window.removeEventListener("beforeunload", beforeUnloadHandler);
      window.onpopstate = null;
    };
  }, []);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        alert("You left the exam tab — exam submitted automatically!");
        setIsSubmitted(true);
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () =>
      document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, []);

  useEffect(() => {
    const handleDevTools = (e: KeyboardEvent) => {
      if (
        (e.ctrlKey &&
          e.shiftKey &&
          ["i", "j", "c"].includes(e.key.toLowerCase())) ||
        e.key === "F12"
      ) {
        e.preventDefault();
        alert("Developer tools are disabled during the exam!");
      }
    };

    window.addEventListener("keydown", handleDevTools);
    return () => window.removeEventListener("keydown", handleDevTools);
  }, []);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        alert(
          "Screen sharing or switching detected — your exam is auto-submitted!"
        );
        setIsSubmitted(true);
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () =>
      document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, []);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 800 || window.innerHeight < 600) {
        alert("Screen resize detected — exam locked for security.");
        setIsSubmitted(true);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="bg-white min-h-screen font-sans">
      <main className="container mx-auto px-6 md:px-12 py-8">
        <div className="max-w-5xl mx-auto space-y-6">
          <Timer duration={10 * 60} />
          {/* Exam Header */}
          <div className="bg-white border border-[#dd6b01] rounded-xl shadow-md p-5 flex items-center justify-between">
            <div>
              <div className="grid grid-cols-1 md:grid-cols-2 items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <Image
                    src="/global/no-picture.jpg"
                    alt="subject image"
                    width={200}
                    height={38}
                    priority
                    className="rounded-md"
                  />
                  <div>
                    <h1 className="text-2xl font-bold text-[#dd6b01]">
                      Science Explorer
                    </h1>
                    <p className="text-gray-400 max-w-md line-clamp-3 my-2">
                      Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                      Nec elementum sollicitudin phasellus velit bibendum mi,
                      eget risus. Nisi nisl, tellus, eu nibh nibh leo erat
                      volutpat. At elementum
                    </p>
                    <span className="font-semibold">
                      10:30 AM | Sunday 5th, 2025{" "}
                    </span>
                  </div>
                </div>
                <div>
                  <div className="flex items-center gap-3">
                    <InfoItem label="Level" value="HSC" />
                    <InfoItem label="Batch" value="2019 - 2020" />
                    <InfoItem label="Exam Pack" value="Science Explorer" />
                  </div>

                  <div className="mt-3">
                    <span className="text-md font-semibold text-[#dd6b01]">
                      Result
                    </span>
                    <div className="flex items-center gap-3">
                      <InfoItem label="Total Marks" value="20" />
                      <InfoItem label="Mark" value="1.25" />
                      <InfoItem label="Pass Marks" value="15" />
                      <InfoItem label="Negative Mark" value="1.50" />
                    </div>
                  </div>
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
              onAnswerChange={isSubmitted ? () => {} : handleAnswerChange}
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

// student have only one change to select a answer, after select one they can't change
// after submit the exam the student can't change the answer
// can't refresh the page
// can't go back
// can't go forward
// can't open new tab
// can't open new window
// can't open dev tools
// can't open console
// can't open inspect
