import React from "react";
import { Input } from "../../ui/Input";
import CustomSelect from "../../ui/CustomSelect";
import ImageUploader from "../../ui/ImageUploader";
import { ExamFormData } from "./types";

interface ExamBasicDetailsSectionProps {
  data: ExamFormData;
  onChange: (data: Partial<ExamFormData>) => void;
  levelOptions: string[];
  batchOptions: string[];
}

export const ExamBasicDetailsSection: React.FC<ExamBasicDetailsSectionProps> = ({
  data,
  onChange,
  levelOptions,
  batchOptions,
}) => {
  return (
    <div className="bg-white p-3.5 sm:p-5 rounded border border-slate-200/80 shadow-2xs space-y-4">
      <div className="border-b border-slate-100 pb-2.5 flex items-center justify-between">
        <div>
          <h2 className="text-xs sm:text-sm font-bold text-slate-900">
            Exam Details & Classification
          </h2>
        </div>
        <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded bg-slate-100 text-slate-500 border border-slate-200">
          REQUIRED
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Exam Title *"
          placeholder="e.g. Higher Math Chapter 3 Mock Test"
          value={data.name}
          onChange={(e) => onChange({ name: e.target.value })}
          required
        />
        <Input
          label="Brief Instructions or Syllabus"
          placeholder="e.g. Vectors & Matrices (30 MCQs)"
          value={data.details}
          onChange={(e) => onChange({ details: e.target.value })}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <CustomSelect
          label="Target Level"
          options={
            levelOptions.length
              ? levelOptions
              : ["Class 10", "HSC", "Admission", "University"]
          }
          value={data.level}
          onChange={(val) => onChange({ level: val })}
          placeholder="Select Level"
        />
        <CustomSelect
          label="Target Batch"
          options={
            batchOptions.length
              ? batchOptions
              : ["2024", "2025", "2026", "2027"]
          }
          value={data.batch}
          onChange={(val) => onChange({ batch: val })}
          placeholder="Select Batch"
        />
      </div>

      {/* Banner Upload */}
      <div className="pt-1">
        <ImageUploader
          label="Exam Thumbnail (Optional)"
          folder="exams"
          height="h-44"
          value={data.image}
          onChange={(url) => onChange({ image: url || "" })}
          description="Recommended ratio 16:9 for clean card displays."
        />
      </div>
    </div>
  );
};
