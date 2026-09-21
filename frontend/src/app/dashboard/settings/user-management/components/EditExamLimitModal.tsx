import React from "react";
import { FaTimes } from "react-icons/fa";
import { User } from "../types";

interface EditExamLimitModalProps {
  user: User;
  limitValue: number;
  savingLimit: boolean;
  onLimitChange: (val: number) => void;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
}

export const EditExamLimitModal: React.FC<EditExamLimitModalProps> = ({
  user,
  limitValue,
  savingLimit,
  onLimitChange,
  onClose,
  onSubmit,
}) => {
  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded border border-slate-200/80 max-w-sm w-full p-3.5 sm:p-5 shadow-2xl animate-fadeIn">
        <div className="flex justify-between items-center pb-3 mb-4 border-b border-slate-100">
          <div>
            <h3 className="text-base font-black text-slate-900">Set Exam Creation Limit</h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition cursor-pointer"
          >
            <FaTimes />
          </button>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          <div className="bg-slate-50 border border-slate-200/80 rounded p-2.5 text-xs text-slate-700 font-mono">
            Teacher: <span className="font-bold text-slate-900">{user.name}</span>
            <br />
            Currently created: <span className="font-bold text-primary">{user.createdExamsCount ?? 0} exam(s)</span>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1.5">
              Maximum Exams Allowed <span className="text-slate-400 font-normal">(-1 = unlimited)</span>
            </label>

            {/* Quick presets */}
            <div className="flex flex-wrap gap-1.5 mb-3 font-mono">
              {[-1, 3, 5, 10, 20, 50].map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => onLimitChange(preset)}
                  className={`px-2.5 py-1 rounded text-xs font-bold border transition cursor-pointer ${
                    limitValue === preset
                      ? "bg-violet-600 text-white border-violet-600 shadow-2xs"
                      : "bg-slate-50 text-slate-700 border-slate-200 hover:border-violet-400 hover:text-violet-600"
                  }`}
                >
                  {preset === -1 ? "∞ Unlimited" : preset}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 font-medium">Custom:</span>
              <input
                type="number"
                min={-1}
                max={999}
                value={limitValue}
                onChange={(e) => onLimitChange(parseInt(e.target.value) || 0)}
                className="w-24 border border-slate-200 rounded px-2.5 py-1.5 text-xs font-bold font-mono outline-none focus:border-violet-500 transition"
              />
            </div>
          </div>

          <div className="flex gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={savingLimit}
              className="flex-1 py-2 bg-violet-600 hover:bg-violet-700 text-white font-bold text-xs rounded transition shadow-2xs cursor-pointer disabled:opacity-50 font-mono"
            >
              {savingLimit ? "Saving..." : "Commit Quota"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
