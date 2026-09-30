"use client";

import React from "react";
import {
  FaClipboardList,
  FaArrowRight,
  FaInfinity,
  FaLock,
  FaBoxOpen,
  FaFileAlt,
} from "react-icons/fa";
import { PrimaryBtn } from "../ui/PrimaryBtn";
import { OutlineBtn } from "../ui/OutlineBtn";

interface ExamQuotaCardProps {
  // Legacy / single quota props
  created?: number;
  limit?: number;

  // Dual quota props
  createdPacks?: number;
  packLimit?: number;
  createdExams?: number;
  examLimit?: number;
}

export default function ExamQuotaCard({
  created,
  limit,
  createdPacks,
  packLimit,
  createdExams,
  examLimit,
}: ExamQuotaCardProps) {
  // Resolve Pack Quota
  const effectivePackLimit = packLimit !== undefined ? packLimit : limit;
  const effectiveCreatedPacks =
    createdPacks !== undefined
      ? createdPacks
      : created !== undefined
      ? created
      : 0;

  const packLoaded =
    typeof effectivePackLimit === "number" && !Number.isNaN(effectivePackLimit);
  const normalizedPackLimit =
    packLoaded && effectivePackLimit < 0 ? -1 : packLoaded ? effectivePackLimit : -2;
  const packUnlimited = normalizedPackLimit === -1;
  const packReached =
    !packUnlimited && packLoaded && effectiveCreatedPacks >= normalizedPackLimit;
  const packRemaining = packUnlimited
    ? Infinity
    : packLoaded
    ? Math.max(normalizedPackLimit - effectiveCreatedPacks, 0)
    : 0;
  const packPct = packUnlimited
    ? 100
    : packLoaded && normalizedPackLimit > 0
    ? Math.min(100, (effectiveCreatedPacks / normalizedPackLimit) * 100)
    : 0;

  // Resolve Exam Quota
  const hasExamQuota = examLimit !== undefined;
  const examLoaded =
    typeof examLimit === "number" && !Number.isNaN(examLimit);
  const normalizedExamLimit =
    examLoaded && examLimit < 0 ? -1 : examLoaded ? examLimit : -2;
  const examUnlimited = normalizedExamLimit === -1;
  const examCount =
    typeof createdExams === "number" && !Number.isNaN(createdExams)
      ? createdExams
      : 0;
  const examReached =
    !examUnlimited && examLoaded && examCount >= normalizedExamLimit;
  const examRemaining = examUnlimited
    ? Infinity
    : examLoaded
    ? Math.max(normalizedExamLimit - examCount, 0)
    : 0;
  const examPct = examUnlimited
    ? 100
    : examLoaded && normalizedExamLimit > 0
    ? Math.min(100, (examCount / normalizedExamLimit) * 100)
    : 0;

  return (
    <div className="relative overflow-hidden rounded bg-white border border-slate-200/80 p-4 sm:p-5 shadow-2xs hover:shadow-xs transition-shadow">
      {/* Background Grid Pattern Watermark */}
      <svg
        className="absolute -right-8 -bottom-8 w-44 h-44 text-slate-700 opacity-[0.03] pointer-events-none"
        viewBox="0 0 120 120"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle cx="60" cy="60" r="50" stroke="currentColor" strokeWidth="1" strokeDasharray="2 4" />
        <circle cx="60" cy="60" r="38" stroke="currentColor" strokeWidth="1.5" />
        <circle cx="60" cy="60" r="22" stroke="currentColor" strokeWidth="1" strokeDasharray="3 3" />
        <path d="M10 60 H110 M60 10 V110" stroke="currentColor" strokeWidth="0.75" />
        <path d="M25 60 L40 45 L55 75 L70 50 L85 65 L95 60" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>

      <div className="relative z-10 space-y-4">
        {/* Header Strip */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3.5">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded flex items-center justify-center text-base shrink-0 bg-blue-50 text-blue-600 border border-blue-200/60 shadow-2xs">
              <FaClipboardList />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-slate-900 tracking-tight">
                  Teacher Resource Quotas
                </h3>
                <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 border border-slate-200">
                  SYSTEM ALLOCATED
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                Admin-controlled limits on how many syllabus packages and total exams you can deploy.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <OutlineBtn
              link="/dashboard/requests"
              className="!text-xs !py-1.5 !px-2.5 !rounded shadow-2xs"
            >
              <span>Request Increase</span>
              <FaArrowRight className="ml-1 text-[9px]" />
            </OutlineBtn>
            <PrimaryBtn
              link="/dashboard/manage-exam-pack/add"
              className="!text-xs !py-1.5 !px-3 !rounded shadow-2xs"
            >
              <span>Create Exam Pack</span>
              <FaArrowRight className="ml-1 text-[9px]" />
            </PrimaryBtn>
          </div>
        </div>

        {/* Dual Quota Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {/* 1. Exam Pack Quota */}
          <div
            className={`p-3.5 rounded border transition-colors ${
              packReached
                ? "bg-rose-50/40 border-rose-200"
                : "bg-slate-50/60 border-slate-200/70"
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                <FaBoxOpen className="text-blue-600" />
                <span>Exam Packs Quota</span>
              </div>
              {!packLoaded ? (
                <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded bg-slate-100 text-slate-500 border border-slate-200">
                  SYNCING…
                </span>
              ) : packReached ? (
                <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded bg-rose-50 text-rose-600 border border-rose-200 flex items-center gap-1">
                  <FaLock className="text-[8px]" /> LIMIT REACHED
                </span>
              ) : packUnlimited ? (
                <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                  UNLIMITED
                </span>
              ) : (
                <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded bg-blue-50 text-blue-700 border border-blue-200">
                  {packRemaining} LEFT
                </span>
              )}
            </div>

            <div className="flex items-end justify-between gap-2 mb-2">
              <div className="font-mono">
                <span className={`text-2xl font-black tabular-nums ${packReached ? "text-rose-600" : "text-slate-900"}`}>
                  {packLoaded ? effectiveCreatedPacks : "—"}
                </span>
                <span className="text-slate-400 font-bold mx-1">/</span>
                <span className="text-base font-bold text-slate-600">
                  {packUnlimited ? <FaInfinity className="inline -translate-y-0.5 text-emerald-600" /> : packLoaded ? normalizedPackLimit : "—"}
                </span>
                <span className="text-xs text-slate-500 font-sans ml-1.5">packs created</span>
              </div>
            </div>

            <div className="w-full h-1.5 bg-slate-200/80 rounded overflow-hidden">
              {packUnlimited ? (
                <div className="h-full w-full bg-emerald-400 rounded" />
              ) : (
                <div
                  className={`h-full rounded transition-all ${
                    packReached
                      ? "bg-rose-500"
                      : packPct >= 80
                      ? "bg-amber-400"
                      : "bg-blue-600"
                  }`}
                  style={{ width: `${packPct}%` }}
                />
              )}
            </div>
          </div>

          {/* 2. Exam Creation Quota */}
          <div
            className={`p-3.5 rounded border transition-colors ${
              examReached
                ? "bg-rose-50/40 border-rose-200"
                : "bg-slate-50/60 border-slate-200/70"
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                <FaFileAlt className="text-violet-600" />
                <span>Total Exams Quota</span>
              </div>
              {!hasExamQuota && !examLoaded ? (
                <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded bg-slate-100 text-slate-500 border border-slate-200">
                  SYNCING…
                </span>
              ) : examReached ? (
                <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded bg-rose-50 text-rose-600 border border-rose-200 flex items-center gap-1">
                  <FaLock className="text-[8px]" /> LIMIT REACHED
                </span>
              ) : examUnlimited ? (
                <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                  UNLIMITED
                </span>
              ) : (
                <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded bg-violet-50 text-violet-700 border border-violet-200">
                  {examRemaining} LEFT
                </span>
              )}
            </div>

            <div className="flex items-end justify-between gap-2 mb-2">
              <div className="font-mono">
                <span className={`text-2xl font-black tabular-nums ${examReached ? "text-rose-600" : "text-slate-900"}`}>
                  {examLoaded ? examCount : "—"}
                </span>
                <span className="text-slate-400 font-bold mx-1">/</span>
                <span className="text-base font-bold text-slate-600">
                  {examUnlimited ? <FaInfinity className="inline -translate-y-0.5 text-emerald-600" /> : examLoaded ? normalizedExamLimit : "—"}
                </span>
                <span className="text-xs text-slate-500 font-sans ml-1.5">exams created</span>
              </div>
            </div>

            <div className="w-full h-1.5 bg-slate-200/80 rounded overflow-hidden">
              {examUnlimited ? (
                <div className="h-full w-full bg-emerald-400 rounded" />
              ) : (
                <div
                  className={`h-full rounded transition-all ${
                    examReached
                      ? "bg-rose-500"
                      : examPct >= 80
                      ? "bg-amber-400"
                      : "bg-violet-600"
                  }`}
                  style={{ width: `${examPct}%` }}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
