import React from "react";

export default function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className="rounded bg-white border border-slate-200/80 p-4 space-y-2.5"
          >
            <div className="h-3 w-20 rounded bg-slate-200/70 animate-pulse" />
            <div className="h-6 w-16 rounded bg-slate-200/70 animate-pulse" />
          </div>
        ))}
      </div>
      <div className="h-56 rounded bg-slate-200/70 animate-pulse" />
    </div>
  );
}
