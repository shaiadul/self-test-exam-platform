"use client";

import React, { useRef, useState, DragEvent } from "react";
import { toast } from "sonner";
import Image from "next/image";
import { FaCloudUploadAlt } from "react-icons/fa";
import CustomSelect from "../../../../../components/ui/CustomSelect";
import DateTimePicker from "../../../../../components/ui/DateTimePicker";
import ToggleSwitch from "../../../../../components/ui/ToggleSwitch";
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
      return d.toISOString().slice(0, 16);
    } catch {
      return dateStr;
    }
  };

  const [examPackData, setExamPackData] = useState({
    name: initialExam?.name || "",
    details: initialExam?.details || "",
    level: initialExam?.level || levelOptions[0] || "HSC",
    batch: initialExam?.batch || batchOptions[0] || "2023",
    image: initialExam?.image || "",
    pack: "Science Explorer",
    totalMarks: initialExam?.totalMarks || 10,
    perQuestionMark: initialExam?.perQuestionMark || 2,
    passMark: initialExam?.passMark || 5,
    startDate: formatDateTime(initialExam?.startDate || ""),
    endDate: formatDateTime(initialExam?.endDate || ""),
  });

  const [examSettings, setExamSettings] = useState({
    randomization: initialExam?.randomization ?? false,
    feedback: initialExam?.feedback ?? false,
    scoreLimit: initialExam?.scoreLimit ?? false,
    scoreValue: initialExam?.scoreValue ?? 0,
    negativeMarking: initialExam?.negativeMarking ?? false,
    negativeValue: initialExam?.negativeValue ?? 0.5,
    totalTime: initialExam?.totalTime ?? false,
    totalTimeValue: initialExam?.totalTimeValue ?? 0,
    privateExam: initialExam?.privateExam ?? false,
    privatePassword: initialExam?.privatePassword || "",
  });

  const handleFileChange = (file: File) => {
    const imageUrl = URL.createObjectURL(file);
    setExamPackData({ ...examPackData, image: imageUrl });
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

    if (!examPackData.name) {
      toast.error("Please enter an exam title.");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        name: examPackData.name,
        details: examPackData.details,
        level: examPackData.level,
        batch: examPackData.batch,
        totalMarks: Number(examPackData.totalMarks),
        perQuestionMark: Number(examPackData.perQuestionMark),
        passMark: Number(examPackData.passMark),
        startDate: examPackData.startDate,
        endDate: examPackData.endDate,

        randomization: examSettings.randomization,
        feedback: examSettings.feedback,
        scoreLimit: examSettings.scoreLimit,
        scoreValue: Number(examSettings.scoreValue),
        negativeMarking: examSettings.negativeMarking,
        negativeValue: Number(examSettings.negativeValue),
        totalTime: examSettings.totalTime,
        totalTimeValue: Number(examSettings.totalTimeValue),
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
      <h1 className="text-3xl font-bold text-[#dd6b01] mb-6">Edit Exam: {examPackData.name}</h1>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
          <h2 className="text-[#dd6b01] text-lg font-bold">Exam Details</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              className="p-3 border border-gray-200 rounded-xl text-sm font-semibold outline-none focus:border-[#dd6b01]"
              placeholder="Exam Name"
              value={examPackData.name}
              onChange={(e) => setExamPackData({ ...examPackData, name: e.target.value })}
              required
            />
            <input
              className="p-3 border border-gray-200 rounded-xl text-sm font-semibold outline-none focus:border-[#dd6b01]"
              placeholder="Exam Details"
              value={examPackData.details}
              onChange={(e) => setExamPackData({ ...examPackData, details: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <CustomSelect
              options={levelOptions.length ? levelOptions : ["Class 10", "HSC", "Admission"]}
              value={examPackData.level}
              onChange={(val) => setExamPackData({ ...examPackData, level: val })}
              placeholder="Select Level"
            />
            <CustomSelect
              options={batchOptions.length ? batchOptions : ["2023", "2024", "2025"]}
              value={examPackData.batch}
              onChange={(val) => setExamPackData({ ...examPackData, batch: val })}
              placeholder="Select Batch"
            />
          </div>

          <div
            onDragEnter={handleDrag}
            onDragOver={handleDrag}
            onDragLeave={handleDrag}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition ${
              dragActive ? "border-[#dd6b01] bg-orange-50/40" : "border-gray-300 hover:border-gray-400"
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
                  width={150}
                  height={90}
                  className="rounded-lg object-cover border"
                />
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <DateTimePicker
              label="Exam Start Date & Time"
              value={examPackData.startDate}
              onChange={(val) => setExamPackData({ ...examPackData, startDate: val })}
            />
            <DateTimePicker
              label="Exam End Date & Time"
              value={examPackData.endDate}
              onChange={(val) => setExamPackData({ ...examPackData, endDate: val })}
            />
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
          <h2 className="text-[#dd6b01] text-lg font-bold">Exam Rules & Configuration</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
            <ToggleSwitch
              label="Negative Marking"
              checked={examSettings.negativeMarking}
              onChange={(val) => setExamSettings({ ...examSettings, negativeMarking: val })}
            />
            <ToggleSwitch
              label="Timer Enabled"
              checked={examSettings.totalTime}
              onChange={(val) => setExamSettings({ ...examSettings, totalTime: val })}
            />
          </div>
        </div>

        <div className="flex justify-end gap-4">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-6 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-sm rounded-xl transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 bg-[#dd6b01] hover:bg-orange-600 text-white font-bold text-sm rounded-xl shadow transition cursor-pointer"
          >
            {saving ? "Saving Changes..." : "Save Changes"}
          </button>
        </div>
      </form>
    </PageContainer>
  );
}
