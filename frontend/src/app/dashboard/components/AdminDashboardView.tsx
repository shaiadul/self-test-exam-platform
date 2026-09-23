import React from "react";
import Link from "next/link";
import {
  FaShieldAlt,
  FaUsers,
  FaChalkboardTeacher,
  FaLayerGroup,
  FaDatabase,
  FaUserShield,
  FaCogs,
  FaServer,
  FaClock,
  FaArrowRight,
} from "react-icons/fa";
import UserCard from "../../../components/dashboard/UserCard";
import ChartCard from "../../../components/dashboard/ChartCard";
import EmptyState from "../../../components/common/EmptyState";
import { PrimaryBtn } from "../../../components/ui/PrimaryBtn";

interface AdminDashboardViewProps {
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

export const AdminDashboardView: React.FC<AdminDashboardViewProps> = ({
  name,
  profileData,
  normRole,
  stats,
}) => {
  // Check if real telemetry data exists (at least one non-zero attempt)
  const hasRealActivity =
    Array.isArray(stats?.activityData) &&
    stats.activityData.length > 0 &&
    stats.activityData.some((d: any) => Number(d.value) > 0);

  // Check if real audit logs exist
  const hasRealAuditLogs =
    Array.isArray(stats?.auditLogs) && stats.auditLogs.length > 0;

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

        {/* Live System Health Card */}
        <div className="relative overflow-hidden rounded bg-slate-900 border border-slate-800 p-4 sm:p-5 text-white shadow-xs flex flex-col justify-between group">
          <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:scale-105 transition-transform duration-500 pointer-events-none">
            <FaShieldAlt className="text-8xl text-white" />
          </div>

          <div className="relative z-10">
            <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 font-mono font-bold text-[10px] uppercase tracking-wider mb-3">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              System Health
            </div>
            <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400 block mb-0.5">
              Node Status
            </span>
            <p className="text-3xl sm:text-4xl font-mono font-black tracking-tight mb-1 text-white">
              {stats?.serverStatus || "OPERATIONAL"}
            </p>
            <p className="text-slate-400 text-xs font-medium leading-relaxed">
              PostgreSQL cluster active. Next.js Turbopack runner nominal.
            </p>
          </div>

          <div className="relative z-10 pt-4">
            <PrimaryBtn
              link="/dashboard/settings/user-management"
              className="!w-full !text-xs !py-2 !px-3.5 !bg-purple-600 hover:!bg-purple-500 !text-white shadow-xs !rounded"
            >
              Manage Users & Roles
            </PrimaryBtn>
          </div>
        </div>
      </div>

      {/* Unified Admin KPI Strip */}
      <div className="rounded bg-white border border-slate-200/80 shadow-xs grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-slate-100 overflow-hidden">
        <div className="p-3.5 sm:p-4 hover:bg-slate-50/50 transition-colors">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">
              Registered Students
            </span>
            <div className="w-6 h-6 rounded bg-orange-50 text-primary flex items-center justify-center text-xs">
              <FaUsers />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-mono font-black text-slate-900">
            {stats?.registeredCount ?? "0"}
          </p>
          <p className="text-[10px] font-mono text-slate-400 mt-0.5">
            Candidate accounts
          </p>
        </div>

        <div className="p-3.5 sm:p-4 hover:bg-slate-50/50 transition-colors">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">
              Verified Educators
            </span>
            <div className="w-6 h-6 rounded bg-blue-50 text-blue-600 flex items-center justify-center text-xs">
              <FaChalkboardTeacher />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-mono font-black text-blue-600">
            {stats?.educatorsCount ?? "0"}
          </p>
          <p className="text-[10px] font-mono text-slate-400 mt-0.5">
            Teacher accounts
          </p>
        </div>

        <div className="p-3.5 sm:p-4 hover:bg-slate-50/50 transition-colors">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">
              Maintained Packs
            </span>
            <div className="w-6 h-6 rounded bg-purple-50 text-purple-600 flex items-center justify-center text-xs">
              <FaLayerGroup />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-mono font-black text-purple-600">
            {stats?.maintainedPacks ?? "0"}
          </p>
          <p className="text-[10px] font-mono text-slate-400 mt-0.5">
            Published modules
          </p>
        </div>

        <div className="p-3.5 sm:p-4 hover:bg-slate-50/50 transition-colors">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">
              Sync Pipeline
            </span>
            <div className="w-6 h-6 rounded bg-emerald-50 text-emerald-600 flex items-center justify-center text-xs">
              <FaDatabase />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-mono font-black text-emerald-600">
            {stats?.syncStatus || "Synced"}
          </p>
          <p className="text-[10px] font-mono text-slate-400 mt-0.5">
            Active replica nodes
          </p>
        </div>
      </div>

      {/* Admin Diagnostics & Activity */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 items-start">
        {/* System Attempt Activity */}
        <div className="xl:col-span-2 rounded bg-white border border-slate-200/80 p-4 sm:p-5 shadow-xs">
          <div className="flex items-center justify-between gap-4 mb-3">
            <div>
              <h3 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight">
                Total Platform Evaluation Volume
              </h3>
              <p className="text-slate-500 text-xs font-medium mt-0.5">
                Aggregated candidate attempts processed across the last 5
                months.
              </p>
            </div>
            <span className="text-[10px] font-mono bg-purple-50 text-purple-700 font-bold px-2 py-0.5 rounded border border-purple-200">
              SYSTEM TELEMETRY
            </span>
          </div>

          {hasRealActivity ? (
            <ChartCard
              data={stats.activityData}
              color="#7c3aed"
              strokeColor="#a855f7"
              avgLabel="Avg Attempts"
            />
          ) : (
            <EmptyState
              compact
              type="exam"
              title="No Platform Evaluation Activity Yet"
              description="Aggregated candidate attempts processed across the last 5 months will appear here as tests are submitted."
            />
          )}
        </div>

        {/* Quick Management Control Center */}
        <div className="rounded bg-white border border-slate-200/80 p-4 sm:p-5 shadow-xs space-y-3">
          <h3 className="text-sm font-bold text-slate-900 tracking-tight">
            Control Center Modules
          </h3>
          <div className="space-y-2">
            <Link
              href="/dashboard/settings/user-management"
              className="p-2.5 rounded bg-slate-50 border border-slate-200/80 hover:border-purple-300 hover:bg-purple-50/50 transition-all flex items-start gap-2.5 group"
            >
              <div className="w-6 h-6 rounded bg-purple-600 text-white flex items-center justify-center text-xs shrink-0 group-hover:scale-105 transition-transform">
                <FaUserShield />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 text-xs">
                  User & Role Management
                </h4>
                <p className="text-[10px] text-slate-500 mt-0.5">
                  Elevate permissions, manage access control.
                </p>
              </div>
            </Link>

            <Link
              href="/dashboard/settings/assets-setup"
              className="p-2.5 rounded bg-slate-50 border border-slate-200/80 hover:border-blue-300 hover:bg-blue-50/50 transition-all flex items-start gap-2.5 group"
            >
              <div className="w-6 h-6 rounded bg-blue-600 text-white flex items-center justify-center text-xs shrink-0 group-hover:scale-105 transition-transform">
                <FaCogs />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 text-xs">
                  System Assets Setup
                </h4>
                <p className="text-[10px] text-slate-500 mt-0.5">
                  Define levels, boards, batches, and institutions.
                </p>
              </div>
            </Link>

            <Link
              href="/dashboard/settings/exam-analysis"
              className="p-2.5 rounded bg-slate-50 border border-slate-200/80 hover:border-amber-300 hover:bg-amber-50/50 transition-all flex items-start gap-2.5 group"
            >
              <div className="w-6 h-6 rounded bg-amber-600 text-white flex items-center justify-center text-xs shrink-0 group-hover:scale-105 transition-transform">
                <FaServer />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 text-xs">
                  Exam Analytics Hub
                </h4>
                <p className="text-[10px] text-slate-500 mt-0.5">
                  Inspect test attempts and pass rate distributions.
                </p>
              </div>
            </Link>

            <Link
              href="/dashboard/settings/financial-report"
              className="p-2.5 rounded bg-slate-50 border border-slate-200/80 hover:border-emerald-300 hover:bg-emerald-50/50 transition-all flex items-start gap-2.5 group"
            >
              <div className="w-6 h-6 rounded bg-emerald-600 text-white flex items-center justify-center text-xs shrink-0 group-hover:scale-105 transition-transform">
                <FaClock />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 text-xs">
                  Financial Ledger
                </h4>
                <p className="text-[10px] text-slate-500 mt-0.5">
                  Review platform income and transaction history.
                </p>
              </div>
            </Link>
          </div>
        </div>
      </div>

      {/* Audit Logs Table */}
      <div className="rounded bg-white border border-slate-200/80 p-4 sm:p-5 shadow-xs">
        <div className="flex items-center justify-between gap-4 mb-4">
          <div>
            <h3 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight">
              Recent Evaluation Audit Stream
            </h3>
            <p className="text-slate-500 text-xs font-medium mt-0.5">
              Real-time transaction logs of candidate test submissions.
            </p>
          </div>
          {hasRealAuditLogs && (
            <Link
              href="/dashboard/settings/exam-analysis"
              className="text-xs font-bold text-purple-600 hover:underline flex items-center gap-1"
            >
              <span>Full Analytics</span>
              <FaArrowRight className="text-[10px]" />
            </Link>
          )}
        </div>

        {hasRealAuditLogs ? (
          <>
            {/* Desktop Table View */}
            <div className="hidden sm:block overflow-x-auto rounded-none border border-slate-200/80">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/90 border-b border-slate-200/80 text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500">
                    <th className="px-3.5 py-2">Attempt Ref</th>
                    <th className="px-3.5 py-2">Exam Name</th>
                    <th className="px-3.5 py-2">Raw Score</th>
                    <th className="px-3.5 py-2">Result Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm font-medium">
                  {stats.auditLogs.map((log: any, idx: number) => {
                    const idStr = String(log.id || "");
                    const formattedId = idStr.startsWith("#")
                      ? idStr
                      : `#${idStr}`;
                    return (
                      <tr
                        key={idx}
                        className="hover:bg-slate-50/50 transition-colors"
                      >
                        <td className="px-3.5 py-2.5 font-mono text-xs font-bold text-slate-500">
                          {formattedId}
                        </td>
                        <td className="px-3.5 py-2.5 font-bold text-slate-900 text-xs sm:text-sm">
                          {log.name}
                        </td>
                        <td className="px-3.5 py-2.5 font-mono font-bold text-slate-700">
                          {log.score}
                        </td>
                        <td className="px-3.5 py-2.5">
                          <span
                            className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${
                              log.negative === "Passed"
                                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                : "bg-rose-50 text-rose-700 border-rose-200"
                            }`}
                          >
                            {log.negative}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards View */}
            <div className="block sm:hidden divide-y divide-slate-100 border border-slate-200/80 bg-white">
              {stats.auditLogs.map((log: any, idx: number) => {
                const idStr = String(log.id || "");
                const formattedId = idStr.startsWith("#") ? idStr : `#${idStr}`;
                return (
                  <div key={idx} className="p-3 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[10px] font-bold text-slate-400">
                        {formattedId}
                      </span>
                      <span
                        className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded border ${
                          log.negative === "Passed"
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : "bg-rose-50 text-rose-700 border-rose-200"
                        }`}
                      >
                        {log.negative}
                      </span>
                    </div>
                    <div className="font-bold text-slate-900 text-xs">
                      {log.name}
                    </div>
                    <div className="flex items-center justify-between pt-1 border-t border-slate-50 text-xs">
                      <span className="font-mono text-slate-400 text-[10px] uppercase font-bold">
                        Raw Score
                      </span>
                      <span className="font-mono font-bold text-slate-700">
                        {log.score}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        ) : (
          <EmptyState
            compact
            type="reports"
            title="No Evaluation Audits Recorded"
            description="Real-time transaction logs of candidate test submissions will appear here once candidates complete tests."
            actionLabel="Exam Analytics Hub"
            actionHref="/dashboard/settings/exam-analysis"
          />
        )}
      </div>
    </div>
  );
};
