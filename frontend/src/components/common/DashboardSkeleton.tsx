import React from "react";

interface DashboardSkeletonProps {
  showHero?: boolean;
}

export default function DashboardSkeleton({ showHero = true }: DashboardSkeletonProps = {}) {
  return (
    <div className="space-y-4 sm:space-y-5 animate-fadeIn">
      {/* 1. Hero / Welcome Banner Skeleton (Black Part - Dashboard Only) */}
      {showHero && (
        <div className="relative overflow-hidden rounded bg-slate-900 border border-slate-800 p-4 sm:p-6 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-2.5 max-w-xl">
              <div className="flex items-center gap-2">
                <div className="h-5 w-28 rounded bg-slate-800 animate-pulse" />
                <div className="h-4 w-36 rounded bg-slate-800/60 animate-pulse hidden sm:block" />
              </div>
              <div className="h-7 w-60 sm:w-80 rounded bg-slate-800 animate-pulse" />
              <div className="h-3.5 w-full max-w-md rounded bg-slate-800/60 animate-pulse" />
            </div>

            <div className="flex items-center gap-2.5 shrink-0 pt-2 md:pt-0">
              <div className="h-8 w-28 rounded bg-slate-800 animate-pulse" />
              <div className="h-8 w-24 rounded bg-slate-800/70 animate-pulse" />
            </div>
          </div>
        </div>
      )}

      {/* 2. Top Profile & Highlight Summary Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-stretch">
        {/* User Card Skeleton */}
        <div className="lg:col-span-2 rounded bg-white border border-slate-200/80 p-4 sm:p-5 shadow-2xs">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-slate-200/80 animate-pulse shrink-0" />
            <div className="space-y-2 flex-1 min-w-0 w-full">
              <div className="flex items-center gap-2">
                <div className="h-5 w-36 rounded bg-slate-200/80 animate-pulse" />
                <div className="h-4 w-20 rounded bg-slate-100 animate-pulse" />
              </div>
              <div className="h-3.5 w-48 rounded bg-slate-200/60 animate-pulse" />
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                {[0, 1, 2, 3].map((i) => (
                  <div key={i} className="h-8 rounded bg-slate-50 border border-slate-100 animate-pulse" />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Highlight / Metric Card Skeleton */}
        <div className="rounded bg-white border border-slate-200/80 p-4 sm:p-5 shadow-2xs flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            <div className="h-4 w-24 rounded bg-slate-200/80 animate-pulse" />
            <div className="h-9 w-28 rounded bg-slate-200/80 animate-pulse" />
            <div className="h-3.5 w-full rounded bg-slate-200/60 animate-pulse" />
          </div>
          <div className="h-9 w-full rounded bg-slate-100 border border-slate-200/60 animate-pulse" />
        </div>
      </div>

      {/* 3. Performance & KPI Analytics Section */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 items-stretch">
        {/* Chart Card Skeleton */}
        <div className="xl:col-span-2 rounded bg-white border border-slate-200/80 p-4 sm:p-5 shadow-2xs flex flex-col justify-between space-y-4 min-h-[280px]">
          <div className="flex items-center justify-between">
            <div className="space-y-1.5">
              <div className="h-5 w-44 rounded bg-slate-200/80 animate-pulse" />
              <div className="h-3.5 w-56 rounded bg-slate-200/60 animate-pulse" />
            </div>
            <div className="h-6 w-24 rounded bg-slate-100 border border-slate-200/60 animate-pulse" />
          </div>
          {/* Simulated chart bars / wave */}
          <div className="h-44 w-full rounded bg-slate-50 border border-slate-100 flex items-end justify-around p-4 gap-2">
            {[45, 65, 30, 80, 55, 90, 70].map((h, idx) => (
              <div
                key={idx}
                className="w-full max-w-[40px] rounded-t bg-slate-200/70 animate-pulse"
                style={{ height: `${h}%` }}
              />
            ))}
          </div>
        </div>

        {/* 4-Card Stats Grid Skeleton */}
        <div className="grid grid-cols-2 gap-3 h-full">
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className="rounded bg-white border border-slate-200/80 p-4 space-y-2.5 flex flex-col justify-between shadow-2xs"
            >
              <div className="flex items-center justify-between">
                <div className="h-3.5 w-20 rounded bg-slate-200/70 animate-pulse" />
                <div className="w-6 h-6 rounded bg-slate-100 animate-pulse" />
              </div>
              <div className="h-7 w-16 rounded bg-slate-200/80 animate-pulse" />
              <div className="h-3 w-12 rounded bg-slate-100 animate-pulse" />
            </div>
          ))}
        </div>
      </div>

      {/* 4. Recent Activity & Schedules Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-start">
        {/* Recent Attempts Table Skeleton */}
        <div className="lg:col-span-2 rounded bg-white border border-slate-200/80 p-4 sm:p-5 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <div className="h-5 w-36 rounded bg-slate-200/80 animate-pulse" />
              <div className="h-3.5 w-52 rounded bg-slate-200/60 animate-pulse" />
            </div>
            <div className="h-4 w-20 rounded bg-slate-200/60 animate-pulse" />
          </div>

          {/* Desktop Table Skeleton */}
          <div className="hidden sm:block overflow-hidden rounded border border-slate-200/70">
            <div className="bg-slate-50 p-3 flex items-center justify-between border-b border-slate-200/70">
              <div className="h-3 w-16 rounded bg-slate-200 animate-pulse" />
              <div className="h-3 w-32 rounded bg-slate-200 animate-pulse" />
              <div className="h-3 w-16 rounded bg-slate-200 animate-pulse" />
              <div className="h-3 w-20 rounded bg-slate-200 animate-pulse" />
            </div>
            <div className="divide-y divide-slate-100">
              {[0, 1, 2, 3, 4].map((i) => (
                <div key={i} className="p-3.5 flex items-center justify-between">
                  <div className="h-4 w-12 rounded bg-slate-200/70 animate-pulse" />
                  <div className="h-4 w-44 rounded bg-slate-200/70 animate-pulse" />
                  <div className="h-4 w-16 rounded bg-slate-200/70 animate-pulse" />
                  <div className="h-5 w-20 rounded bg-slate-100 animate-pulse" />
                </div>
              ))}
            </div>
          </div>

          {/* Mobile Cards Skeleton */}
          <div className="block sm:hidden divide-y divide-slate-100 border border-slate-200/70 rounded">
            {[0, 1, 2].map((i) => (
              <div key={i} className="p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="h-3.5 w-24 rounded bg-slate-200/70 animate-pulse" />
                  <div className="h-4 w-14 rounded bg-slate-100 animate-pulse" />
                </div>
                <div className="h-4 w-40 rounded bg-slate-200/80 animate-pulse" />
                <div className="flex items-center justify-between pt-1">
                  <div className="h-3.5 w-16 rounded bg-slate-200/60 animate-pulse" />
                  <div className="h-3.5 w-20 rounded bg-slate-200/60 animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming / Tasks Sidebar Skeleton */}
        <div className="rounded bg-white border border-slate-200/80 p-4 sm:p-5 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="h-4 w-28 rounded bg-slate-200/80 animate-pulse" />
            <div className="h-4 w-14 rounded bg-slate-100 animate-pulse" />
          </div>
          <div className="space-y-2.5">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="p-3 rounded bg-slate-50 border border-slate-100 flex items-center gap-3"
              >
                <div className="w-10 h-10 rounded bg-slate-200/80 animate-pulse shrink-0" />
                <div className="space-y-1.5 flex-1 min-w-0">
                  <div className="h-3.5 w-28 rounded bg-slate-200/80 animate-pulse" />
                  <div className="h-3 w-20 rounded bg-slate-200/60 animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
