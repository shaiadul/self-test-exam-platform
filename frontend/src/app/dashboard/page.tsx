"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import ChartCard from "../../components/dashboard/ChartCard";
import ExamsTable from "../../components/dashboard/ExamsTable";
import StatsGrid from "../../components/dashboard/StatsGrid";
import UpcomingExamCard from "../../components/dashboard/UpcomingExamCard";
import UserCard from "../../components/dashboard/UserCard";
import {
  FaGraduationCap,
  FaAward,
  FaServer,
  FaCogs,
  FaBookOpen,
  FaUserShield,
  FaClock,
} from "react-icons/fa";
import { PageContainer } from "../../components/common/PageContainer";

// Mock datasets for dynamic role charts
const studentChartData = [
  { name: "Exam 1", value: 30 },
  { name: "Exam 2", value: 55 },
  { name: "Exam 3", value: 45 },
  { name: "Exam 4", value: 70 },
  { name: "Exam 5", value: 50 },
];

const teacherChartData = [
  { name: "Oct", value: 20 },
  { name: "Nov", value: 45 },
  { name: "Dec", value: 35 },
  { name: "Jan", value: 80 },
  { name: "Feb", value: 65 },
];

const adminChartData = [
  { name: "Oct", value: 45 },
  { name: "Nov", value: 60 },
  { name: "Dec", value: 55 },
  { name: "Jan", value: 88 },
  { name: "Feb", value: 95 },
];

import { getProfileAction, getDashboardStatsAction } from "../../lib/actions";

