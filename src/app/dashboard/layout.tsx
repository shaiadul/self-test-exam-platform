"use client";

import { ReactNode } from "react";
import { Sidebar } from "@/components/common/Sidebar";
import { DashboardHeader } from "@/components/common/DashboardHeader";
import { MobileNav } from "@/components/common/MobileNav";

export default function DashboardLayout({ children }: { children: ReactNode }) {
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
      <div className="flex-1 flex flex-col min-h-screen print:p-0">
        {/* Header for Desktop/Mobile */}
        <div className="print:hidden">
          <DashboardHeader />
        </div>
        
        <main className="flex-1 overflow-y-auto print:overflow-visible">
          <div className="p-6 max-w-7xl mx-auto print:p-0 print:max-w-none">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
