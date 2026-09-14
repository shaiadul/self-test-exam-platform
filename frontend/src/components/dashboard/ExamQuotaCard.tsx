"use client";

import React from "react";
import Link from "next/link";
import { FaClipboardList, FaArrowRight, FaInfinity, FaLock } from "react-icons/fa";

interface ExamQuotaCardProps {
  created?: number;
  limit?: number;
}

export default function ExamQuotaCard({ created, limit }: ExamQuotaCardProps) {
  const loaded = typeof limit === "number" && !Number.isNaN(limit);
  const createdCount = typeof created === "number" && !Number.isNaN(created) ? created : 0;
  const normalizedLimit = loaded && limit < 0 ? -1 : loaded ? limit : -2;

  const unlimited = normalizedLimit === -1;
  const reached = !unlimited && loaded && createdCount >= normalizedLimit;
  const remaining = unlimited ? Infinity : loaded ? Math.max(normalizedLimit - createdCount, 0) : 0;
  const pct = unlimited ? 100 : loaded && normalizedLimit > 0 ? Math.min(100, (createdCount / normalizedLimit) * 100) : 0;

  const barColor = reached ? "bg-rose-500" : pct >= 80 ? "bg-amber-400" : "bg-emerald-500";

  const message = !loaded
    ? "Quota data is unavailable. If this persists, please ensure the server is running the latest build."
    : unlimited
    ? "No restriction — you have unlimited exam creation access."
    : reached
    ? `You have created ${createdCount} of ${normalizedLimit} allowed exams. Contact an admin to increase your limit.`
    : `You have created ${createdCount} of ${normalizedLimit} allowed exams with ${remaining} slot${remaining === 1 ? "" : "s"} remaining.`;

  return (
    <div
      className={`rounded-3xl bg-white border p-6 shadow-sm hover:shadow-md transition-shadow ${
        !loaded
          ? "border-slate-200/80"
          : reached
          ? "border-rose-200"
          : "border-slate-200/80"
      }`}
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div className="flex items-start gap-4">
          <div
            className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl shrink-0 ${
              !loaded
                ? "bg-slate-50 text-slate-400"
                : reached
                ? "bg-rose-50 text-rose-600"
                : "bg-blue-50 text-blue-600"
            }`}
          >
            <FaClipboardList />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-base font-black text-slate-900 tracking-tight">
                Exam Creation Quota
              </h3>
              {!loaded ? (
                <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-500 border border-slate-200">
                  SYNCING…
                </span>
              ) : reached ? (
                <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-600 border border-rose-200">
                  LIMIT REACHED
                </span>
              ) : unlimited ? (
                <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  UNLIMITED
                </span>
              ) : (
                <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                  {remaining} SLOT{remaining === 1 ? "" : "S"} LEFT
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 font-medium mt-1 max-w-lg">
              The platform admin configures how many exams you can publish across
              your exam packs. This quota is enforced automatically.
            </p>
          </div>
        </div>

        <div className="flex items-end gap-2 shrink-0">
          <span
            className={`text-4xl font-black tracking-tight tabular-nums ${
              reached ? "text-rose-600" : "text-slate-900"
            }`}
          >
            {loaded ? createdCount : "\u2014"}
          </span>
          <span className="text-xl font-black text-slate-300 pb-1">/</span>
          <span
            className={`text-2xl font-black pb-1 tabular-nums ${
              unlimited ? "text-emerald-600" : "text-slate-700"
            }`}
          >
            {unlimited ? (
              <FaInfinity className="inline -translate-y-0.5" />
            ) : loaded ? (
              normalizedLimit
            ) : (
              "\u2014"
            )}
          </span>
        </div>
      </div>

      <div className="mt-5 space-y-3">
        <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
          {!loaded ? (
            <div className="h-full w-1/2 bg-slate-200 rounded-full animate-pulse" />
          ) : unlimited ? (
            <div className="h-full w-full bg-emerald-400 rounded-full" />
          ) : (
            <div
              className={`h-full rounded-full transition-all ${barColor}`}
              style={{ width: `${pct}%` }}
            />
          )}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <p
            className={`text-xs font-semibold flex items-center gap-1.5 ${
              reached ? "text-rose-600" : "text-slate-500"
            }`}
          >
            {reached && <FaLock className="shrink-0" />}
            {message}
          </p>
          <div className="flex items-center gap-2 shrink-0">
            <Link
              href="/dashboard/manage-exam-pack/add"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 border border-blue-100 px-3 py-2 rounded-xl transition-colors"
            >
              <span>Create Exam Pack</span>
              <FaArrowRight className="text-[10px]" />
            </Link>
            <Link
              href="/dashboard/manage-exam-pack"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 bg-slate-50 hover:bg-slate-100 border border-slate-200 px-3 py-2 rounded-xl transition-colors"
            >
              <span>Manage Packs</span>
              <FaArrowRight className="text-[10px]" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
