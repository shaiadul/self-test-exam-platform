import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaExclamationTriangle } from "react-icons/fa";
import { PrimaryBtn } from "../../../../../../components/ui/PrimaryBtn";

interface ExamSecurityModalProps {
  isOpen: boolean;
  warnings: number;
  currentWarningMsg: string;
  onResumeFullscreen: () => void;
}

export const ExamSecurityModal: React.FC<ExamSecurityModalProps> = ({
  isOpen,
  warnings,
  currentWarningMsg,
  onResumeFullscreen,
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <motion.div
            initial={{ scale: 0.92, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.92, opacity: 0 }}
            className="bg-white max-w-md w-full rounded p-4 sm:p-6 border-2 border-rose-500 shadow-2xl text-center space-y-4"
          >
            <div className="w-12 h-12 bg-rose-100 text-rose-600 rounded flex items-center justify-center text-xl mx-auto border border-rose-200 animate-bounce">
              <FaExclamationTriangle />
            </div>

            <div className="space-y-1">
              <span className="px-2 py-0.5 bg-rose-100 text-rose-700 font-mono font-bold text-[10px] rounded uppercase tracking-wider">
                Security Strike #{warnings} of 3
              </span>
              <h3 className="text-lg font-bold text-slate-900 pt-1">
                Proctor Alert: Focus Lost!
              </h3>
              <p className="text-xs text-rose-600 font-bold">{currentWarningMsg}</p>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed font-medium">
              Leaving the exam window, switching applications, or exiting fullscreen violates testing integrity.
              {warnings >= 3 ? (
                <span className="block font-bold text-rose-600 mt-1">
                  Maximum limit reached! Auto-submitting exam now.
                </span>
              ) : (
                <span className="block font-bold text-slate-900 mt-1">
                  You have {3 - warnings} warning(s) remaining before immediate disqualification.
                </span>
              )}
            </p>

            {warnings < 3 ? (
              <PrimaryBtn
                onClick={onResumeFullscreen}
                className="w-full !py-2 !text-xs !rounded !from-rose-600 !to-primary"
              >
                I Understand & Resume Fullscreen
              </PrimaryBtn>
            ) : (
              <button
                disabled
                className="w-full py-2 bg-rose-600 text-white font-bold text-xs rounded opacity-80"
              >
                Submitting Exam Now...
              </button>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
