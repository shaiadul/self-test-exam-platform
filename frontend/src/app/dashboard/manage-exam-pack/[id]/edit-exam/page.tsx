"use client";

import React, { useRef, useState, useEffect, DragEvent } from "react";
import Image from "next/image";
import { FaCloudUploadAlt } from "react-icons/fa";
import CustomSelect from "../../../../../components/ui/CustomSelect";
import DateTimePicker from "../../../../../components/ui/DateTimePicker";
import ToggleSwitch from "../../../../../components/ui/ToggleSwitch";
import { PageContainer } from "../../../../../components/common/PageContainer";
import { getExamDetailsAction, updateExamAction, getSystemAssetsAction } from "../../../../../lib/actions";
import { useParams, useRouter, useSearchParams } from "next/navigation";

export default function EditExamPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const idStr = params.id as string;
  const packId = idStr ? parseInt(idStr) : 0;
  const examId = searchParams.get("examId") || "";

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Dynamic options from system assets
  const [levelOptions, setLevelOptions] = useState<string[]>([]);
  const [batchOptions, setBatchOptions] = useState<string[]>([]);

  // Load initial data from props (or API)
  const [examPackData, setExamPackData] = useState({
    name: "",
    details: "",
    level: "",
    batch: "",
    image: "",
    pack: "Science Explorer",
    totalMarks: 0,
    perQuestionMark: 0,
    passMark: 0,
    startDate: "",
    endDate: "",
  });

  const [examSettings, setExamSettings] = useState({
    randomization: false,
    feedback: false,
    scoreLimit: false,
    scoreValue: 0,
    negativeMarking: false,
    negativeValue: 0.5,
    totalTime: false,
    totalTimeValue: 0,
    privateExam: false,
    privatePassword: "",
  });

  // Helper to format ISO date string to datetime-local format
  const formatDateTime = (dateStr: string) => {
    if (!dateStr) return "";
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return "";
      const pad = (n: number) => n.toString().padStart(2, "0");
      return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
    } catch {
      return "";
    }
  };

  // --- Preload Data when editing ---
  useEffect(() => {
    async function loadExam() {
      if (!examId) {
        alert("No Exam ID provided.");
        router.push(`/dashboard/manage-exam-pack/${packId}`);
        return;
      }
      setLoading(true);
      try {
        const data = await getExamDetailsAction(examId);
        if (data) {
          setExamPackData({
            name: data.name || "",
            details: data.details || "Exam details description",
            level: data.level || "",
            batch: data.batch || "",
            image: data.image || "/global/test.png",
            pack: data.pack || "Science Explorer",
            totalMarks: data.totalMarks || 0,
            perQuestionMark: data.perQuestionMarks || 0,
            passMark: data.passingMarks || 0,
            startDate: formatDateTime(data.startDate),
            endDate: formatDateTime(data.endDate),
          });

          setExamSettings({
            randomization: true,
            feedback: false,
            scoreLimit: false,
            scoreValue: 0,
            negativeMarking: data.negativeMarks < 0,
            negativeValue: Math.abs(data.negativeMarks) || 0.5,
            totalTime: true,
            totalTimeValue: 60,
            privateExam: false,
            privatePassword: "",
          });
        } else {
          alert("Failed to load exam details.");
          router.push(`/dashboard/manage-exam-pack/${packId}`);
        }
      } catch (err) {
        alert("Failed to load exam details.");
        router.push(`/dashboard/manage-exam-pack/${packId}`);
      } finally {
        setLoading(false);
      }
    }
    loadExam();
  }, [examId, packId, router]);

  // Load system assets for dynamic select options
  useEffect(() => {
    async function loadAssets() {
      try {
        const assets = await getSystemAssetsAction();
        if (Array.isArray(assets)) {
          setLevelOptions(assets.filter((a: any) => a.type === "level").map((a: any) => a.value));
          setBatchOptions(assets.filter((a: any) => a.type === "batch").map((a: any) => a.value));
        }
      } catch (err) {
        console.error("Failed to load system assets:", err);
      }
    }
    loadAssets();
  }, []);

  // --- Image Upload Handlers ---
  const handleFileChange = (file: File) => {
    const imageUrl = URL.createObjectURL(file);
    setExamPackData({ ...examPackData, image: imageUrl });
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragActive(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragActive(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFileChange(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await updateExamAction(examId, packId, {
        name: examPackData.name,
        startDate: new Date(examPackData.startDate).toISOString(),
        endDate: new Date(examPackData.endDate).toISOString(),
        level: examPackData.level || "General",
        batch: examPackData.batch || "2025",
        totalMarks: examPackData.totalMarks || 10,
        passingMarks: examPackData.passMark || 5,
        perQuestionMarks: examPackData.perQuestionMark || 2,
        negativeMarks: examSettings.negativeMarking ? -Math.abs(examSettings.negativeValue) : 0,
      });

      if (res.success) {
        alert("Exam updated successfully!");
        router.push(`/dashboard/manage-exam-pack/${packId}`);
      } else {
        alert(res.error || "Failed to update exam.");
      }
    } catch (err) {
      alert("Failed to update exam.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <PageContainer>
        <div className="flex flex-col items-center justify-center min-h-[400px]">
          <div className="w-12 h-12 border-4 border-[#dd6b01] border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-600 font-medium">Loading Exam Details...</p>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <h1 className="text-2xl md:text-3xl font-semibold mb-8 text-[#dd6b01]">
        Edit Exam
      </h1>

      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 md:grid-cols-2 gap-10 items-start"
      >
        {/* Left side (Image + Info) */}
        <div className="flex flex-col gap-4">
          {/* --- Image Upload (Drag & Drop) --- */}
          <div
            className={`w-full h-96 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-300 ${
              dragActive
                ? "border-[#dd6b01] bg-orange-50"
                : "border-gray-300 bg-gray-100 hover:border-[#dd6b01] hover:bg-orange-50/30"
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            {examPackData.image ? (
              <div className="relative w-full h-full rounded-2xl overflow-hidden">
                <Image
                  src={examPackData.image}
                  alt="Exam Pack"
                  fill
                  className="object-cover object-center w-full h-full rounded-2xl"
                />
              </div>
            ) : (
              <>
                <FaCloudUploadAlt className="text-5xl text-[#dd6b01] mb-3" />
                <p className="text-gray-700 font-medium">
                  Drag & drop image here or click to upload
                </p>
              </>
            )}
            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              className="hidden"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  handleFileChange(e.target.files[0]);
                }
              }}
            />
          </div>
          <div>
            <label className="text-sm font-semibold text-gray-800 block mb-1">
              Exam Name
            </label>
            <input
              type="text"
              placeholder="Exam Name*"
              className="w-full px-4 py-3 text-base outline-none border border-[#f97a00] rounded-lg focus:ring-2 focus:ring-[#f97a00]"
              value={examPackData.name}
              onChange={(e) =>
                setExamPackData({ ...examPackData, name: e.target.value })
              }
              required
            />
          </div>
          <div>
            <label className="text-sm font-semibold text-gray-800 block mb-1">
              Details (Description)
            </label>
            <textarea
              placeholder="Details*"
              className="w-full px-4 py-3 text-base outline-none border border-[#f97a00] rounded-lg resize-none focus:ring-2 focus:ring-[#f97a00] min-h-[120px]"
              value={examPackData.details}
              onChange={(e) =>
                setExamPackData({ ...examPackData, details: e.target.value })
              }
              required
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <DateTimePicker
              label="Start Date & Time"
              value={examPackData.startDate}
              onChange={(value) =>
                setExamPackData({ ...examPackData, startDate: value })
              }
            />
            <DateTimePicker
              label="End Date & Time"
              value={examPackData.endDate}
              onChange={(value) =>
                setExamPackData({ ...examPackData, endDate: value })
              }
            />
          </div>
        </div>

        {/* Right side (Inputs + Toggles) */}
        <div className="space-y-5">
          <div className="text-2xl text-[#dd6b01] font-semibold">
            Assign Student
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-semibold text-gray-800 block mb-1">
                Level
              </label>
              <CustomSelect
                label="Select Level"
                options={levelOptions}
                value={examPackData.level}
                onChange={(val) =>
                  setExamPackData({ ...examPackData, level: val })
                }
              />
            </div>

            <div>
              <label className="text-sm font-semibold text-gray-800 block mb-1">
                Batch
              </label>
              <CustomSelect
                label="Select Batch"
                options={batchOptions}
                value={examPackData.batch}
                onChange={(val) =>
                  setExamPackData({ ...examPackData, batch: val })
                }
              />
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-800 block mb-1">
                Exam Pack
              </label>
              <CustomSelect
                label="Select Exam Pack"
                options={["Science Explored"]}
                value={examPackData.pack}
                onChange={(val) =>
                  setExamPackData({ ...examPackData, pack: val })
                }
              />
            </div>
          </div>

          <div className="text-2xl text-[#dd6b01] font-semibold">
            Marking Details
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-semibold text-gray-800 block mb-1">
                Total Marks
              </label>
              <input
                type="number"
                placeholder="Total Marks*"
                className="w-full px-4 py-3 text-base outline-none border border-[#f97a00] rounded-lg focus:ring-2 focus:ring-[#f97a00]"
                value={examPackData.totalMarks || ""}
                onChange={(e) =>
                  setExamPackData({
                    ...examPackData,
                    totalMarks: parseFloat(e.target.value),
                  })
                }
                required
              />
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-800 block mb-1">
                Per Question Mark
              </label>
              <input
                type="number"
                placeholder="Per Question Mark*"
                className="w-full px-4 py-3 text-base outline-none border border-[#f97a00] rounded-lg focus:ring-2 focus:ring-[#f97a00]"
                value={examPackData.perQuestionMark || ""}
                onChange={(e) =>
                  setExamPackData({
                    ...examPackData,
                    perQuestionMark: parseFloat(e.target.value),
                  })
                }
                required
              />
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-800 block mb-1">
                Passing Marks
              </label>
              <input
                type="number"
                placeholder="Passing Marks*"
                className="w-full px-4 py-3 text-base outline-none border border-[#f97a00] rounded-lg focus:ring-2 focus:ring-[#f97a00]"
                value={examPackData.passMark || ""}
                onChange={(e) =>
                  setExamPackData({
                    ...examPackData,
                    passMark: parseFloat(e.target.value),
                  })
                }
                required
              />
            </div>
          </div>

          {/* --- Exam Settings (Toggles) --- */}
          <div className="text-2xl text-[#dd6b01] font-semibold mt-8">
            Exam Settings
          </div>

          <div className="space-y-3 mt-3">
            <ToggleSwitch
              label="Randomization"
              checked={examSettings.randomization}
              onChange={(val) =>
                setExamSettings({ ...examSettings, randomization: val })
              }
            />
            <ToggleSwitch
              label="Feedback"
              checked={examSettings.feedback}
              onChange={(val) =>
                setExamSettings({ ...examSettings, feedback: val })
              }
            />
            <ToggleSwitch
              label="Private Exam"
              checked={examSettings.privateExam}
              onChange={(val) =>
                setExamSettings({ ...examSettings, privateExam: val })
              }
            />
            {examSettings.privateExam && (
              <input
                type="text"
                placeholder="Enter Private Password"
                value={examSettings.privatePassword || ""}
                onChange={(e) =>
                  setExamSettings({
                    ...examSettings,
                    privatePassword: e.target.value,
                  })
                }
                className="w-full px-4 py-2 border border-[#f97a00] rounded-lg focus:ring-2 focus:ring-[#f97a00] focus:outline-0"
              />
            )}
            <ToggleSwitch
              label="Score Limit"
              checked={examSettings.scoreLimit}
              onChange={(val) =>
                setExamSettings({ ...examSettings, scoreLimit: val })
              }
            />
            {examSettings.scoreLimit && (
              <input
                type="number"
                placeholder="Enter Score Limit"
                value={examSettings.scoreValue || ""}
                onChange={(e) =>
                  setExamSettings({
                    ...examSettings,
                    scoreValue: parseFloat(e.target.value),
                  })
                }
                required
                className="w-full px-4 py-2 border border-[#f97a00] rounded-lg focus:ring-2 focus:ring-[#f97a00] focus:outline-0"
              />
            )}

            <ToggleSwitch
              label="Negative Marking"
              checked={examSettings.negativeMarking}
              onChange={(val) =>
                setExamSettings({ ...examSettings, negativeMarking: val })
              }
            />
            {examSettings.negativeMarking && (
              <input
                type="number"
                placeholder="Enter Negative Mark (e.g. -0.5)"
                value={examSettings.negativeValue || ""}
                onChange={(e) =>
                  setExamSettings({
                    ...examSettings,
                    negativeValue: parseFloat(e.target.value),
                  })
                }
                required
                className="w-full px-4 py-2 border border-[#f97a00] rounded-lg focus:ring-2 focus:ring-[#f97a00] focus:outline-0"
              />
            )}

            <ToggleSwitch
              label="Exam Total Time (Minutes)"
              checked={examSettings.totalTime}
              onChange={(val) =>
                setExamSettings({ ...examSettings, totalTime: val })
              }
            />
            {examSettings.totalTime && (
              <input
                type="number"
                placeholder="Enter Total Time (Minutes)"
                value={examSettings.totalTimeValue || ""}
                onChange={(e) =>
                  setExamSettings({
                    ...examSettings,
                    totalTimeValue: parseFloat(e.target.value),
                  })
                }
                required
                className="w-full px-4 py-2 border border-[#f97a00] rounded-lg focus:ring-2 focus:ring-[#f97a00] focus:outline-0"
              />
            )}
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full bg-gradient-to-r from-[#dd6b01] to-[#f0b176] text-white font-semibold text-base py-3 rounded-full hover:opacity-90 transition-all duration-500 cursor-pointer disabled:opacity-50"
          >
            {saving ? "Updating..." : "Update Exam"}
          </button>
        </div>
      </form>
      {/* --- Relevant Rules Section --- */}
      <div className="mt-14 bg-orange-50 border border-[#fcd6aa] rounded-2xl p-6 md:p-10 shadow-sm">
        <h2 className="text-xl md:text-2xl font-semibold text-[#dd6b01] mb-4">
          📘 Relevant Rules for Editing Exam
        </h2>

        <ul className="list-disc list-inside space-y-2 text-gray-700 text-base leading-relaxed">
          <li>
            The <span className="font-bold">Exam Name</span> must be unique,
            clear, and descriptive — avoid duplicates.
          </li>
          <li>
            Ensure the uploaded image is high-quality (JPG/PNG) and under{" "}
            <span className="font-bold">2MB</span> in size.
          </li>
          <li>
            Select the correct <span className="font-bold">Level</span> and{" "}
            <span className="font-bold">Batch</span> for accurate student
            targeting.
          </li>
          <li>
            Add complete and helpful information in the{" "}
            <span className="font-bold">“Details”</span> section to describe the
            exam’s purpose and structure.
          </li>
          <li>
            Once published, exam packs can be edited but not deleted directly
            without admin approval.
          </li>
          <li>
            Make sure to set a valid <span className="font-bold">Start</span>{" "}
            and <span className="font-bold">End Time</span> — expired exams
            won’t be visible to students.
          </li>
          <li>
            If <span className="font-bold">Random Questions</span> is enabled,
            ensure you have enough questions in the pool to avoid duplication.
          </li>
          <li>
            The <span className="font-bold">Total Marks</span> and{" "}
            <span className="font-bold">Time Limit</span> should be balanced —
            avoid setting impossible goals.
          </li>
          <li>
            Always double-check spelling and grammar before publishing to
            maintain professionalism.
          </li>
          <li>
            For better ranking, assign the exam to the right{" "}
            <span className="font-bold">Category</span> and{" "}
            <span className="font-bold">Subject</span>.
          </li>
        </ul>

        <p className="mt-5 text-gray-600 text-sm italic">
          💡 Tip: Well-organized and clearly defined exam packs help students
          find and complete their exams more efficiently.
        </p>
      </div>
    </PageContainer>
  );
}
