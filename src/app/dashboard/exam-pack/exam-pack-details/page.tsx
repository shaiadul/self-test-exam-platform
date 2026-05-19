"use client";

import Link from "next/link";
import { PageContainer } from "@/components/common/PageContainer";

type Exam = {
  id: string; // Professional ID
  name: string;
  startDate: string; // ISO string with time
  endDate: string;
  status: "Start Exam" | "Complete" | "Expire";
  link: string;
};

const examData: Exam[] = [
  {
    id: "HSC2341",
    name: "Algebra Basics",
    startDate: "2025-10-05T10:30",
    endDate: "2025-10-05T12:30",
    status: "Start Exam",
    link: "/dashboard/exam-pack/exam-pack-details/demo-exam",
  },
  {
    id: "SSC2341",
    name: "Physics Fundamentals",
    startDate: "2025-09-25T09:00",
    endDate: "2025-09-25T11:00",
    status: "Complete",
    link: "/dashboard/exam-pack/exam-pack-details/demo-exam",
  },
  {
    id: "BCSS2341",
    name: "Chemistry Lab",
    startDate: "2025-10-01T14:00",
    endDate: "2025-10-01T16:00",
    status: "Expire",
    link: "/dashboard/exam-pack/exam-pack-details/demo-exam",
  },
  {
    id: "HSC2342",
    name: "Biology Concepts",
    startDate: "2025-10-07T13:00",
    endDate: "2025-10-07T15:00",
    status: "Start Exam",
    link: "/dashboard/exam-pack/exam-pack-details/demo-exam",
  },
  {
    id: "SSC2342",
    name: "Geography Basics",
    startDate: "2025-09-28T09:00",
    endDate: "2025-09-28T11:00",
    status: "Complete",
    link: "/dashboard/exam-pack/exam-pack-details/demo-exam",
  },
  {
    id: "BCSS2342",
    name: "Physics Lab",
    startDate: "2025-10-03T15:00",
    endDate: "2025-10-03T17:00",
    status: "Expire",
    link: "/dashboard/exam-pack/exam-pack-details/demo-exam",
  },
  {
    id: "HSC2343",
    name: "Chemistry Fundamentals",
    startDate: "2025-10-09T12:00",
    endDate: "2025-10-09T14:00",
    status: "Start Exam",
    link: "/dashboard/exam-pack/exam-pack-details/demo-exam",
  },
  {
    id: "SSC2343",
    name: "Biology Lab",
    startDate: "2025-09-30T10:00",
    endDate: "2025-09-30T12:00",
    status: "Complete",
    link: "/dashboard/exam-pack/exam-pack-details/demo-exam",
  },
  {
    id: "BCSS2343",
    name: "Chemistry Concepts",
    startDate: "2025-10-05T16:00",
    endDate: "2025-10-05T18:00",
    status: "Expire",
    link: "/dashboard/exam-pack/exam-pack-details/demo-exam",
  },
];

export default function ExamPackDetail() {
  return (
    <PageContainer className="space-y-6">
      <h1 className="text-3xl font-bold text-[#dd6b01] mb-6">
        Exam Pack: Science Explorer
      </h1>

      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse shadow-lg rounded-xl overflow-hidden">
          <thead className="bg-amber-50 text-gray-400">
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
              <th className="px-6 py-4 text-left uppercase tracking-wide text-sm font-semibold">
                Status
              </th>
            </tr>
          </thead>

          <tbody className="bg-white">
            {examData.map((exam) => (
              <tr
                key={exam.id}
                className="border-b border-gray-200 hover:bg-[#ffedd5]/50 transition-colors"
              >
                {/* Exam ID */}
                <td className="px-6 py-4 font-mono text-sm text-gray-600 bg-amber-50">
                  {exam.id}
                </td>

                {/* Exam Name */}
                <td className="px-6 py-4">
                  <Link
                    href={exam.link}
                    className="text-[#dd6b01] font-semibold underline"
                  >
                    {exam.name}
                  </Link>
                </td>

                {/* Start Date & Time */}
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

                {/* End Date & Time */}
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

                {/* Status */}
                <td className="px-6 py-4">
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      exam.status === "Start Exam"
                        ? "bg-green-100 text-green-800"
                        : exam.status === "Complete"
                        ? "bg-blue-100 text-blue-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {exam.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </PageContainer>
  );
}