export default function DashboardPage() {
  const [userRole, setUserRole] = useState<string>("student");
  const [userName, setUserName] = useState("Md Saidul Basar");
  const [mounted, setMounted] = useState(false);
  const [stats, setStats] = useState<any>(null);

  // Synchronized Profile state loader
  const [profileData, setProfileData] = useState({
    image: "/user/md-saidul.jpeg",
    board: "Dhaka",
    level: "BSS",
    batch: "2019-2020",
    institution: "Govt. Titumir College Dhaka",
  });

  useEffect(() => {
    async function loadDashboard() {
      try {
        const profile = await getProfileAction();
        const liveStats = await getDashboardStatsAction();

        const role = profile?.role || localStorage.getItem("userRole") || "student";
        const name = profile?.name || localStorage.getItem("userName") || "Md Saidul Basar";

        setUserRole(role);
        setUserName(name);
        setStats(liveStats);

        const data = {
          image: profile?.image || localStorage.getItem("userImage") || "/user/md-saidul.jpeg",
          board: "",
          level: "",
          batch: "",
          institution: "",
        };

        if (role === "student") {
          data.board = profile?.board || "Dhaka";
          data.level = profile?.level || "BSS";
          data.batch = profile?.batch || "2019-2020";
          data.institution = profile?.institution || "Govt. Titumir College Dhaka";
        } else if (role === "teacher") {
          data.board = profile?.subject || "Physics Dept";
          data.level = profile?.designation || "Lead Faculty";
          data.batch = "LMS Faculty";
          data.institution = profile?.institution || "Govt. Titumir College Dhaka";
        } else if (role === "admin") {
          data.board = profile?.adminTier || "Super Admin";
          data.level = profile?.adminDept || "Global Control";
          data.batch = profile?.adminBase || "Operations Control";
          data.institution = "Self-Test Portal Central";
        }

        setProfileData(data);
      } catch (err) {
        console.error("Failed to load dashboard statistics:", err);
      } finally {
        setMounted(true);
      }
    }
    loadDashboard();
  }, []);

  if (!mounted) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#dd6b01]"></div>
      </div>
    );
  }

  const normRole = userRole.toLowerCase();

  return (
    <PageContainer>
      {/* Dynamic Greetings Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-gray-100 pb-8 mb-4 animate-fadeIn">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary font-bold text-xs uppercase tracking-wider">
            ⚡ Dashboard Overview
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-gray-900 tracking-tight">
            Welcome back, {userName.split(" ")[0]}!
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
                name={userName}
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
                <p className="text-5xl font-black tracking-tight mb-2">#{stats?.rank || 42}</p>
                <p className="text-orange-100 text-xs font-semibold">
                  {stats?.institutionRank || `Top 5% of ${profileData.institution || "Govt. Titumir College"}`}
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
                  data={stats?.accuracyData || studentChartData}
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
          {/* Header Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
            <div className="lg:col-span-2">
              <UserCard
                name={userName}
                board={profileData.board}
                level={profileData.level}
                batch={profileData.batch}
                institution={profileData.institution}
                image={profileData.image}
              />
            </div>
            <div className="bg-gradient-to-br from-blue-600 to-indigo-500 rounded-3xl p-6 text-white shadow-xl shadow-blue-500/10 relative overflow-hidden group flex flex-col justify-between h-full min-h-[170px]">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform duration-500">
                <FaBookOpen className="text-9xl" />
              </div>
              <div className="relative z-10">
                <h3 className="text-sm font-bold text-blue-50/80 uppercase tracking-widest mb-1">
                  Class Average
                </h3>
                <p className="text-5xl font-black tracking-tight mb-2">78.4%</p>
                <p className="text-blue-100 text-xs font-semibold">
                  Average Accuracy Across 8 Active Batches
                </p>
              </div>
              <Link href="/dashboard/report" className="relative z-10 mt-4 w-full py-2.5 bg-white/20 hover:bg-white/35 backdrop-blur-md border border-white/25 rounded-2xl font-bold transition-all text-xs cursor-pointer text-center block">
                Manage Class Reports
              </Link>
            </div>
          </div>

          {/* Analytics & Metrics */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
            <div className="xl:col-span-2">
              <div className="bg-white p-6 rounded-3xl border border-gray-100/80 shadow-md shadow-gray-100/30 h-full flex flex-col justify-between">
                <div className="mb-6 flex justify-between items-center">
                  <h3 className="text-lg font-black text-gray-900 tracking-tight">
                    Question Contributions
                  </h3>
                  <span className="text-[10px] bg-blue-50 text-blue-700 font-extrabold px-2.5 py-1 rounded-full border border-blue-200">
                    BANK ACTIVITY
                  </span>
                </div>
                <ChartCard
                  data={stats?.activityData || teacherChartData}
                  color="#3b82f6"
                  strokeColor="#6366f1"
                  avgLabel="Questions/Mo"
                />
              </div>
            </div>
            <div>
              <StatsGrid
                stats={[
                  { label: "Active Exam Packs", value: stats?.activePacks?.toString() || "0" },
                  { label: "Questions Created", value: stats?.questionsCount?.toString() || "0" },
                  { label: "Graded Scripts", value: stats?.gradedScripts?.toString() || "0" },
                  { label: "Instructor Rating", value: stats?.rating || "4.9 / 5" },
                ]}
              />
            </div>
          </div>

          {/* Recents & Activities */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <div className="bg-white p-6 rounded-3xl border border-gray-100/80 shadow-md shadow-gray-100/30">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-black text-gray-900 tracking-tight">
                    Assigned Exam Packages
                  </h3>
                  <Link href="/dashboard/manage-exam-pack" className="text-blue-600 text-xs font-bold hover:underline cursor-pointer">
                    Add Exam Schedule
                  </Link>
                </div>
                {stats?.assignedPacks && stats.assignedPacks.length > 0 ? (
                  <ExamsTable exams={stats.assignedPacks} />
                ) : (
                  <p className="text-sm text-gray-500 py-6 text-center">No assigned exams yet.</p>
                )}
              </div>
            </div>

            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-black text-gray-900 tracking-tight">
                  Pending Tasks
                </h3>
                <span className="px-2.5 py-1 bg-blue-100 text-blue-700 text-[10px] font-extrabold rounded-full border border-blue-200 uppercase tracking-wider">
                  {stats?.pendingTasks?.length || 0} Review Drafts
                </span>
              </div>
              <div className="grid grid-cols-1 gap-4">
                {(stats?.pendingTasks || []).map((task: any, idx: number) => (
                  <div key={idx} className="bg-white border border-gray-100/80 rounded-2xl p-4 flex gap-4 hover:shadow-md transition">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm shrink-0 border ${
                      task.type === "time" ? "bg-orange-50 text-[#dd6b01] border-orange-100" : "bg-indigo-50 text-indigo-600 border-indigo-100"
                    }`}>
                      {task.type === "time" ? <FaClock /> : <FaCogs />}
                    </div>
                    <div>
                      <h4 className="text-xs font-extrabold text-gray-800">
                        {task.title}
                      </h4>
                      <p className="text-[10px] text-gray-400 mt-1">
                        {task.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          3. SYSTEM ADMINISTRATOR DASHBOARD
          ======================================================== */}
      {normRole === "admin" && (
        <div className="space-y-8 animate-fadeIn">
          {/* Header Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
            <div className="lg:col-span-2">
              <UserCard
                name={userName}
                board={profileData.board}
                level={profileData.level}
                batch={profileData.batch}
                institution={profileData.institution}
                image={profileData.image}
              />
            </div>
            <div className="bg-gradient-to-br from-purple-700 to-indigo-600 rounded-3xl p-6 text-white shadow-xl shadow-purple-500/10 relative overflow-hidden group flex flex-col justify-between h-full min-h-[170px]">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform duration-500">
                <FaServer className="text-9xl" />
              </div>
              <div className="relative z-10">
                <h3 className="text-sm font-bold text-purple-50/80 uppercase tracking-widest mb-1">
                  Server Status
                </h3>
                <p className="text-5xl font-black tracking-tight mb-2">{stats?.serverStatus || "99.9%"}</p>
                <p className="text-purple-100 text-xs font-semibold flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  All Nodes Online & Healthy
                </p>
              </div>
              <Link href="/dashboard/settings" className="relative z-10 mt-4 w-full py-2.5 bg-white/20 hover:bg-white/35 backdrop-blur-md border border-white/25 rounded-2xl font-bold transition-all text-xs cursor-pointer text-center block">
                Access Portal Settings
              </Link>
            </div>
          </div>

          {/* Analytics & Metrics */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
            <div className="xl:col-span-2">
              <div className="bg-white p-6 rounded-3xl border border-gray-100/80 shadow-md shadow-gray-100/30 h-full flex flex-col justify-between">
                <div className="mb-6 flex justify-between items-center">
                  <h3 className="text-lg font-black text-gray-900 tracking-tight">
                    Platform Attempts Over Time
                  </h3>
                  <span className="text-[10px] bg-purple-50 text-purple-700 font-extrabold px-2.5 py-1 rounded-full border border-purple-200">
                    PORTAL SYNCS
                  </span>
                </div>
                <ChartCard
                  data={stats?.activityData || adminChartData}
                  color="#7c3aed"
                  strokeColor="#8b5cf6"
                  avgLabel="Total Attempts"
                />
              </div>
            </div>
            <div>
              <StatsGrid
                stats={[
                  { label: "Registered Students", value: stats?.registeredCount || "0" },
                  { label: "Educator Accounts", value: stats?.educatorsCount || "0" },
                  { label: "Maintained Packs", value: stats?.maintainedPacks || "0" },
                  { label: "Sync Status", value: stats?.syncStatus || "100% Synced" },
                ]}
              />
            </div>
          </div>

          {/* Auditing & Logs */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <div className="bg-white p-6 rounded-3xl border border-gray-100/80 shadow-md shadow-gray-100/30">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-black text-gray-900 tracking-tight">
                    System Operations Audit Trail
                  </h3>
                  <Link href="/dashboard/settings/permission-management" className="text-purple-600 text-xs font-bold hover:underline cursor-pointer">
                    Review Permission Logs
                  </Link>
                </div>
                {stats?.auditLogs && stats.auditLogs.length > 0 ? (
                  <ExamsTable exams={stats.auditLogs} />
                ) : (
                  <p className="text-sm text-gray-500 py-6 text-center">No system operations logged.</p>
                )}
              </div>
            </div>

            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-black text-gray-900 tracking-tight">
                  Pending Portal Audits
                </h3>
                <span className="px-2.5 py-1 bg-purple-100 text-purple-700 text-[10px] font-extrabold rounded-full border border-purple-200 uppercase tracking-wider">
                  Queue Status
                </span>
              </div>
              <div className="grid grid-cols-1 gap-4">
                {(stats?.pendingAudits || []).map((audit: any, idx: number) => (
                  <div key={idx} className="bg-white border border-gray-100/80 rounded-2xl p-4 flex gap-4 hover:shadow-md transition">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm shrink-0 border ${
                      audit.type === "user" ? "bg-purple-50 text-purple-600 border-purple-100" : "bg-red-50 text-red-600 border-red-100"
                    }`}>
                      {audit.type === "user" ? <FaUserShield /> : <FaServer />}
                    </div>
                    <div>
                      <h4 className="text-xs font-extrabold text-gray-800">
                        {audit.title}
                      </h4>
                      <p className="text-[10px] text-gray-400 mt-1">
                        {audit.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </PageContainer>
  );
}
