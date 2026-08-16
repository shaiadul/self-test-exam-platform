"use client";

import React from "react";
import Link from "next/link";
import ChartCard from "../../components/dashboard/ChartCard";
import ExamsTable from "../../components/dashboard/ExamsTable";
import StatsGrid from "../../components/dashboard/StatsGrid";
import UpcomingExamCard from "../../components/dashboard/UpcomingExamCard";
import UserCard from "../../components/dashboard/UserCard";
import {
  FaAward,
  FaServer,
  FaCogs,
  FaBookOpen,
  FaUserShield,
  FaClock,
} from "react-icons/fa";
import { PageContainer } from "../../components/common/PageContainer";

interface DashboardClientViewProps {
  initialProfile: any;
  initialStats: any;
}

export default function DashboardClientView({ initialProfile, initialStats }: DashboardClientViewProps) {
  const role = initialProfile?.role || "student";
  const name = initialProfile?.name || "";
  const stats = initialStats;

  const profileData = {
    image: initialProfile?.image || "",
    board: "",
    level: "",
    batch: "",
    institution: "",
  };

  const normRole = role.toLowerCase();

  if (normRole === "student") {
    profileData.board = initialProfile?.board || "";
    profileData.level = initialProfile?.level || "";
    profileData.batch = initialProfile?.batch || "";
    profileData.institution = initialProfile?.institution || "";
  } else if (normRole === "teacher") {
    profileData.board = initialProfile?.subject || "";
    profileData.level = initialProfile?.designation || "";
    profileData.batch = "";
    profileData.institution = initialProfile?.institution || "";
  } else if (normRole === "admin") {
    profileData.board = initialProfile?.adminTier || "";
    profileData.level = initialProfile?.adminDept || "";
    profileData.batch = initialProfile?.adminBase || "";
    profileData.institution = "";
  }

  return (
    <PageContainer>
      {/* Dynamic Greetings Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-gray-100 pb-8 mb-4 animate-fadeIn">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary font-bold text-xs uppercase tracking-wider">
            ⚡ Dashboard Overview
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-gray-900 tracking-tight">
            Welcome back, {name ? name.split(" ")[0] : "User"}!
          </h1>
          <p className="text-gray-500 font-semibold text-sm">
            {normRole === "student" && "Track your mocks, check dynamic performance charts, and prepare for exams."}
            {normRole === "teacher" && "Syllabus administration center. Configure exam packs, manage grading & logs."}
            {normRole === "admin" && "Control node. Monitor server diagnostics, platform database users, and finance logs."}
          </p>
        </div>

        {/* Dynamic Contextual Action Panel */}
        <div className="flex items-center gap-3">
          {normRole === "student" && (
            <Link href="/dashboard/exam-pack" className="px-5 py-3 bg-[#dd6b01] hover:bg-orange-600 text-white font-bold text-sm rounded-2xl shadow-lg shadow-orange-500/10 hover-lift transition">
              Launch Mock Exams
            </Link>
          )}
          {normRole === "teacher" && (
            <Link href="/dashboard/manage-exam-pack" className="px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-2xl shadow-lg shadow-blue-500/10 hover-lift transition">
              Manage Exam Packs
            </Link>
          )}
          {normRole === "admin" && (
            <Link href="/dashboard/settings/assets-setup" className="px-5 py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold text-sm rounded-2xl shadow-lg shadow-purple-500/10 hover-lift transition">
              Admin Configuration
            </Link>
          )}
        </div>
      </div>

      {/* ========================================================
          1. STUDENT DASHBOARD
          ======================================================== */}
      {normRole === "student" && (
        <div className="space-y-8 animate-fadeIn">
          {/* Header Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
            <div className="lg:col-span-2">
              <UserCard
                name={name}
                board={profileData.board}
                level={profileData.level}
                batch={profileData.batch}
                institution={profileData.institution}
                image={profileData.image}
              />
            </div>
            <div className="bg-gradient-to-br from-[#dd6b01] to-[#f0b176] rounded-3xl p-6 text-white shadow-xl shadow-orange-500/10 relative overflow-hidden group flex flex-col justify-between h-full min-h-[170px]">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform duration-500">
                <FaAward className="text-9xl" />
              </div>
              <div className="relative z-10">
                <h3 className="text-sm font-bold text-orange-50/80 uppercase tracking-widest mb-1">
                  Overall Rank
                </h3>
                <p className="text-5xl font-black tracking-tight mb-2">#{stats?.rank || 0}</p>
                <p className="text-orange-100 text-xs font-semibold">
                  {stats?.institutionRank || "Complete exams to get ranked"}
                </p>
              </div>
              <Link href="/dashboard/reporting" className="relative z-10 mt-4 w-full py-2.5 bg-white/20 hover:bg-white/35 backdrop-blur-md border border-white/25 rounded-2xl font-bold transition-all text-xs cursor-pointer text-center block">
                View Performance Reports
              </Link>
            </div>
          </div>

          {/* Analytics & Metrics */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
            <div className="xl:col-span-2">
              <div className="bg-white p-6 rounded-3xl border border-gray-100/80 shadow-md shadow-gray-100/30 h-full flex flex-col justify-between">
                <div className="mb-6 flex justify-between items-center">
                  <h3 className="text-lg font-black text-gray-900 tracking-tight">
                    Performance Accuracy
                  </h3>
                  <span className="text-[10px] bg-green-50 text-green-700 font-extrabold px-2.5 py-1 rounded-full border border-green-200">
                    ACTIVE SESSION
                  </span>
                </div>
                <ChartCard
                  data={stats?.accuracyData || []}
                  color="#dd6b01"
                  strokeColor="#f59e0b"
                  avgLabel="Avg Mark"
                />
              </div>
            </div>
            <div>
              <StatsGrid
                stats={[
                  { label: "Completed Exams", value: stats?.completedCount?.toString() || "0" },
                  { label: "Average Mark", value: stats?.averageMark || "0%" },
                  { label: "Passed Ratio", value: stats?.passedRatio || "0%" },
                  { label: "Failed Count", value: stats?.failedCount?.toString() || "0" },
                ]}
              />
            </div>
          </div>

          {/* Recents & Upcomings */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <div className="bg-white p-6 rounded-3xl border border-gray-100/80 shadow-md shadow-gray-100/30">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-black text-gray-900 tracking-tight">
                    Recent Exam Results
                  </h3>
                  <Link href="/dashboard/reporting" className="text-[#dd6b01] text-xs font-bold hover:underline cursor-pointer">
                    View Evaluation History
                  </Link>
                </div>
                {stats?.recentExams && stats.recentExams.length > 0 ? (
                  <ExamsTable exams={stats.recentExams} />
                ) : (
                  <p className="text-sm text-gray-500 py-6 text-center">No recent exams taken yet.</p>
                )}
              </div>
            </div>

            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-black text-gray-900 tracking-tight">
                  Upcoming Schedules
                </h3>
                <span className="px-2.5 py-1 bg-orange-100 text-[#dd6b01] text-[10px] font-extrabold rounded-full border border-orange-200 uppercase tracking-wider">
                  {stats?.upcomingExams?.length || 0} Scheduled
                </span>
              </div>
              <div className="grid grid-cols-1 gap-6">
                {(stats?.upcomingExams || []).map((exam: any, idx: number) => (
                  <UpcomingExamCard
                    key={idx}
                    id={exam.id}
                    image={exam.image || "/global/logo2.png"}
                    title={exam.title}
                    dateTime={exam.dateTime}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          2. TEACHER DASHBOARD
          ======================================================== */}
      {normRole === "teacher" && (
        <div className="space-y-8 animate-fadeIn">
          {/* Top Info Banner */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
            <div className="lg:col-span-2">
              <UserCard
                name={name}
                board={profileData.board}
                level={profileData.level}
                batch={profileData.batch}
                institution={profileData.institution}
                image={profileData.image}
              />
            </div>
            <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl p-6 text-white shadow-xl shadow-blue-500/10 relative overflow-hidden group flex flex-col justify-between h-full min-h-[170px]">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform duration-500">
                <FaBookOpen className="text-9xl" />
              </div>
              <div className="relative z-10">
                <h3 className="text-sm font-bold text-blue-100/80 uppercase tracking-widest mb-1">
                  Active Modules
                </h3>
                <p className="text-5xl font-black tracking-tight mb-2">{stats?.activePacks || 0}</p>
                <p className="text-blue-100 text-xs font-semibold">Configured Exam Containers</p>
              </div>
              <Link href="/dashboard/manage-exam-pack" className="relative z-10 mt-4 w-full py-2.5 bg-white/20 hover:bg-white/35 backdrop-blur-md border border-white/25 rounded-2xl font-bold transition-all text-xs cursor-pointer text-center block">
                Manage Course Syllabus
              </Link>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-3xl border border-gray-100/80 shadow-md shadow-gray-100/30">
              <span className="text-xs font-extrabold text-gray-400 uppercase tracking-wider block mb-2">Total Exam Packs</span>
              <p className="text-3xl font-black text-gray-900">{stats?.activePacks || 0}</p>
            </div>
            <div className="bg-white p-6 rounded-3xl border border-gray-100/80 shadow-md shadow-gray-100/30">
              <span className="text-xs font-extrabold text-gray-400 uppercase tracking-wider block mb-2">Published Exams</span>
              <p className="text-3xl font-black text-blue-600">{stats?.totalExams || 0}</p>
            </div>
            <div className="bg-white p-6 rounded-3xl border border-gray-100/80 shadow-md shadow-gray-100/30">
              <span className="text-xs font-extrabold text-gray-400 uppercase tracking-wider block mb-2">Student Submissions</span>
              <p className="text-3xl font-black text-green-600">{stats?.totalSubmissions || 0}</p>
            </div>
            <div className="bg-white p-6 rounded-3xl border border-gray-100/80 shadow-md shadow-gray-100/30">
              <span className="text-xs font-extrabold text-gray-400 uppercase tracking-wider block mb-2">Average Score</span>
              <p className="text-3xl font-black text-purple-600">{stats?.averageScore || "0%"}</p>
            </div>
          </div>

          {/* Activity Overview */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-gray-100/80 shadow-md shadow-gray-100/30">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-black text-gray-900 tracking-tight">Evaluations & Reports</h3>
                <Link href="/dashboard/report" className="text-blue-600 text-xs font-bold hover:underline cursor-pointer">
                  View Full Reports
                </Link>
              </div>
              {stats?.recentReports && stats.recentReports.length > 0 ? (
                <div className="space-y-4">
                  {stats.recentReports.map((rep: any, idx: number) => (
                    <div key={idx} className="p-4 bg-gray-50 rounded-2xl flex items-center justify-between border border-gray-150">
                      <div>
                        <h4 className="font-bold text-gray-900 text-sm">{rep.title}</h4>
                        <span className="text-xs text-gray-500 font-semibold">{rep.students} Students Evaluated</span>
                      </div>
                      <span className="px-3 py-1 bg-blue-100 text-blue-700 font-bold text-xs rounded-full">
                        Avg: {rep.avgScore}%
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500 py-6 text-center">No recent evaluations available.</p>
              )}
            </div>

            <div className="bg-white p-6 rounded-3xl border border-gray-100/80 shadow-md shadow-gray-100/30">
              <h3 className="text-lg font-black text-gray-900 tracking-tight mb-4">Quick Management</h3>
              <div className="space-y-3">
                <Link href="/dashboard/manage-exam-pack/add" className="w-full py-3 px-4 bg-blue-50 text-blue-600 hover:bg-blue-100 font-bold text-xs rounded-2xl border border-blue-200 flex items-center justify-between transition">
                  <span>+ Create Exam Pack</span>
                  <FaCogs />
                </Link>
                <Link href="/dashboard/report" className="w-full py-3 px-4 bg-purple-50 text-purple-600 hover:bg-purple-100 font-bold text-xs rounded-2xl border border-purple-200 flex items-center justify-between transition">
                  <span>View Student Reports</span>
                  <FaAward />
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          3. ADMIN DASHBOARD
          ======================================================== */}
      {normRole === "admin" && (
        <div className="space-y-8 animate-fadeIn">
          {/* Top Control Panel Info */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
            <div className="lg:col-span-2">
              <UserCard
                name={name}
                board={profileData.board}
                level={profileData.level}
                batch={profileData.batch}
                institution={profileData.institution}
                image={profileData.image}
              />
            </div>
            <div className="bg-gradient-to-br from-purple-700 to-indigo-900 rounded-3xl p-6 text-white shadow-xl shadow-purple-500/10 relative overflow-hidden group flex flex-col justify-between h-full min-h-[170px]">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform duration-500">
                <FaUserShield className="text-9xl" />
              </div>
              <div className="relative z-10">
                <h3 className="text-sm font-bold text-purple-200/80 uppercase tracking-widest mb-1">
                  System Health
                </h3>
                <p className="text-4xl font-black tracking-tight mb-2">OPERATIONAL</p>
                <p className="text-purple-200 text-xs font-semibold">Active Database Nodes: 100%</p>
              </div>
              <Link href="/dashboard/settings/user-management" className="relative z-10 mt-4 w-full py-2.5 bg-white/20 hover:bg-white/35 backdrop-blur-md border border-white/25 rounded-2xl font-bold transition-all text-xs cursor-pointer text-center block">
                Manage Platform Users
              </Link>
            </div>
          </div>

          {/* Admin Metrics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-3xl border border-gray-100/80 shadow-md shadow-gray-100/30">
              <span className="text-xs font-extrabold text-gray-400 uppercase tracking-wider block mb-2">Total System Users</span>
              <p className="text-3xl font-black text-gray-900">{stats?.totalUsers || 0}</p>
            </div>
            <div className="bg-white p-6 rounded-3xl border border-gray-100/80 shadow-md shadow-gray-100/30">
              <span className="text-xs font-extrabold text-gray-400 uppercase tracking-wider block mb-2">Total Exams Built</span>
              <p className="text-3xl font-black text-purple-600">{stats?.totalExams || 0}</p>
            </div>
            <div className="bg-white p-6 rounded-3xl border border-gray-100/80 shadow-md shadow-gray-100/30">
              <span className="text-xs font-extrabold text-gray-400 uppercase tracking-wider block mb-2">System Assets</span>
              <p className="text-3xl font-black text-blue-600">{stats?.systemAssetsCount || 0}</p>
            </div>
            <div className="bg-white p-6 rounded-3xl border border-gray-100/80 shadow-md shadow-gray-100/30">
              <span className="text-xs font-extrabold text-gray-400 uppercase tracking-wider block mb-2">Platform Revenue</span>
              <p className="text-3xl font-black text-emerald-600">${stats?.revenue || "0.00"}</p>
            </div>
          </div>

          {/* Diagnostic & Quick Controls */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-gray-100/80 shadow-md shadow-gray-100/30">
              <h3 className="text-lg font-black text-gray-900 tracking-tight mb-6">Control Center Modules</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Link href="/dashboard/settings/user-management" className="p-4 bg-purple-50/50 border border-purple-100 hover:border-purple-300 rounded-2xl transition group">
                  <div className="flex items-center gap-3 mb-2">
                    <FaUserShield className="text-purple-600 group-hover:scale-110 transition-transform" />
                    <h4 className="font-bold text-gray-900 text-sm">User & Role Management</h4>
                  </div>
                  <p className="text-xs text-gray-500">Configure access control levels, elevate permissions, remove users.</p>
                </Link>

                <Link href="/dashboard/settings/assets-setup" className="p-4 bg-blue-50/50 border border-blue-100 hover:border-blue-300 rounded-2xl transition group">
                  <div className="flex items-center gap-3 mb-2">
                    <FaCogs className="text-blue-600 group-hover:scale-110 transition-transform" />
                    <h4 className="font-bold text-gray-900 text-sm">System Assets Setup</h4>
                  </div>
                  <p className="text-xs text-gray-500">Define dynamic dropdown assets: levels, education boards, and batches.</p>
                </Link>

                <Link href="/dashboard/settings/exam-analysis" className="p-4 bg-amber-50/50 border border-amber-100 hover:border-amber-300 rounded-2xl transition group">
                  <div className="flex items-center gap-3 mb-2">
                    <FaServer className="text-amber-600 group-hover:scale-110 transition-transform" />
                    <h4 className="font-bold text-gray-900 text-sm">Exam Analytics</h4>
                  </div>
                  <p className="text-xs text-gray-500">Inspect attempt data, failure rates, and exam completion metrics.</p>
                </Link>

                <Link href="/dashboard/settings/financial-report" className="p-4 bg-emerald-50/50 border border-emerald-100 hover:border-emerald-300 rounded-2xl transition group">
                  <div className="flex items-center gap-3 mb-2">
                    <FaClock className="text-emerald-600 group-hover:scale-110 transition-transform" />
                    <h4 className="font-bold text-gray-900 text-sm">Financial Report</h4>
                  </div>
                  <p className="text-xs text-gray-500">Track platform income, expenses, and ledger history.</p>
                </Link>
              </div>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-gray-100/80 shadow-md shadow-gray-100/30 flex flex-col justify-between">
              <div>
                <h3 className="text-lg font-black text-gray-900 tracking-tight mb-4">System Status</h3>
                <div className="space-y-4 text-xs font-semibold text-gray-600">
                  <div className="flex justify-between items-center pb-3 border-b border-gray-100">
                    <span>Database Connection</span>
                    <span className="px-2 py-0.5 bg-green-100 text-green-700 font-bold rounded-full text-[10px]">CONNECTED</span>
                  </div>
                  <div className="flex justify-between items-center pb-3 border-b border-gray-100">
                    <span>Next.js SSR Engine</span>
                    <span className="px-2 py-0.5 bg-green-100 text-green-700 font-bold rounded-full text-[10px]">ACTIVE</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Server Actions Handler</span>
                    <span className="px-2 py-0.5 bg-blue-100 text-blue-700 font-bold rounded-full text-[10px]">ENABLED</span>
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-4 border-t border-gray-100">
                <span className="text-[10px] text-gray-400 font-bold block text-center uppercase tracking-widest">
                  Self-Test Exam System v2.0
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </PageContainer>
  );
}
