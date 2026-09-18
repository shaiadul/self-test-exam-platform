"use client";

import React from "react";
import {
  FaClipboardList,
  FaArrowRight,
  FaInfinity,
  FaLock,
} from "react-icons/fa";
import { PrimaryBtn } from "../ui/PrimaryBtn";
import { OutlineBtn } from "../ui/OutlineBtn";

interface ExamQuotaCardProps {
  created?: number;
  limit?: number;
}

export default function ExamQuotaCard({ created, limit }: ExamQuotaCardProps) {
  const loaded = typeof limit === "number" && !Number.isNaN(limit);
  const createdCount =
    typeof created === "number" && !Number.isNaN(created) ? created : 0;
  const normalizedLimit = loaded && limit < 0 ? -1 : loaded ? limit : -2;

  const unlimited = normalizedLimit === -1;
  const reached = !unlimited && loaded && createdCount >= normalizedLimit;
  const remaining = unlimited
    ? Infinity
    : loaded
      ? Math.max(normalizedLimit - createdCount, 0)
      : 0;
  const pct = unlimited
    ? 100
    : loaded && normalizedLimit > 0
      ? Math.min(100, (createdCount / normalizedLimit) * 100)
      : 0;

  const barColor = reached
    ? "bg-rose-500"
    : pct >= 80
      ? "bg-amber-400"
      : "bg-emerald-500";

  const message = !loaded
    ? "Quota data is unavailable. If this persists, please ensure the server is running the latest build."
    : unlimited
      ? "No restriction — you have unlimited exam pack access."
      : reached
        ? `You have created ${createdCount} of ${normalizedLimit} allowed exam packs. Submit a request to increase your limit.`
        : `You have created ${createdCount} of ${normalizedLimit} allowed exam packs with ${remaining} slot${remaining === 1 ? "" : "s"} remaining.`;

  return (
    <div
      className={`relative overflow-hidden rounded bg-white border p-3.5 sm:p-4 shadow-2xs hover:shadow-xs transition-shadow ${
        !loaded
          ? "border-slate-200/80"
          : reached
            ? "border-rose-200"
            : "border-slate-200/80"
      }`}
    >
      {/* Background Tech Waveform Grid Watermark */}
      <svg
        className="absolute -right-8 -bottom-8 w-44 h-44 text-slate-700 opacity-[0.03] pointer-events-none"
        viewBox="0 0 120 120"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle
          cx="60"
          cy="60"
          r="50"
          stroke="currentColor"
          strokeWidth="1"
          strokeDasharray="2 4"
        />
        <circle
          cx="60"
          cy="60"
          r="38"
          stroke="currentColor"
          strokeWidth="1.5"
        />
        <circle
          cx="60"
          cy="60"
          r="22"
          stroke="currentColor"
          strokeWidth="1"
          strokeDasharray="3 3"
        />
        <path
          d="M10 60 H110 M60 10 V110"
          stroke="currentColor"
          strokeWidth="0.75"
        />
        <path
          d="M25 60 L40 45 L55 75 L70 50 L85 65 L95 60"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>

      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-start gap-3">
          <div
            className={`w-9 h-9 rounded flex items-center justify-center text-base shrink-0 ${
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
              <h3 className="text-xs sm:text-sm font-bold text-slate-900 tracking-tight">
                Exam Pack Quota
              </h3>
              {!loaded ? (
                <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded bg-slate-100 text-slate-500 border border-slate-200">
                  SYNCING…
                </span>
              ) : reached ? (
                <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded bg-rose-50 text-rose-600 border border-rose-200">
                  LIMIT REACHED
                </span>
              ) : unlimited ? (
                <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                  UNLIMITED
                </span>
              ) : (
                <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded bg-blue-50 text-blue-700 border border-blue-200">
                  {remaining} PACK{remaining === 1 ? "" : "S"} LEFT
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-500 font-medium mt-0.5 max-w-lg">
              The platform admin configures how many exam packs you can create.
              Each pack allows up to 6 exams by default.
            </p>
          </div>
        </div>

        <div className="flex items-end gap-1.5 shrink-0">
          <span
            className={`text-3xl font-mono font-black tracking-tight tabular-nums ${
              reached ? "text-rose-600" : "text-slate-900"
            }`}
          >
            {loaded ? createdCount : "\u2014"}
          </span>
          <span className="text-lg font-black text-slate-300 pb-0.5">/</span>
          <span
            className={`text-xl font-mono font-black pb-0.5 tabular-nums ${
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

      <div className="mt-3.5 space-y-2.5">
        <div className="w-full h-1.5 bg-slate-100 rounded overflow-hidden">
          {!loaded ? (
            <div className="h-full w-1/2 bg-slate-200 rounded animate-pulse" />
          ) : unlimited ? (
            <div className="h-full w-full bg-emerald-400 rounded" />
          ) : (
            <div
              className={`h-full rounded transition-all ${barColor}`}
              style={{ width: `${pct}%` }}
            />
          )}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2.5">
          <p
            className={`text-[11px] font-medium flex items-center gap-1.5 ${
              reached ? "text-rose-600 font-bold" : "text-slate-500"
            }`}
          >
            {reached && <FaLock className="shrink-0 text-[10px]" />}
            {message}
          </p>
          <div className="grid grid-cols-2 gap-1.5 w-full sm:flex sm:w-auto sm:items-center sm:shrink-0">
            <OutlineBtn
              link="/dashboard/manage-exam-pack"
              className="!text-xs !py-1 !px-2.5 !rounded !w-full !justify-center sm:!w-auto"
            >
              <span>Manage Packs</span>
            </OutlineBtn>

            <OutlineBtn
              link="/dashboard/requests"
              className="!text-xs !py-1 !px-2.5 !rounded !w-full !justify-center sm:!w-auto"
            >
              <span>Request Increase</span>
              <FaArrowRight className="ml-1 text-[9px]" />
            </OutlineBtn>

            <PrimaryBtn
              link="/dashboard/manage-exam-pack/add"
              className="!text-xs !py-1 !px-3 !rounded col-span-2 !w-full !justify-center sm:!w-auto"
            >
              <span>Create Exam Pack</span>
              <FaArrowRight className="ml-1 text-[9px]" />
            </PrimaryBtn>
          </div>
        </div>
      </div>
    </div>
  );
}
