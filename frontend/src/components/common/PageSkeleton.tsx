import React from "react";
import { PageContainer } from "./PageContainer";

export default function PageSkeleton() {
  return (
    <PageContainer className="space-y-5 animate-fadeIn pb-12">
      {/* 1. Header Command Strip Skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded bg-slate-100 border border-slate-200/60 animate-pulse shrink-0" />
          <div className="space-y-1.5">
            <div className="h-6 w-48 sm:w-64 rounded bg-slate-200 animate-pulse" />
            <div className="h-3 w-32 sm:w-44 rounded bg-slate-100 animate-pulse" />
          </div>
        </div>
        <div className="h-7 w-28 rounded bg-slate-100 border border-slate-200/70 animate-pulse" />
      </div>

      {/* 2. Controls Toolbar Skeleton */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="h-9 w-full sm:w-72 rounded bg-white border border-slate-200/80 animate-pulse shadow-2xs" />
        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <div className="h-9 w-36 rounded bg-white border border-slate-200/80 animate-pulse shadow-2xs" />
          <div className="h-9 w-9 rounded bg-white border border-slate-200/80 animate-pulse shadow-2xs" />
        </div>
      </div>

      {/* 3. Cards / Table Grid Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
          <div
            key={i}
            className="rounded bg-white border border-slate-200/80 p-4 shadow-2xs space-y-3"
          >
            <div className="flex items-center justify-between">
              <div className="h-4 w-20 rounded bg-slate-100 animate-pulse" />
              <div className="h-3 w-16 rounded bg-slate-100 animate-pulse" />
            </div>
            <div className="h-5 w-3/4 rounded bg-slate-200 animate-pulse" />
            <div className="grid grid-cols-3 gap-1 p-2 bg-slate-50/70 rounded border border-slate-200/60">
              <div className="h-6 rounded bg-slate-200/60 animate-pulse" />
              <div className="h-6 rounded bg-slate-200/60 animate-pulse" />
              <div className="h-6 rounded bg-slate-200/60 animate-pulse" />
            </div>
            <div className="h-4 w-full rounded bg-slate-100 animate-pulse pt-2 border-t border-slate-100" />
          </div>
        ))}
      </div>
    </PageContainer>
  );
}
