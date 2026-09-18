"use client";

import React, { useState, useEffect } from "react";
import { formatDate, DATE_FORMATS } from "@/lib/date";
import { PageContainer } from "../../components/common/PageContainer";
import { DashboardHero } from "./components/DashboardHero";
import { StudentDashboardView } from "./components/StudentDashboardView";
import { TeacherDashboardView } from "./components/TeacherDashboardView";
import { AdminDashboardView } from "./components/AdminDashboardView";

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
    setCurrentDateStr(formatDate(now, DATE_FORMATS.DATETIME_FULL));
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
    profileData.institution =
      initialProfile?.institution || "Education Department";
  } else if (normRole === "admin") {
    profileData.board = initialProfile?.adminTier || "System Admin";
    profileData.level = initialProfile?.adminDept || "Operations";
    profileData.batch = initialProfile?.adminBase || "HQ Node";
    profileData.institution = "Platform Management";
  }

  const firstName = name ? name.split(" ")[0] : "Candidate";

  return (
    <PageContainer className="space-y-6">
      {/* Top Hero & Welcome Banner */}
      <DashboardHero
        greeting={greeting}
        firstName={firstName}
        normRole={normRole}
        currentDateStr={currentDateStr}
      />

      {/* Role-Specific Dashboard Views */}
      {normRole === "student" && (
        <StudentDashboardView
          name={name}
          profileData={profileData}
          normRole={normRole}
          stats={stats}
        />
      )}

      {normRole === "teacher" && (
        <TeacherDashboardView
          name={name}
          profileData={profileData}
          normRole={normRole}
          stats={stats}
        />
      )}

      {normRole === "admin" && (
        <AdminDashboardView
          name={name}
          profileData={profileData}
          normRole={normRole}
          stats={stats}
        />
      )}
    </PageContainer>
  );
}
