"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import ChartCard from "../../components/dashboard/ChartCard";
import ExamsTable from "../../components/dashboard/ExamsTable";
import StatsGrid from "../../components/dashboard/StatsGrid";
import UpcomingExamCard from "../../components/dashboard/UpcomingExamCard";
import UserCard from "../../components/dashboard/UserCard";
import ExamQuotaCard from "../../components/dashboard/ExamQuotaCard";
import EmptyState from "../../components/common/EmptyState";
import { PrimaryBtn } from "../../components/ui/PrimaryBtn";
import { OutlineBtn } from "../../components/ui/OutlineBtn";
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
    const hour = new Date().getHours();
    if (hour < 12) setGreeting("Good morning");
    else if (hour < 18) setGreeting("Good afternoon");
    else setGreeting("Good evening");

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
      <div className="relative overflow-hidden rounded bg-slate-950 text-white p-4 sm:p-5 border border-slate-800 shadow-sm">
        {/* Subtle orange ambient glow */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-bl from-primary/20 via-amber-500/10 to-transparent rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        <div className="absolute bottom-0 left-1/3 w-48 h-48 bg-orange-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-white/10 backdrop-blur-md border border-white/15 text-orange-300 font-mono font-bold text-[10px] uppercase tracking-wider">
                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>
                {normRole === "student" && "Student Console"}
                {normRole === "teacher" && "Faculty Console"}
                {normRole === "admin" && "Root Admin"}
              </span>
              {currentDateStr && (
                <span className="text-slate-400 text-xs font-mono px-1">
                  {currentDateStr}
                </span>
              )}
            </div>

            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white">
              {greeting}, <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-orange-400 to-primary">{firstName}</span>!
            </h1>

            <p className="text-slate-300 text-xs font-normal leading-relaxed">
              {normRole === "student" &&
                "Active test series, accuracy telemetry, and academic progress ranking."}
              {normRole === "teacher" &&
                "Manage curriculum packages, question bank telemetry, and student progress reports."}
              {normRole === "admin" &&
                "Platform governance, server operational health, and audit telemetry stream."}
            </p>
          </div>

          {/* Quick Actions Panel */}
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            {normRole === "student" && (
              <>
                <PrimaryBtn
                  link="/dashboard/exam-pack"
                  className="!text-xs !py-1.5 !px-3.5 !rounded"
                >
                  <FaBookOpen className="mr-1.5 text-xs shrink-0" />
                  <span>Browse Exam Packs</span>
                </PrimaryBtn>
                <OutlineBtn
                  link="/dashboard/reporting"
                  className="!text-xs !py-1.5 !px-3.5 !bg-white/10 !border-white/20 !text-white hover:!bg-white/20 !rounded"
                >
                  <FaChartLine className="mr-1.5 text-xs shrink-0" />
                  <span>Performance</span>
                </OutlineBtn>
              </>
            )}

            {normRole === "teacher" && (
              <>
                <PrimaryBtn
                  link="/dashboard/manage-exam-pack/add"
                  className="!text-xs !py-1.5 !px-3.5 !rounded"
                >
                  <FaCogs className="mr-1.5 text-xs shrink-0" />
                  <span>+ Create Exam Pack</span>
                </PrimaryBtn>
                <OutlineBtn
                  link="/dashboard/question/add"
                  className="!text-xs !py-1.5 !px-3.5 !bg-white/10 !border-white/20 !text-white hover:!bg-white/20 !rounded"
                >
                  <FaFileAlt className="mr-1.5 text-xs shrink-0" />
                  <span>Question Bank</span>
                </OutlineBtn>
              </>
            )}

            {normRole === "admin" && (
              <>
                <PrimaryBtn
                  link="/dashboard/settings/user-management"
                  className="!text-xs !py-1.5 !px-3.5 !from-purple-600 !to-indigo-600 !rounded"
                >
                  <FaUsers className="mr-1.5 text-xs shrink-0" />
                  <span>Users & Access</span>
                </PrimaryBtn>
                <OutlineBtn
                  link="/dashboard/settings/assets-setup"
                  className="!text-xs !py-1.5 !px-3.5 !bg-white/10 !border-white/20 !text-white hover:!bg-white/20 !rounded"
                >
                  <FaCogs className="mr-1.5 text-xs shrink-0" />
                  <span>Assets</span>
                </OutlineBtn>
              </>
            )}
          </div>
        </div>
      </div>

      {/* ========================================================
          1. STUDENT DASHBOARD
          ======================================================== */}
      {normRole === "student" && (
        <div className="space-y-4 sm:space-y-5 animate-fadeIn">
          {/* Identity & Rank Standings Row */}
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

            {/* Merit Standing / Overall Rank Card */}
            <div className="relative overflow-hidden rounded bg-gradient-to-br from-primary via-orange-600 to-amber-600 p-4 sm:p-4.5 text-white shadow-2xs flex flex-col justify-between group">
              {/* Decorative Trophy watermark */}
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
                  {stats?.institutionRank || "Complete self-tests to qualify for institution ranking."}
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
      )}

      {/* ========================================================
          2. TEACHER DASHBOARD
          ======================================================== */}
      {normRole === "teacher" && (
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
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse"></span>
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

          {/* Teacher Exam Creation Quota */}
          <ExamQuotaCard
            created={stats?.createdPacksCount}
            limit={stats?.examPackLimit}
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
          {stats?.assignedPacks && stats.assignedPacks.length > 0 && (
            <div className="rounded bg-white border border-slate-200/80 p-4 sm:p-5 shadow-xs">
              <div className="flex items-center justify-between gap-4 mb-4">
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight">
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
                      <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-3.5 py-2.5 font-mono text-xs font-bold text-slate-500">
                          {pack.id}
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
                        {pack.id}
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
                        Submissions: <span className="font-bold text-blue-600">{pack.score}</span>
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
            </div>
          )}
        </div>
      )}

      {/* ========================================================
          3. ADMIN DASHBOARD
          ======================================================== */}
      {normRole === "admin" && (
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
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
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
                {stats?.registeredCount || "0"}
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
                {stats?.educatorsCount || "0"}
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
                {stats?.maintainedPacks || "0"}
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
                    Aggregated candidate attempts processed across the last 5 months.
                  </p>
                </div>
                <span className="text-[10px] font-mono bg-purple-50 text-purple-700 font-bold px-2 py-0.5 rounded border border-purple-200">
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
          {stats?.auditLogs && stats.auditLogs.length > 0 && (
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
                <Link
                  href="/dashboard/settings/exam-analysis"
                  className="text-xs font-bold text-purple-600 hover:underline flex items-center gap-1"
                >
                  <span>Full Analytics</span>
                  <FaArrowRight className="text-[10px]" />
                </Link>
              </div>

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
                    {stats.auditLogs.map((log: any, idx: number) => (
                      <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-3.5 py-2.5 font-mono text-xs font-bold text-slate-500">
                          {log.id}
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
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Cards View */}
              <div className="block sm:hidden divide-y divide-slate-100 border border-slate-200/80 bg-white">
                {stats.auditLogs.map((log: any, idx: number) => (
                  <div key={idx} className="p-3 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[10px] font-bold text-slate-400">
                        {log.id}
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
                      <span className="font-mono text-slate-400 text-[10px] uppercase font-bold">Raw Score</span>
                      <span className="font-mono font-bold text-slate-700">{log.score}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </PageContainer>
  );
}
