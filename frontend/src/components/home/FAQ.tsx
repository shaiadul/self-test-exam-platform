"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaChevronDown, FaQuestionCircle } from "react-icons/fa";

const faqs = [
  {
    question: "Is Self Test free to use for students?",
    answer: "Yes! Students can sign up and access our public mock exams, automated instant scorecards, and interactive practice question sets completely free.",
  },
  {
    question: "How does the instant evaluation and scoring engine work?",
    answer: "When you submit a mock test, our assessment engine instantly evaluates your choices against validated answer keys, calculating weighted scores, negative markings (if enabled), percentage accuracy, and time spent per question in seconds.",
  },
  {
    question: "Can I take exams on mobile phones or tablets?",
    answer: "Absolutely! Self Test is built with a responsive interface designed for smartphones, tablets, laptops, and desktop workstations. Your test progress auto-syncs continuously.",
  },
  {
    question: "How do performance analytics help me study better?",
    answer: "Instead of just giving a final percentage, Self Test breaks down your performance by subject sub-topic, pacing per question, and accuracy history over time. You get instant recommendations on exactly which topics to review.",
  },
  {
    question: "Are solution explanations provided after completing a test?",
    answer: "Yes! Every assessment includes detailed step-by-step solutions, key formulas, and pedagogical explanations for every single question so you learn while practicing.",
  },
];

export const FAQ = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section id="faq" className="w-full py-20 sm:py-28 bg-white relative">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-14 sm:mb-20 space-y-4">
          <span className="text-xs text-primary font-bold uppercase tracking-widest bg-primary/10 border border-primary/20 px-3.5 py-1.5 rounded-full inline-flex items-center gap-1.5">
            <FaQuestionCircle /> Frequently Asked Questions
          </span>
          <h2 className="text-2xl sm:text-4xl font-black text-gray-900 tracking-tight">
            Got Questions? We&apos;ve Got Answers
          </h2>
          <p className="text-gray-500 font-medium text-sm sm:text-base leading-relaxed">
            Everything you need to know about preparing with Self Test.
          </p>
        </div>

        {/* FAQ Accordion List */}
        <div className="space-y-4">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <div
                key={index}
                className={`border rounded-2xl transition-all duration-200 overflow-hidden ${
                  isOpen
                    ? "border-primary/40 bg-orange-50/30 shadow-md"
                    : "border-gray-200 bg-white hover:border-gray-300"
                }`}
              >
                <button
                  onClick={() => toggleFAQ(index)}
                  className="w-full p-5 sm:p-6 text-left flex items-center justify-between gap-4 font-bold text-gray-900 text-base sm:text-lg focus:outline-none"
                >
                  <span>{faq.question}</span>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs transition-transform duration-300 shrink-0 ${
                    isOpen ? "bg-primary text-white rotate-180" : "bg-gray-100 text-gray-500"
                  }`}>
                    <FaChevronDown />
                  </div>
                </button>

                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className="px-5 pb-6 sm:px-6 sm:pb-6 text-gray-600 text-sm font-medium leading-relaxed border-t border-orange-100/60 pt-4">
                        {faq.answer}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
