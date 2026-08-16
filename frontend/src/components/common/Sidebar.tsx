"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { IoMdLogOut, IoMdSettings } from "react-icons/io";
import { FaHome, FaBoxOpen, FaChartBar, FaUserCog } from "react-icons/fa";
import { SiGoogletagmanager } from "react-icons/si";
import { MdQuestionAnswer } from "react-icons/md";
import { TbMessageReportFilled } from "react-icons/tb";
import { MenuItem } from "../../lib/types";

const menuItems: MenuItem[] = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: <FaHome className="text-xl" />,
  },
  {
    name: "Exam Pack",
    href: "/dashboard/exam-pack",
    icon: <FaBoxOpen className="text-xl" />,
  },
  {
    name: "Manage Exam Pack",
    href: "/dashboard/manage-exam-pack",
    icon: <SiGoogletagmanager className="text-xl" />,
  },
  {
    name: "Reporting",
    href: "/dashboard/reporting",
    icon: <FaChartBar className="text-xl" />,
  },
  {
    name: "Question Bank",
    href: "/dashboard/question/add",
    icon: <MdQuestionAnswer className="text-xl" />,
  },
  {
    name: "Exam Reports",
    href: "/dashboard/report",
    icon: <TbMessageReportFilled className="text-xl" />,
  },
  {
    name: "Edit Profile",
    href: "/dashboard/edit-profile",
    icon: <FaUserCog className="text-xl" />,
  },
  {
    name: "Settings",
    href: "/dashboard/settings",
    icon: <IoMdSettings className="text-xl" />,
  },
];

// Define role access restrictions (if undefined, accessible by all)
const roleAccess: Record<string, string[]> = {
  "Manage Exam Pack": ["teacher", "admin"],
  "Question Bank": ["teacher", "admin"],
  "Exam Reports": ["teacher", "admin"],
  Settings: ["admin"],
};

export const Sidebar = () => {
  const pathname = usePathname();
  const [userRole, setUserRole] = useState<string>("student");

  useEffect(() => {
    // Read local storage inside client-side effect
    const role = localStorage.getItem("userRole") || "student";
    setUserRole(role);
  }, []);

  const visibleMenuItems = menuItems.filter((item) => {
    const allowed = roleAccess[item.name];
    if (!allowed) return true;
    return allowed.includes(userRole);
  });

  return (
    <aside className="hidden lg:flex flex-col w-72 h-screen sticky top-0 bg-[#f8f9fa] border-r border-gray-200 shadow-sm z-30">
      <div className="px-6">
        <Link href="/">
          <Image
            src="/global/logo2.png"
            alt="site logo"
            width={180}
            height={40}
            priority
            className="w-auto"
          />
        </Link>
      </div>

      <nav className="flex-1 px-4 py-4 space-y-1.5 overflow-y-auto custom-scrollbar">
        {visibleMenuItems.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3.5 px-4 py-3 rounded-xl font-medium transition-all duration-200 group ${
                active
                  ? "bg-primary text-white shadow-lg shadow-primary/20"
                  : "text-gray-600 hover:bg-primary/10 hover:text-primary"
              }`}
            >
              <span
                className={`${active ? "text-white" : "text-gray-500 group-hover:text-primary"} transition-colors`}
              >
                {item.icon}
              </span>
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-6 border-t border-gray-100">
        <Link
          href="/auth/login"
          onClick={() => {
            localStorage.clear();
          }}
          className="flex items-center justify-center w-full gap-3 px-4 py-3 text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-red-50 hover:text-red-600 hover:border-red-100 transition-all duration-300 group shadow-sm font-semibold"
        >
          <IoMdLogOut className="text-2xl text-gray-400 group-hover:text-red-500 transition-colors" />
          <span>Sign Out</span>
        </Link>
      </div>
    </aside>
  );
};
