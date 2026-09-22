import React from "react";
import Link from "next/link";
import {
  FaBookOpen,
  FaAward,
  FaFileAlt,
  FaCheckCircle,
  FaTasks,
  FaClock,
  FaArrowRight,
} from "react-icons/fa";
import UserCard from "../../../components/dashboard/UserCard";
import ExamQuotaCard from "../../../components/dashboard/ExamQuotaCard";
import ChartCard from "../../../components/dashboard/ChartCard";
import EmptyState from "../../../components/common/EmptyState";
import { PrimaryBtn } from "../../../components/ui/PrimaryBtn";

interface TeacherDashboardViewProps {
  name: string;
  profileData: {
    image: string;
    board: string;
    level: string;
    batch: string;
    institution: string;
  };
  normRole: string;
  stats: any;
}

export const TeacherDashboardView: React.FC<TeacherDashboardViewProps> = ({
  name,
  profileData,
  normRole,
  stats,
}) => {
  return (
    <div className="space-y-4 sm:space-y-5 animate-fadeIn">
      {/* Top Banner Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-stretch">
        <div className="lg:col-span-2">
          <UserCard
            name={name}
            board={profileData.board}
            level={profileData.level}
            batch={profileData.batch}
            institution={profileData.institution}
            image={profileData.image}
            role={normRole}
          />
        </div>

        {/* Active Syllabus Module Card */}
        <div className="relative overflow-hidden rounded bg-slate-900 border border-slate-800 p-4 sm:p-5 text-white shadow-xs flex flex-col justify-between group">
          <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:scale-105 transition-transform duration-500 pointer-events-none">
            <FaBookOpen className="text-8xl text-white" />
          </div>

          <div className="relative z-10">
            <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-blue-500/10 border border-blue-500/30 text-blue-300 font-mono font-bold text-[10px] uppercase tracking-wider mb-3">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
              Syllabus Admin
            </div>
            <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400 block mb-0.5">
              Active Exam Packs
            </span>
            <p className="text-4xl sm:text-5xl font-mono font-black tracking-tight mb-1 text-white">
              {stats?.activePacks || 0}
            </p>
            <p className="text-slate-400 text-xs font-medium leading-relaxed">
              Configured question containers ready for student evaluations.
            </p>
          </div>

          <div className="relative z-10 pt-4">
            <PrimaryBtn
              link="/dashboard/manage-exam-pack"
              className="!w-full !text-xs !py-2 !px-3.5 !bg-blue-600 hover:!bg-blue-500 !text-white shadow-xs !rounded"
            >
              Manage Curriculum Packs
            </PrimaryBtn>
          </div>
        </div>
      </div>

      {/* Unified Teacher KPI Strip */}
      <div className="rounded bg-white border border-slate-200/80 shadow-xs grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-slate-100 overflow-hidden">
        <div className="p-3.5 sm:p-4 hover:bg-slate-50/50 transition-colors">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">
              Class Average
            </span>
            <div className="w-6 h-6 rounded bg-orange-50 text-primary flex items-center justify-center text-xs">
              <FaAward />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-mono font-black text-slate-900">
            {stats?.classAverage || "0%"}
          </p>
          <p className="text-[10px] font-mono text-slate-400 mt-0.5">
            Score ratio
          </p>
        </div>

        <div className="p-3.5 sm:p-4 hover:bg-slate-50/50 transition-colors">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">
              Active Packs
            </span>
            <div className="w-6 h-6 rounded bg-blue-50 text-blue-600 flex items-center justify-center text-xs">
              <FaBookOpen />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-mono font-black text-blue-600">
            {stats?.activePacks || 0}
          </p>
          <p className="text-[10px] font-mono text-slate-400 mt-0.5">
            Published packages
          </p>
        </div>

        <div className="p-3.5 sm:p-4 hover:bg-slate-50/50 transition-colors">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">
              Questions Built
            </span>
            <div className="w-6 h-6 rounded bg-emerald-50 text-emerald-600 flex items-center justify-center text-xs">
              <FaFileAlt />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-mono font-black text-emerald-600">
            {stats?.questionsCount || 0}
          </p>
          <p className="text-[10px] font-mono text-slate-400 mt-0.5">
            Total item bank
          </p>
        </div>

        <div className="p-3.5 sm:p-4 hover:bg-slate-50/50 transition-colors">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">
              Graded Scripts
            </span>
            <div className="w-6 h-6 rounded bg-purple-50 text-purple-600 flex items-center justify-center text-xs">
              <FaCheckCircle />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-mono font-black text-purple-600">
            {stats?.gradedScripts || 0}
          </p>
          <p className="text-[10px] font-mono text-slate-400 mt-0.5">
            Submissions
          </p>
        </div>
      </div>

      {/* Teacher Resource Quotas (Packs & Exams) */}
      <ExamQuotaCard
        createdPacks={stats?.createdPacksCount}
        packLimit={stats?.examPackLimit}
        createdExams={stats?.createdExamsCount}
        examLimit={stats?.examLimit}
      />

      {/* Teacher Activity & Curriculum Table */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 items-start">
        {/* Monthly Attempts Chart */}
        <div className="xl:col-span-2 rounded bg-white border border-slate-200/80 p-4 sm:p-5 shadow-xs">
          <div className="flex items-center justify-between gap-4 mb-3">
            <div>
              <h3 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight">
                Monthly Student Submission Volume
              </h3>
              <p className="text-slate-500 text-xs font-medium mt-0.5">
                Test submission activity across your courses in the past 5 months.
              </p>
            </div>
            <span className="text-[10px] font-mono bg-blue-50 text-blue-700 font-bold px-2 py-0.5 rounded border border-blue-200">
              ACTIVITY METRICS
            </span>
          </div>

          <ChartCard
            data={stats?.activityData || []}
            color="#2563eb"
            strokeColor="#3b82f6"
            avgLabel="Avg Monthly Submits"
          />
        </div>

        {/* Pending Tasks & Action Queue */}
        <div className="rounded bg-white border border-slate-200/80 p-4 sm:p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded bg-amber-50 text-amber-600 flex items-center justify-center text-xs">
                <FaTasks />
              </div>
              <h3 className="text-sm font-bold text-slate-900 tracking-tight">
                Review Tasks
              </h3>
            </div>
            <span className="px-2 py-0.5 bg-amber-50 border border-amber-200 text-amber-800 text-[10px] font-mono font-bold rounded">
              {stats?.pendingTasks?.length || 0} Pending
            </span>
          </div>

          {stats?.pendingTasks && stats.pendingTasks.length > 0 ? (
            <div className="space-y-2">
              {stats.pendingTasks.map((t: any, idx: number) => (
                <div
                  key={idx}
                  className="p-2.5 rounded bg-slate-50 border border-slate-200/70 flex items-start gap-2.5 hover:bg-slate-100/60 transition-colors"
                >
                  <div className="w-4 h-4 rounded bg-orange-100 text-primary flex items-center justify-center text-[9px] shrink-0 mt-0.5">
                    <FaClock />
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-slate-800 text-xs truncate">
                      {t.title}
                    </p>
                    <p className="text-[10px] text-slate-500 mt-0.5 leading-snug">
                      {t.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="border border-slate-200/80 rounded bg-slate-50/50">
              <EmptyState
                compact
                type="tasks"
                title="All caught up!"
                description="No pending grading tasks or exam approvals in queue."
              />
            </div>
          )}

          <div className="pt-2.5 border-t border-slate-100 space-y-2">
            <Link
              href="/dashboard/manage-exam-pack/add"
              className="w-full py-2 px-3 rounded bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-xs flex items-center justify-between transition-colors border border-blue-100"
            >
              <span>+ Create New Exam Container</span>
              <FaArrowRight className="text-[10px]" />
            </Link>
            <Link
              href="/dashboard/report"
              className="w-full py-2 px-3 rounded bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold text-xs flex items-center justify-between transition-colors border border-slate-200"
            >
              <span>Review Detailed Student Reports</span>
              <FaArrowRight className="text-[10px]" />
            </Link>
          </div>
        </div>
      </div>

      {/* Assigned Course Packs Table */}
      <div className="rounded bg-white border border-slate-200/80 p-4 sm:p-5 shadow-xs">
        <div className="flex items-center justify-between gap-4 mb-4">
          <div>
            <h3 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight">
              My Course Syllabus Packs & Submission Counts
            </h3>
            <p className="text-slate-500 text-xs font-medium mt-0.5">
              Overview of active exam modules created by you and published for students.
            </p>
          </div>
          <Link
            href="/dashboard/manage-exam-pack"
            className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1"
          >
            <span>Manage Packs</span>
            <FaArrowRight className="text-[10px]" />
          </Link>
        </div>

        {stats?.assignedPacks && stats.assignedPacks.length > 0 ? (
          <>
            {/* Desktop Table View */}
            <div className="hidden sm:block overflow-x-auto rounded-none border border-slate-200/80">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/90 border-b border-slate-200/80 text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500">
                    <th className="px-3.5 py-2">ID</th>
                    <th className="px-3.5 py-2">Pack Name</th>
                    <th className="px-3.5 py-2">Submissions</th>
                    <th className="px-3.5 py-2">Grading Policy</th>
                    <th className="px-3.5 py-2 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm font-medium">
                  {stats.assignedPacks.map((pack: any, idx: number) => (
                    <tr
                      key={idx}
                      className="hover:bg-slate-50/50 transition-colors"
                    >
                      <td className="px-3.5 py-2.5 font-mono text-xs font-bold text-slate-500">
                        #{pack.id}
                      </td>
                      <td className="px-3.5 py-2.5 font-bold text-slate-900 text-xs sm:text-sm">
                        {pack.name}
                      </td>
                      <td className="px-3.5 py-2.5 font-mono font-bold text-blue-600">
                        {pack.score}
                      </td>
                      <td className="px-3.5 py-2.5">
                        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                          {pack.negative}
                        </span>
                      </td>
                      <td className="px-3.5 py-2.5 text-right">
                        <Link
                          href="/dashboard/manage-exam-pack"
                          className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:underline"
                        >
                          <span>Configure</span>
                          <FaArrowRight className="text-[10px]" />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards View */}
            <div className="block sm:hidden divide-y divide-slate-100 border border-slate-200/80 bg-white">
              {stats.assignedPacks.map((pack: any, idx: number) => (
                <div key={idx} className="p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[10px] font-bold text-slate-400">
                      #{pack.id}
                    </span>
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                      {pack.negative}
                    </span>
                  </div>
                  <div className="font-bold text-slate-900 text-xs">
                    {pack.name}
                  </div>
                  <div className="flex items-center justify-between pt-1 border-t border-slate-50 text-xs">
                    <div className="font-mono text-slate-500 text-[11px]">
                      Submissions:{" "}
                      <span className="font-bold text-blue-600">
                        {pack.score}
                      </span>
                    </div>
                    <Link
                      href="/dashboard/manage-exam-pack"
                      className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:underline"
                    >
                      <span>Configure</span>
                      <FaArrowRight className="text-[10px]" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="py-6 border border-dashed border-slate-200 rounded">
            <EmptyState
              type="general"
              title="No Exam Packs Created Yet"
              description="You haven't created any course syllabus packs yet. Create your first syllabus pack to publish exams for students."
              actionLabel="+ Create Exam Pack"
              actionHref="/dashboard/manage-exam-pack/add"
            />
          </div>
        )}
      </div>
    </div>
  );
};
