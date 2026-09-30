import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaCheckCircle } from "react-icons/fa";
import { PrimaryBtn } from "../../../../../../components/ui/PrimaryBtn";
import { OutlineBtn } from "../../../../../../components/ui/OutlineBtn";

interface ExamSubmitConfirmModalProps {
  isOpen: boolean;
  answeredCount: number;
  totalCount: number;
  reviewCount: number;
  isSubmitting: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

export const ExamSubmitConfirmModal: React.FC<ExamSubmitConfirmModalProps> = ({
  isOpen,
  answeredCount,
  totalCount,
  reviewCount,
  isSubmitting,
  onCancel,
  onConfirm,
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <motion.div
            initial={{ scale: 0.94, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.94, opacity: 0 }}
            className="bg-white max-w-md w-full rounded p-4 sm:p-6 border border-slate-200/80 shadow-2xl text-center space-y-4"
          >
            <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded flex items-center justify-center text-xl mx-auto border border-emerald-200">
              <FaCheckCircle />
            </div>

            <div className="space-y-1">
              <h3 className="text-lg font-bold text-slate-900">Confirm Exam Submission?</h3>
              <p className="text-xs text-slate-500 font-medium leading-relaxed">
                You have answered <strong className="text-primary font-bold">{answeredCount}</strong> of{" "}
                <strong className="text-slate-900 font-bold">{totalCount}</strong> questions.
                {reviewCount > 0 && (
                  <span className="block text-review font-bold mt-1">
                    ⚠️ You still have {reviewCount} question(s) marked for review.
                  </span>
                )}
              </p>
            </div>

            <div className="flex flex-col-reverse sm:flex-row gap-2.5 pt-2">
              <OutlineBtn
                type="button"
                onClick={onCancel}
                className="w-full sm:flex-1 !text-xs !py-2.5 !rounded"
              >
                Keep Reviewing
              </OutlineBtn>
              <PrimaryBtn
                onClick={onConfirm}
                disabled={isSubmitting}
                className="w-full sm:flex-1 !text-xs !py-2.5 !rounded gap-1.5"
              >
                {isSubmitting ? "Submitting..." : "Confirm & Submit"}
              </PrimaryBtn>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
