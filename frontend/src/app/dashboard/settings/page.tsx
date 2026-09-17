"use client";

import {
  FaUsers,
  FaUserShield,
  FaMoneyBillWave,
  FaChartLine,
  FaCogs,
  FaTools,
  FaSlidersH,
  FaArrowRight,
} from "react-icons/fa";
import Link from "next/link";
import { PageContainer } from "../../../components/common/PageContainer";

const settingsModules = [
  {
    code: "MOD-USR",
    title: "User & Role Management",
    description: "Create, edit, assign permissions, and control teacher exam creation quotas.",
    icon: FaUsers,
    href: "/dashboard/settings/user-management",
  },
  {
    code: "MOD-PRM",
    title: "Permission Matrix",
    description: "Configure granular access privileges across student, teacher, and admin roles.",
    icon: FaUserShield,
    href: "/dashboard/settings/permission-management",
  },
  {
    code: "MOD-FIN",
    title: "Financial Ledger",
    description: "Inspect organization balances, track exam pack sales, and record expenditures.",
    icon: FaMoneyBillWave,
    href: "/dashboard/settings/financial-report",
  },
  {
    code: "MOD-ANL",
    title: "Exam & System Analytics",
    description: "Aggregate system health, total student engagements, and question pack telemetry.",
    icon: FaChartLine,
    href: "/dashboard/settings/exam-analysis",
  },
  {
    code: "MOD-AST",
    title: "Curriculum Assets Setup",
    description: "Manage academic levels, education boards, batches, and categorical taxonomies.",
    icon: FaCogs,
    href: "/dashboard/settings/assets-setup",
  },
  {
    code: "MOD-TLS",
    title: "Developer Tools & Utilities",
    description: "Internal administrative utilities, maintenance tools, and system diagnostics.",
    icon: FaTools,
    href: "/dashboard/settings/tools",
  },
];

export default function SettingsPage() {
  return (
    <PageContainer className="space-y-6 animate-fadeIn pb-12">
      {/* Top Header Command Strip */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded bg-blue-50 text-blue-600 flex items-center justify-center text-base border border-blue-200/60 shadow-2xs">
            <FaSlidersH />
          </div>
          <div>
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
              SYSTEM // CORE_CONFIGURATION_MATRIX
            </span>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Administration &amp; System Settings
            </h1>
          </div>
        </div>

        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-100 text-slate-600 border border-slate-200 text-xs font-mono font-bold">
          {settingsModules.length} MODULES READY
        </span>
      </div>

      {/* Modules Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {settingsModules.map((module) => {
          const Icon = module.icon;
          return (
            <Link
              key={module.code}
              href={module.href}
              className="group relative overflow-hidden rounded border border-slate-200/80 bg-white p-5 shadow-2xs hover:border-primary/50 hover:shadow-xs transition flex flex-col justify-between gap-4"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="w-9 h-9 rounded flex items-center justify-center text-base border border-slate-200/60 bg-slate-50 text-slate-700 group-hover:bg-primary/10 group-hover:text-primary group-hover:border-primary/30 transition shadow-2xs">
                    <Icon />
                  </div>
                  <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 border border-slate-200">
                    [{module.code}]
                  </span>
                </div>

                <h3 className="text-sm font-bold text-slate-900 group-hover:text-primary transition-colors">
                  {module.title}
                </h3>
                <p className="text-xs text-slate-500 font-medium mt-1 leading-relaxed">
                  {module.description}
                </p>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-[11px] font-mono font-bold text-slate-400 group-hover:text-primary transition">
                <span>MANAGE_MODULE</span>
                <FaArrowRight className="text-[10px] group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          );
        })}
      </div>
    </PageContainer>
  );
}
