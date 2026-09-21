"use client";

import React, { useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { FaArrowLeft, FaSave, FaInfoCircle, FaEdit } from "react-icons/fa";
import CustomSelect from "../../../../components/ui/CustomSelect";
import { Input } from "../../../../components/ui/Input";
import { PageContainer } from "../../../../components/common/PageContainer";
import ImageUploader from "../../../../components/ui/ImageUploader";
import { PrimaryBtn } from "../../../../components/ui/PrimaryBtn";
import { OutlineBtn } from "../../../../components/ui/OutlineBtn";
import { updateExamPackAction } from "../../../../lib/actions";

interface EditExamPackClientViewProps {
  packId: number;
  initialPack: any;
}

export default function EditExamPackClientView({
  packId,
  initialPack,
}: EditExamPackClientViewProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [examPackData, setExamPackData] = useState({
    id: initialPack?.id ? initialPack.id.toString() : "",
    name: initialPack?.title || "",
    details: initialPack?.description || "",
    level: initialPack?.category || "General",
    batch: "",
    image: initialPack?.image || "/global/test.png",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!examPackData.name.trim()) {
      toast.error("Please provide an Exam Pack title.");
      return;
    }
    if (examPackData.name.trim().length < 3) {
      toast.error("Exam Pack title must be at least 3 characters long.");
      return;
    }
    if (!examPackData.details.trim()) {
      toast.error("Please provide an Exam Pack description.");
      return;
    }
    if (examPackData.details.trim().length < 5) {
      toast.error("Exam Pack description must be at least 5 characters long.");
      return;
    }

    setLoading(true);
    try {
      const res = await updateExamPackAction(packId, {
        title: examPackData.name.trim(),
        description: examPackData.details.trim(),
        category: examPackData.level || "General",
        image: examPackData.image,
      });

      if (res.success) {
        toast.success("Exam pack updated successfully!");
        router.push("/dashboard/manage-exam-pack");
      } else {
        toast.error(res.error || "Failed to update exam pack.");
      }
    } catch {
      toast.error("Failed to update exam pack.");
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
              Edit Exam Pack: {examPackData.name || `#${packId}`}
            </h1>
          </div>
        </div>

        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-amber-50 text-amber-700 border border-amber-200 text-xs font-bold">
          <FaEdit className="text-xs" />
          Edit Mode
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
                onChange={(url) => setExamPackData((prev) => ({ ...prev, image: url || "" }))}
                description="Aspect ratio 16:9 recommended. Max 2MB."
              />
            </div>

            {/* Architecture Guidelines Callout */}
            <div className="relative overflow-hidden rounded bg-slate-50 border border-slate-200/80 p-4 text-[11px] leading-relaxed text-slate-600 space-y-2">
              <div className="flex items-center gap-1.5 font-bold text-slate-800">
                <FaInfoCircle className="text-blue-500 text-xs" />
                <span>Container Structure</span>
              </div>
              <p>
                Updates will be reflected immediately in all enrolled student rosters and curriculum browsing matrices.
              </p>
            </div>
          </div>

          {/* Form Fields Column */}
          <div className="lg:col-span-8 space-y-4">
            <div className="relative overflow-hidden rounded bg-white border border-slate-200/80 p-5 sm:p-6 shadow-2xs space-y-5">
              <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
                <div>
                  <h2 className="text-base font-black text-slate-900 tracking-tight">
                    Pack Configuration
                  </h2>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200 font-bold">
                  ID: #{packId}
                </span>
              </div>

              <div className="space-y-4">
                <Input
                  label="Exam Pack Title"
                  placeholder="e.g. HSC Physics Model Tests 2025"
                  value={examPackData.name}
                  onChange={(e) => setExamPackData({ ...examPackData, name: e.target.value })}
                  required
                />

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 ml-0.5 block">
                    Curriculum Description & Syllabus
                  </label>
                  <textarea
                    className="w-full p-3 border border-slate-200 rounded text-xs font-medium text-slate-800 placeholder:text-slate-400 outline-none transition-all duration-150 focus:border-primary focus:ring-1 focus:ring-primary/20 min-h-[110px]"
                    placeholder="Provide overview, covered chapters, and target test takers..."
                    value={examPackData.details}
                    onChange={(e) => setExamPackData({ ...examPackData, details: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-700 ml-0.5 block mb-1">
                      Academic Level / Category
                    </label>
                    <CustomSelect
                      options={["Class 10", "HSC", "Admission", "General"]}
                      value={examPackData.level}
                      onChange={(val) => setExamPackData({ ...examPackData, level: val })}
                      placeholder="Select Category Level"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Action HUD */}
            <div className="rounded bg-white border border-slate-200/80 p-4 shadow-2xs flex flex-col sm:flex-row items-center justify-center sm:justify-between mx-auto gap-3">
              <div className="text-xs text-slate-500">
                Ready to save your exam pack changes
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
                      <span>Saving Changes…</span>
                    </>
                  ) : (
                    <>
                      <FaSave className="text-[11px]" />
                      <span>Commit Changes</span>
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
