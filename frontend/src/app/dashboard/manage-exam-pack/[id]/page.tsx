"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FaEdit, FaTrashAlt, FaPlus } from "react-icons/fa";
import { MdOutlineEditNote } from "react-icons/md";
import { PageContainer } from "../../../../components/common/PageContainer";

type Exam = {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  link: string;
};

const examData: Exam[] = [
  {
    id: "HSC2341",
    name: "Algebra Basics",
    startDate: "2025-10-05T10:30",
    endDate: "2025-10-05T12:30",
    link: "/dashboard/exam-pack/exam-pack-details/demo-exam",
  },
  {
    id: "SSC2341",
    name: "Physics Fundamentals",
    startDate: "2025-09-25T09:00",
    endDate: "2025-09-25T11:00",
    link: "/dashboard/exam-pack/exam-pack-details/demo-exam",
  },
  {
    id: "BCSS2341",
    name: "Chemistry Lab",
    startDate: "2025-10-01T14:00",
    endDate: "2025-10-01T16:00",
    link: "/dashboard/exam-pack/exam-pack-details/demo-exam",
  },
];

export default function ExamPackDetail() {
  const router = useRouter();
  const handleEditExam = (id: string) => {
    console.log("Edit Exam:", id);
    router.push(`/dashboard/manage-exam-pack/mathbcs2025/edit-exam`);
  };

  return (
    <PageContainer>
      {/* --- Page Header --- */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
        <h1 className="text-3xl font-bold text-[#dd6b01]">
          Exam Pack: Science Explorer
        </h1>

        <div className="flex gap-3">
          <Link
            href="/dashboard/manage-exam-pack/edit"
            className="flex items-center gap-2 border border-[#dd6b01] text-[#dd6b01] font-medium px-4 py-2 rounded-lg hover:bg-[#dd6b01] hover:text-white transition-all"
          >
            <MdOutlineEditNote className="text-lg" /> Edit Exam Pack
          </Link>
          <Link
            href="/dashboard/manage-exam-pack/mathbcs2025/add-exam"
            className="flex items-center gap-2 bg-[#dd6b01] text-white font-medium px-4 py-2 rounded-lg hover:bg-[#c25e00] transition-all"
          >
            <FaPlus className="text-sm" /> Add Exam
          </Link>
        </div>
      </div>

      {/* --- Exam Table --- */}
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
            {examData.map((exam) => (
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
    </PageContainer>
  );
}
