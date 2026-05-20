"use client";

import React, { useState, useEffect } from "react";
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

export default function DashboardPage() {
  const [userRole, setUserRole] = useState<string>("student");
  const [userName, setUserName] = useState("Md Saidul Basar");
  const [mounted, setMounted] = useState(false);

  // Synchronized Profile state loader
  const [profileData, setProfileData] = useState({
    image: "/user/md-saidul.jpeg",
    board: "Dhaka",
    level: "BSS",
    batch: "2019-2020",
    institution: "Govt. Titumir College Dhaka",
  });

  useEffect(() => {
    const role = localStorage.getItem("userRole") || "student";
    const name = localStorage.getItem("userName") || "Md Saidul Basar";
    setUserRole(role);
    setUserName(name);

    setProfileData(() => {
      const data = {
        image: localStorage.getItem("userImage") || "/user/md-saidul.jpeg",
        board: "",
        level: "",
        batch: "",
        institution: "",
      };

      if (role === "student") {
        data.board = localStorage.getItem("studentBoard") || "Dhaka";
        data.level = localStorage.getItem("studentLevel") || "BSS";
        data.batch = localStorage.getItem("studentBatch") || "2019-2020";
        data.institution =
          localStorage.getItem("studentInstitution") ||
          "Govt. Titumir College Dhaka";
      } else if (role === "teacher") {
        data.board = localStorage.getItem("teacherSubject") || "Physics Dept";
        data.level =
          localStorage.getItem("teacherDesignation") || "Lead Faculty";
        data.batch = "LMS Faculty";
        data.institution =
          localStorage.getItem("teacherInstitution") ||
          "Govt. Titumir College Dhaka";
        data.image = localStorage.getItem("userImage") || "";
      } else if (role === "admin") {
        data.board = localStorage.getItem("adminTier") || "Super Admin";
        data.level = localStorage.getItem("adminDept") || "Global Control";
        data.batch = localStorage.getItem("adminBase") || "Operations Control";
        data.institution = "Self-Test Portal Central";
        data.image = localStorage.getItem("userImage") || "";
      }

      return data;
    });

    setMounted(true);
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
                <p className="text-5xl font-black tracking-tight mb-2">#42</p>
                <p className="text-orange-100 text-xs font-semibold">
                  Top 5% of Govt. Titumir College Dhaka
                </p>
              </div>
              <button className="relative z-10 mt-4 w-full py-2.5 bg-white/20 hover:bg-white/35 backdrop-blur-md border border-white/25 rounded-2xl font-bold transition-all text-xs cursor-pointer">
                View Dynamic Leaderboard
              </button>
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
                  data={studentChartData}
                  color="#dd6b01"
                  strokeColor="#f59e0b"
                  avgLabel="Avg Mark"
                />
              </div>
            </div>
            <div>
              <StatsGrid
                stats={[
                  { label: "Completed Exams", value: "25" },
                  { label: "Average Mark", value: "66%" },
                  { label: "Passed Ratio", value: "75%" },
                  { label: "Failed Count", value: "6" },
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
                  <button className="text-[#dd6b01] text-xs font-bold hover:underline cursor-pointer">
                    View Evaluation History
                  </button>
                </div>
                <ExamsTable
                  exams={[
                    {
                      id: "#HSC34930",
                      name: "Physics-02 Mechanics",
                      score: "25/30",
                      negative: "-5",
                      answerSheet: "#",
                    },
                    {
                      id: "#HSC9800",
                      name: "Chemistry-03 Organic",
                      score: "28/30",
                      negative: "-2",
                      answerSheet: "#",
                    },
                  ]}
                />
              </div>
            </div>

            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-black text-gray-900 tracking-tight">
                  Upcoming Schedules
                </h3>
                <span className="px-2.5 py-1 bg-orange-100 text-[#dd6b01] text-[10px] font-extrabold rounded-full border border-orange-200 uppercase tracking-wider">
                  2 Scheduled
                </span>
              </div>
              <div className="grid grid-cols-1 gap-6">
                <UpcomingExamCard
                  image="/global/logo2.png"
                  title="Islamic Economics & Banking"
                  dateTime="10:30 AM | Sunday, 14th May"
                />
                <UpcomingExamCard
                  image="/global/logo2.png"
                  title="Physics 1st Paper Electromagnetism"
                  dateTime="12:30 PM | Monday, 15th May"
                />
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
              <button className="relative z-10 mt-4 w-full py-2.5 bg-white/20 hover:bg-white/35 backdrop-blur-md border border-white/25 rounded-2xl font-bold transition-all text-xs cursor-pointer">
                Manage Class Leaderboard
              </button>
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
                  data={teacherChartData}
                  color="#3b82f6"
                  strokeColor="#6366f1"
                  avgLabel="Questions/Mo"
                />
              </div>
            </div>
            <div>
              <StatsGrid
                stats={[
                  { label: "Active Exam Packs", value: "12" },
                  { label: "Questions Created", value: "480" },
                  { label: "Graded Scripts", value: "890" },
                  { label: "Instructor Rating", value: "4.9 / 5" },
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
                  <button className="text-blue-600 text-xs font-bold hover:underline cursor-pointer">
                    Add Exam Schedule
                  </button>
                </div>
                <ExamsTable
                  exams={[
                    {
                      id: "#TCH8820",
                      name: "Physics Mechanics Part-01",
                      score: "48 Submits",
                      negative: "No Negatives",
                      answerSheet: "#",
                    },
                    {
                      id: "#TCH2390",
                      name: "Modern Physics & Quantum",
                      score: "35 Submits",
                      negative: "-0.25 Marking",
                      answerSheet: "#",
                    },
                  ]}
                />
              </div>
            </div>

            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-black text-gray-900 tracking-tight">
                  Pending Tasks
                </h3>
                <span className="px-2.5 py-1 bg-blue-100 text-blue-700 text-[10px] font-extrabold rounded-full border border-blue-200 uppercase tracking-wider">
                  Review Drafts
                </span>
              </div>
              <div className="grid grid-cols-1 gap-4">
                <div className="bg-white border border-gray-100/80 rounded-2xl p-4 flex gap-4 hover:shadow-md transition">
                  <div className="w-10 h-10 rounded-xl bg-orange-50 text-[#dd6b01] flex items-center justify-center text-sm shrink-0 border border-orange-100">
                    <FaClock />
                  </div>
                  <div>
                    <h4 className="text-xs font-extrabold text-gray-800">
                      Grade Physics-02 Papers
                    </h4>
                    <p className="text-[10px] text-gray-400 mt-1">
                      12 student submissions pending scorecards
                    </p>
                  </div>
                </div>
                <div className="bg-white border border-gray-100/80 rounded-2xl p-4 flex gap-4 hover:shadow-md transition">
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center text-sm shrink-0 border border-indigo-100">
                    <FaCogs />
                  </div>
                  <div>
                    <h4 className="text-xs font-extrabold text-gray-800">
                      Verify Question Options
                    </h4>
                    <p className="text-[10px] text-gray-400 mt-1">
                      Check correctness of Organic Chemistry answers
                    </p>
                  </div>
                </div>
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
                <p className="text-5xl font-black tracking-tight mb-2">99.9%</p>
                <p className="text-purple-100 text-xs font-semibold flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  All Nodes Online & Healthy
                </p>
              </div>
              <button className="relative z-10 mt-4 w-full py-2.5 bg-white/20 hover:bg-white/35 backdrop-blur-md border border-white/25 rounded-2xl font-bold transition-all text-xs cursor-pointer">
                Access System Shell Logs
              </button>
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
                  data={adminChartData}
                  color="#7c3aed"
                  strokeColor="#8b5cf6"
                  avgLabel="Total Attempts"
                />
              </div>
            </div>
            <div>
              <StatsGrid
                stats={[
                  { label: "Registered Students", value: "12,850" },
                  { label: "Educator Accounts", value: "450" },
                  { label: "Maintained Packs", value: "89" },
                  { label: "Sync Status", value: "100% Synced" },
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
                  <button className="text-purple-600 text-xs font-bold hover:underline cursor-pointer">
                    Export Security Logs
                  </button>
                </div>
                <ExamsTable
                  exams={[
                    {
                      id: "#SYS-90021",
                      name: "Backup Database Operations",
                      score: "Success",
                      negative: "System System",
                      answerSheet: "#",
                    },
                    {
                      id: "#SYS-11090",
                      name: "Regrade Physics Mechanics Batch",
                      score: "Completed",
                      negative: "Admin Action",
                      answerSheet: "#",
                    },
                  ]}
                />
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
                <div className="bg-white border border-gray-100/80 rounded-2xl p-4 flex gap-4 hover:shadow-md transition">
                  <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center text-sm shrink-0 border border-purple-100">
                    <FaUserShield />
                  </div>
                  <div>
                    <h4 className="text-xs font-extrabold text-gray-800">
                      Review Educator Credentials
                    </h4>
                    <p className="text-[10px] text-gray-400 mt-1">
                      4 new physics tutors awaiting dashboard permissions
                    </p>
                  </div>
                </div>
                <div className="bg-white border border-gray-100/80 rounded-2xl p-4 flex gap-4 hover:shadow-md transition">
                  <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center text-sm shrink-0 border border-red-100">
                    <FaServer />
                  </div>
                  <div>
                    <h4 className="text-xs font-extrabold text-gray-800">
                      Clear Server Cached Logs
                    </h4>
                    <p className="text-[10px] text-gray-400 mt-1">
                      Cache exceeds 4.2GB, needs manual system flush
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </PageContainer>
  );
}
