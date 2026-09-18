"use client";

import React, { useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { FaArrowLeft, FaSave, FaInfoCircle, FaBoxOpen } from "react-icons/fa";
import CustomSelect from "../../../../components/ui/CustomSelect";
import { Input } from "../../../../components/ui/Input";
import { PageContainer } from "../../../../components/common/PageContainer";
import ImageUploader from "../../../../components/ui/ImageUploader";
import { PrimaryBtn } from "../../../../components/ui/PrimaryBtn";
import { OutlineBtn } from "../../../../components/ui/OutlineBtn";
import { createExamPackAction } from "../../../../lib/actions";

export default function AddExamPackPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [examPackData, setExamPackData] = useState({
    name: "",
    details: "",
    level: "HSC",
    batch: "2025",
    image: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!examPackData.name.trim()) {
      toast.error("Please provide an Exam Pack title.");
      return;
    }

    setLoading(true);
    try {
      const res = await createExamPackAction({
        title: examPackData.name.trim(),
        description: examPackData.details.trim(),
        category: examPackData.level || "General",
        image: examPackData.image || "/global/test.png",
      });
      if (res.success) {
        toast.success("Exam Pack container initialized successfully.");
        router.push("/dashboard/manage-exam-pack");
      } else {
        toast.error(res.error || "Failed to create exam pack.");
      }
    } catch {
      toast.error("Failed to create exam pack.");
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
            link="/dashboard/manage-exam-pack"
            className="!p-2 !rounded !text-slate-600 hover:!text-primary shadow-2xs border-slate-200"
            title="Return to Pack List"
          >
            <FaArrowLeft className="text-xs" />
          </OutlineBtn>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Create New Exam Pack
            </h1>
          </div>
        </div>

        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-blue-50 text-blue-700 border border-blue-200 text-xs font-bold">
          <FaBoxOpen className="text-xs" />
          Create Pack
        </span>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Cover Media Column */}
          <div className="lg:col-span-4 space-y-4">
            <div className="relative overflow-hidden rounded bg-white border border-slate-200/80 p-4 shadow-2xs">
              <span className="text-xs font-bold text-slate-700 block mb-2">
                Pack Cover Image
              </span>
              <ImageUploader
                folder="exam-packs"
                height="h-64"
                value={examPackData.image}
                onChange={(url) =>
                  setExamPackData((prev) => ({ ...prev, image: url || "" }))
                }
                description="Aspect ratio 16:9 recommended. Max 2MB."
              />
            </div>

            <div className="relative overflow-hidden rounded bg-slate-50 border border-slate-200/80 p-4 text-[11px] leading-relaxed text-slate-600 space-y-2">
              <div className="flex items-center gap-1.5 text-slate-900 font-bold text-xs">
                <FaInfoCircle className="text-primary" />
                <span>Container Structure Guidelines</span>
              </div>
              <ul className="space-y-1 text-slate-500 font-medium">
                <li>• Each pack holds individual exam question papers.</li>
                <li>
                  • Candidate access policies are derived from syllabus level.
                </li>
                <li>
                  • Published containers can be edited or augmented anytime.
                </li>
              </ul>
            </div>
          </div>

          <div className="lg:col-span-8 space-y-4">
            <div className="relative rounded bg-white border border-slate-200/80 p-5 shadow-2xs space-y-4">
              <Input
                label="Exam Pack Title *"
                placeholder="e.g. Higher Secondary Physics Board Prep"
                value={examPackData.name}
                onChange={(e) =>
                  setExamPackData({ ...examPackData, name: e.target.value })
                }
                required
              />

              <div className="space-y-1.5">
                <label className="text-xs font-mono font-bold uppercase tracking-wider text-slate-600 block">
                  Curriculum Description / Objectives *
                </label>
                <textarea
                  rows={4}
                  placeholder="Provide syllabus outline, target topics, and chapter coverage..."
                  className="w-full p-3 bg-white border border-slate-300 rounded text-xs text-slate-800 placeholder:text-slate-400 font-medium outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all resize-none"
                  value={examPackData.details}
                  onChange={(e) =>
                    setExamPackData({
                      ...examPackData,
                      details: e.target.value,
                    })
                  }
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                <CustomSelect
                  label="Target Academic Level"
                  placeholder="Select Level"
                  options={[
                    "PSC",
                    "SSC",
                    "HSC",
                    "Admission",
                    "BCS",
                    "Undergraduate",
                    "Postgraduate",
                  ]}
                  value={examPackData.level}
                  onChange={(val) =>
                    setExamPackData({ ...examPackData, level: val })
                  }
                />

                <CustomSelect
                  label="Target Examination Batch"
                  placeholder="Select Batch"
                  options={["2024", "2025", "2026", "2027", "2028"]}
                  value={examPackData.batch}
                  onChange={(val) =>
                    setExamPackData({ ...examPackData, batch: val })
                  }
                />
              </div>
            </div>

            {/* Submit HUD */}
            <div className="rounded bg-white border border-slate-200/80 p-4 shadow-2xs flex items-center justify-between gap-3">
              <span className="text-[11px] font-mono text-slate-400">
                PARAMS_VERIFIED: READY
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
                  {loading ? (
                    <>
                      <span className="animate-spin inline-block w-3 h-3 border-2 border-white/30 border-t-white rounded-full" />
                      <span>Initializing…</span>
                    </>
                  ) : (
                    <>
                      <FaSave className="text-[10px]" />
                      <span>Save Exam Pack</span>
                    </>
                  )}
                </PrimaryBtn>
              </div>
            </div>
          </div>
        </div>
      </form>
    </PageContainer>
  );
}
