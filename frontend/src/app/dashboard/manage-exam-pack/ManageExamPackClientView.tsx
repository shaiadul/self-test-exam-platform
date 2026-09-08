"use client";

import { useState, useEffect } from "react";
import { FaSpinner } from "react-icons/fa";
import ExamPackCard from "../../../components/dashboard/ExamPackCard";
import AddButton from "../../../components/ui/AddButton";
import { PageContainer } from "../../../components/common/PageContainer";
import { getExamPacksAction } from "../../../lib/actions";

interface ManageExamPackClientViewProps {
  initialPacks: any[];
}

export default function ManageExamPackClientView({ initialPacks }: ManageExamPackClientViewProps) {
  const [examPacks, setExamPacks] = useState<any[]>(initialPacks || []);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initialPacks && initialPacks.length > 0) {
      setExamPacks(initialPacks);
    }
  }, [initialPacks]);

  useEffect(() => {
    if (!initialPacks || initialPacks.length === 0) {
      setLoading(true);
      const token = typeof window !== "undefined" ? localStorage.getItem("token") || undefined : undefined;
      getExamPacksAction(token)
        .then((fetched) => {
          if (fetched && Array.isArray(fetched) && fetched.length > 0) {
            setExamPacks(fetched);
          }
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [initialPacks]);

  return (
    <PageContainer>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Manage Exam Packs</h1>
        <AddButton href="/dashboard/manage-exam-pack/add" label="Add Exam Pack" />
      </div>

      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center gap-3 text-gray-500 font-medium">
          <FaSpinner className="animate-spin text-3xl text-[#dd6b01]" />
          <span className="text-sm">Loading exam packs...</span>
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
