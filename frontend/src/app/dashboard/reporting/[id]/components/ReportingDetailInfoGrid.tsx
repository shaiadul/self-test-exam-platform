import React from "react";
import { formatDate, DATE_FORMATS } from "@/lib/date";

interface ReportingDetailInfoGridProps {
  attempt: {
    examName?: string;
    packName?: string;
    examId?: string | number;
    createdAt?: string | Date;
  };
}

const InfoItem: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div className="bg-slate-50 border border-slate-200/80 rounded p-3.5">
    <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block mb-1">
      {label}
    </span>
    <p className="font-bold text-xs sm:text-sm text-slate-800 truncate">{value}</p>
  </div>
);

export const ReportingDetailInfoGrid: React.FC<ReportingDetailInfoGridProps> = ({ attempt }) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-white p-3.5 sm:p-5 rounded border border-slate-200/80 shadow-2xs">
      <InfoItem label="Exam Title" value={attempt.examName || "N/A"} />
      <InfoItem label="Exam Pack" value={attempt.packName || "General Pack"} />
      <InfoItem label="Exam Code" value={`#${attempt.examId || "N/A"}`} />
      <InfoItem
        label="Submitted At"
        value={formatDate(attempt.createdAt, DATE_FORMATS.DATE_MEDIUM, "N/A")}
      />
    </div>
  );
};
