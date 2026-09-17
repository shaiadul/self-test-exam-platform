"use client";

import { useState, useEffect, useTransition } from "react";
import { toast } from "sonner";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FaEdit, FaTrashAlt, FaPlus, FaSpinner, FaArrowLeft } from "react-icons/fa";
import { MdOutlineEditNote } from "react-icons/md";
import { PageContainer } from "../../../../components/common/PageContainer";
import EmptyState from "../../../../components/common/EmptyState";
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
  const [isPending, startTransition] = useTransition();

  const [exams, setExams] = useState<Exam[]>(
    (initialExams || []).map((e: any) => ({
      id: e.id,
      name: e.name,
      startDate: e.startDate,
      endDate: e.endDate,
      link: `/dashboard/exam-pack/exam-pack-details/${e.id}`,
    }))
  );

  const packTitle = initialPack?.title || "Exam Pack";

  // Sync state whenever SSR props change (e.g. after router.refresh())
  useEffect(() => {
    if (initialExams) {
      setExams(
        initialExams.map((e: any) => ({
          id: e.id,
          name: e.name,
          startDate: e.startDate,
          endDate: e.endDate,
          link: `/dashboard/exam-pack/exam-pack-details/${e.id}`,
        }))
      );
    }
  }, [initialExams]);

  // Sync token to document.cookie & trigger router.refresh() if initial data was empty
  useEffect(() => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("token");
      if (token && !document.cookie.includes("token=")) {
        document.cookie = `token=${token}; path=/; max-age=86400; SameSite=Lax`;
      }
    }

    if (packId && (!initialExams || initialExams.length === 0 || !initialPack)) {
      startTransition(() => {
        router.refresh();
      });
    }
  }, [packId, initialExams, initialPack, router]);

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "—";
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

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
        router.refresh();
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
        router.refresh();
      } else {
        toast.error(res.error || "Failed to delete exam pack.");
      }
    } catch {
      toast.error("Failed to delete exam pack.");
    }
  };

  return (
    <PageContainer className="space-y-6 animate-fadeIn pb-12">
      {/* --- Page Header Command Strip --- */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-4">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/manage-exam-pack"
            className="p-2 rounded border border-slate-200/80 bg-white text-slate-600 hover:text-primary hover:border-primary/40 shadow-2xs transition"
            title="Return to Packs"
          >
            <FaArrowLeft className="text-xs" />
          </Link>
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">
                CURRICULUM CONTAINER
              </span>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 border border-slate-200 font-bold">
                #{packId}
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              {packTitle}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <Link
            href={`/dashboard/manage-exam-pack/${packId}/add-exam`}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-primary hover:bg-primary-hover text-white rounded text-xs font-bold shadow-2xs transition"
          >
            <FaPlus className="text-[10px]" /> Add Exam
          </Link>
          <Link
            href={`/dashboard/manage-exam-pack/edit?packId=${packId}`}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 border border-slate-200/80 bg-white text-slate-700 hover:text-primary hover:border-primary/40 rounded text-xs font-bold shadow-2xs transition"
          >
            <FaEdit className="text-[10px]" /> Edit Pack
          </Link>
          <button
            onClick={handleDeleteExamPack}
            className="inline-flex items-center gap-1.5 px-3 py-2 border border-rose-200 bg-rose-50/50 hover:bg-rose-100/60 text-rose-700 rounded text-xs font-bold shadow-2xs transition cursor-pointer"
          >
            <FaTrashAlt className="text-[10px]" /> Delete
          </button>
        </div>
      </div>

      {/* --- Exams Table Data Grid --- */}
      <div className="bg-white rounded-none border border-slate-200/80 shadow-2xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-500">
              EXAMS REPOSITORY
            </span>
            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-primary/10 text-primary border border-primary/20 font-bold">
              {exams.length} ACTIVE
            </span>
            {isPending && (
              <FaSpinner className="animate-spin text-xs text-primary ml-1" />
            )}
          </div>
        </div>

        {exams.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/70 border-b border-slate-200/80 text-slate-500 font-mono font-bold text-[10px] uppercase tracking-wider">
                  <th className="py-3 px-4">Exam Name</th>
                  <th className="py-3 px-4">Code / ID</th>
                  <th className="py-3 px-4">Start Window</th>
                  <th className="py-3 px-4">End Window</th>
                  <th className="py-3 px-4 text-center">Questions</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {exams.map((exam) => (
                  <tr key={exam.id} className="hover:bg-slate-50/50 transition">
                    <td className="py-3.5 px-4 font-bold text-slate-900">
                      <Link
                        href={exam.link}
                        className="hover:text-primary transition"
                      >
                        {exam.name}
                      </Link>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-[11px] text-slate-500">
                      #{exam.id}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 font-medium font-mono text-[11px]">
                      {formatDate(exam.startDate)}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 font-medium font-mono text-[11px]">
                      {formatDate(exam.endDate)}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <Link
                        href={`/dashboard/question/add?examId=${exam.id}`}
                        className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded border border-blue-200/80 text-[11px] font-bold transition font-mono"
                      >
                        <MdOutlineEditNote className="text-sm" /> MANAGE_QUESTIONS
                      </Link>
                    </td>
                    <td className="py-3.5 px-4 text-right space-x-1">
                      <button
                        onClick={() => handleEditExam(exam.id)}
                        className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-slate-100 rounded transition cursor-pointer"
                        title="Edit Exam"
                      >
                        <FaEdit />
                      </button>
                      <button
                        onClick={() => handleDeleteExam(exam.id)}
                        className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded transition cursor-pointer"
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
        ) : isPending ? (
          <div className="py-16 flex flex-col items-center justify-center gap-2 text-slate-400 font-medium">
            <FaSpinner className="animate-spin text-2xl text-primary" />
            <span className="text-xs font-mono font-bold">SYNCHRONIZING REPOSITORY...</span>
          </div>
        ) : (
          <div className="py-6">
            <EmptyState
              compact
              type="exam"
              title="No Exams Configured"
              description="No exams have been configured in this curriculum container yet. Click '+ Add Exam' to initialize."
            />
          </div>
        )}
      </div>
    </PageContainer>
  );
}
