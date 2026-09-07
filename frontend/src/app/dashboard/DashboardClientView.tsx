"use client";

import React, { useState, useEffect } from "react";
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
  FaChalkboardTeacher,
  FaUsers,
  FaCheckCircle,
  FaCalendarCheck,
  FaArrowRight,
  FaExclamationCircle,
  FaChartLine,
  FaTasks,
  FaLayerGroup,
  FaFileAlt,
  FaShieldAlt,
  FaDatabase,
} from "react-icons/fa";
import { PageContainer } from "../../components/common/PageContainer";

interface DashboardClientViewProps {
  initialProfile: any;
  initialStats: any;
}

export default function DashboardClientView({
  initialProfile,
  initialStats,
}: DashboardClientViewProps) {
  const [greeting, setGreeting] = useState("Welcome back");
  const [currentDateStr, setCurrentDateStr] = useState("");

  const role = initialProfile?.role || "student";
  const name = initialProfile?.name || "";
  const stats = initialStats;
  const normRole = role.toLowerCase();

  useEffect(() => {
    // Dynamic time-of-day greeting
    const hour = new Date().getHours();
    if (hour < 12) setGreeting("Good morning");
    else if (hour < 18) setGreeting("Good afternoon");
    else setGreeting("Good evening");

    // Format current human-readable date
    const now = new Date();
    setCurrentDateStr(
      now.toLocaleDateString("en-US", {
        weekday: "long",
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    );
  }, []);

  const profileData = {
    image: initialProfile?.image || "",
    board: "",
    level: "",
    batch: "",
    institution: "",
  };

  if (normRole === "student") {
    profileData.board = initialProfile?.board || "";
    profileData.level = initialProfile?.level || "";
    profileData.batch = initialProfile?.batch || "";
    profileData.institution = initialProfile?.institution || "";
  } else if (normRole === "teacher") {
    profileData.board = initialProfile?.subject || "Curriculum Lead";
    profileData.level = initialProfile?.designation || "Faculty Member";
    profileData.batch = "";
    profileData.institution = initialProfile?.institution || "Education Department";
  } else if (normRole === "admin") {
    profileData.board = initialProfile?.adminTier || "System Admin";
    profileData.level = initialProfile?.adminDept || "Operations";
    profileData.batch = initialProfile?.adminBase || "HQ Node";
    profileData.institution = "Platform Management";
  }

  const firstName = name ? name.split(" ")[0] : "Candidate";

  return (
    <PageContainer>
      {/* ========================================================
          TOP HERO & WELCOME BANNER
          ======================================================== */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white p-6 sm:p-8 shadow-xl shadow-slate-900/10 border border-slate-700/50">
        {/* Subtle orange ambient glow */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-[#dd6b01]/25 via-amber-500/10 to-transparent rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        <div className="absolute bottom-0 left-1/3 w-64 h-64 bg-orange-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-orange-300 font-bold text-xs uppercase tracking-wider">
                <span className="w-2 h-2 rounded-full bg-[#f97a00] animate-pulse"></span>
                {normRole === "student" && "Student Workspace"}
                {normRole === "teacher" && "Instructor Command Center"}
                {normRole === "admin" && "Administrative Root"}
              </span>
              {currentDateStr && (
                <span className="text-slate-400 text-xs font-semibold px-2">
                  {currentDateStr}
                </span>
              )}
            </div>

            <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
              {greeting}, <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-orange-400 to-[#f97a00]">{firstName}</span>!
            </h1>

            <p className="text-slate-300 text-xs sm:text-sm font-medium leading-relaxed">
              {normRole === "student" &&
                "Review your active test series, analyze accuracy trends, and maintain your academic progress."}
              {normRole === "teacher" &&
                "Manage syllabus modules, evaluate question bank performance, and review student progress reports."}
              {normRole === "admin" &&
                "Control platform access, monitor server operational health, and inspect system audit streams."}
            </p>
          </div>

          {/* Quick Actions Panel */}
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            {normRole === "student" && (
              <>
                <Link
                  href="/dashboard/exam-pack"
                  className="px-5 py-3 bg-[#dd6b01] hover:bg-orange-600 text-white font-bold text-xs sm:text-sm rounded-2xl shadow-lg shadow-orange-500/25 hover-lift transition-all cursor-pointer inline-flex items-center gap-2"
                >
                  <FaBookOpen className="text-xs" />
                  <span>Browse Exam Packs</span>
                </Link>
                <Link
                  href="/dashboard/reporting"
                  className="px-4 py-3 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold text-xs sm:text-sm rounded-2xl transition-all cursor-pointer inline-flex items-center gap-2"
                >
                  <FaChartLine className="text-xs" />
                  <span>My Reports</span>
                </Link>
              </>
            )}

            {normRole === "teacher" && (
              <>
                <Link
                  href="/dashboard/manage-exam-pack/add"
                  className="px-5 py-3 bg-[#dd6b01] hover:bg-orange-600 text-white font-bold text-xs sm:text-sm rounded-2xl shadow-lg shadow-orange-500/25 hover-lift transition-all cursor-pointer inline-flex items-center gap-2"
                >
                  <FaCogs className="text-xs" />
                  <span>+ Create Exam Pack</span>
                </Link>
                <Link
                  href="/dashboard/question/add"
                  className="px-4 py-3 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold text-xs sm:text-sm rounded-2xl transition-all cursor-pointer inline-flex items-center gap-2"
                >
                  <FaFileAlt className="text-xs" />
                  <span>Question Bank</span>
                </Link>
              </>
            )}

            {normRole === "admin" && (
              <>
                <Link
                  href="/dashboard/settings/user-management"
                  className="px-5 py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs sm:text-sm rounded-2xl shadow-lg shadow-purple-500/25 hover-lift transition-all cursor-pointer inline-flex items-center gap-2"
                >
                  <FaUsers className="text-xs" />
                  <span>Manage Users</span>
                </Link>
                <Link
                  href="/dashboard/settings/assets-setup"
                  className="px-4 py-3 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold text-xs sm:text-sm rounded-2xl transition-all cursor-pointer inline-flex items-center gap-2"
                >
                  <FaCogs className="text-xs" />
                  <span>System Assets</span>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>

      {/* ========================================================
          1. STUDENT DASHBOARD
          ======================================================== */}
      {normRole === "student" && (
        <div className="space-y-8 animate-fadeIn">
          {/* Identity & Rank Standings Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
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

            {/* Merit Standing / Overall Rank Card */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#dd6b01] via-[#ea580c] to-amber-600 p-6 sm:p-7 text-white shadow-xl shadow-orange-500/15 flex flex-col justify-between group">
              {/* Decorative Trophy watermark */}
              <div className="absolute top-0 right-0 p-4 opacity-15 group-hover:scale-110 group-hover:opacity-20 transition-all duration-500 pointer-events-none">
                <FaAward className="text-9xl text-white" />
              </div>

              <div className="relative z-10">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-white font-extrabold text-[10px] uppercase tracking-wider mb-4">
                  <span>🏆</span> Current Merit Standing
                </div>

                <div className="mb-2">
                  <span className="text-xs font-bold uppercase tracking-widest text-orange-100 block mb-1">
                    Overall Rank
                  </span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-5xl sm:text-6xl font-black tracking-tight">
                      #{stats?.rank || 0}
                    </span>
                    {stats?.rank > 0 && (
                      <span className="text-xs font-extrabold bg-white/25 px-2 py-0.5 rounded-lg border border-white/30 text-white">
                        Ranked Candidate
                      </span>
                    )}
                  </div>
                </div>

                <p className="text-orange-50 text-xs font-medium leading-relaxed max-w-xs mt-2">
                  {stats?.institutionRank || "Complete self-tests and mocks to qualify for institution ranking."}
                </p>
              </div>

              <div className="relative z-10 pt-6">
                <Link
                  href="/dashboard/reporting"
                  className="w-full py-3 px-4 rounded-2xl bg-white text-[#dd6b01] hover:bg-orange-50 font-bold text-xs text-center block shadow-lg shadow-black/5 hover-lift transition-all cursor-pointer"
                >
                  View Performance Scorecards
                </Link>
              </div>
            </div>
          </div>

          {/* Performance Analytics Section */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-stretch">
            {/* Accuracy Chart */}
            <div className="xl:col-span-2 rounded-3xl bg-white border border-slate-200/80 p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
              <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-lg font-black text-slate-900 tracking-tight">
                      Evaluation Accuracy Trends
                    </h3>
                    <span className="text-[10px] bg-emerald-50 text-emerald-700 font-extrabold px-2.5 py-0.5 rounded-full border border-emerald-200">
                      LIVE DATA
                    </span>
                  </div>
                  <p className="text-slate-500 text-xs font-medium">
                    Chronological score trajectories across your most recent attempts.
                  </p>
                </div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-50 text-slate-600 rounded-xl border border-slate-200/60 text-xs font-bold">
                  <FaChartLine className="text-[#dd6b01]" />
                  <span>Last {stats?.accuracyData?.length || 5} Tests</span>
                </div>
              </div>

              <ChartCard
                data={stats?.accuracyData || []}
                color="#dd6b01"
                strokeColor="#f59e0b"
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
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
            {/* Recent Exam Attempts Table */}
            <div className="lg:col-span-2 rounded-3xl bg-white border border-slate-200/80 p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between gap-4 mb-6">
                <div>
                  <h3 className="text-lg font-black text-slate-900 tracking-tight">
                    Recent Mock Results
                  </h3>
                  <p className="text-slate-500 text-xs font-medium mt-0.5">
                    Detailed summary of your latest evaluations and scores.
                  </p>
                </div>
                <Link
                  href="/dashboard/reporting"
                  className="text-xs font-bold text-[#dd6b01] hover:underline flex items-center gap-1 shrink-0"
                >
                  <span>All Evaluations</span>
                  <FaArrowRight className="text-[10px]" />
                </Link>
              </div>

              <ExamsTable exams={stats?.recentExams || []} />
            </div>

            {/* Upcoming Schedules */}
            <div className="rounded-3xl bg-white border border-slate-200/80 p-6 shadow-sm hover:shadow-md transition-shadow space-y-5">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-orange-50 text-[#dd6b01] border border-orange-100 flex items-center justify-center text-xs">
                    <FaCalendarCheck />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-slate-900 tracking-tight">
                      Upcoming Tests
                    </h3>
                    <p className="text-[11px] text-slate-400 font-semibold">
                      Scheduled by batch instructor
                    </p>
                  </div>
                </div>

                <span className="px-2.5 py-0.5 bg-orange-50 text-[#dd6b01] text-[10px] font-extrabold rounded-full border border-orange-200 uppercase">
                  {stats?.upcomingExams?.length || 0} Listed
                </span>
              </div>

              {stats?.upcomingExams && stats.upcomingExams.length > 0 ? (
                <div className="space-y-4">
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
                <div className="py-8 px-4 text-center border-2 border-dashed border-slate-100 rounded-2xl">
                  <FaCalendarCheck className="mx-auto text-2xl text-slate-300 mb-2" />
                  <p className="text-xs font-bold text-slate-700 mb-1">
                    No Live Schedules
                  </p>
                  <p className="text-[11px] text-slate-400 leading-normal mb-4">
                    Your educators have not scheduled any mandatory live tests today.
                  </p>
                  <Link
                    href="/dashboard/exam-pack"
                    className="inline-block py-2 px-4 rounded-xl bg-slate-100 hover:bg-[#dd6b01] hover:text-white text-slate-700 text-xs font-bold transition-colors"
                  >
                    Take Practice Mocks
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          2. TEACHER DASHBOARD
          ======================================================== */}
      {normRole === "teacher" && (
        <div className="space-y-8 animate-fadeIn">
          {/* Top Banner Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
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

            {/* Active Syllabus Module Card */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600 via-indigo-600 to-blue-800 p-6 sm:p-7 text-white shadow-xl shadow-blue-500/15 flex flex-col justify-between group">
              <div className="absolute top-0 right-0 p-4 opacity-15 group-hover:scale-110 transition-transform duration-500 pointer-events-none">
                <FaBookOpen className="text-9xl text-white" />
              </div>

              <div className="relative z-10">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-white font-extrabold text-[10px] uppercase tracking-wider mb-4">
                  <span>📚</span> Syllabus Administration
                </div>
                <span className="text-xs font-bold uppercase tracking-widest text-blue-100 block mb-1">
                  Active Exam Packs
                </span>
                <p className="text-5xl sm:text-6xl font-black tracking-tight mb-2">
                  {stats?.activePacks || 0}
                </p>
                <p className="text-blue-100 text-xs font-medium leading-relaxed">
                  Configured question containers ready for student evaluations.
                </p>
              </div>

              <div className="relative z-10 pt-6">
                <Link
                  href="/dashboard/manage-exam-pack"
                  className="w-full py-3 px-4 rounded-2xl bg-white text-blue-700 hover:bg-blue-50 font-bold text-xs text-center block shadow-lg shadow-black/5 hover-lift transition-all cursor-pointer"
                >
                  Manage Curriculum Packs
                </Link>
              </div>
            </div>
          </div>

          {/* Teacher KPI Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="rounded-3xl bg-white border border-slate-200/80 p-5 shadow-sm hover:shadow-md transition-all">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">
                  Class Average
                </span>
                <div className="w-8 h-8 rounded-xl bg-orange-50 text-[#dd6b01] flex items-center justify-center text-xs">
                  <FaAward />
                </div>
              </div>
              <p className="text-3xl font-black text-slate-900">
                {stats?.classAverage || "0%"}
              </p>
              <p className="text-[11px] text-slate-400 font-semibold mt-1">
                Overall score ratio
              </p>
            </div>

            <div className="rounded-3xl bg-white border border-slate-200/80 p-5 shadow-sm hover:shadow-md transition-all">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">
                  Active Packs
                </span>
                <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center text-xs">
                  <FaBookOpen />
                </div>
              </div>
              <p className="text-3xl font-black text-blue-600">
                {stats?.activePacks || 0}
              </p>
              <p className="text-[11px] text-slate-400 font-semibold mt-1">
                Published packages
              </p>
            </div>

            <div className="rounded-3xl bg-white border border-slate-200/80 p-5 shadow-sm hover:shadow-md transition-all">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">
                  Questions Built
                </span>
                <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-xs">
                  <FaFileAlt />
                </div>
              </div>
              <p className="text-3xl font-black text-emerald-600">
                {stats?.questionsCount || 0}
              </p>
              <p className="text-[11px] text-slate-400 font-semibold mt-1">
                Total item bank
              </p>
            </div>

            <div className="rounded-3xl bg-white border border-slate-200/80 p-5 shadow-sm hover:shadow-md transition-all">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">
                  Graded Scripts
                </span>
                <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center text-xs">
                  <FaCheckCircle />
                </div>
              </div>
              <p className="text-3xl font-black text-purple-600">
                {stats?.gradedScripts || 0}
              </p>
              <p className="text-[11px] text-slate-400 font-semibold mt-1">
                Student submissions
              </p>
            </div>
          </div>

          {/* Teacher Activity & Curriculum Table */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start">
            {/* Monthly Attempts Chart */}
            <div className="xl:col-span-2 rounded-3xl bg-white border border-slate-200/80 p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between gap-4 mb-4">
                <div>
                  <h3 className="text-lg font-black text-slate-900 tracking-tight">
                    Monthly Student Submission Volume
                  </h3>
                  <p className="text-slate-500 text-xs font-medium mt-0.5">
                    Test submission activity across your courses in the past 5 months.
                  </p>
                </div>
                <span className="text-[10px] bg-blue-50 text-blue-700 font-extrabold px-2.5 py-0.5 rounded-full border border-blue-200">
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
            <div className="rounded-3xl bg-white border border-slate-200/80 p-6 shadow-sm hover:shadow-md transition-shadow space-y-4">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center text-xs">
                    <FaTasks />
                  </div>
                  <h3 className="text-base font-black text-slate-900 tracking-tight">
                    Review Tasks
                  </h3>
                </div>
                <span className="px-2 py-0.5 bg-amber-100 text-amber-800 text-[10px] font-extrabold rounded-full">
                  {stats?.pendingTasks?.length || 0} Pending
                </span>
              </div>

              {stats?.pendingTasks && stats.pendingTasks.length > 0 ? (
                <div className="space-y-3">
                  {stats.pendingTasks.map((t: any, idx: number) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/70 flex items-start gap-3 hover:bg-slate-100/60 transition-colors"
                    >
                      <div className="w-6 h-6 rounded-lg bg-orange-100 text-[#dd6b01] flex items-center justify-center text-[10px] shrink-0 mt-0.5">
                        <FaClock />
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-slate-800 text-xs truncate">
                          {t.title}
                        </p>
                        <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                          {t.desc}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-8 text-center text-slate-400">
                  <FaCheckCircle className="mx-auto text-2xl mb-1 text-emerald-400 opacity-60" />
                  <p className="text-xs font-bold text-slate-700">All caught up!</p>
                  <p className="text-[11px] text-slate-400">
                    No pending grading tasks or exam approvals.
                  </p>
                </div>
              )}

              <div className="pt-3 border-t border-slate-100 space-y-2">
                <Link
                  href="/dashboard/manage-exam-pack/add"
                  className="w-full py-2.5 px-4 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-xs flex items-center justify-between transition-colors"
                >
                  <span>+ Create New Exam Container</span>
                  <FaArrowRight className="text-[10px]" />
                </Link>
                <Link
                  href="/dashboard/report"
                  className="w-full py-2.5 px-4 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold text-xs flex items-center justify-between transition-colors"
                >
                  <span>Review Detailed Student Reports</span>
                  <FaArrowRight className="text-[10px]" />
                </Link>
              </div>
            </div>
          </div>

          {/* Assigned Course Packs Table */}
          {stats?.assignedPacks && stats.assignedPacks.length > 0 && (
            <div className="rounded-3xl bg-white border border-slate-200/80 p-6 shadow-sm">
              <div className="flex items-center justify-between gap-4 mb-6">
                <div>
                  <h3 className="text-lg font-black text-slate-900 tracking-tight">
                    Course Syllabus Packs & Submission Counts
                  </h3>
                  <p className="text-slate-500 text-xs font-medium mt-0.5">
                    Overview of active exam modules currently published for students.
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

              <div className="overflow-x-auto rounded-2xl border border-slate-200/80">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50/90 border-b border-slate-200/80 text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
                      <th className="px-5 py-3.5">ID</th>
                      <th className="px-5 py-3.5">Pack Name</th>
                      <th className="px-5 py-3.5">Submissions</th>
                      <th className="px-5 py-3.5">Grading Policy</th>
                      <th className="px-5 py-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-sm font-medium">
                    {stats.assignedPacks.map((pack: any, idx: number) => (
                      <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-5 py-4 font-mono text-xs font-bold text-slate-500">
                          {pack.id}
                        </td>
                        <td className="px-5 py-4 font-bold text-slate-900">
                          {pack.name}
                        </td>
                        <td className="px-5 py-4 font-black text-blue-600">
                          {pack.score}
                        </td>
                        <td className="px-5 py-4">
                          <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                            {pack.negative}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-right">
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
            </div>
          )}
        </div>
      )}

      {/* ========================================================
          3. ADMIN DASHBOARD
          ======================================================== */}
      {normRole === "admin" && (
        <div className="space-y-8 animate-fadeIn">
          {/* Top Banner Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
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

            {/* Live System Health Card */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-purple-700 via-indigo-800 to-purple-900 p-6 sm:p-7 text-white shadow-xl shadow-purple-500/15 flex flex-col justify-between group">
              <div className="absolute top-0 right-0 p-4 opacity-15 group-hover:scale-110 transition-transform duration-500 pointer-events-none">
                <FaShieldAlt className="text-9xl text-white" />
              </div>

              <div className="relative z-10">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-white font-extrabold text-[10px] uppercase tracking-wider mb-4">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  System Health
                </div>
                <span className="text-xs font-bold uppercase tracking-widest text-purple-200 block mb-1">
                  Node Status
                </span>
                <p className="text-4xl sm:text-5xl font-black tracking-tight mb-2">
                  {stats?.serverStatus || "OPERATIONAL"}
                </p>
                <p className="text-purple-200 text-xs font-medium leading-relaxed">
                  PostgreSQL cluster active. Next.js Turbopack runner nominal.
                </p>
              </div>

              <div className="relative z-10 pt-6">
                <Link
                  href="/dashboard/settings/user-management"
                  className="w-full py-3 px-4 rounded-2xl bg-white text-purple-800 hover:bg-purple-50 font-bold text-xs text-center block shadow-lg shadow-black/5 hover-lift transition-all cursor-pointer"
                >
                  Manage Users & Roles
                </Link>
              </div>
            </div>
          </div>

          {/* Admin KPI Counters */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="rounded-3xl bg-white border border-slate-200/80 p-5 shadow-sm hover:shadow-md transition-all">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">
                  Registered Students
                </span>
                <div className="w-8 h-8 rounded-xl bg-orange-50 text-[#dd6b01] flex items-center justify-center text-xs">
                  <FaUsers />
                </div>
              </div>
              <p className="text-3xl font-black text-slate-900">
                {stats?.registeredCount || "0"}
              </p>
              <p className="text-[11px] text-slate-400 font-semibold mt-1">
                Candidate accounts
              </p>
            </div>

            <div className="rounded-3xl bg-white border border-slate-200/80 p-5 shadow-sm hover:shadow-md transition-all">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">
                  Verified Educators
                </span>
                <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center text-xs">
                  <FaChalkboardTeacher />
                </div>
              </div>
              <p className="text-3xl font-black text-blue-600">
                {stats?.educatorsCount || "0"}
              </p>
              <p className="text-[11px] text-slate-400 font-semibold mt-1">
                Teacher faculty accounts
              </p>
            </div>

            <div className="rounded-3xl bg-white border border-slate-200/80 p-5 shadow-sm hover:shadow-md transition-all">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">
                  Maintained Packs
                </span>
                <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center text-xs">
                  <FaLayerGroup />
                </div>
              </div>
              <p className="text-3xl font-black text-purple-600">
                {stats?.maintainedPacks || "0"}
              </p>
              <p className="text-[11px] text-slate-400 font-semibold mt-1">
                Published exam modules
              </p>
            </div>

            <div className="rounded-3xl bg-white border border-slate-200/80 p-5 shadow-sm hover:shadow-md transition-all">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">
                  Sync Pipeline
                </span>
                <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-xs">
                  <FaDatabase />
                </div>
              </div>
              <p className="text-3xl font-black text-emerald-600">
                {stats?.syncStatus || "Synced"}
              </p>
              <p className="text-[11px] text-slate-400 font-semibold mt-1">
                Active replica nodes
              </p>
            </div>
          </div>

          {/* Admin Diagnostics & Activity */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start">
            {/* System Attempt Activity */}
            <div className="xl:col-span-2 rounded-3xl bg-white border border-slate-200/80 p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between gap-4 mb-4">
                <div>
                  <h3 className="text-lg font-black text-slate-900 tracking-tight">
                    Total Platform Evaluation Volume
                  </h3>
                  <p className="text-slate-500 text-xs font-medium mt-0.5">
                    Aggregated candidate attempts processed across the last 5 months.
                  </p>
                </div>
                <span className="text-[10px] bg-purple-50 text-purple-700 font-extrabold px-2.5 py-0.5 rounded-full border border-purple-200">
                  SYSTEM TELEMETRY
                </span>
              </div>

              <ChartCard
                data={stats?.activityData || []}
                color="#7c3aed"
                strokeColor="#a855f7"
                avgLabel="Avg Attempts"
              />
            </div>

            {/* Quick Management Control Center */}
            <div className="rounded-3xl bg-white border border-slate-200/80 p-6 shadow-sm hover:shadow-md transition-shadow space-y-4">
              <h3 className="text-base font-black text-slate-900 tracking-tight">
                Control Center Modules
              </h3>
              <div className="space-y-3">
                <Link
                  href="/dashboard/settings/user-management"
                  className="p-3.5 rounded-2xl bg-purple-50/70 border border-purple-100 hover:border-purple-300 transition-all flex items-start gap-3 group"
                >
                  <div className="w-8 h-8 rounded-xl bg-purple-600 text-white flex items-center justify-center text-xs shrink-0 group-hover:scale-105 transition-transform">
                    <FaUserShield />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-xs">
                      User & Role Management
                    </h4>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Elevate permissions, manage access control.
                    </p>
                  </div>
                </Link>

                <Link
                  href="/dashboard/settings/assets-setup"
                  className="p-3.5 rounded-2xl bg-blue-50/70 border border-blue-100 hover:border-blue-300 transition-all flex items-start gap-3 group"
                >
                  <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center text-xs shrink-0 group-hover:scale-105 transition-transform">
                    <FaCogs />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-xs">
                      System Assets Setup
                    </h4>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Define levels, boards, batches, and institutions.
                    </p>
                  </div>
                </Link>

                <Link
                  href="/dashboard/settings/exam-analysis"
                  className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-100 hover:border-amber-300 transition-all flex items-start gap-3 group"
                >
                  <div className="w-8 h-8 rounded-xl bg-amber-600 text-white flex items-center justify-center text-xs shrink-0 group-hover:scale-105 transition-transform">
                    <FaServer />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-xs">
                      Exam Analytics Hub
                    </h4>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Inspect test attempts and pass rate distributions.
                    </p>
                  </div>
                </Link>

                <Link
                  href="/dashboard/settings/financial-report"
                  className="p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-100 hover:border-emerald-300 transition-all flex items-start gap-3 group"
                >
                  <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center text-xs shrink-0 group-hover:scale-105 transition-transform">
                    <FaClock />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-xs">
                      Financial Ledger
                    </h4>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Review platform income and transaction history.
                    </p>
                  </div>
                </Link>
              </div>
            </div>
          </div>

          {/* Audit Logs Table */}
          {stats?.auditLogs && stats.auditLogs.length > 0 && (
            <div className="rounded-3xl bg-white border border-slate-200/80 p-6 shadow-sm">
              <div className="flex items-center justify-between gap-4 mb-6">
                <div>
                  <h3 className="text-lg font-black text-slate-900 tracking-tight">
                    Recent Evaluation Audit Stream
                  </h3>
                  <p className="text-slate-500 text-xs font-medium mt-0.5">
                    Real-time transaction logs of candidate test submissions.
                  </p>
                </div>
                <Link
                  href="/dashboard/settings/exam-analysis"
                  className="text-xs font-bold text-purple-600 hover:underline flex items-center gap-1"
                >
                  <span>Full Analytics</span>
                  <FaArrowRight className="text-[10px]" />
                </Link>
              </div>

              <div className="overflow-x-auto rounded-2xl border border-slate-200/80">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50/90 border-b border-slate-200/80 text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
                      <th className="px-5 py-3.5">Attempt Ref</th>
                      <th className="px-5 py-3.5">Exam Name</th>
                      <th className="px-5 py-3.5">Raw Score</th>
                      <th className="px-5 py-3.5">Result Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-sm font-medium">
                    {stats.auditLogs.map((log: any, idx: number) => (
                      <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-5 py-4 font-mono text-xs font-bold text-slate-500">
                          {log.id}
                        </td>
                        <td className="px-5 py-4 font-bold text-slate-900">
                          {log.name}
                        </td>
                        <td className="px-5 py-4 font-bold text-slate-700">
                          {log.score}
                        </td>
                        <td className="px-5 py-4">
                          <span
                            className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${
                              log.negative === "Passed"
                                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                : "bg-rose-50 text-rose-700 border-rose-200"
                            }`}
                          >
                            {log.negative}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </PageContainer>
  );
}
