"use client";

import React, { useState } from "react";
import { toast } from "sonner";
import { FaArrowLeft, FaSave } from "react-icons/fa";
import { PrimaryBtn } from "../../../../../components/ui/PrimaryBtn";
import { OutlineBtn } from "../../../../../components/ui/OutlineBtn";
import { PageContainer } from "../../../../../components/common/PageContainer";
import { updateExamAction } from "../../../../../lib/actions";
import { useRouter } from "next/navigation";
import { ExamFormData, ExamSettingsData } from "../../../../../components/dashboard/exam-form/types";
import { ExamBasicDetailsSection } from "../../../../../components/dashboard/exam-form/ExamBasicDetailsSection";
import { ExamScoringScheduleSection } from "../../../../../components/dashboard/exam-form/ExamScoringScheduleSection";
import { ExamRulesPolicySection } from "../../../../../components/dashboard/exam-form/ExamRulesPolicySection";

interface EditExamClientViewProps {
  packId: number;
  examId: string;
  initialAssets: any[];
  initialExam: any;
}

export default function EditExamClientView({
  packId,
  examId,
  initialAssets,
  initialExam,
}: EditExamClientViewProps) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);

  const levelOptions = (initialAssets || [])
    .filter((a: any) => a.type === "level")
    .map((a: any) => a.value);
  const batchOptions = (initialAssets || [])
    .filter((a: any) => a.type === "batch")
    .map((a: any) => a.value);

  const formatDateTime = (dateStr: string) => {
    if (!dateStr) return "";
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      return d.toISOString();
    } catch {
      return dateStr;
    }
  };

  const hasNegative =
    initialExam?.negativeMarks !== undefined
      ? Math.abs(Number(initialExam.negativeMarks)) > 0
      : (initialExam?.negativeMarking ?? true);

  const negativeVal =
    initialExam?.negativeMarks !== undefined &&
    Number(initialExam.negativeMarks) !== 0
      ? Math.abs(Number(initialExam.negativeMarks))
      : Number(initialExam?.negativeValue) || 0.5;

  const [examPackData, setExamPackData] = useState<ExamFormData>({
    name: initialExam?.name || "",
    details: initialExam?.details || "",
    level: initialExam?.level || levelOptions[0] || "HSC",
    batch: initialExam?.batch || batchOptions[0] || "2024",
    image: initialExam?.image || "",
    totalMarks: initialExam?.totalMarks || 100,
    perQuestionMark:
      initialExam?.perQuestionMarks || initialExam?.perQuestionMark || 2,
    passMark: initialExam?.passingMarks || initialExam?.passMark || 33,
    durationMinutes:
      initialExam?.durationMinutes || initialExam?.duration || 30,
    startDate: formatDateTime(initialExam?.startDate || ""),
    endDate: formatDateTime(initialExam?.endDate || ""),
  });

  const [examSettings, setExamSettings] = useState<ExamSettingsData>({
    randomization: initialExam?.randomization ?? false,
    feedback: initialExam?.feedback ?? true,
    negativeMarking: hasNegative,
    negativeValue: negativeVal,
    privateExam: initialExam?.privateExam ?? false,
    privatePassword: initialExam?.privatePassword || "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!examPackData.name.trim()) {
      toast.error("Please enter an exam title.");
      return;
    }
    if (!examPackData.startDate) {
      toast.error("Please select an exam start date & time.");
      return;
    }
    if (!examPackData.endDate) {
      toast.error("Please select an exam end date & time.");
      return;
    }

    const start = new Date(examPackData.startDate);
    const end = new Date(examPackData.endDate);
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      toast.error("Please enter valid start and end dates.");
      return;
    }
    if (end <= start) {
      toast.error("Exam end date must be after the start date.");
      return;
    }

    if (
      Number(examPackData.passMark) <= 0 ||
      Number(examPackData.passMark) > 100
    ) {
      toast.error("Pass mark percentage must be between 1 and 100.");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        name: examPackData.name.trim(),
        details: examPackData.details.trim(),
        level: examPackData.level,
        batch: examPackData.batch,
        totalMarks: Number(examPackData.totalMarks) || 100,
        passingMarks: Number(examPackData.passMark) || 33,
        passMark: Number(examPackData.passMark) || 33,
        perQuestionMarks: Number(examPackData.perQuestionMark) || 2,
        perQuestionMark: Number(examPackData.perQuestionMark) || 2,
        startDate: start.toISOString(),
        endDate: end.toISOString(),
        durationMinutes: Number(examPackData.durationMinutes) || 30,

        randomization: examSettings.randomization,
        feedback: examSettings.feedback,
        negativeMarking: examSettings.negativeMarking,
        negativeMarks: examSettings.negativeMarking
          ? Number(examSettings.negativeValue) || 0.5
          : 0,
        negativeValue: examSettings.negativeMarking
          ? Number(examSettings.negativeValue) || 0.5
          : 0,
        privateExam: examSettings.privateExam,
        privatePassword: examSettings.privatePassword,
      };

      const res = await updateExamAction(examId, packId, payload);
      if (res.success) {
        toast.success("Exam updated successfully!");
        router.push(`/dashboard/manage-exam-pack/${packId}`);
      } else {
        toast.error(res.error || "Failed to update exam.");
      }
    } catch {
      toast.error("Failed to update exam.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <PageContainer className="space-y-6 animate-fadeIn pb-12">
      {/* Top Header Command Strip */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200/80 pb-4">
        <div className="flex items-center gap-3">
          <OutlineBtn
            link={`/dashboard/manage-exam-pack/${packId}`}
            className="!p-2 !rounded !text-slate-600 hover:!text-primary shadow-2xs border-slate-200"
            title="Return to Pack"
          >
            <FaArrowLeft className="text-xs" />
          </OutlineBtn>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Edit Exam Paper #{examId}
            </h1>
          </div>
        </div>

        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-amber-50 text-amber-700 border border-amber-200 text-xs font-bold">
          Configuring Paper
        </span>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Section 1: Exam Basic Information */}
        <ExamBasicDetailsSection
          data={examPackData}
          onChange={(patch) => setExamPackData((prev) => ({ ...prev, ...patch }))}
          levelOptions={levelOptions}
          batchOptions={batchOptions}
        />

        {/* Section 2: Marks & Timing Configuration */}
        <ExamScoringScheduleSection
          data={examPackData}
          onChange={(patch) => setExamPackData((prev) => ({ ...prev, ...patch }))}
        />

        {/* Section 3: Negative Marking & Rules */}
        <ExamRulesPolicySection
          settings={examSettings}
          onChange={(patch) => setExamSettings((prev) => ({ ...prev, ...patch }))}
        />

        {/* Action Buttons HUD */}
        <div className="rounded bg-white border border-slate-200/80 p-4 shadow-2xs flex items-center justify-between gap-3">
          <span className="text-[11px] font-mono text-slate-400">
            RECORD_PERSISTENCE: ATOMIC
          </span>

          <div className="flex items-center gap-2.5">
            <OutlineBtn
              type="button"
              onClick={() => router.back()}
              className="!text-xs !py-1.5 !px-3.5 !rounded"
            >
              Cancel
            </OutlineBtn>
            <PrimaryBtn
              type="submit"
              disabled={saving}
              className="!text-xs !py-1.5 !px-4 gap-1.5 !rounded shadow-2xs font-bold"
            >
              <FaSave className="text-xs" />
              <span>{saving ? "Saving Changes..." : "Commit Exam Updates"}</span>
            </PrimaryBtn>
          </div>
        </div>
      </form>
    </PageContainer>
  );
}
