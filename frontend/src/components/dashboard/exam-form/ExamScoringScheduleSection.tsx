import React from "react";
import { Input } from "../../ui/Input";
import DateTimePicker from "../../ui/DateTimePicker";
import { ExamFormData } from "./types";

interface ExamScoringScheduleSectionProps {
  data: ExamFormData;
  onChange: (data: Partial<ExamFormData>) => void;
}

export const ExamScoringScheduleSection: React.FC<ExamScoringScheduleSectionProps> = ({
  data,
  onChange,
}) => {
  return (
    <div className="bg-white p-5 rounded border border-slate-200/80 shadow-2xs space-y-4">
      <div className="border-b border-slate-100 pb-2.5 flex items-center justify-between">
        <div>
          <h2 className="text-xs sm:text-sm font-bold text-slate-900">
            Marks & Duration Settings
          </h2>
        </div>
        <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded bg-slate-100 text-slate-500 border border-slate-200">
          SCORING
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Input
          label="Total Marks"
          type="number"
          placeholder="100"
          value={data.totalMarks}
          onChange={(e) => onChange({ totalMarks: Number(e.target.value) })}
          min={1}
        />
        <Input
          label="Marks Per Question"
          type="number"
          placeholder="2"
          value={data.perQuestionMark}
          onChange={(e) => onChange({ perQuestionMark: Number(e.target.value) })}
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
