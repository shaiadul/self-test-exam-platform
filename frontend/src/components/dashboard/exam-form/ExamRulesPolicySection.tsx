import React from "react";
import { FaExclamationTriangle } from "react-icons/fa";
import { Input } from "../../ui/Input";
import ToggleSwitch from "../../ui/ToggleSwitch";
import { ExamSettingsData } from "./types";

interface ExamRulesPolicySectionProps {
  settings: ExamSettingsData;
  onChange: (settings: Partial<ExamSettingsData>) => void;
}

export const ExamRulesPolicySection: React.FC<ExamRulesPolicySectionProps> = ({
  settings,
  onChange,
}) => {
  return (
    <div className="bg-white p-5 rounded border border-slate-200/80 shadow-2xs space-y-4">
      <div className="border-b border-slate-100 pb-2.5 flex items-center justify-between">
        <div>
          <h2 className="text-xs sm:text-sm font-bold text-slate-900">
            Negative Marking & Behavioral Rules
          </h2>
        </div>
        <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded bg-slate-100 text-slate-500 border border-slate-200">
          POLICY
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <ToggleSwitch
          label="Negative Marking"
          checked={settings.negativeMarking}
          onChange={(val) => onChange({ negativeMarking: val })}
        />
        <ToggleSwitch
          label="Question Randomization"
          checked={settings.randomization}
          onChange={(val) => onChange({ randomization: val })}
        />
        <ToggleSwitch
          label="Instant Feedback"
          checked={settings.feedback}
          onChange={(val) => onChange({ feedback: val })}
        />
      </div>

      {/* Enhanced Negative Marking Value Section */}
      {settings.negativeMarking && (
        <div className="p-3.5 bg-amber-50/60 rounded border border-amber-200 space-y-2.5">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
            <FaExclamationTriangle className="text-amber-600 text-xs" />
            <span>Negative Mark Deduction Per Wrong Answer</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
            <Input
              type="number"
              step="0.05"
              min="0.05"
              max="10"
              placeholder="e.g. 0.25 or 0.50"
              value={settings.negativeValue}
              onChange={(e) =>
                onChange({
                  negativeValue: Math.abs(parseFloat(e.target.value)) || 0,
                })
              }
            />

            {/* Quick Selection Pills */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[11px] font-mono text-slate-500">
                PRESETS:
              </span>
              {[0.25, 0.5, 0.75, 1.0].map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => onChange({ negativeValue: preset })}
                  className={`px-2.5 py-1 rounded text-[11px] font-mono font-bold border transition cursor-pointer ${
                    settings.negativeValue === preset
                      ? "bg-primary text-white border-primary shadow-2xs"
                      : "bg-white text-slate-700 border-slate-200 hover:border-primary/50"
                  }`}
                >
                  -{preset.toFixed(2)}
                </button>
              ))}
            </div>
          </div>

          <p className="text-[11px] text-slate-500">
            For every incorrect answer,{" "}
            <span className="font-mono font-bold text-amber-700">
              {settings.negativeValue || 0} marks
            </span>{" "}
            will be deducted from the candidate&apos;s total score.
          </p>
        </div>
      )}

      {/* Access Control */}
      <div className="pt-2 border-t border-slate-100">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
          <ToggleSwitch
            label="Private Exam (Requires Passcode)"
            checked={settings.privateExam}
            onChange={(val) => onChange({ privateExam: val })}
          />
          {settings.privateExam && (
            <Input
              label="Exam Passcode"
              type="password"
              placeholder="Enter access passcode"
              value={settings.privatePassword || ""}
              onChange={(e) => onChange({ privatePassword: e.target.value })}
            />
          )}
        </div>
      </div>
    </div>
  );
};
