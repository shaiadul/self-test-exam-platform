"use client";

import { useState } from "react";
import { toast } from "sonner";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FaEdit, FaTrashAlt, FaPlus } from "react-icons/fa";
import { MdOutlineEditNote } from "react-icons/md";
import { PageContainer } from "../../../../components/common/PageContainer";
import { deleteExamAction, deleteExamPackAction } from "../../../../lib/actions";

type Exam = {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  link: string;
};

interface ManageExamPackDetailClientViewProps {
  packId: number;
  initialPack: any;
  initialExams: any[];
}

export default function ManageExamPackDetailClientView({
  packId,
  initialPack,
  initialExams,
}: ManageExamPackDetailClientViewProps) {
  const router = useRouter();

  const [packTitle] = useState(initialPack?.title || "Exam Pack");
  const [exams, setExams] = useState<Exam[]>(
    (initialExams || []).map((e: any) => ({
      id: e.id,
      name: e.name,
      startDate: e.startDate,
      endDate: e.endDate,
      link: `/dashboard/exam-pack/exam-pack-details/${e.id}`,
    }))
  );

  const handleEditExam = (examId: string) => {
    router.push(`/dashboard/manage-exam-pack/${packId}/edit-exam?examId=${examId}`);
  };

  const handleDeleteExam = async (examId: string) => {
    if (!confirm("Are you sure you want to delete this exam?")) return;
    try {
      const res = await deleteExamAction(examId, packId);
      if (res.success) {
        toast.success("Exam deleted successfully.");
        setExams((prev) => prev.filter((e) => e.id !== examId));
      } else {
        toast.error(res.error || "Failed to delete exam.");
      }
    } catch {
      toast.error("Failed to delete exam.");
    }
  };

  const handleDeleteExamPack = async () => {
    if (!confirm(`Are you sure you want to delete exam pack "${packTitle}"? All exams inside will also be deleted.`)) return;
    try {
      const res = await deleteExamPackAction(packId);
      if (res.success) {
        toast.success("Exam pack deleted successfully.");
        router.push("/dashboard/manage-exam-pack");
      } else {
        toast.error(res.error || "Failed to delete exam pack.");
      }
    } catch {
      toast.error("Failed to delete exam pack.");
    }
  };

  return (
    <PageContainer>
      {/* --- Page Header --- */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
        <h1 className="text-3xl font-bold text-[#dd6b01]">
          Exam Pack: {packTitle}
        </h1>

        <div className="flex items-center gap-3">
          <Link
            href={`/dashboard/manage-exam-pack/${packId}/add-exam`}
            className="flex items-center gap-2 px-4 py-2 bg-[#dd6b01] hover:bg-orange-600 text-white rounded-lg font-bold text-sm shadow transition"
          >
            <FaPlus /> Add Exam
          </Link>
          <Link
            href={`/dashboard/manage-exam-pack/edit?packId=${packId}`}
            className="flex items-center gap-2 px-4 py-2 border border-[#dd6b01] text-[#dd6b01] hover:bg-orange-50 rounded-lg font-bold text-sm transition"
          >
            <FaEdit /> Edit Pack
          </Link>
          <button
            onClick={handleDeleteExamPack}
            className="flex items-center gap-2 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-bold text-sm shadow transition cursor-pointer"
          >
            <FaTrashAlt /> Delete Pack
          </button>
        </div>
      </div>

      {/* --- Exams Table --- */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-800">
            Exams List ({exams.length})
          </h2>
        </div>

        {exams.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100 text-gray-400 font-bold text-xs uppercase tracking-wider">
                  <th className="py-3 px-6">Exam Name</th>
                  <th className="py-3 px-6">Code / ID</th>
                  <th className="py-3 px-6">Start Date</th>
                  <th className="py-3 px-6">End Date</th>
                  <th className="py-3 px-6 text-center">Questions</th>
                  <th className="py-3 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {exams.map((exam) => (
                  <tr key={exam.id} className="hover:bg-gray-50/50 transition">
                    <td className="py-4 px-6 font-bold text-gray-900">
                      <Link
                        href={exam.link}
                        className="hover:text-[#dd6b01] transition"
                      >
                        {exam.name}
                      </Link>
                    </td>
                    <td className="py-4 px-6 font-mono text-xs text-gray-500">
                      {exam.id}
                    </td>
                    <td className="py-4 px-6 text-gray-600 font-medium">
                      {exam.startDate}
                    </td>
                    <td className="py-4 px-6 text-gray-600 font-medium">
                      {exam.endDate}
                    </td>
                    <td className="py-4 px-6 text-center">
                      <Link
                        href={`/dashboard/question/add?examId=${exam.id}`}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-xl text-xs font-bold transition border border-blue-200"
                      >
                        <MdOutlineEditNote className="text-base" /> Add / Manage
                      </Link>
                    </td>
                    <td className="py-4 px-6 text-right space-x-2">
                      <button
                        onClick={() => handleEditExam(exam.id)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                        title="Edit Exam"
                      >
                        <FaEdit />
                      </button>
                      <button
                        onClick={() => handleDeleteExam(exam.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                        title="Delete Exam"
                      >
                        <FaTrashAlt />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12 text-gray-500 font-medium">
            No exams configured in this pack yet.
          </div>
        )}
      </div>
    </PageContainer>
  );
}
