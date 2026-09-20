import React from "react";
import { Input } from "../../ui/Input";
import DateTimePicker from "../../ui/DateTimePicker";
import { ExamFormData } from "./types";

interface ExamScoringScheduleSectionProps {
  data: ExamFormData;
  onChange: (data: Partial<ExamFormData>) => void;
  questionCount?: number;
  negativeMarking?: boolean;
  negativeValue?: number;
}

export const ExamScoringScheduleSection: React.FC<ExamScoringScheduleSectionProps> = ({
  data,
  onChange,
  questionCount = 0,
  negativeMarking = false,
  negativeValue = 0,
}) => {
  const perQ = Number(data.perQuestionMark) > 0 ? Number(data.perQuestionMark) : 1;
  const passPercent = Number(data.passMark) > 0 ? Number(data.passMark) : 33;
  const calculatedTotalMarks = questionCount * perQ;
  const passingScore = calculatedTotalMarks > 0 ? ((calculatedTotalMarks * passPercent) / 100).toFixed(1) : "0";

  return (
    <div className="bg-white p-5 rounded border border-slate-200/80 shadow-2xs space-y-4">
      <div className="border-b border-slate-100 pb-2.5 flex items-center justify-between">
        <div>
          <h2 className="text-xs sm:text-sm font-bold text-slate-900">
            Marks & Schedule Configuration
          </h2>
        </div>
        <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded bg-slate-100 text-slate-500 border border-slate-200">
          SCORING & TIMING
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        {/* Dynamic Total Marks Display - NO Manual Input */}
        <div className="flex flex-col justify-between p-3 rounded bg-slate-50 border border-slate-200">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-700">Total Marks</span>
            <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-blue-100 text-blue-700 border border-blue-200">
              CALCULATED
            </span>
          </div>
          <div className="my-1">
            <span className="text-2xl font-mono font-black text-slate-900">
              {questionCount > 0 ? calculatedTotalMarks : "--"}
            </span>
            <span className="text-xs text-slate-500 font-mono ml-1">marks</span>
          </div>
          <p className="text-[10px] text-slate-500 font-mono leading-tight">
            {questionCount > 0
              ? `${questionCount} Qs × ${perQ} mark${perQ > 1 ? "s" : ""}`
              : `Auto: Question Count × ${perQ} mark/Q`}
          </p>
        </div>

        <Input
          label="Marks Per Question"
          type="number"
          placeholder="2"
          value={data.perQuestionMark}
          onChange={(e) => {
            const val = Math.max(1, Number(e.target.value));
            onChange({
              perQuestionMark: val,
              totalMarks: questionCount * val,
            });
          }}
          min={1}
        />
        <Input
          label="Pass Mark (%)"
          type="number"
          placeholder="33"
          value={data.passMark}
          onChange={(e) => onChange({ passMark: Number(e.target.value) })}
          min={1}
          max={100}
        />
        <Input
          label="Duration (Minutes)"
          type="number"
          placeholder="30"
          value={data.durationMinutes}
          onChange={(e) => onChange({ durationMinutes: Number(e.target.value) })}
          min={1}
        />
      </div>

      {/* Comprehensive Mark Distribution Summary */}
      <div className="p-3.5 bg-slate-50/70 rounded border border-slate-200 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-600">
            Live Mark Distribution
          </span>
          <span className="text-[11px] font-mono text-slate-500">
            Registered Questions: <strong className="text-slate-800 font-bold">{questionCount}</strong>
          </span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs font-mono">
          <div className="bg-white p-2.5 rounded border border-slate-200">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Credit / Question</span>
            <span className="text-sm font-black text-emerald-600">+{perQ} marks</span>
          </div>
          <div className="bg-white p-2.5 rounded border border-slate-200">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Maximum Total</span>
            <span className="text-sm font-black text-slate-800">
              {questionCount > 0 ? `${calculatedTotalMarks} marks` : `${perQ} mark/Q (Pending Qs)`}
            </span>
          </div>
          <div className="bg-white p-2.5 rounded border border-slate-200">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Pass Threshold ({passPercent}%)</span>
            <span className="text-sm font-black text-blue-600">
              {questionCount > 0 ? `${passingScore} marks` : `${passPercent}% of total`}
            </span>
          </div>
          <div className="bg-white p-2.5 rounded border border-slate-200">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Wrong Penalty</span>
            <span className={`text-sm font-black ${negativeMarking ? "text-rose-600" : "text-slate-400"}`}>
              {negativeMarking ? `-${Number(negativeValue || 0.5).toFixed(2)} marks` : "None (0.00)"}
            </span>
          </div>
        </div>
      </div>

      {/* Schedule */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
        <DateTimePicker
          label="Exam Start Date & Time *"
          value={data.startDate}
          onChange={(val) => onChange({ startDate: val })}
        />
        <DateTimePicker
          label="Exam End Date & Time *"
          value={data.endDate}
          onChange={(val) => onChange({ endDate: val })}
        />
      </div>
    </div>
  );
};
