"use client";

import React, { useRef, useState, DragEvent } from "react";
import { toast } from "sonner";
import Image from "next/image";
import {
  FaCloudUploadAlt,
  FaExclamationTriangle,
  FaArrowLeft,
} from "react-icons/fa";
import CustomSelect from "../../../../../components/ui/CustomSelect";
import { Input } from "../../../../../components/ui/Input";
import DateTimePicker from "../../../../../components/ui/DateTimePicker";
import ToggleSwitch from "../../../../../components/ui/ToggleSwitch";
import { PrimaryBtn } from "../../../../../components/ui/PrimaryBtn";
import { OutlineBtn } from "../../../../../components/ui/OutlineBtn";
import { PageContainer } from "../../../../../components/common/PageContainer";
import ImageUploader from "../../../../../components/ui/ImageUploader";
import { createExamAction } from "../../../../../lib/actions";
import { useRouter } from "next/navigation";

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

  const [examPackData, setExamPackData] = useState({
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

  const [examSettings, setExamSettings] = useState({
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

    setLoading(true);
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
              Create New Exam Paper
            </h1>
          </div>
        </div>

        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-blue-50 text-blue-700 border border-blue-200 text-xs font-bold">
          New Exam
        </span>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Section 1: Exam Basic Information */}
        <div className="bg-white p-5 rounded border border-slate-200/80 shadow-2xs space-y-4">
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
              value={examPackData.name}
              onChange={(e) =>
                setExamPackData({ ...examPackData, name: e.target.value })
              }
              required
            />
            <Input
              label="Brief Instructions or Syllabus"
              placeholder="e.g. Vectors & Matrices (30 MCQs)"
              value={examPackData.details}
              onChange={(e) =>
                setExamPackData({ ...examPackData, details: e.target.value })
              }
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
              value={examPackData.level}
              onChange={(val) =>
                setExamPackData({ ...examPackData, level: val })
              }
              placeholder="Select Level"
            />
            <CustomSelect
              label="Target Batch"
              options={
                batchOptions.length
                  ? batchOptions
                  : ["2024", "2025", "2026", "2027"]
              }
              value={examPackData.batch}
              onChange={(val) =>
                setExamPackData({ ...examPackData, batch: val })
              }
              placeholder="Select Batch"
            />
          </div>

          {/* Banner Upload */}
          <div className="pt-1">
            <ImageUploader
              label="Exam Thumbnail (Optional)"
              folder="exams"
              height="h-44"
              value={examPackData.image}
              onChange={(url) =>
                setExamPackData({ ...examPackData, image: url || "" })
              }
              description="Recommended ratio 16:9 for clean card displays."
            />
          </div>
        </div>

        {/* Section 2: Marks & Timing Configuration */}
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
              value={examPackData.totalMarks}
              onChange={(e) =>
                setExamPackData({
                  ...examPackData,
                  totalMarks: Number(e.target.value),
                })
              }
              min={1}
            />
            <Input
              label="Marks Per Question"
              type="number"
              placeholder="2"
              value={examPackData.perQuestionMark}
              onChange={(e) =>
                setExamPackData({
                  ...examPackData,
                  perQuestionMark: Number(e.target.value),
                })
              }
              min={1}
            />
            <Input
              label="Pass Mark (%)"
              type="number"
              placeholder="33"
              value={examPackData.passMark}
              onChange={(e) =>
                setExamPackData({
                  ...examPackData,
                  passMark: Number(e.target.value),
                })
              }
              min={1}
              max={100}
            />
            <Input
              label="Duration (Minutes)"
              type="number"
              placeholder="30"
              value={examPackData.durationMinutes}
              onChange={(e) =>
                setExamPackData({
                  ...examPackData,
                  durationMinutes: Number(e.target.value),
                })
              }
              min={1}
            />
          </div>

          {/* Schedule */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <DateTimePicker
              label="Exam Start Date & Time *"
              value={examPackData.startDate}
              onChange={(val) =>
                setExamPackData({ ...examPackData, startDate: val })
              }
            />
            <DateTimePicker
              label="Exam End Date & Time *"
              value={examPackData.endDate}
              onChange={(val) =>
                setExamPackData({ ...examPackData, endDate: val })
              }
            />
          </div>
        </div>

        {/* Section 3: Negative Marking & Rules */}
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
              checked={examSettings.negativeMarking}
              onChange={(val) =>
                setExamSettings({ ...examSettings, negativeMarking: val })
              }
            />
            <ToggleSwitch
              label="Question Randomization"
              checked={examSettings.randomization}
              onChange={(val) =>
                setExamSettings({ ...examSettings, randomization: val })
              }
            />
            <ToggleSwitch
              label="Instant Feedback"
              checked={examSettings.feedback}
              onChange={(val) =>
                setExamSettings({ ...examSettings, feedback: val })
              }
            />
          </div>

          {/* Enhanced Negative Marking Value Section */}
          {examSettings.negativeMarking && (
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
                  value={examSettings.negativeValue}
                  onChange={(e) =>
                    setExamSettings({
                      ...examSettings,
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
                      onClick={() =>
                        setExamSettings({
                          ...examSettings,
                          negativeValue: preset,
                        })
                      }
                      className={`px-2.5 py-1 rounded text-[11px] font-mono font-bold border transition cursor-pointer ${
                        examSettings.negativeValue === preset
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
                  {examSettings.negativeValue || 0} marks
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
                checked={examSettings.privateExam}
                onChange={(val) =>
                  setExamSettings({ ...examSettings, privateExam: val })
                }
              />
              {examSettings.privateExam && (
                <Input
                  label="Exam Passcode"
                  type="password"
                  placeholder="Enter access passcode"
                  value={examSettings.privatePassword}
                  onChange={(e) =>
                    setExamSettings({
                      ...examSettings,
                      privatePassword: e.target.value,
                    })
                  }
                />
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons HUD */}
        <div className="rounded bg-white border border-slate-200/80 p-4 shadow-2xs flex items-center justify-between gap-3">
          <span className="text-[11px] font-mono text-slate-400">
            DEPLOY_STATE: VERIFIED
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
              disabled={loading}
              className="!text-xs !py-1.5 !px-4 gap-1.5 !rounded shadow-2xs font-bold"
            >
              {loading ? "Creating Exam..." : "Deploy Exam Paper"}
            </PrimaryBtn>
          </div>
        </div>
      </form>
    </PageContainer>
  );
}
