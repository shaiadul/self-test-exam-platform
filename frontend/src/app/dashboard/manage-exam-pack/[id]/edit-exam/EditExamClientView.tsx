"use client";

import React, { useRef, useState, DragEvent } from "react";
import { toast } from "sonner";
import Image from "next/image";
import { FaCloudUploadAlt, FaExclamationTriangle } from "react-icons/fa";
import CustomSelect from "../../../../../components/ui/CustomSelect";
import { Input } from "../../../../../components/ui/Input";
import DateTimePicker from "../../../../../components/ui/DateTimePicker";
import ToggleSwitch from "../../../../../components/ui/ToggleSwitch";
import { PrimaryBtn } from "../../../../../components/ui/PrimaryBtn";
import { OutlineBtn } from "../../../../../components/ui/OutlineBtn";
import { PageContainer } from "../../../../../components/common/PageContainer";
import { updateExamAction } from "../../../../../lib/actions";
import { useRouter } from "next/navigation";

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
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [dragActive, setDragActive] = useState(false);
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

  const hasNegative = initialExam?.negativeMarks !== undefined
    ? Math.abs(Number(initialExam.negativeMarks)) > 0
    : (initialExam?.negativeMarking ?? true);

  const negativeVal = initialExam?.negativeMarks !== undefined && Number(initialExam.negativeMarks) !== 0
    ? Math.abs(Number(initialExam.negativeMarks))
    : (Number(initialExam?.negativeValue) || 0.5);

  const [examPackData, setExamPackData] = useState({
    name: initialExam?.name || "",
    details: initialExam?.details || "",
    level: initialExam?.level || levelOptions[0] || "HSC",
    batch: initialExam?.batch || batchOptions[0] || "2024",
    image: initialExam?.image || "",
    totalMarks: initialExam?.totalMarks || 100,
    perQuestionMark: initialExam?.perQuestionMarks || initialExam?.perQuestionMark || 2,
    passMark: initialExam?.passingMarks || initialExam?.passMark || 40,
    durationMinutes: initialExam?.durationMinutes || initialExam?.duration || 30,
    startDate: formatDateTime(initialExam?.startDate || ""),
    endDate: formatDateTime(initialExam?.endDate || ""),
  });

  const [examSettings, setExamSettings] = useState({
    randomization: initialExam?.randomization ?? false,
    feedback: initialExam?.feedback ?? true,
    negativeMarking: hasNegative,
    negativeValue: negativeVal,
    privateExam: initialExam?.privateExam ?? false,
    privatePassword: initialExam?.privatePassword || "",
  });

  const handleFileChange = (file: File) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      setExamPackData((prev) => ({ ...prev, image: reader.result as string }));
    };
    reader.readAsDataURL(file);
  };

  const handleDrag = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") setDragActive(true);
    else if (e.type === "dragleave") setDragActive(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

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

    if (Number(examPackData.passMark) > Number(examPackData.totalMarks)) {
      toast.error("Passing marks cannot be greater than total marks.");
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
        passingMarks: Number(examPackData.passMark) || 40,
        passMark: Number(examPackData.passMark) || 40,
        perQuestionMarks: Number(examPackData.perQuestionMark) || 2,
        perQuestionMark: Number(examPackData.perQuestionMark) || 2,
        startDate: start.toISOString(),
        endDate: end.toISOString(),
        durationMinutes: Number(examPackData.durationMinutes) || 30,

        randomization: examSettings.randomization,
        feedback: examSettings.feedback,
        negativeMarking: examSettings.negativeMarking,
        negativeMarks: examSettings.negativeMarking ? (Number(examSettings.negativeValue) || 0.5) : 0,
        negativeValue: examSettings.negativeMarking ? (Number(examSettings.negativeValue) || 0.5) : 0,
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
    <PageContainer>
      <div className="mb-6">
        <h1 className="text-3xl font-extrabold text-[#dd6b01]">Edit Exam: {examPackData.name || "Exam"}</h1>
        <p className="text-sm text-gray-500 font-semibold mt-1">
          Update examination parameters, scoring weights, negative marking, and schedule.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Section 1: Exam Details */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-5">
          <div className="border-b border-gray-100 pb-3">
            <h2 className="text-[#dd6b01] text-lg font-bold">Exam Details & Categorization</h2>
            <p className="text-xs text-gray-400 font-medium">Basic identity and metadata for this examination.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Exam Title *"
              placeholder="Exam Name"
              value={examPackData.name}
              onChange={(e) => setExamPackData({ ...examPackData, name: e.target.value })}
              required
            />
            <Input
              label="Brief Instructions or Syllabus"
              placeholder="Exam Details"
              value={examPackData.details}
              onChange={(e) => setExamPackData({ ...examPackData, details: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <CustomSelect
              label="Target Level"
              options={levelOptions.length ? levelOptions : ["Class 10", "HSC", "Admission", "University"]}
              value={examPackData.level}
              onChange={(val) => setExamPackData({ ...examPackData, level: val })}
              placeholder="Select Level"
            />
            <CustomSelect
              label="Target Batch"
              options={batchOptions.length ? batchOptions : ["2024", "2025", "2026", "2027"]}
              value={examPackData.batch}
              onChange={(val) => setExamPackData({ ...examPackData, batch: val })}
              placeholder="Select Batch"
            />
          </div>

          {/* Banner Upload */}
          <div>
            <label className="text-sm font-bold text-gray-700 ml-1 block mb-2">Exam Thumbnail (Optional)</label>
            <div
              onDragEnter={handleDrag}
              onDragOver={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition ${
                dragActive ? "border-[#dd6b01] bg-orange-50/40" : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <FaCloudUploadAlt className="mx-auto text-4xl text-[#dd6b01] mb-2" />
              <p className="text-sm font-semibold text-gray-700">
                Drag & Drop Exam Thumbnail or <span className="text-[#dd6b01] font-bold">Browse</span>
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => e.target.files?.[0] && handleFileChange(e.target.files[0])}
              />
              {examPackData.image && (
                <div className="mt-4 flex justify-center">
                  <Image
                    src={examPackData.image}
                    alt="Preview"
                    width={160}
                    height={90}
                    className="rounded-lg object-cover border border-gray-200 shadow-sm"
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Section 2: Marks & Timing Configuration */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-5">
          <div className="border-b border-gray-100 pb-3">
            <h2 className="text-[#dd6b01] text-lg font-bold">Marks & Duration Settings</h2>
            <p className="text-xs text-gray-400 font-medium">Scoring weights, pass mark threshold, and time allocation.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Input
              label="Total Marks"
              type="number"
              placeholder="100"
              value={examPackData.totalMarks}
              onChange={(e) => setExamPackData({ ...examPackData, totalMarks: Number(e.target.value) })}
              min={1}
            />
            <Input
              label="Marks Per Question"
              type="number"
              placeholder="2"
              value={examPackData.perQuestionMark}
              onChange={(e) => setExamPackData({ ...examPackData, perQuestionMark: Number(e.target.value) })}
              min={1}
            />
            <Input
              label="Passing Marks"
              type="number"
              placeholder="40"
              value={examPackData.passMark}
              onChange={(e) => setExamPackData({ ...examPackData, passMark: Number(e.target.value) })}
              min={1}
            />
            <Input
              label="Duration (Minutes)"
              type="number"
              placeholder="30"
              value={examPackData.durationMinutes}
              onChange={(e) => setExamPackData({ ...examPackData, durationMinutes: Number(e.target.value) })}
              min={1}
            />
          </div>

          {/* Schedule */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <DateTimePicker
              label="Exam Start Date & Time *"
              value={examPackData.startDate}
              onChange={(val) => setExamPackData({ ...examPackData, startDate: val })}
            />
            <DateTimePicker
              label="Exam End Date & Time *"
              value={examPackData.endDate}
              onChange={(val) => setExamPackData({ ...examPackData, endDate: val })}
            />
          </div>
        </div>

        {/* Section 3: Negative Marking & Rules */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-5">
          <div className="border-b border-gray-100 pb-3">
            <h2 className="text-[#dd6b01] text-lg font-bold">Negative Marking & Exam Rules</h2>
            <p className="text-xs text-gray-400 font-medium">Configure deductions for wrong answers and behavioral rules.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <ToggleSwitch
              label="Negative Marking"
              checked={examSettings.negativeMarking}
              onChange={(val) => setExamSettings({ ...examSettings, negativeMarking: val })}
            />
            <ToggleSwitch
              label="Question Randomization"
              checked={examSettings.randomization}
              onChange={(val) => setExamSettings({ ...examSettings, randomization: val })}
            />
            <ToggleSwitch
              label="Instant Feedback"
              checked={examSettings.feedback}
              onChange={(val) => setExamSettings({ ...examSettings, feedback: val })}
            />
          </div>

          {/* Enhanced Negative Marking Value Section */}
          {examSettings.negativeMarking && (
            <div className="p-4 bg-orange-50/50 rounded-xl border border-orange-200 space-y-3">
              <div className="flex items-center gap-2 text-sm font-bold text-gray-800">
                <FaExclamationTriangle className="text-[#dd6b01]" />
                <span>Negative Mark Deduction Per Wrong Answer</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
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
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-semibold text-gray-500">Quick presets:</span>
                  {[0.25, 0.5, 0.75, 1.0].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setExamSettings({ ...examSettings, negativeValue: preset })}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition cursor-pointer ${
                        examSettings.negativeValue === preset
                          ? "bg-[#dd6b01] text-white border-[#dd6b01] shadow-sm"
                          : "bg-white text-gray-700 border-gray-200 hover:border-[#dd6b01]"
                      }`}
                    >
                      -{preset.toFixed(2)}
                    </button>
                  ))}
                </div>
              </div>

              <p className="text-xs text-gray-500 font-medium">
                For every incorrect answer, <span className="font-bold text-[#dd6b01]">{examSettings.negativeValue || 0} marks</span> will be deducted from the candidate&apos;s total score.
              </p>
            </div>
          )}

          {/* Access Control */}
          <div className="pt-2 border-t border-gray-100">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
              <ToggleSwitch
                label="Private Exam (Requires Passcode)"
                checked={examSettings.privateExam}
                onChange={(val) => setExamSettings({ ...examSettings, privateExam: val })}
              />
              {examSettings.privateExam && (
                <Input
                  label="Exam Passcode"
                  type="password"
                  placeholder="Enter access passcode"
                  value={examSettings.privatePassword}
                  onChange={(e) => setExamSettings({ ...examSettings, privatePassword: e.target.value })}
                />
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-4 pt-4">
          <OutlineBtn type="button" onClick={() => router.back()}>
            Cancel
          </OutlineBtn>
          <PrimaryBtn type="submit" disabled={saving}>
            {saving ? "Saving Changes..." : "Save Changes"}
          </PrimaryBtn>
        </div>
      </form>
    </PageContainer>
  );
}
