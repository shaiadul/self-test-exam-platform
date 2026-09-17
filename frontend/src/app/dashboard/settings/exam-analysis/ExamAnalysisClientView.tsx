"use client";

import { FaBook, FaUsers, FaClipboardList, FaUserShield, FaChartLine } from "react-icons/fa";
import { PageContainer } from "../../../../components/common/PageContainer";

interface ExamAnalysisClientViewProps {
  initialStats: any;
}

export default function ExamAnalysisClientView({ initialStats }: ExamAnalysisClientViewProps) {
  const stats = initialStats;

  const statsList = [
    {
      code: "METRIC-01",
      title: "Total Exams",
      value: stats?.totalExams ?? 0,
      icon: FaBook,
      color: "text-primary bg-primary/10 border-primary/20",
      description: "Live exams configured across all packs",
    },
    {
      code: "METRIC-02",
      title: "Total Students",
      value: stats?.totalStudents ?? 0,
      icon: FaUsers,
      color: "text-emerald-600 bg-emerald-50 border-emerald-200/60",
      description: "Enrolled candidates and test takers",
    },
    {
      code: "METRIC-03",
      title: "Total Packs",
      value: stats?.totalPacks ?? 0,
      icon: FaClipboardList,
      color: "text-blue-600 bg-blue-50 border-blue-200/60",
      description: "Curriculum containers and categories",
    },
    {
      code: "METRIC-04",
      title: "Active Teachers",
      value: stats?.totalTeachers ?? 0,
      icon: FaUserShield,
      color: "text-purple-600 bg-purple-50 border-purple-200/60",
      description: "Educators with authoring privileges",
    },
  ];

  return (
    <PageContainer className="space-y-6 animate-fadeIn pb-12">
      {/* Top Header Command Strip */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded bg-blue-50 text-blue-600 flex items-center justify-center text-base border border-blue-200/60 shadow-2xs">
            <FaChartLine />
          </div>
          <div>
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
              TELEMETRY // [MOD-ANL] SYSTEM_METRICS
            </span>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Exam &amp; Platform Analysis
            </h1>
          </div>
        </div>

        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-mono font-bold">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          REALTIME_TELEMETRY
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statsList.map((s) => {
          const Icon = s.icon;
          return (
            <div
              key={s.code}
              className="relative overflow-hidden rounded border border-slate-200/80 bg-white p-5 shadow-2xs hover:border-primary/40 hover:shadow-xs transition"
            >
              {/* Subtle background SVG grid watermark */}
              <svg
                className="absolute inset-0 w-full h-full opacity-[0.03] pointer-events-none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <defs>
                  <pattern
                    id={`stat-grid-${s.code}`}
                    width="16"
                    height="16"
                    patternUnits="userSpaceOnUse"
                  >
                    <path
                      d="M 16 0 L 0 0 0 16"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="0.8"
                    />
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill={`url(#stat-grid-${s.code})`} />
              </svg>

              <div className="relative">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 border border-slate-200">
                    [{s.code}]
                  </span>
                  <div className={`w-8 h-8 rounded flex items-center justify-center text-sm border shadow-2xs ${s.color}`}>
                    <Icon />
                  </div>
                </div>

                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 block">
                  {s.title}
                </span>
                <p className="text-3xl font-black font-mono text-slate-900 tracking-tight my-1">
                  {s.value}
                </p>
                <p className="text-[11px] text-slate-500 font-medium line-clamp-1">
                  {s.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </PageContainer>
  );
}
