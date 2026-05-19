"use client";

import { FaBook, FaUsers, FaClipboardList, FaUserShield } from "react-icons/fa";
import { PageContainer } from "@/components/common/PageContainer";

export default function ExamAnalysisPage() {
  // Dummy stats
  const stats = [
    { title: "Total Exams", value: 15, icon: FaBook, color: "bg-orange-100 text-orange-600" },
    { title: "Total Students", value: 520, icon: FaUsers, color: "bg-green-100 text-green-600" },
    { title: "Total Packs", value: 10, icon: FaClipboardList, color: "bg-blue-100 text-blue-600" },
    { title: "Total Teachers", value: 8, icon: FaUserShield, color: "bg-purple-100 text-purple-600" },
  ];

  return (
    <PageContainer className="space-y-6">
      <h1 className="text-3xl font-bold text-[#dd6b01]">Exam Analysis</h1>
      <p className="text-gray-500">Reports and statistics for exams, students, packs, and teachers.</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-6">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.title} className="bg-white p-6 rounded-xl shadow-lg flex flex-col items-center">
              <div className={`w-16 h-16 flex items-center justify-center rounded-full mb-4 ${s.color}`}>
                <Icon className="text-2xl" />
              </div>
              <h3 className="text-gray-700 font-semibold">{s.title}</h3>
              <p className="text-gray-900 font-bold text-xl">{s.value}</p>
            </div>
          );
        })}
      </div>
    </PageContainer>
  );
}
