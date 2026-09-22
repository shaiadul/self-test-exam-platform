import React from "react";
import { FaTimes, FaBoxOpen, FaFileAlt } from "react-icons/fa";
import { User } from "../types";

interface EditExamLimitModalProps {
  user: User;
  limitValue: number;
  packLimitValue: number;
  savingLimit: boolean;
  onLimitChange: (val: number) => void;
  onPackLimitChange: (val: number) => void;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
}

export const EditExamLimitModal: React.FC<EditExamLimitModalProps> = ({
  user,
  limitValue,
  packLimitValue,
  savingLimit,
  onLimitChange,
  onPackLimitChange,
  onClose,
  onSubmit,
}) => {
  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded border border-slate-200/80 max-w-md w-full p-4 sm:p-6 shadow-2xl animate-fadeIn max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center pb-3 mb-4 border-b border-slate-100">
          <div>
            <h3 className="text-base font-black text-slate-900">Set Teacher Quotas</h3>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Configure curriculum pack and exam limits for {user.name}.
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition cursor-pointer"
          >
            <FaTimes />
          </button>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          {/* 1. Exam Pack Quota Section */}
          <div className="p-3.5 bg-blue-50/60 border border-blue-200/60 rounded space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-blue-900 font-bold text-xs">
                <FaBoxOpen className="text-blue-600 text-sm" />
                <span>Exam Pack Limit</span>
              </div>
              <span className="text-[11px] font-mono font-bold text-blue-700">
                Created: {user.createdPacksCount ?? 0} pack(s)
              </span>
            </div>
            <p className="text-[11px] text-slate-500">
              Maximum syllabus packages the teacher is permitted to publish (-1 = unlimited).
            </p>

            {/* Presets */}
            <div className="flex flex-wrap gap-1.5 font-mono">
              {[-1, 2, 3, 5, 10, 20].map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => onPackLimitChange(preset)}
                  className={`px-2 py-0.5 rounded text-xs font-bold border transition cursor-pointer ${
                    packLimitValue === preset
                      ? "bg-blue-600 text-white border-blue-600 shadow-2xs"
                      : "bg-white text-slate-700 border-slate-200 hover:border-blue-400"
                  }`}
                >
                  {preset === -1 ? "∞ Unlimited" : preset}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2 pt-0.5">
              <span className="text-xs text-slate-500 font-medium">Custom:</span>
              <input
                type="number"
                min={-1}
                max={999}
                value={packLimitValue}
                onChange={(e) => onPackLimitChange(parseInt(e.target.value) || 0)}
                className="w-24 border border-slate-200 rounded px-2 py-1 text-xs font-bold font-mono outline-none focus:border-blue-500 bg-white"
              />
            </div>
          </div>

          {/* 2. Total Exams Quota Section */}
          <div className="p-3.5 bg-violet-50/60 border border-violet-200/60 rounded space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-violet-900 font-bold text-xs">
                <FaFileAlt className="text-violet-600 text-sm" />
                <span>Exam Creation Limit</span>
              </div>
              <span className="text-[11px] font-mono font-bold text-violet-700">
                Created: {user.createdExamsCount ?? 0} exam(s)
              </span>
            </div>
            <p className="text-[11px] text-slate-500">
              Maximum total individual exams allowed across all packs (-1 = unlimited).
            </p>

            {/* Presets */}
            <div className="flex flex-wrap gap-1.5 font-mono">
              {[-1, 3, 5, 10, 20, 50].map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => onLimitChange(preset)}
                  className={`px-2 py-0.5 rounded text-xs font-bold border transition cursor-pointer ${
                    limitValue === preset
                      ? "bg-violet-600 text-white border-violet-600 shadow-2xs"
                      : "bg-white text-slate-700 border-slate-200 hover:border-violet-400"
                  }`}
                >
                  {preset === -1 ? "∞ Unlimited" : preset}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2 pt-0.5">
              <span className="text-xs text-slate-500 font-medium">Custom:</span>
              <input
                type="number"
                min={-1}
                max={999}
                value={limitValue}
                onChange={(e) => onLimitChange(parseInt(e.target.value) || 0)}
                className="w-24 border border-slate-200 rounded px-2 py-1 text-xs font-bold font-mono outline-none focus:border-violet-500 bg-white"
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
              className="flex-1 py-2 bg-primary hover:bg-primary-hover text-white font-bold text-xs rounded transition shadow-2xs cursor-pointer disabled:opacity-50 font-mono"
            >
              {savingLimit ? "Saving..." : "Commit Quotas"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
