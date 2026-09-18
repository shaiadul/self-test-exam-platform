import React from "react";
import Link from "next/link";
import { FaAward, FaChartLine, FaArrowRight, FaCalendarCheck } from "react-icons/fa";
import UserCard from "../../../components/dashboard/UserCard";
import ChartCard from "../../../components/dashboard/ChartCard";
import StatsGrid from "../../../components/dashboard/StatsGrid";
import ExamsTable from "../../../components/dashboard/ExamsTable";
import UpcomingExamCard from "../../../components/dashboard/UpcomingExamCard";
import EmptyState from "../../../components/common/EmptyState";
import { PrimaryBtn } from "../../../components/ui/PrimaryBtn";

interface StudentDashboardViewProps {
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

export const StudentDashboardView: React.FC<StudentDashboardViewProps> = ({
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

        {/* Merit Standing Highlights Card */}
        <div className="relative overflow-hidden rounded bg-gradient-to-br from-primary via-orange-500 to-amber-500 p-4 sm:p-5 text-white shadow-xs flex flex-col justify-between group">
          <div className="absolute top-0 right-0 p-3 opacity-15 group-hover:scale-105 group-hover:opacity-20 transition-all duration-300 pointer-events-none">
            <FaAward className="text-7xl text-white" />
          </div>

          <div className="relative z-10">
            <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-white/20 backdrop-blur-md border border-white/30 text-white font-mono font-bold text-[10px] uppercase tracking-wider mb-2.5">
              <span>🏆</span> Merit Standing
            </div>

            <div className="mb-1">
              <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-orange-100 block">
                Overall Rank
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl sm:text-4xl font-mono font-black tracking-tight">
                  #{stats?.rank || 0}
                </span>
                {stats?.rank > 0 && (
                  <span className="text-[10px] font-mono font-bold bg-white/25 px-1.5 py-0.2 rounded border border-white/30 text-white">
                    Ranked
                  </span>
                )}
              </div>
            </div>

            <p className="text-orange-50 text-xs font-normal leading-relaxed max-w-xs mt-1">
              {stats?.institutionRank ||
                "Complete self-tests to qualify for institution ranking."}
            </p>
          </div>

          <div className="relative z-10 pt-3">
            <PrimaryBtn
              link="/dashboard/reporting"
              className="!w-full !text-xs !py-1.5 !px-3 !bg-white !from-white !to-white !text-primary hover:!bg-orange-50 shadow-2xs !rounded font-semibold"
            >
              View Performance Scorecards
            </PrimaryBtn>
          </div>
        </div>
      </div>

      {/* Performance Analytics Section */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 items-stretch">
        {/* Accuracy Chart */}
        <div className="xl:col-span-2 rounded bg-white border border-slate-200/80 p-3.5 sm:p-4 shadow-2xs flex flex-col justify-between">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
            <div>
              <div className="flex items-center gap-2 mb-0.5">
                <h3 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight">
                  Evaluation Accuracy Trends
                </h3>
                <span className="text-[9px] font-mono bg-emerald-50 text-emerald-700 font-bold px-1.5 py-0.2 rounded border border-emerald-200">
                  LIVE
                </span>
              </div>
              <p className="text-slate-500 text-xs">
                Score trajectories across recent attempts.
              </p>
            </div>
            <div className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-slate-50 text-slate-600 rounded border border-slate-200 text-[11px] font-mono font-bold">
              <FaChartLine className="text-primary text-[10px]" />
              <span>Last {stats?.accuracyData?.length || 5} Tests</span>
            </div>
          </div>

          <ChartCard
            data={stats?.accuracyData || []}
            color="#f97a00"
            strokeColor="#f97a00"
            avgLabel="Average Score"
          />
        </div>

        {/* 4-Card Stats Grid */}
        <div>
          <StatsGrid
            stats={[
              {
                label: "Completed Exams",
                value: stats?.completedCount?.toString() || "0",
              },
              {
                label: "Average Mark",
                value: stats?.averageMark || "0%",
              },
              {
                label: "Passed Ratio",
                value: stats?.passedRatio || "0%",
              },
              {
                label: "Failed Attempts",
                value: stats?.failedCount?.toString() || "0",
              },
            ]}
          />
        </div>
      </div>

      {/* Recents & Upcoming Schedules */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-start">
        {/* Recent Exam Attempts Table */}
        <div className="lg:col-span-2 rounded bg-white border border-slate-200/80 p-3.5 sm:p-4 shadow-2xs">
          <div className="flex items-center justify-between gap-4 mb-3">
            <div>
              <h3 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight">
                Recent Mock Results
              </h3>
              <p className="text-slate-500 text-xs mt-0.5">
                Detailed summary of your latest evaluations and scores.
              </p>
            </div>
            <Link
              href="/dashboard/reporting"
              className="text-xs font-semibold text-primary hover:underline flex items-center gap-1 shrink-0 font-mono"
            >
              <span>All Evaluations</span>
              <FaArrowRight className="text-[9px]" />
            </Link>
          </div>

          <ExamsTable exams={stats?.recentExams || []} />
        </div>

        {/* Upcoming Schedules */}
        <div className="rounded bg-white border border-slate-200/80 p-3.5 sm:p-4 shadow-2xs space-y-3">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded bg-orange-50 text-primary border border-orange-100 flex items-center justify-center text-[11px]">
                <FaCalendarCheck />
              </div>
              <div>
                <h3 className="text-xs sm:text-sm font-bold text-slate-900 tracking-tight">
                  Upcoming Tests
                </h3>
                <p className="text-[10px] text-slate-400">
                  Scheduled by batch instructor
                </p>
              </div>
            </div>

            <span className="px-1.5 py-0.2 bg-orange-50 text-primary text-[10px] font-mono font-bold rounded border border-orange-200 uppercase">
              {stats?.upcomingExams?.length || 0} Listed
            </span>
          </div>

          {stats?.upcomingExams && stats.upcomingExams.length > 0 ? (
            <div className="space-y-2">
              {stats.upcomingExams.map((exam: any, idx: number) => (
                <UpcomingExamCard
                  key={idx}
                  id={exam.id}
                  image={exam.image || "/global/no-picture.jpg"}
                  title={exam.title}
                  dateTime={exam.dateTime}
                />
              ))}
            </div>
          ) : (
            <div className="border border-slate-200/80 rounded bg-slate-50/50">
              <EmptyState
                compact
                type="exam"
                title="No Live Schedules"
                description="Your educators have not scheduled any mandatory tests today."
                actionLabel="Take Practice Mocks"
                actionHref="/dashboard/exam-pack"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
