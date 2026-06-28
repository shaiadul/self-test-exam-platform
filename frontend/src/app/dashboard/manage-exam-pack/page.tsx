"use client";

import { useState, useEffect } from "react";
import ExamPackCard from "../../../components/dashboard/ExamPackCard";
import AddButton from "../../../components/ui/AddButton";
import { PageContainer } from "../../../components/common/PageContainer";
import { getExamPacksAction } from "../../../lib/actions";

export default function ManageExamPackPage() {
  const [examPacks, setExamPacks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadPacks() {
      try {
        const packs = await getExamPacksAction();
        setExamPacks(packs || []);
      } catch (err) {
        console.error("Failed to load exam packs:", err);
      } finally {
        setLoading(false);
      }
    }
    loadPacks();
  }, []);

  return (
    <PageContainer>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Manage Exam Packs</h1>
        <AddButton href="/dashboard/manage-exam-pack/add" label="Add Exam Pack" />
      </div>

      {loading ? (
        <div className="min-h-[40vh] flex items-center justify-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#dd6b01]"></div>
        </div>
      ) : examPacks.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {examPacks.map((pack) => (
            <ExamPackCard
              key={pack.id}
              image={pack.image || "/global/test.png"}
              title={pack.title}
              description={pack.description}
              totalExams={pack.totalExams || 0}
              link={`/dashboard/manage-exam-pack/${pack.id}`}
            />
          ))}
        </div>
      ) : (
        <p className="text-center text-gray-500 mt-10">No exam packs found. Create one above!</p>
      )}
    </PageContainer>
  );
}
