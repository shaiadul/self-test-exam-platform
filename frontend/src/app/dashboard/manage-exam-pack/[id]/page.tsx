"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { FaEdit, FaTrashAlt, FaPlus } from "react-icons/fa";
import { MdOutlineEditNote } from "react-icons/md";
import { PageContainer } from "../../../../components/common/PageContainer";
import { getExamsAction, getExamPackDetailsAction, deleteExamAction, deleteExamPackAction } from "../../../../lib/actions";

type Exam = {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  link: string;
};

export default function ExamPackDetail() {
  const params = useParams();
  const router = useRouter();
  const idStr = params.id as string;
  const packId = idStr ? parseInt(idStr) : 0;

  const [packTitle, setPackTitle] = useState("Science Explorer");
  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);

  async function loadExams() {
    try {
      const pack = await getExamPackDetailsAction(packId);
      if (pack) {
        setPackTitle(pack.title);
      }

      const liveExams = await getExamsAction(packId);
      const formatted: Exam[] = (liveExams || []).map((e: any) => ({
        id: e.id,
        name: e.name,
        startDate: e.startDate,
        endDate: e.endDate,
        link: `/dashboard/exam-pack/exam-pack-details/${e.id}`,
      }));
      setExams(formatted);
    } catch (err) {
      console.error("Failed to load exams:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (packId) {
      loadExams();
    }
  }, [packId]);

  const handleEditExam = (examId: string) => {
    router.push(`/dashboard/manage-exam-pack/${packId}/edit-exam?examId=${examId}`);
  };

  const handleDeleteExam = async (examId: string) => {
    if (!confirm("Are you sure you want to delete this exam?")) return;
    try {
      const res = await deleteExamAction(examId, packId);
      if (res.success) {
        alert("Exam deleted successfully.");
        loadExams();
      } else {
        alert(res.error || "Failed to delete exam.");
      }
    } catch (err) {
      alert("Failed to delete exam.");
    }
  };

  const handleDeleteExamPack = async () => {
    if (!confirm(`Are you sure you want to delete exam pack "${packTitle}"? All exams inside will also be deleted.`)) return;
    try {
      const res = await deleteExamPackAction(packId);
      if (res.success) {
        alert("Exam pack deleted successfully.");
        router.push("/dashboard/manage-exam-pack");
      } else {
        alert(res.error || "Failed to delete exam pack.");
      }
    } catch (err) {
      alert("Failed to delete exam pack.");
    }
  };

  return (
    <PageContainer>
      {/* --- Page Header --- */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
        <h1 className="text-3xl font-bold text-[#dd6b01]">
          Exam Pack: {packTitle}
        </h1>

        <div className="flex gap-3">
          <Link
            href={`/dashboard/manage-exam-pack/edit?packId=${packId}`}
            className="flex items-center gap-2 border border-[#dd6b01] text-[#dd6b01] font-medium px-4 py-2 rounded-lg hover:bg-[#dd6b01] hover:text-white transition-all"
          >
            <MdOutlineEditNote className="text-lg" /> Edit Exam Pack
          </Link>
          <button
            onClick={handleDeleteExamPack}
            className="flex items-center gap-2 border border-red-600 text-red-600 font-medium px-4 py-2 rounded-lg hover:bg-red-600 hover:text-white transition-all cursor-pointer"
          >
            <FaTrashAlt className="text-sm" /> Delete Exam Pack
          </button>
          <Link
            href={`/dashboard/manage-exam-pack/${packId}/add-exam`}
            className="flex items-center gap-2 bg-[#dd6b01] text-white font-medium px-4 py-2 rounded-lg hover:bg-[#c25e00] transition-all"
          >
            <FaPlus className="text-sm" /> Add Exam
          </Link>
        </div>
      </div>

      {/* --- Exam Table --- */}
      {loading ? (
        <div className="min-h-[40vh] flex items-center justify-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#dd6b01]"></div>
        </div>
      ) : exams.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse shadow-md rounded-xl overflow-hidden">
            <thead className="bg-amber-50 text-gray-500">
              <tr>
                <th className="px-6 py-4 text-left uppercase tracking-wide text-sm font-semibold">
                  Exam ID
                </th>
                <th className="px-6 py-4 text-left uppercase tracking-wide text-sm font-semibold">
                  Exam Name
                </th>
                <th className="px-6 py-4 text-left uppercase tracking-wide text-sm font-semibold">
                  Start Date & Time
                </th>
                <th className="px-6 py-4 text-left uppercase tracking-wide text-sm font-semibold">
                  End Date & Time
                </th>
                <th className="px-6 py-4 text-center uppercase tracking-wide text-sm font-semibold">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody className="bg-white">
              {exams.map((exam) => (
                <tr
                  key={exam.id}
                  className="border-b border-gray-200 hover:bg-[#fff7ed] transition-colors"
                >
                  {/* Exam ID */}
                  <td className="px-6 py-4 font-mono text-sm text-gray-600 bg-amber-50">
                    {exam.id}
                  </td>

                  {/* Exam Name */}
                  <td className="px-6 py-4">
                    <Link
                      href={exam.link}
                      className="text-[#dd6b01] font-semibold underline hover:text-[#c25e00]"
                    >
                      {exam.name}
                    </Link>
                  </td>

                  {/* Start Date */}
                  <td className="px-6 py-4 text-gray-700 text-sm">
                    <div className="flex flex-col">
                      <span className="font-semibold">
                        {new Date(exam.startDate).toLocaleDateString("en-US", {
                          weekday: "short",
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </span>
                      <span className="text-gray-500 text-xs">
                        {new Date(exam.startDate).toLocaleTimeString("en-US", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                  </td>

                  {/* End Date */}
                  <td className="px-6 py-4 text-gray-700 text-sm">
                    <div className="flex flex-col">
                      <span className="font-semibold">
                        {new Date(exam.endDate).toLocaleDateString("en-US", {
                          weekday: "short",
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </span>
                      <span className="text-gray-500 text-xs">
                        {new Date(exam.endDate).toLocaleTimeString("en-US", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                  </td>

                  {/* Actions */}
                  <td className="px-6 py-4 text-center">
                    <div className="flex justify-center items-center gap-3">
                      <button
                        onClick={() => {
                          handleEditExam(exam.id);
                        }}
                        className="flex items-center gap-2 bg-[#dd6b01] text-white px-3 py-1.5 rounded-md text-sm font-medium hover:bg-[#c25e00] transition-all cursor-pointer"
                        title="Edit Exam"
                      >
                        <FaEdit className="text-sm" />
                        Edit
                      </button>

                      <button
                        onClick={() => {
                          handleDeleteExam(exam.id);
                        }}
                        className="flex items-center gap-2 bg-red-600 text-white px-3 py-1.5 rounded-md text-sm font-medium hover:bg-red-700 transition-all cursor-pointer"
                        title="Delete Exam"
                      >
                        <FaTrashAlt className="text-sm" />
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-center text-gray-500 py-12">No exams created for this pack yet.</p>
      )}
    </PageContainer>
  );
}
