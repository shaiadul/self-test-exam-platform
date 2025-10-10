"use client";

import { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { FaHome, FaBoxOpen, FaChartBar, FaUserCog } from "react-icons/fa";
import Image from "next/image";
import { IoMdLogOut } from "react-icons/io";
import { SiGoogletagmanager } from "react-icons/si";

const menuItems = [
  { name: "Dashboard", href: "/dashboard", icon: <FaHome /> },
  { name: "Exam Pack", href: "/dashboard/exam-pack", icon: <FaBoxOpen /> },
  {
    name: "Manage Exam Pack",
    href: "/dashboard/manage-exam-pack",
    icon: <SiGoogletagmanager />,
  },
  { name: "Reporting", href: "/dashboard/reporting", icon: <FaChartBar /> },
  {
    name: "Edit Profile",
    href: "/dashboard/edit-profile",
    icon: <FaUserCog />,
  },
];

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <aside className="w-64 bg-[#f6f6f6] shadow-md flex flex-col">
        <div>
          <Link href="/">
            <Image
              src="/global/logo2.png"
              alt="site logo"
              width={500}
              height={38}
              priority
            />
          </Link>
        </div>
        <nav className="flex-1 px-4 space-y-2">
          {menuItems.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-2 rounded-lg transition ${
                  active
                    ? "bg-[#dd6b01] text-white"
                    : "text-gray-700 hover:bg-orange-100"
                }`}
              >
                {item.icon}
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>
        <div className="p-4">
          <button className="flex items-center mx-auto gap-2 text-xl text-gray-700 hover:text-[#dd6b01] duration-500 cursor-pointer">
            <IoMdLogOut className="text-2xl text-[#dd6b01]" /> Sign Out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-6">{children}</main>
    </div>
  );
}
