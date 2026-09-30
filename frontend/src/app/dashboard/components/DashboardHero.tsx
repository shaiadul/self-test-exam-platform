import React from "react";
import Link from "next/link";
import { PrimaryBtn } from "../../../components/ui/PrimaryBtn";
import { OutlineBtn } from "../../../components/ui/OutlineBtn";
import {
  FaBookOpen,
  FaChartLine,
  FaLayerGroup,
  FaFileAlt,
  FaUsers,
  FaShieldAlt,
} from "react-icons/fa";

interface DashboardHeroProps {
  greeting: string;
  firstName: string;
  normRole: string;
  currentDateStr: string;
}

export const DashboardHero: React.FC<DashboardHeroProps> = ({
  greeting,
  firstName,
  normRole,
  currentDateStr,
}) => {
  return (
    <div className="relative overflow-hidden rounded bg-slate-950 text-white p-4 sm:p-5 border border-slate-800 shadow-sm">
      {/* Subtle orange ambient glow */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-bl from-primary/20 via-amber-500/10 to-transparent rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
      <div className="absolute bottom-0 left-1/3 w-48 h-48 bg-orange-500/10 rounded-full blur-2xl pointer-events-none" />

      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1 max-w-2xl">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-white/10 backdrop-blur-md border border-white/15 text-orange-300 font-mono font-bold text-[10px] uppercase tracking-wider">
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
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
            {greeting},{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-orange-400 to-primary">
              {firstName}
            </span>
            !
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
                <FaLayerGroup className="mr-1.5 text-xs shrink-0" />
                <span>New Exam Pack</span>
              </PrimaryBtn>
              <OutlineBtn
                link="/dashboard/question/add"
                className="!text-xs !py-1.5 !px-3.5 !bg-white/10 !border-white/20 !text-white hover:!bg-white/20 !rounded"
              >
                <FaFileAlt className="mr-1.5 text-xs shrink-0" />
                <span>Add Question</span>
              </OutlineBtn>
            </>
          )}

          {normRole === "admin" && (
            <>
              <PrimaryBtn
                link="/dashboard/settings/user-management"
                className="!text-xs !py-1.5 !px-3.5 !rounded"
              >
                <FaUsers className="mr-1.5 text-xs shrink-0" />
                <span>Manage Users</span>
              </PrimaryBtn>
              <OutlineBtn
                link="/dashboard/settings/exam-analysis"
                className="!text-xs !py-1.5 !px-3.5 !bg-white/10 !border-white/20 !text-white hover:!bg-white/20 !rounded"
              >
                <FaShieldAlt className="mr-1.5 text-xs shrink-0" />
                <span>Platform Health</span>
              </OutlineBtn>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
