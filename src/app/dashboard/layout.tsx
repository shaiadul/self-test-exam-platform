"use client";

import { ReactNode } from "react";
import { Sidebar } from "@/components/common/Sidebar";
import { DashboardHeader } from "@/components/common/DashboardHeader";
import { MobileNav } from "@/components/common/MobileNav";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-[#fafafa]">
      {/* Sidebar for Desktop */}
      <Sidebar />

      {/* Mobile Navigation */}
      <MobileNav />

      {/* Main content area */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Header for Desktop/Mobile */}
        <DashboardHeader />
        
        <main className="flex-1 overflow-y-auto">
          <div className="p-6 max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
