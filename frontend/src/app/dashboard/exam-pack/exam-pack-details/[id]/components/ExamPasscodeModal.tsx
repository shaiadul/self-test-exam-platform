import React from "react";
import { FaLock, FaKey } from "react-icons/fa";
import { PageContainer } from "../../../../../../components/common/PageContainer";
import { Input } from "../../../../../../components/ui/Input";
import { PrimaryBtn } from "../../../../../../components/ui/PrimaryBtn";
import { OutlineBtn } from "../../../../../../components/ui/OutlineBtn";

interface ExamPasscodeModalProps {
  title: string;
  enteredPasscode: string;
  passcodeError: string;
  verifyingPasscode: boolean;
  onPasscodeChange: (val: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
}

export const ExamPasscodeModal: React.FC<ExamPasscodeModalProps> = ({
  title,
  enteredPasscode,
  passcodeError,
  verifyingPasscode,
  onPasscodeChange,
  onSubmit,
  onCancel,
}) => {
  return (
    <PageContainer className="max-w-md mx-auto py-8 sm:py-16 px-4">
      <div className="bg-white rounded p-4 sm:p-7 border border-slate-200/80 shadow-xs text-center space-y-4">
        <div className="w-12 h-12 bg-primary/10 text-primary rounded flex items-center justify-center text-xl mx-auto border border-primary/20">
          <FaLock />
        </div>

        <div className="space-y-1">
          <span className="px-2 py-0.5 bg-rose-50 text-rose-700 font-mono font-bold text-[10px] rounded uppercase tracking-wider border border-rose-200">
            Passcode Protected
          </span>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">{title}</h1>
          <p className="text-xs text-slate-500 font-medium leading-relaxed">
            This is a private examination. Enter your student access passcode provided by the instructor to proceed.
          </p>
        </div>

        <form onSubmit={onSubmit} className="space-y-4 text-left pt-1">
          <Input
            label="Exam Access Passcode"
            type="password"
            icon={<FaKey />}
            placeholder="Enter passcode to unlock"
            value={enteredPasscode}
            onChange={(e) => onPasscodeChange(e.target.value)}
            error={passcodeError}
            autoFocus
          />

          <div className="flex gap-2.5 pt-2">
            <OutlineBtn
              type="button"
              onClick={onCancel}
              className="flex-1 !text-xs !py-2.5 !rounded"
            >
              Cancel
            </OutlineBtn>
            <PrimaryBtn
              type="submit"
              disabled={verifyingPasscode}
              className="flex-1 !text-xs !py-2.5 !rounded shadow-xs disabled:opacity-50"
            >
              {verifyingPasscode ? "Verifying..." : "Unlock Exam"}
            </PrimaryBtn>
          </div>
        </form>
      </div>
    </PageContainer>
  );
};
