"use client";

import Link from "next/link";
import { PageContainer } from "../../../../components/common/PageContainer";

type Exam = {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  status: "Start Exam" | "Complete" | "Expire";
  link: string;
};

interface ExamPackDetailsClientViewProps {
  initialPack: any;
  initialExams: any[];
  initialStats: any;
}

export default function ExamPackDetailsClientView({
  initialPack,
  initialExams,
  initialStats,
}: ExamPackDetailsClientViewProps) {
  const packTitle = initialPack?.title || "Science Explorer";

  const completedSet = new Set<string>();
  if (initialStats?.recentExams) {
    initialStats.recentExams.forEach((item: any) => {
      const cleanId = item.id.startsWith("#") ? item.id.substring(1) : item.id;
      completedSet.add(cleanId);
    });
  }

  const now = new Date();
  const exams: Exam[] = (initialExams || []).map((e: any) => {
    const end = new Date(e.endDate);
    let status: "Start Exam" | "Complete" | "Expire" = "Start Exam";

    if (completedSet.has(e.id)) {
      status = "Complete";
    } else if (now > end) {
      status = "Expire";
    }

    return {
      id: e.id,
      name: e.name,
      startDate: e.startDate,
      endDate: e.endDate,
      status,
      link: `/dashboard/exam-pack/exam-pack-details/${e.id}`,
    };
  });

  return (
    <PageContainer className="space-y-6">
      <h1 className="text-3xl font-bold text-[#dd6b01] mb-6">
        Exam Pack Details: {packTitle}
      </h1>

      <div className="overflow-x-auto bg-white border border-gray-100 rounded-2xl shadow-sm">
        <table className="min-w-full border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100 text-gray-500 font-bold text-xs uppercase tracking-wider">
              <th className="px-6 py-4 text-left">Exam Name</th>
              <th className="px-6 py-4 text-left">Exam Code</th>
              <th className="px-6 py-4 text-left">Start Date</th>
              <th className="px-6 py-4 text-left">End Date</th>
              <th className="px-6 py-4 text-center">Action / Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {exams.map((exam) => (
              <tr key={exam.id} className="hover:bg-gray-50/50 transition">
                <td className="px-6 py-4 font-bold text-gray-900">{exam.name}</td>
                <td className="px-6 py-4 font-mono text-xs text-gray-500">#{exam.id}</td>
                <td className="px-6 py-4 text-sm text-gray-600 font-medium">{exam.startDate}</td>
                <td className="px-6 py-4 text-sm text-gray-600 font-medium">{exam.endDate}</td>
                <td className="px-6 py-4 text-center">
                  {exam.status === "Start Exam" && (
                    <Link
                      href={exam.link}
                      className="inline-block px-5 py-2 bg-[#dd6b01] hover:bg-orange-600 text-white font-bold text-xs rounded-xl shadow transition"
                    >
                      Start Exam
                    </Link>
                  )}
                  {exam.status === "Complete" && (
                    <span className="inline-block px-4 py-1.5 bg-green-50 text-green-700 font-bold text-xs rounded-full border border-green-200">
                      ✓ Completed
                    </span>
                  )}
                  {exam.status === "Expire" && (
                    <span className="inline-block px-4 py-1.5 bg-gray-100 text-gray-500 font-bold text-xs rounded-full border border-gray-200">
                      Expired
                    </span>
                  )}
                </td>
              </tr>
            ))}

            {exams.length === 0 && (
              <tr>
                <td colSpan={5} className="py-8 text-center text-gray-500 font-medium">
                  No active exams available in this pack.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </PageContainer>
  );
}
