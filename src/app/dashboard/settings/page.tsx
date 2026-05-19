"use client";

import { FaUsers, FaUserShield, FaMoneyBillWave, FaChartLine, FaCogs, FaTools } from "react-icons/fa";
import Link from "next/link";
import { PageContainer } from "@/components/common/PageContainer";

const settingsModules = [
  {
    title: "User Management",
    description: "Create, edit & manage users and roles",
    icon: FaUsers,
    color: "bg-orange-100 text-orange-600",
    href: "/dashboard/settings/user-management",
  },
  {
    title: "Permission Management",
    description: "Manage permissions & access levels",
    icon: FaUserShield,
    color: "bg-red-100 text-red-600",
    href: "/dashboard/settings/permission-management",
  },
  {
    title: "Financial Report",
    description: "Organizer income & finance overview",
    icon: FaMoneyBillWave,
    color: "bg-green-100 text-green-600",
    href: "/dashboard/settings/financial-report",
  },
  {
    title: "Exam Analysis",
    description: "Exam, student, pack, teacher reports",
    icon: FaChartLine,
    color: "bg-blue-100 text-blue-600",
    href: "/dashboard/settings/exam-analysis",
  },
  {
    title: "Assets Setup",
    description: "Level, board, batch & other setups",
    icon: FaCogs,
    color: "bg-purple-100 text-purple-600",
    href: "/dashboard/settings/assets-setup",
  },
  {
    title: "Tools",
    description: "Future tools & utilities (coming soon)",
    icon: FaTools,
    color: "bg-gray-100 text-gray-600",
    href: "/dashboard/settings/tools",
  },
];

export default function SettingsPage() {
  return (
    <PageContainer className="space-y-8">
      <h1 className="text-3xl font-bold text-[#dd6b01]">Settings</h1>
      <p className="text-gray-500">
        Configure your system modules, permissions, finances and assets.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
        {settingsModules.map((module) => {
          const Icon = module.icon;
          return (
            <Link
              key={module.title}
              href={module.href}
              className="flex flex-col items-center justify-center p-6 bg-white cursor-pointer"
            >
              <div
                className={`w-16 h-16 flex items-center justify-center rounded-full mb-4 ${module.color}`}
              >
                <Icon className="text-2xl" />
              </div>
              <h3 className="text-lg font-semibold text-gray-700 text-center">
                {module.title}
              </h3>
              <p className="text-gray-400 text-center mt-1 text-sm">
                {module.description}
              </p>
            </Link>
          );
        })}
      </div>
    </PageContainer>
  );
}
