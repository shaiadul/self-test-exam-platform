"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaCheck, FaTimes, FaLightbulb, FaClock, FaRedo, FaArrowRight, FaBrain, FaCalculator, FaCode, FaFlask } from "react-icons/fa";
import Link from "next/link";

interface Question {
  id: number;
  subject: string;
  icon: any;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

const sampleQuestions: Question[] = [
  {
    id: 1,
    subject: "Mathematics",
    icon: <FaCalculator className="text-amber-500" />,
    question: "If a polynomial function f(x) has roots at x = -2 and x = 5, which of the following could be a factor of f(x)?",
    options: ["(x - 2)", "(x + 2)", "(x + 5)", "(x - 10)"],
    correctIndex: 1,
    explanation: "By the Factor Theorem, if k is a root of a polynomial, then (x - k) is a factor. Since x = -2 is a root, (x - (-2)) = (x + 2) must be a factor.",
  },
  {
    id: 2,
    subject: "Computer Science",
    icon: <FaCode className="text-blue-500" />,
    question: "What is the worst-case time complexity of quicksort when using standard last-element partitioning?",
    options: ["O(log n)", "O(n)", "O(n log n)", "O(n²)"],
    correctIndex: 3,
    explanation: "In the worst case (e.g., already sorted array with unbalanced partitions), quicksort degrades to O(n²). Average time complexity is O(n log n).",
  },
  {
    id: 3,
    subject: "General Physics",
    icon: <FaFlask className="text-purple-500" />,
    question: "What happens to the resistance of a pure semiconductor material as its temperature increases?",
    options: ["It increases linearly", "It decreases exponentialy", "It remains completely unchanged", "It fluctuates randomly"],
    correctIndex: 1,
    explanation: "As temperature rises in semiconductors, more valence electrons gain energy to jump into the conduction band, increasing conductivity and reducing electrical resistance.",
  },
];

export const InteractiveDemo = () => {
  const [selectedSubjectIndex, setSelectedSubjectIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const currentQ = sampleQuestions[selectedSubjectIndex];

  const handleSelectOption = (index: number) => {
    if (!isSubmitted) {
      setSelectedOption(index);
    }
  };

  const handleSubmit = () => {
    if (selectedOption !== null) {
      setIsSubmitted(true);
    }
  };

  const handleReset = () => {
    setSelectedOption(null);
    setIsSubmitted(false);
  };

  const handleSubjectChange = (index: number) => {
    setSelectedSubjectIndex(index);
    setSelectedOption(null);
    setIsSubmitted(false);
  };

  return (
    <section className="w-full py-16 sm:py-24 bg-slate-900 text-white relative overflow-hidden">
      {/* Background Orbs */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10">
        {/* Section Title */}
        <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-10 space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-orange-500/10 border border-orange-500/30 text-orange-400 font-mono font-bold text-xs uppercase tracking-wider">
            <FaBrain className="text-orange-400" /> Interactive Demo
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Try a Live Assessment Question
          </h2>
          <p className="text-slate-400 text-xs sm:text-sm font-medium">
            Experience our instant automated grading, timer feedback, and step-by-step solution breakdowns in real time.
          </p>
        </div>

        {/* Demo App Wrapper */}
        <div className="max-w-3xl mx-auto bg-slate-900/90 border border-slate-800 rounded p-4 sm:p-6 backdrop-blur-xl shadow-xs">
          {/* Subject Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-4 border-b border-slate-800 scrollbar-none">
            {sampleQuestions.map((q, idx) => (
              <button
                key={q.subject}
                onClick={() => handleSubjectChange(idx)}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded font-mono font-bold text-xs whitespace-nowrap transition-all duration-150 ${
                  selectedSubjectIndex === idx
                    ? "bg-primary text-white shadow-xs"
                    : "bg-slate-800/80 text-slate-300 hover:bg-slate-800 hover:text-white border border-slate-700/50"
                }`}
              >
                {q.icon}
                <span>{q.subject}</span>
              </button>
            ))}
          </div>

          {/* Question Card */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentQ.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="space-y-4"
            >
              {/* Question Header */}
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <span className="text-[10px] font-mono font-bold text-orange-400 uppercase tracking-widest">
                    Question 01 of 01 • Live Sandbox
                  </span>
                  <h3 className="text-sm sm:text-base font-bold text-white leading-relaxed">
                    {currentQ.question}
                  </h3>
                </div>
                <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-800 border border-slate-700 text-slate-300 text-xs font-mono">
                  <FaClock className="text-amber-400" /> 00:45
                </div>
              </div>

              {/* Options Grid */}
              <div className="grid grid-cols-1 gap-2">
                {currentQ.options.map((opt, idx) => {
                  let btnStyle = "bg-slate-800/60 border-slate-700/80 text-slate-200 hover:bg-slate-800 hover:border-slate-600";
                  
                  if (selectedOption === idx) {
                    btnStyle = "bg-primary/20 border-primary text-white font-semibold";
                  }

                  if (isSubmitted) {
                    if (idx === currentQ.correctIndex) {
                      btnStyle = "bg-emerald-500/20 border-emerald-500 text-emerald-300 font-bold";
                    } else if (selectedOption === idx && idx !== currentQ.correctIndex) {
                      btnStyle = "bg-rose-500/20 border-rose-500 text-rose-300 font-bold";
                    }
                  }

                  return (
                    <button
                      key={idx}
                      onClick={() => handleSelectOption(idx)}
                      disabled={isSubmitted}
                      className={`w-full flex items-center justify-between p-3 rounded border text-left text-xs sm:text-sm transition-all duration-150 cursor-pointer ${btnStyle}`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-5 h-5 rounded bg-slate-800 flex items-center justify-center text-[11px] font-mono font-bold text-slate-400 border border-slate-700">
                          {String.fromCharCode(65 + idx)}
                        </span>
                        <span>{opt}</span>
                      </div>
                      
                      {isSubmitted && idx === currentQ.correctIndex && (
                        <div className="w-5 h-5 rounded bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xs">
                          <FaCheck />
                        </div>
                      )}
                      {isSubmitted && selectedOption === idx && idx !== currentQ.correctIndex && (
                        <div className="w-5 h-5 rounded bg-rose-500/20 text-rose-400 flex items-center justify-center text-xs">
                          <FaTimes />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Action Bar */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t border-slate-800">
                {!isSubmitted ? (
                  <button
                    onClick={handleSubmit}
                    disabled={selectedOption === null}
                    className={`w-full sm:w-auto px-5 py-2 rounded font-bold text-xs transition-all duration-150 cursor-pointer ${
                      selectedOption !== null
                        ? "bg-primary text-white shadow-xs hover:bg-primary-dark"
                        : "bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-750"
                    }`}
                  >
                    Submit Answer
                  </button>
                ) : (
                  <div className="flex items-center gap-2.5 w-full sm:w-auto">
                    <button
                      onClick={handleReset}
                      className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3.5 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition-colors border border-slate-700 cursor-pointer"
                    >
                      <FaRedo size={10} /> Retry Question
                    </button>
                    <Link
                      href="/auth/register"
                      className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-4 py-1.5 rounded bg-primary hover:bg-primary-dark text-white font-bold text-xs transition-all shadow-xs"
                    >
                      <span>Full Exam Suite</span>
                      <FaArrowRight size={10} />
                    </Link>
                  </div>
                )}

                {isSubmitted && (
                  <div className={`text-[11px] font-mono font-bold px-2.5 py-1 rounded border ${
                    selectedOption === currentQ.correctIndex
                      ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                      : "bg-rose-500/20 text-rose-400 border-rose-500/30"
                  }`}>
                    {selectedOption === currentQ.correctIndex ? "Correct Answer! (+1.0 Score)" : "Incorrect Option (0.0 Score)"}
                  </div>
                )}
              </div>

              {/* Explanation Card */}
              {isSubmitted && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  transition={{ duration: 0.2 }}
                  className="bg-slate-950/90 border border-slate-800 rounded p-3.5 sm:p-4 space-y-1.5 text-left"
                >
                  <div className="flex items-center gap-2 text-amber-400 font-mono font-bold text-xs uppercase tracking-wider">
                    <FaLightbulb /> Detailed Solution & Pedagogy
                  </div>
                  <p className="text-slate-300 text-xs leading-relaxed font-medium">
                    {currentQ.explanation}
                  </p>
                </motion.div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
};
