"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { IoMdLogOut, IoMdSettings } from "react-icons/io";
import { FaHome, FaBoxOpen, FaChartBar, FaUserCog, FaClipboardList, FaPoll, FaShieldAlt } from "react-icons/fa";
import { SiGoogletagmanager } from "react-icons/si";
import { MdQuestionAnswer } from "react-icons/md";
import { TbMessageReportFilled } from "react-icons/tb";
import { MenuItem } from "../../lib/types";
import { cn } from "../../lib/utils";

interface NavGroup {
  title: string;
  items: MenuItem[];
}

const navGroups: NavGroup[] = [
  {
    title: "ACADEMIC PORTAL",
    items: [
      { name: "Dashboard", href: "/dashboard", icon: <FaHome className="text-lg" /> },
      { name: "Exam Pack", href: "/dashboard/exam-pack", icon: <FaBoxOpen className="text-lg" /> },
      { name: "My Reports", href: "/dashboard/reporting", icon: <FaChartBar className="text-lg" /> },
      { name: "Exam Reports", href: "/dashboard/teacher-reports", icon: <FaPoll className="text-lg" /> },
    ],
  },
  {
    title: "EXAMINATION ENGINE",
    items: [
      { name: "Manage Exam Pack", href: "/dashboard/manage-exam-pack", icon: <SiGoogletagmanager className="text-lg" /> },
      { name: "Question Bank", href: "/dashboard/question/add", icon: <MdQuestionAnswer className="text-lg" /> },
      { name: "Requests", href: "/dashboard/requests", icon: <FaClipboardList className="text-lg" /> },
      { name: "Class Evaluations", href: "/dashboard/report", icon: <TbMessageReportFilled className="text-lg" /> },
    ],
  },
  {
    title: "ACCOUNT & PLATFORM",
    items: [
      { name: "Edit Profile", href: "/dashboard/edit-profile", icon: <FaUserCog className="text-lg" /> },
      { name: "Settings", href: "/dashboard/settings", icon: <IoMdSettings className="text-lg" /> },
    ],
  },
];

// Define role access restrictions (if undefined, accessible by all)
const roleAccess: Record<string, string[]> = {
  "My Reports": ["student"],
  "Exam Reports": ["teacher", "admin"],
  "Manage Exam Pack": ["teacher", "admin"],
  "Question Bank": ["teacher", "admin"],
  "Class Evaluations": ["teacher", "admin"],
  Requests: ["teacher", "admin"],
  Settings: ["admin"],
};

const isItemActive = (currentPath: string, itemHref: string) => {
  if (currentPath === itemHref) return true;
  if (itemHref === "/dashboard") return false;
  if (itemHref.startsWith("/dashboard/question") && currentPath.startsWith("/dashboard/question")) return true;
  return currentPath.startsWith(itemHref + "/");
};

export const Sidebar = ({ role = "student" }: { role?: string }) => {
  const pathname = usePathname();
  const [userRole, setUserRole] = useState<string>(role);
  const [userName, setUserName] = useState<string>("Candidate");

  useEffect(() => {
    const storedRole = localStorage.getItem("userRole") || role;
    const storedName = localStorage.getItem("userName") || "Candidate";
    setUserRole(storedRole);
    setUserName(storedName);
  }, [role]);

  const roleLabel =
    userRole === "admin"
      ? "System Admin"
      : userRole === "teacher"
      ? "Lead Instructor"
      : "Student Candidate";

  return (
    <aside className="hidden lg:flex flex-col w-72 h-screen sticky top-0 bg-white border-r border-slate-200/80 shadow-xs z-30 select-none">
      <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
        <Link href="/" className="inline-block transition-transform hover:scale-[1.02]">
          <Image
            src="/global/logo2.png"
            alt="site logo"
            width={150}
            height={36}
            priority
            className="w-auto h-8"
          />
        </Link>
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-serif font-bold uppercase tracking-wider bg-primary/10 text-primary border border-primary/20">
          BETA
        </span>
      </div>

      <div className="px-4 pt-3 pb-1">
        <div className="px-3.5 py-2 rounded bg-slate-50 border border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 ring-4 ring-emerald-500/20 animate-pulse" />
            <span className="text-xs font-bold text-slate-800">{roleLabel}</span>
          </div>
          <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-white text-slate-500 border border-slate-200 uppercase">
            {userRole}
          </span>
        </div>
      </div>

      <nav className="flex-1 px-3 py-3 space-y-5 overflow-y-auto custom-scrollbar">
        {navGroups.map((group) => {
          const visibleItems = group.items.filter((item) => {
            const allowed = roleAccess[item.name];
            if (!allowed) return true;
            return allowed.includes(userRole);
          });

          if (visibleItems.length === 0) return null;

          return (
            <div key={group.title} className="space-y-1">
              <span className="px-3 text-[10px] font-mono font-bold tracking-wider text-slate-400 uppercase block mb-1">
                {group.title}
              </span>
              <div className="space-y-1">
                {visibleItems.map((item) => {
                  const active = isItemActive(pathname, item.href);
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={cn(
                        "flex items-center gap-3 px-3.5 py-2 rounded font-semibold text-xs transition-all duration-150 group relative",
                        active
                          ? "bg-primary text-white shadow-2xs font-bold"
                          : "text-slate-600 hover:bg-slate-50 hover:text-primary"
                      )}
                    >
                      <span
                        className={cn(
                          "transition-colors",
                          active ? "text-white" : "text-slate-400 group-hover:text-primary"
                        )}
                      >
                        {item.icon}
                      </span>
                      <span className="truncate flex-1">{item.name}</span>
                      {active && (
                        <span className="w-1.5 h-1.5 rounded-full bg-white ml-auto" />
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          );
        })}
      </nav>

      <div className="p-3 border-t border-slate-100 space-y-2 bg-slate-50/50">
        <Link
          href="/dashboard/edit-profile"
          className="flex items-center gap-3 p-2 rounded hover:bg-white transition-colors group border border-transparent hover:border-slate-200/60"
        >
          <div className="w-8 h-8 rounded bg-gradient-to-br from-primary to-amber-500 text-white flex items-center justify-center font-bold text-xs shadow-xs shrink-0">
            {userName.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold text-slate-800 truncate group-hover:text-primary transition-colors">
              {userName}
            </p>
            <p className="text-[10px] text-slate-400 truncate">{roleLabel}</p>
          </div>
        </Link>

        <Link
          href="/auth/login"
          onClick={() => {
            localStorage.clear();
          }}
          className="flex items-center justify-center w-full gap-2 px-3 py-2 text-xs font-bold text-slate-600 bg-white border border-slate-200 rounded hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 transition-all duration-150 shadow-2xs group cursor-pointer"
        >
          <IoMdLogOut className="text-base text-slate-400 group-hover:text-rose-500 transition-colors" />
          <span>Sign Out</span>
        </Link>
      </div>
    </aside>
  );
};

