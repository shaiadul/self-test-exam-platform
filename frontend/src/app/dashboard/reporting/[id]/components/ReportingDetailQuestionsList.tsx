import React from "react";
import Image from "next/image";
import { FaLightbulb } from "react-icons/fa";
import { QuestionItem } from "../types";

interface ReportingDetailQuestionsListProps {
  questions: QuestionItem[];
  userAnswersMap: Record<string, any>;
}

export const ReportingDetailQuestionsList: React.FC<ReportingDetailQuestionsListProps> = ({
  questions,
  userAnswersMap,
}) => {
  if (!questions || questions.length === 0) return null;

  return (
    <div className="bg-white p-4 sm:p-6 rounded border border-slate-200/80 shadow-2xs space-y-6">
      <div className="border-b border-slate-100 pb-4">
        <h3 className="text-xl font-black text-slate-900 tracking-tight">
          Question Analysis & Detailed Solutions
        </h3>
        <p className="text-xs text-slate-500 font-medium mt-1">
          Inspect your responses, correct answers, and solution breakdowns.
        </p>
      </div>

      <div className="space-y-6">
        {questions.map((q, idx) => {
          const userSelected = userAnswersMap[q.id.toString()];
          const isUnanswered =
            userSelected === undefined || userSelected === null || userSelected === "";

          // Determine if an option index/string matches the correct answer
          const isOptionCorrect = (opt: string, optIdx: number) => {
            if (q.correctAnswer && opt === q.correctAnswer) return true;
            if (q.options && q.correctAnswer && optIdx === q.options.indexOf(q.correctAnswer))
              return true;
            if (q.correctIndex !== undefined && optIdx === q.correctIndex) return true;
            return false;
          };

          // Determine if user selected this option
          const isOptionUserSelected = (opt: string, optIdx: number) => {
            if (isUnanswered) return false;
            if (userSelected === opt) return true;
            if (Number(userSelected) === optIdx) return true;
            return false;
          };

          // Check overall question correctness
          const isCorrect =
            !isUnanswered &&
            (userSelected === q.correctAnswer ||
              (q.options &&
                q.correctAnswer &&
                Number(userSelected) === q.options.indexOf(q.correctAnswer)) ||
              (q.correctIndex !== undefined && Number(userSelected) === q.correctIndex));

          const questionTitle = q.questionText || q.text || `Question ${idx + 1}`;

          return (
            <div
              key={q.id || idx}
              className={`p-4 sm:p-5 rounded border transition-all ${
                isCorrect
                  ? "bg-emerald-50/30 border-emerald-200"
                  : isUnanswered
                  ? "bg-slate-50/60 border-slate-200"
                  : "bg-rose-50/30 border-rose-200"
              }`}
            >
              <div className="flex items-start justify-between gap-4 mb-3">
                <h4 className="font-bold text-slate-900 text-sm sm:text-base leading-snug">
                  Q{idx + 1}. {questionTitle}
                </h4>
                <span
                  className={`shrink-0 px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase border ${
                    isCorrect
                      ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                      : isUnanswered
                      ? "bg-slate-100 text-slate-600 border border-slate-200"
                      : "bg-rose-100 text-rose-800 border border-rose-200"
                  }`}
                >
                  {isCorrect
                    ? "✓ Correct"
                    : isUnanswered
                    ? "Not Answered"
                    : "✕ Incorrect"}
                </span>
              </div>

              {/* Passage text if any */}
              {q.passage && (
                <div className="mb-4 p-3.5 bg-white border border-slate-200 rounded text-xs text-slate-700 leading-relaxed font-serif">
                  <strong className="block text-slate-900 font-sans font-bold text-[11px] uppercase tracking-wider mb-1">
                    Reference Passage:
                  </strong>
                  {q.passage}
                </div>
              )}

              {/* Picture if any */}
              {q.pictureUrl && (
                <div className="relative w-full max-w-sm h-48 rounded overflow-hidden mb-4 border border-slate-200">
                  <Image
                    src={q.pictureUrl}
                    alt="Question Illustration"
                    fill
                    className="object-cover"
                  />
                </div>
              )}

              {/* Options list */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 my-3">
                {q.options &&
                  q.options.map((opt: string, optIdx: number) => {
                    const optionIsCorrect = isOptionCorrect(opt, optIdx);
                    const optionIsChosen = isOptionUserSelected(opt, optIdx);

                    return (
                      <div
                        key={optIdx}
                        className={`p-3 rounded text-xs font-semibold flex items-center justify-between gap-2 border transition ${
                          optionIsCorrect
                            ? "bg-emerald-100 border-emerald-300 text-emerald-900 font-bold"
                            : optionIsChosen
                            ? "bg-rose-100 border-rose-300 text-rose-900"
                            : "bg-slate-50/50 border-slate-200 text-slate-700"
                        }`}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="w-5 h-5 rounded-full bg-white border border-slate-200 flex items-center justify-center text-[10px] font-mono shrink-0 font-bold text-slate-600">
                            {String.fromCharCode(65 + optIdx)}
                          </span>
                          <span className="truncate">{opt}</span>
                        </div>

                        {optionIsCorrect && (
                          <span className="text-[10px] text-emerald-700 font-bold shrink-0">
                            ✓ Correct
                          </span>
                        )}
                        {!optionIsCorrect && optionIsChosen && (
                          <span className="text-[10px] text-rose-600 font-bold shrink-0">
                            ✕ Your Pick
                          </span>
                        )}
                      </div>
                    );
                  })}
              </div>

              {/* Solution Explanation */}
              {q.explanation && (
                <div className="mt-3 p-3.5 bg-amber-50/70 border border-amber-200/80 rounded text-xs text-amber-950 flex items-start gap-2">
                  <FaLightbulb className="text-amber-500 shrink-0 text-sm mt-0.5" />
                  <div>
                    <strong className="block font-bold text-amber-900 mb-0.5">
                      Solution Explanation:
                    </strong>
                    <p className="leading-relaxed">{q.explanation}</p>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
