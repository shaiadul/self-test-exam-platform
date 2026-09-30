"use client";

import React, { useState } from "react";
import { toast } from "sonner";
import { FaArrowLeft, FaSave } from "react-icons/fa";
import { PrimaryBtn } from "../../../../../components/ui/PrimaryBtn";
import { OutlineBtn } from "../../../../../components/ui/OutlineBtn";
import { PageContainer } from "../../../../../components/common/PageContainer";
import { createExamAction } from "../../../../../lib/actions";
import { useRouter } from "next/navigation";
import { ExamFormData, ExamSettingsData } from "../../../../../components/dashboard/exam-form/types";
import { ExamBasicDetailsSection } from "../../../../../components/dashboard/exam-form/ExamBasicDetailsSection";
import { ExamScoringScheduleSection } from "../../../../../components/dashboard/exam-form/ExamScoringScheduleSection";
import { ExamRulesPolicySection } from "../../../../../components/dashboard/exam-form/ExamRulesPolicySection";

interface AddExamClientViewProps {
  packId: number;
  initialAssets: any[];
}

export default function AddExamClientView({
  packId,
  initialAssets,
}: AddExamClientViewProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const levelOptions = (initialAssets || [])
    .filter((a: any) => a.type === "level")
    .map((a: any) => a.value);
  const batchOptions = (initialAssets || [])
    .filter((a: any) => a.type === "batch")
    .map((a: any) => a.value);

  const [examPackData, setExamPackData] = useState<ExamFormData>({
    name: "",
    details: "",
    level: levelOptions[0] || "HSC",
    batch: batchOptions[0] || "2024",
    image: "",
    totalMarks: 100,
    perQuestionMark: 2,
    passMark: 33,
    durationMinutes: 30,
    startDate: "",
    endDate: "",
  });

  const [examSettings, setExamSettings] = useState<ExamSettingsData>({
    randomization: false,
    feedback: true,
    negativeMarking: true,
    negativeValue: 0.5,
    privateExam: false,
    privatePassword: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!examPackData.name.trim()) {
      toast.error("Please enter an exam title.");
      return;
    }
    if (examPackData.name.trim().length < 3) {
      toast.error("Exam title must be at least 3 characters long.");
      return;
    }
    if (!examPackData.perQuestionMark || Number(examPackData.perQuestionMark) < 1) {
      toast.error("Marks per question must be at least 1.");
      return;
    }
    if (
      !examPackData.passMark ||
      Number(examPackData.passMark) < 1 ||
      Number(examPackData.passMark) > 100
    ) {
      toast.error("Pass mark percentage must be between 1 and 100.");
      return;
    }
    if (!examPackData.durationMinutes || Number(examPackData.durationMinutes) < 1) {
      toast.error("Exam duration must be at least 1 minute.");
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
      toast.error("Exam end date & time must be after the start date & time.");
      return;
    }

    if (examSettings.negativeMarking) {
      const negVal = Number(examSettings.negativeValue);
      if (!negVal || negVal <= 0) {
        toast.error("Negative mark deduction must be greater than 0.");
        return;
      }
    }

    if (examSettings.privateExam) {
      const passcode = examSettings.privatePassword?.trim();
      if (!passcode) {
        toast.error("Please enter an access passcode for the private exam.");
        return;
      }
      if (passcode.length < 4) {
        toast.error("Exam passcode must be at least 4 characters long.");
        return;
      }
    }

    setLoading(true);
    try {
      const payload = {
        name: examPackData.name.trim(),
        details: examPackData.details.trim(),
        level: examPackData.level,
        batch: examPackData.batch,
        totalMarks: Number(examPackData.perQuestionMark) || 2,
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
        isPrivate: examSettings.privateExam,
        passcode: examSettings.privatePassword || "",
        privatePassword: examSettings.privatePassword || "",
      };

      const res = await createExamAction(packId, payload);
      if (res.success) {
        toast.success("Exam created successfully!");
        router.push(`/dashboard/manage-exam-pack/${packId}`);
      } else {
        toast.error(res.error || "Failed to create exam.");
      }
    } catch {
      toast.error("Failed to create exam.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageContainer className="space-y-4 sm:space-y-6 animate-fadeIn pb-12">
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
              Create New Exam Paper
            </h1>
          </div>
        </div>

        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-blue-50 text-blue-700 border border-blue-200 text-xs font-bold">
          New Exam
        </span>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
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
          questionCount={0}
          negativeMarking={examSettings.negativeMarking}
          negativeValue={examSettings.negativeValue}
        />

        {/* Section 3: Negative Marking & Rules */}
        <ExamRulesPolicySection
          settings={examSettings}
          onChange={(patch) => setExamSettings((prev) => ({ ...prev, ...patch }))}
        />

        {/* Action Buttons HUD */}
        <div className="rounded bg-white border border-slate-200/80 p-3.5 sm:p-4 shadow-2xs flex flex-col sm:flex-row items-center justify-center sm:justify-between mx-auto gap-3">
          <div className="text-xs text-slate-500">
            Ready to deploy this exam paper
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto justify-center sm:justify-end">
            <OutlineBtn
              type="button"
              onClick={() => router.back()}
              className="!text-xs !py-1.5 !px-3.5 !rounded"
            >
              Cancel
            </OutlineBtn>

            <PrimaryBtn
              type="submit"
              disabled={loading}
              className="!text-xs !py-1.5 !px-4 gap-1.5 !rounded shadow-2xs"
            >
              {loading ? (
                <>
                  <span className="animate-spin inline-block w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full" />
                  <span>Creating Exam…</span>
                </>
              ) : (
                <>
                  <FaSave className="text-[11px]" />
                  <span>Deploy Exam Paper</span>
                </>
              )}
            </PrimaryBtn>
          </div>
        </div>
      </form>
    </PageContainer>
  );
}
