"use client";

import { ReactNode, useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { Sidebar } from "../../components/common/Sidebar";
import { DashboardHeader } from "../../components/common/DashboardHeader";
import { MobileNav } from "../../components/common/MobileNav";
import { FaLock, FaExclamationTriangle } from "react-icons/fa";

// Helper function to check role authorization per route
function isRouteAllowed(role: string, pathname: string): boolean {
  const normRole = role.toLowerCase();

  if (normRole === "admin") {
    return true; // admin can access all routes
  }

  if (normRole === "teacher") {
    // teacher cannot access admin settings
    if (pathname.startsWith("/dashboard/settings")) return false;
    return true;
  }

  if (normRole === "student") {
    // student cannot access settings, manage-exam-pack, question-bank, and exam reports
    if (pathname.startsWith("/dashboard/settings")) return false;
    if (pathname.startsWith("/dashboard/manage-exam-pack")) return false;
    if (pathname.startsWith("/dashboard/question")) return false;
    if (pathname.startsWith("/dashboard/report")) return false;
    return true;
  }

  return true; // default fallback
}

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [userRole, setUserRole] = useState<string>("student");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Retrieve role from localStorage
    const role = localStorage.getItem("userRole") || "student";
    setUserRole(role);
    setLoading(false);
  }, [pathname]); // refresh auth state on navigate

  const allowed = isRouteAllowed(userRole, pathname);

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-[#fafafa] print:bg-white print:p-0">
      {/* Sidebar for Desktop */}
      <div className="print:hidden">
        <Sidebar />
      </div>

      {/* Mobile Navigation */}
      <div className="print:hidden">
        <MobileNav />
      </div>

      {/* Main content area */}
      <div className="flex-1 flex flex-col min-h-screen print:p-0 relative">
        {/* Header for Desktop/Mobile */}
        <div className="print:hidden">
          <DashboardHeader />
        </div>

        {/* Added pt-20 to offset the fixed DashboardHeader height (h-20) */}
        <main className="flex-1 overflow-y-auto print:overflow-visible pt-20">
          <div className="p-6 max-w-7xl mx-auto print:p-0 print:max-w-none">
            {loading ? (
              <div className="min-h-[50vh] flex items-center justify-center">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#dd6b01]"></div>
              </div>
            ) : allowed ? (
              children
            ) : (
              /* Premium Access Denied Screen */
              <div className="min-h-[70vh] flex items-center justify-center p-4">
                <div className="bg-white border border-gray-100 rounded-3xl p-10 shadow-xl max-w-lg w-full text-center relative overflow-hidden">
                  {/* Decorative background gradients */}
                  <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-red-500 to-orange-500"></div>

                  {/* Lock Indicator */}
                  <div className="w-20 h-20 rounded-full bg-red-50 text-red-500 flex items-center justify-center text-3xl mx-auto mb-6 border border-red-100 shadow-inner relative">
                    <FaLock />
                    <FaExclamationTriangle className="absolute bottom-4 right-4 text-xs text-amber-500" />
                  </div>

                  <h2 className="text-2xl font-black text-gray-900 mb-3 uppercase tracking-wider">
                    Access Restricted
                  </h2>
                  <p className="text-gray-500 text-sm leading-relaxed mb-8">
                    Your account role{" "}
                    <span className="font-bold text-[#dd6b01] uppercase">
                      ({userRole})
                    </span>{" "}
                    is not authorized to access{" "}
                    <span className="font-semibold text-gray-700 bg-gray-50 px-2 py-1 rounded border border-gray-100 text-xs break-all">
                      {pathname}
                    </span>
                    . Please verify your credentials or contact the portal
                    administrator if you believe this is an error.
                  </p>

                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Link
                      href="/dashboard"
                      className="px-6 py-3 bg-[#dd6b01] text-white font-bold rounded-xl shadow-md shadow-orange-500/10 hover:bg-[#c35f00] hover:shadow-lg transition cursor-pointer text-sm"
                    >
                      Return to Dashboard
                    </Link>
                    <Link
                      href="/auth/login"
                      onClick={() => localStorage.clear()}
                      className="px-6 py-3 border border-gray-200 text-gray-600 font-bold rounded-xl hover:bg-gray-50 hover:text-gray-800 transition cursor-pointer text-sm"
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
