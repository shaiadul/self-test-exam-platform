"use client";

import { useState, useEffect } from "react";
import { FaBook, FaUsers, FaClipboardList, FaUserShield } from "react-icons/fa";
import { PageContainer } from "../../../../components/common/PageContainer";
import { getAnalysisStatsAction } from "../../../../lib/actions";

export default function ExamAnalysisPage() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadStats() {
      setLoading(true);
      setError(null);
      try {
        const res = await getAnalysisStatsAction();
        if (res) {
          setStats(res);
        } else {
          setError("Failed to retrieve metrics from backend.");
        }
      } catch (err) {
        console.error(err);
        setError("Failed to fetch system analysis stats.");
      } finally {
        setLoading(false);
      }
    }
    loadStats();
  }, []);

  const statsList = [
    {
      title: "Total Exams",
      value: stats?.totalExams ?? 0,
      icon: FaBook,
      color: "bg-orange-100 text-orange-600",
    },
    {
      title: "Total Students",
      value: stats?.totalStudents ?? 0,
      icon: FaUsers,
      color: "bg-green-100 text-green-600",
    },
    {
      title: "Total Packs",
      value: stats?.totalPacks ?? 0,
      icon: FaClipboardList,
      color: "bg-blue-100 text-blue-600",
    },
    {
      title: "Total Teachers",
      value: stats?.totalTeachers ?? 0,
      icon: FaUserShield,
      color: "bg-purple-100 text-purple-600",
    },
  ];

  return (
    <PageContainer className="space-y-6 animate-fadeIn">
      <div>
        <h1 className="text-3xl font-bold text-[#dd6b01]">Exam Analysis</h1>
        <p className="text-gray-500">
          Live statistics and metric analysis for exams, students, packs, and teachers.
        </p>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-2xl font-semibold">
          {error}
        </div>
      )}

      {loading ? (
        <div className="min-h-[50vh] flex items-center justify-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#dd6b01]"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-6">
          {statsList.map((s) => {
            const Icon = s.icon;
            return (
              <div
                key={s.title}
                className="bg-white p-6 rounded-3xl border border-gray-100 shadow-md flex flex-col items-center justify-center text-center hover:scale-[1.02] transition-transform duration-300"
              >
                <div
                  className={`w-16 h-16 flex items-center justify-center rounded-full mb-4 ${s.color}`}
                >
                  <Icon className="text-2xl" />
                </div>
                <h3 className="text-gray-700 font-bold mb-1">{s.title}</h3>
                <p className="text-gray-900 font-black text-3xl">{s.value}</p>
              </div>
            );
          })}
        </div>
      )}
    </PageContainer>
  );
}
