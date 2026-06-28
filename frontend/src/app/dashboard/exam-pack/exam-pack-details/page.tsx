"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { PageContainer } from "../../../../components/common/PageContainer";
import { getExamsAction, getExamPackDetailsAction, getDashboardStatsAction } from "../../../../lib/actions";

type Exam = {
  id: string; // Professional ID
  name: string;
  startDate: string; // ISO string with time
  endDate: string;
  status: "Start Exam" | "Complete" | "Expire";
  link: string;
};

export default function ExamPackDetail() {
  const searchParams = useSearchParams();
  const packIdVal = searchParams.get("packId");
  const packId = packIdVal ? parseInt(packIdVal) : 2;

  const [packTitle, setPackTitle] = useState("Science Explorer");
  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadExams() {
      try {
        const pack = await getExamPackDetailsAction(packId);
        if (pack) {
          setPackTitle(pack.title);
        }

        const liveExams = await getExamsAction(packId);
        const stats = await getDashboardStatsAction();

        const completedSet = new Set<string>();
        if (stats?.recentExams) {
          stats.recentExams.forEach((item: any) => {
            const cleanId = item.id.startsWith("#") ? item.id.substring(1) : item.id;
            completedSet.add(cleanId);
          });
        }

        const now = new Date();
        const formatted: Exam[] = (liveExams || []).map((e: any) => {
          const start = new Date(e.startDate);
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

        setExams(formatted);
      } catch (err) {
        console.error("Failed to load exams:", err);
      } finally {
        setLoading(false);
      }
    }
    loadExams();
  }, [packId]);

  return (
    <PageContainer className="space-y-6">
      <h1 className="text-3xl font-bold text-[#dd6b01] mb-6">
        Exam Pack: {packTitle}
      </h1>

      {loading ? (
        <div className="min-h-[40vh] flex items-center justify-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#dd6b01]"></div>
        </div>
      ) : exams.length > 0 ? (
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
              {exams.map((exam) => (
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
                    {exam.status === "Expire" ? (
                      <span className="text-gray-500 font-semibold">{exam.name}</span>
                    ) : (
                      <Link
                        href={exam.link}
                        className="text-[#dd6b01] font-semibold underline hover:text-[#c35f00]"
                      >
                        {exam.name}
                      </Link>
                    )}
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
      ) : (
        <p className="text-center text-gray-500 py-12">No exams found in this package.</p>
      )}
    </PageContainer>
  );
}
