"use client";

import React, { useState } from "react";
import { toast } from "sonner";
import CustomSelect from "../../../../components/ui/CustomSelect";
import { Input } from "../../../../components/ui/Input";
import { PageContainer } from "../../../../components/common/PageContainer";
import ImageUploader from "../../../../components/ui/ImageUploader";
import { createExamPackAction } from "../../../../lib/actions";
import { useRouter } from "next/navigation";

export default function AddExamPackPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [examPackData, setExamPackData] = useState({
    name: "",
    details: "",
    level: "",
    batch: "",
    image: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await createExamPackAction({
        title: examPackData.name,
        description: examPackData.details,
        category: examPackData.level || "General",
        image: examPackData.image || "/global/test.png",
      });
      if (res.success) {
        toast.success("Exam Pack created successfully.");
        router.push("/dashboard/manage-exam-pack");
      } else {
        toast.error(res.error || "Failed to create exam pack.");
      }
    } catch (err) {
      toast.error("Failed to create exam pack.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageContainer>
      <h1 className="text-2xl md:text-3xl font-semibold mb-8 text-[#dd6b01]">
        Create Exam Pack
      </h1>

      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 md:grid-cols-2 gap-10 items-start"
      >
        {/* --- Image Upload --- */}
        <div>
          <ImageUploader
            label="Exam Pack Cover Image"
            folder="exam-packs"
            height="h-96"
            value={examPackData.image}
            onChange={(url) => setExamPackData((prev) => ({ ...prev, image: url || "" }))}
            description="Upload a high quality cover image for this exam pack."
          />
        </div>

        {/* --- Form Inputs --- */}
        <div className="space-y-5">
          <Input
            label="Exam Pack Name"
            placeholder="Exam Pack Name*"
            value={examPackData.name}
            onChange={(e) =>
              setExamPackData({ ...examPackData, name: e.target.value })
            }
            required
          />

          <div>
            <label className="text-sm font-bold text-gray-700 ml-1 block mb-2">
              Details (description)
            </label>
            <textarea
              placeholder="Details*"
              className="w-full px-4 py-3.5 text-base outline-none border-2 border-gray-200 rounded-xl resize-none focus:border-[#dd6b01] min-h-[120px] bg-white transition-all font-medium text-gray-700 focus:ring-4 focus:ring-[#dd6b01]/10 outline-none"
              value={examPackData.details}
              onChange={(e) =>
                setExamPackData({ ...examPackData, details: e.target.value })
              }
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <CustomSelect
              label="Level"
              placeholder="Select Level"
              options={[
                "PSC",
                "SSC",
                "HSC",
                "BCS",
                "BS",
                "BA",
                "BBA",
                "MA",
                "PHD",
              ]}
              value={examPackData.level}
              onChange={(val) =>
                setExamPackData({ ...examPackData, level: val })
              }
            />

            <CustomSelect
              label="Batch"
              placeholder="Select Batch"
              options={Array.from({ length: 20 }, (_, i) =>
                (2010 + i).toString(),
              )}
              value={examPackData.batch}
              onChange={(val) =>
                setExamPackData({ ...examPackData, batch: val })
              }
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-[#dd6b01] to-[#f0b176] text-white font-semibold text-base py-3 rounded-full hover:opacity-90 transition-all duration-500 cursor-pointer disabled:opacity-50"
          >
            {loading ? "Saving..." : "Save Exam Pack"}
          </button>
        </div>
      </form>

      {/* --- Relevant Rules Section --- */}
      <div className="mt-14 bg-orange-50 border border-[#fcd6aa] rounded-2xl p-6 md:p-10 shadow-sm">
        <h2 className="text-xl md:text-2xl font-semibold text-[#dd6b01] mb-4">
          📘 Relevant Rules for Creating Exam Packs
        </h2>

        <ul className="list-disc list-inside space-y-2 text-gray-700 text-base leading-relaxed">
          <li>
            The <span className="font-bold">Exam Pack Name</span> must be unique
            and descriptive.
          </li>
          <li>
            Ensure the uploaded image is high-quality and under{" "}
            <span className="font-bold">2MB</span> in size.
          </li>
          <li>
            Use accurate <span className="font-bold">Level</span> and{" "}
            <span className="font-bold">Batch</span> to categorize properly.
          </li>
          <li>
            Include detailed information in the{" "}
            <span className="font-bold">“Details”</span> section for better
            clarity.
          </li>
          <li>
            Once published, exam packs can be edited but not deleted directly
            without admin permission.
          </li>
        </ul>

        <p className="mt-5 text-gray-600 text-sm italic">
          Tip: Well-organized exam packs help students quickly find relevant
          materials.
        </p>
      </div>
    </PageContainer>
  );
}
