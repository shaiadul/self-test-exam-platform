"use client";

import { useState } from "react";
import Link from "next/link";
import { HiMenuAlt3, HiX } from "react-icons/hi";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { FaHome, FaBoxOpen, FaChartBar, FaUserCog, FaClipboardList, FaPoll, FaBars } from "react-icons/fa";
import { IoMdLogOut, IoMdSettings } from "react-icons/io";
import { SiGoogletagmanager } from "react-icons/si";
import { MdQuestionAnswer } from "react-icons/md";
import { TbMessageReportFilled } from "react-icons/tb";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "../../lib/utils";
import { logoutAction } from "../../lib/actions";

const menuItems = [
  { name: "Dashboard", href: "/dashboard", icon: <FaHome className="text-lg" /> },
  { name: "Exam Pack", href: "/dashboard/exam-pack", icon: <FaBoxOpen className="text-lg" /> },
  { name: "Manage Exam Pack", href: "/dashboard/manage-exam-pack", icon: <SiGoogletagmanager className="text-lg" /> },
  { name: "My Reports", href: "/dashboard/reporting", icon: <FaChartBar className="text-lg" /> },
  { name: "Exam Reports", href: "/dashboard/teacher-reports", icon: <FaPoll className="text-lg" /> },
  { name: "Question Bank", href: "/dashboard/question/add", icon: <MdQuestionAnswer className="text-lg" /> },
  { name: "Requests", href: "/dashboard/requests", icon: <FaClipboardList className="text-lg" /> },
  { name: "Class Evaluations", href: "/dashboard/report", icon: <TbMessageReportFilled className="text-lg" /> },
  { name: "Edit Profile", href: "/dashboard/edit-profile", icon: <FaUserCog className="text-lg" /> },
  { name: "Settings", href: "/dashboard/settings", icon: <IoMdSettings className="text-lg" /> },
];

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

import { useUser } from "../../context/UserContext";

export const MobileNav = ({ role = "student" }: { role?: string }) => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, clearUser } = useUser();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  const userRole = user?.role?.toLowerCase() || role?.toLowerCase() || "student";
  const userName = user?.name || "Candidate";

  const handleLogout = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (isLoggingOut) return;
    setIsLoggingOut(true);
    setIsOpen(false);
    try {
      await logoutAction();
    } catch {
      // Proceed even if network request fails
    } finally {
      clearUser();
      router.push("/auth/login");
    }
  };

  const visibleMenuItems = menuItems.filter((item) => {
    const allowed = roleAccess[item.name];
    if (!allowed) return true;
    return allowed.includes(userRole);
  });

  const reportsLink = userRole === "student" ? "/dashboard/reporting" : "/dashboard/teacher-reports";

  return (
    <div className="lg:hidden select-none">
      {/* Top Mobile Bar */}
      <div className="flex items-center justify-between px-4 h-16 bg-white border-b border-slate-200/80 sticky top-0 z-40">
        <Link href="/">
          <Image src="/global/logo2.png" alt="logo" width={110} height={28} className="w-auto h-7" />
        </Link>
        <div className="flex items-center gap-2">
          <span className="px-2 py-0.5 rounded-md bg-primary/10 text-primary text-[10px] font-extrabold uppercase tracking-wider">
            {userRole}
          </span>
          <button 
            onClick={() => setIsOpen(true)}
            className="p-2 text-slate-700 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            aria-label="Open mobile navigation"
          >
            <HiMenuAlt3 className="text-2xl" />
          </button>
        </div>
      </div>

      {/* Slide-over Menu Drawer */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50"
            />
            <motion.aside 
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 26, stiffness: 240 }}
              className="fixed right-0 top-0 bottom-0 w-80 max-w-[85vw] bg-white z-[60] shadow-2xl flex flex-col"
            >
              <div className="flex items-center justify-between p-4 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-amber-500 text-white flex items-center justify-center font-bold text-xs">
                    {userName.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <span className="font-bold text-sm text-slate-900 block leading-tight">{userName}</span>
                    <span className="text-[10px] text-slate-400 capitalize font-medium">{userRole} Portal</span>
                  </div>
                </div>
                <button 
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                  aria-label="Close menu"
                >
                  <HiX className="text-xl" />
                </button>
              </div>

              <nav className="flex-1 overflow-y-auto p-3 space-y-1 custom-scrollbar">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 px-3 py-1 block">
                  Platform Navigation
                </span>
                {visibleMenuItems.map((item) => {
                  const active = isItemActive(pathname, item.href);
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={() => setIsOpen(false)}
                      className={cn(
                        "flex items-center gap-3.5 px-3.5 py-2.5 rounded text-xs font-semibold transition-all",
                        active
                          ? "bg-primary text-white shadow-2xs font-bold"
                          : "text-slate-600 hover:bg-slate-50 hover:text-primary"
                      )}
                    >
                      <span className={active ? "text-white" : "text-slate-400"}>{item.icon}</span>
                      <span className="flex-1">{item.name}</span>
                      {active && <span className="w-1.5 h-1.5 rounded-full bg-white ml-auto" />}
                    </Link>
                  );
                })}
              </nav>

              <div className="p-4 border-t border-slate-100 bg-slate-50">
                <form onSubmit={handleLogout} className="w-full">
                  <button
                    type="submit"
                    disabled={isLoggingOut}
                    className="flex items-center justify-center w-full gap-2 px-4 py-2.5 text-xs text-rose-600 bg-rose-50 border border-rose-200 rounded-xl font-bold transition-all hover:bg-rose-100 cursor-pointer disabled:opacity-50"
                  >
                    <IoMdLogOut className="text-base" />
                    <span>{isLoggingOut ? "Signing Out..." : "Sign Out"}</span>
                  </button>
                </form>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Mobile Bottom Navigation Bar (1-Thumb Access) */}
      <nav className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/80 px-2 pt-1.5 pb-[calc(0.375rem+env(safe-area-inset-bottom,0px))] flex items-center justify-around shadow-lg">
        <Link
          href="/dashboard"
          className={cn(
            "flex flex-col items-center gap-0.5 px-3 py-1 rounded text-[10px] font-bold transition-colors",
            isItemActive(pathname, "/dashboard") ? "text-primary" : "text-slate-500 hover:text-slate-800"
          )}
        >
          <FaHome className="text-base" />
          <span>Home</span>
        </Link>
        <Link
          href="/dashboard/exam-pack"
          className={cn(
            "flex flex-col items-center gap-0.5 px-3 py-1 rounded text-[10px] font-bold transition-colors",
            isItemActive(pathname, "/dashboard/exam-pack") ? "text-primary" : "text-slate-500 hover:text-slate-800"
          )}
        >
          <FaBoxOpen className="text-base" />
          <span>Exams</span>
        </Link>
        <Link
          href={reportsLink}
          className={cn(
            "flex flex-col items-center gap-0.5 px-3 py-1 rounded text-[10px] font-bold transition-colors",
            isItemActive(pathname, reportsLink) ? "text-primary" : "text-slate-500 hover:text-slate-800"
          )}
        >
          <FaChartBar className="text-base" />
          <span>Reports</span>
        </Link>
        <button
          onClick={() => setIsOpen(true)}
          className="flex flex-col items-center gap-0.5 px-3 py-1 rounded text-[10px] font-bold text-slate-500 hover:text-slate-800 cursor-pointer"
        >
          <FaBars className="text-base" />
          <span>Menu</span>
        </button>
      </nav>
    </div>
  );
};

