import React from "react";
import { motion } from "framer-motion";
import EmptyState from "../../../../../components/common/EmptyState";
import { Question } from "../types";

interface QuestionBankListProps {
  questions: Question[];
  onEdit: (q: Question) => void;
  onDelete: (q: Question) => void;
}

export const QuestionBankList: React.FC<QuestionBankListProps> = ({
  questions,
  onEdit,
  onDelete,
}) => {
  return (
    <div className="lg:col-span-5 bg-white p-3.5 sm:p-4 rounded border border-slate-200/80 shadow-2xs space-y-3">
      <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
        <div>
          <h3 className="text-xs sm:text-sm font-bold text-slate-900">
            Authored Items ({questions.length})
          </h3>
        </div>
      </div>

      <div className="space-y-2.5 max-h-[650px] overflow-y-auto custom-scrollbar pr-1">
        {questions.map((q, idx) => (
          <motion.div
            key={q.id || idx}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-3 rounded border border-slate-200/80 bg-slate-50/50 space-y-2 text-xs hover:border-slate-300 transition-colors"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-1.5">
                <span className="font-mono font-bold text-slate-500 text-[11px] bg-slate-200/80 px-1 py-0.2 rounded">
                  Q-{String(idx + 1).padStart(2, "0")}
                </span>
                <span className="font-bold text-slate-900 line-clamp-1">
                  {q.questionText}
                </span>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <span className="text-[9px] font-mono font-bold uppercase px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 border border-slate-200">
                  {q.type}
                </span>
                <button
                  type="button"
                  title="Edit question"
                  onClick={() => onEdit(q)}
                  className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold text-blue-700 bg-blue-50 border border-blue-200 hover:bg-blue-100 transition cursor-pointer"
                >
                  Edit
                </button>
                <button
                  type="button"
                  title="Delete question"
                  onClick={() => onDelete(q)}
                  className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold text-rose-700 bg-rose-50 border border-rose-200 hover:bg-rose-100 transition cursor-pointer"
                >
                  Del
                </button>
              </div>
            </div>

            <div className="space-y-0.5 text-[11px] text-slate-600 pl-1 font-mono">
              {q.options &&
                q.options.map((opt, oIdx) => (
                  <div
                    key={oIdx}
                    className={
                      opt === q.correctAnswer
                        ? "font-bold text-emerald-700 flex items-center gap-1"
                        : "text-slate-500"
                    }
                  >
                    [{String.fromCharCode(65 + oIdx)}] {opt}{" "}
                    {opt === q.correctAnswer && "✓"}
                  </div>
                ))}
            </div>
          </motion.div>
        ))}

        {questions.length === 0 && (
          <EmptyState
            compact
            type="exam"
            title="No Authored Questions"
            description="This paper has no questions authored yet. Compose questions using the creator tool."
          />
        )}
      </div>
    </div>
  );
};
