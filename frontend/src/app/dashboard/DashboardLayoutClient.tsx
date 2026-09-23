"use client";

import { ReactNode, useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { Sidebar } from "../../components/common/Sidebar";
import { DashboardHeader } from "../../components/common/DashboardHeader";
import { MobileNav } from "../../components/common/MobileNav";
import { FaLock, FaExclamationTriangle } from "react-icons/fa";

function isRouteAllowed(role: string, pathname: string): boolean {
  const normRole = role.toLowerCase();

  if (normRole === "admin") {
    return true;
  }

  if (normRole === "teacher") {
    if (pathname.startsWith("/dashboard/settings")) return false;
    return true;
  }

  if (normRole === "student") {
    if (pathname.startsWith("/dashboard/settings")) return false;
    if (pathname.startsWith("/dashboard/manage-exam-pack")) return false;
    if (pathname.startsWith("/dashboard/teacher-reports")) return false;
    if (pathname.startsWith("/dashboard/question")) return false;
    if (pathname.startsWith("/dashboard/report") && !pathname.startsWith("/dashboard/reporting")) return false;
    return true;
  }

  return true;
}

import { useUser } from "../../context/UserContext";

export default function DashboardLayoutClient({
  children,
  initialRole = "student",
}: {
  children: ReactNode;
  initialRole?: string;
}) {
  const pathname = usePathname();
  const { user, clearUser } = useUser();
  const userRole = user?.role?.toLowerCase() || initialRole.toLowerCase();

  const allowed = isRouteAllowed(userRole, pathname);
  const isExamPage = pathname.includes("/dashboard/exam-pack/exam-pack-details/");

  return (
    <div className={`min-h-screen flex flex-col bg-slate-50/50 print:bg-white print:p-0 ${!isExamPage ? "lg:flex-row" : ""}`}>
      {!isExamPage && (
        <div className="print:hidden">
          <Sidebar role={userRole} />
        </div>
      )}

      {!isExamPage && (
        <div className="print:hidden">
          <MobileNav role={userRole} />
        </div>
      )}

      <div className="flex-1 flex flex-col min-h-screen print:p-0 relative w-full overflow-x-hidden">
        {!isExamPage && (
          <div className="print:hidden">
            <DashboardHeader />
          </div>
        )}

        <main className={`flex-1 overflow-y-auto print:overflow-visible ${!isExamPage ? "pt-0 lg:pt-16" : "pt-0"} pb-20 sm:pb-0`}>
          <div className={isExamPage ? "w-full p-0 max-w-none print:p-0" : "p-3.5 sm:p-5 max-w-7xl mx-auto print:p-0 print:max-w-none"}>
            {allowed ? (
              children
            ) : (
              <div className="min-h-[70vh] flex items-center justify-center p-4">
                <div className="bg-white border border-slate-200/80 rounded p-8 shadow-xl max-w-lg w-full text-center relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-rose-500 to-amber-500"></div>

                  <div className="w-20 h-20 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center text-3xl mx-auto mb-6 border border-rose-100 shadow-inner relative">
                    <FaLock />
                    <FaExclamationTriangle className="absolute bottom-4 right-4 text-xs text-amber-500" />
                  </div>

                  <h2 className="text-2xl font-black text-slate-900 mb-3 uppercase tracking-wider">
                    Access Restricted
                  </h2>
                  <p className="text-slate-500 text-sm leading-relaxed mb-8">
                    Your account role{" "}
                    <span className="font-bold text-primary uppercase">
                      ({userRole})
                    </span>{" "}
                    is not authorized to access{" "}
                    <span className="font-semibold text-slate-700 bg-slate-50 px-2 py-1 rounded border border-slate-100 text-xs break-all">
                      {pathname}
                    </span>
                    . Please verify your credentials or contact the portal
                    administrator if you believe this is an error.
                  </p>

                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Link
                      href="/dashboard"
                      className="px-6 py-3 bg-primary text-white font-bold rounded shadow-md hover:bg-primary-hover hover:shadow-lg transition cursor-pointer text-sm"
                    >
                      Return to Dashboard
                    </Link>
                    <Link
                      href="/auth/login"
                      onClick={() => clearUser()}
                      className="px-6 py-3 border border-slate-200 text-slate-600 font-bold rounded hover:bg-slate-50 hover:text-slate-800 transition cursor-pointer text-sm"
                    >
                      Log in to Another Account
                    </Link>
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
