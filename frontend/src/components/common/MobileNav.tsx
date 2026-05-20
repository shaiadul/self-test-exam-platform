"use client";

import { useState } from "react";
import Link from "next/link";
import { HiMenuAlt3, HiX } from "react-icons/hi";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { FaHome, FaBoxOpen, FaChartBar, FaUserCog } from "react-icons/fa";
import { IoMdLogOut, IoMdSettings } from "react-icons/io";
import { SiGoogletagmanager } from "react-icons/si";
import { MdQuestionAnswer } from "react-icons/md";
import { TbMessageReportFilled } from "react-icons/tb";
import { motion, AnimatePresence } from "framer-motion";

const menuItems = [
  { name: "Dashboard", href: "/dashboard", icon: <FaHome /> },
  { name: "Exam Pack", href: "/dashboard/exam-pack", icon: <FaBoxOpen /> },
  { name: "Manage Exam Pack", href: "/dashboard/manage-exam-pack", icon: <SiGoogletagmanager /> },
  { name: "Reporting", href: "/dashboard/reporting", icon: <FaChartBar /> },
  { name: "Question Bank", href: "/dashboard/question/add", icon: <MdQuestionAnswer /> },
  { name: "Exam Reports", href: "/dashboard/report", icon: <TbMessageReportFilled /> },
  { name: "Edit Profile", href: "/dashboard/edit-profile", icon: <FaUserCog /> },
  { name: "Settings", href: "/dashboard/settings", icon: <IoMdSettings /> },
];

export const MobileNav = () => {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  return (
    <div className="lg:hidden">
      <div className="flex items-center justify-between px-6 h-16 bg-white border-b border-gray-100 sticky top-0 z-40">
        <Link href="/">
          <Image src="/global/logo2.png" alt="logo" width={120} height={30} className="w-auto h-8" />
        </Link>
        <button 
          onClick={() => setIsOpen(true)}
          className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
        >
          <HiMenuAlt3 className="text-2xl" />
        </button>
      </div>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
            />
            <motion.aside 
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 bottom-0 w-80 bg-white z-[60] shadow-2xl flex flex-col"
            >
              <div className="flex items-center justify-between p-6 border-b border-gray-50">
                <span className="font-bold text-xl text-primary">Menu</span>
                <button 
                  onClick={() => setIsOpen(false)}
                  className="p-2 text-gray-500 hover:bg-gray-50 rounded-full transition-colors"
                >
                  <HiX className="text-2xl" />
                </button>
              </div>

              <nav className="flex-1 overflow-y-auto p-4 space-y-1">
                {menuItems.map((item) => {
                  const active = pathname === item.href;
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={() => setIsOpen(false)}
                      className={`flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all ${
                        active
                          ? "bg-primary text-white shadow-md shadow-primary/20"
                          : "text-gray-600 hover:bg-primary/5 hover:text-primary"
                      }`}
                    >
                      <span className={active ? "text-white" : "text-gray-400"}>{item.icon}</span>
                      <span className="font-medium">{item.name}</span>
                    </Link>
                  );
                })}
              </nav>

              <div className="p-6 border-t border-gray-50">
                <button className="flex items-center justify-center w-full gap-3 px-4 py-3 text-red-600 bg-red-50 rounded-xl font-bold transition-all hover:bg-red-100">
                  <IoMdLogOut className="text-xl" /> Sign Out
                </button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};
