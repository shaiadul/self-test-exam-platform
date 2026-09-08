"use client";

import React, { useState } from "react";
import { toast } from "sonner";
import CustomSelect from "../../../../components/ui/CustomSelect";
import { Input } from "../../../../components/ui/Input";
import { PageContainer } from "../../../../components/common/PageContainer";
import ImageUploader from "../../../../components/ui/ImageUploader";
import { updateExamPackAction } from "../../../../lib/actions";
import { useRouter } from "next/navigation";

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
    setLoading(true);

    try {
      const res = await updateExamPackAction(packId, {
        title: examPackData.name,
        description: examPackData.details,
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
    <PageContainer>
      <h1 className="text-3xl font-bold text-[#dd6b01] mb-6">Edit Exam Pack: {examPackData.name}</h1>

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4 max-w-3xl">
        <Input
          placeholder="Exam Pack Title"
          value={examPackData.name}
          onChange={(e) => setExamPackData({ ...examPackData, name: e.target.value })}
          required
        />

        <textarea
          className="w-full p-3 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#dd6b01] min-h-[100px]"
          placeholder="Exam Pack Details / Description"
          value={examPackData.details}
          onChange={(e) => setExamPackData({ ...examPackData, details: e.target.value })}
        />

        <CustomSelect
          options={["Class 10", "HSC", "Admission", "General"]}
          value={examPackData.level}
          onChange={(val) => setExamPackData({ ...examPackData, level: val })}
          placeholder="Select Category Level"
        />

        <div>
          <ImageUploader
            label="Exam Pack Cover Image"
            folder="exam-packs"
            height="h-64"
            value={examPackData.image}
            onChange={(url) => setExamPackData({ ...examPackData, image: url || "" })}
            description="JPG, PNG, or WebP cover image for this pack."
          />
        </div>

        <div className="flex justify-end gap-4 pt-4">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-6 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-sm rounded-xl transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2.5 bg-[#dd6b01] hover:bg-orange-600 text-white font-bold text-sm rounded-xl shadow transition cursor-pointer"
          >
            {loading ? "Updating..." : "Update Pack"}
          </button>
        </div>
      </form>
    </PageContainer>
  );
}
