"use client";

import React, { useState } from "react";
import { toast } from "sonner";
import {
  FaArrowLeft,
  FaBroom,
  FaSyncAlt,
  FaTrashAlt,
  FaExclamationTriangle,
  FaClock,
  FaInfoCircle,
  FaDatabase,
  FaShieldAlt,
  FaCheck,
} from "react-icons/fa";
import { PageContainer } from "../../../../components/common/PageContainer";
import { OutlineBtn } from "../../../../components/ui/OutlineBtn";
import {
  ToolsOverview,
  clearBackendCacheAction,
  clearRequestApprovalDataAction,
  getToolsOverviewAction,
} from "../../../../lib/actions/tools";

interface ToolsClientViewProps {
  initialOverview: ToolsOverview | null;
}

export default function ToolsClientView({
  initialOverview,
}: ToolsClientViewProps) {
  const [overview, setOverview] = useState<ToolsOverview | null>(
    initialOverview,
  );
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Cache rule state
  const [clearingCache, setClearingCache] = useState(false);
  const [showCacheConfirm, setShowCacheConfirm] = useState(false);
  const [lastCacheCleared, setLastCacheCleared] = useState<string | null>(null);

  // Request approval rule state
  const [selectedTarget, setSelectedTarget] = useState<
    "quota" | "all" | "institution"
  >("quota");
  const [selectedScope, setSelectedScope] = useState<
    "all" | "resolved" | "pending"
  >("all");
  const [clearingRequests, setClearingRequests] = useState(false);
  const [showRequestConfirm, setShowRequestConfirm] = useState(false);
  const [lastRequestsPurged, setLastRequestsPurged] = useState<{
    count: number;
    target: string;
    timestamp: string;
  } | null>(null);

  // Refresh diagnostics from server
  async function refreshData() {
    setIsRefreshing(true);
    try {
      const fresh = await getToolsOverviewAction();
      if (fresh) {
        setOverview(fresh);
        toast.success("Maintenance diagnostics updated.");
      } else {
        toast.error("Failed to refresh diagnostics.");
      }
    } catch {
      toast.error("Error refreshing system diagnostics.");
    } finally {
      setIsRefreshing(false);
    }
  }

  // 1-Click Clear Backend Cache handler
  async function handleClearCache() {
    setShowCacheConfirm(false);
    setClearingCache(true);
    try {
      const res = await clearBackendCacheAction();
      if (res.success) {
        const timeStr = new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        });
        setLastCacheCleared(timeStr);
        toast.success(res.message || "Backend cache cleared successfully!");
        // Refresh overview
        const fresh = await getToolsOverviewAction();
        if (fresh) setOverview(fresh);
      } else {
        toast.error(res.error || "Failed to clear backend cache.");
      }
    } catch {
      toast.error("Unexpected error clearing backend cache.");
    } finally {
      setClearingCache(false);
    }
  }

  // 1-Click Clear Request Approval Data handler
  async function handleClearRequests() {
    setShowRequestConfirm(false);
    setClearingRequests(true);
    try {
      const res = await clearRequestApprovalDataAction({
        target: selectedTarget,
        scope: selectedScope,
      });

      if (res.success && res.result) {
        const timeStr = new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        });
        setLastRequestsPurged({
          count: res.result.totalDeleted,
          target: selectedTarget,
          timestamp: timeStr,
        });
        toast.success(
          res.result.message ||
            `Removed ${res.result.totalDeleted} request approval record(s) successfully.`,
        );

        // Refresh overview
        const fresh = await getToolsOverviewAction();
        if (fresh) setOverview(fresh);
      } else {
        toast.error(res.error || "Failed to clear request approval data.");
      }
    } catch {
      toast.error("Unexpected error clearing request approval data.");
    } finally {
      setClearingRequests(false);
    }
  }

  // Helper to calculate target count preview
  function calculatePreviewCount(): number {
    if (!overview) return 0;
    const { categories, totalRequests, totalPending, totalResolved } =
      overview.requests;

    if (selectedTarget === "all") {
      if (selectedScope === "pending") return totalPending;
      if (selectedScope === "resolved") return totalResolved;
      return totalRequests;
    }

    const cat = categories.find((c) => c.key === selectedTarget);
    if (!cat) return 0;

    if (selectedScope === "pending") return cat.pending;
    if (selectedScope === "resolved") return cat.approved + cat.rejected;
    return cat.total;
  }

  const quotaCat = overview?.requests.categories.find((c) => c.key === "quota");
  const instCat = overview?.requests.categories.find(
    (c) => c.key === "institution",
  );
  const previewCount = calculatePreviewCount();

  return (
    <PageContainer className="space-y-6 animate-fadeIn pb-24 sm:pb-8">
      {/* Top Header Command Strip */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200/80 pb-4">
        <div className="flex items-center gap-3">
          <OutlineBtn
            link="/dashboard/settings"
            className="!p-2 !rounded !text-slate-600 hover:!text-primary shadow-2xs border-slate-200"
            title="Back to Settings Hub"
          >
            <FaArrowLeft className="text-xs" />
          </OutlineBtn>
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200 font-bold uppercase tracking-wider">
                Admin Maintenance Console
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Developer Tools &amp; Maintenance
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={refreshData}
            disabled={isRefreshing}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-white text-slate-700 border border-slate-200 text-xs font-semibold hover:border-slate-300 hover:bg-slate-50 transition shadow-2xs disabled:opacity-50 cursor-pointer"
          >
            <FaSyncAlt
              className={`text-[11px] ${isRefreshing ? "animate-spin" : ""}`}
            />
            <span>{isRefreshing ? "Refreshing..." : "Refresh Status"}</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white border border-slate-200/90 rounded shadow-2xs flex flex-col justify-between overflow-hidden">
          {/* Card Header */}
          <div className="p-5 sm:p-6 border-b border-slate-100 bg-linear-to-b from-slate-50/50 to-white">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded bg-cyan-50 border border-cyan-200/70 text-cyan-600 flex items-center justify-center text-lg shadow-2xs shrink-0">
                  <FaDatabase />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono font-bold uppercase px-1.5 py-0.5 rounded bg-cyan-100 text-cyan-800">
                      Rule 01
                    </span>
                    <span className="text-xs font-medium text-slate-500">
                      In-Memory Store
                    </span>
                  </div>
                  <h2 className="text-base sm:text-lg font-bold text-slate-900 mt-0.5">
                    Clear Backend Cache
                  </h2>
                </div>
              </div>

              {overview?.cache.connected ? (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Active
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-100 text-slate-600 border border-slate-200 text-xs font-semibold">
                  Passthrough
                </span>
              )}
            </div>

            <p className="text-xs text-slate-600 mt-3 leading-relaxed">
              Flush Redis cache keys across the backend application. Forces the
              next request to re-fetch clean, up-to-date data directly from
              PostgreSQL.
            </p>
          </div>

          <div className="p-5 sm:p-6 space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-slate-50 border border-slate-200/80 rounded">
                <span className="text-slate-400 block font-medium">
                  Cache Engine
                </span>
                <span className="font-bold text-slate-800 text-sm mt-0.5 block">
                  {overview?.cache.provider || "Redis"}
                </span>
              </div>
              <div className="p-3 bg-slate-50 border border-slate-200/80 rounded">
                <span className="text-slate-400 block font-medium">
                  Engine Status
                </span>
                <span className="font-bold text-slate-800 text-sm mt-0.5 block truncate">
                  {overview?.cache.status || "Ready"}
                </span>
              </div>
            </div>

            <div>
              <span className="text-slate-500 font-semibold block mb-2">
                Cached Subsystems Affected:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {[
                  "User Sessions",
                  "Exam Packs",
                  "Exams & Questions",
                  "Analytics & Telemetry",
                  "Rate Limiter Counters",
                  "OTP Throttling",
                ].map((item) => (
                  <span
                    key={item}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200 text-[11px] font-medium"
                  >
                    <FaCheck className="text-[9px] text-cyan-600" />
                    {item}
                  </span>
                ))}
              </div>
            </div>

            <div className="p-3 bg-cyan-50/60 border border-cyan-200/60 rounded text-cyan-900 flex items-start gap-2.5">
              <FaInfoCircle className="text-cyan-600 shrink-0 text-sm mt-0.5" />
              <p className="leading-relaxed text-[11px]">
                Clearing cache is non-destructive to user accounts and exams. It
                instantly purges stale memory values so updates are reflected
                platform-wide immediately.
              </p>
            </div>

            {lastCacheCleared && (
              <div className="flex items-center gap-1.5 text-slate-500 text-[11px]">
                <FaClock className="text-slate-400" />
                <span>Last cleared at: </span>
                <strong className="text-slate-700">{lastCacheCleared}</strong>
              </div>
            )}
          </div>

          <div className="p-5 sm:p-6 bg-slate-50/70 border-t border-slate-200/80 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <span className="text-xs text-slate-500 font-medium">
              Immediate Redis Flush
            </span>
            <button
              id="btn-clear-cache"
              onClick={() => setShowCacheConfirm(true)}
              disabled={clearingCache}
              className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded bg-cyan-600 hover:bg-cyan-700 active:bg-cyan-800 text-white text-xs font-bold transition shadow-xs disabled:opacity-50 cursor-pointer"
            >
              <FaBroom className={clearingCache ? "animate-spin" : ""} />
              <span>
                {clearingCache
                  ? "Flushing Cache..."
                  : "Clear Backend Cache Now"}
              </span>
            </button>
          </div>
        </div>

        <div className="bg-white border border-slate-200/90 rounded shadow-2xs flex flex-col justify-between overflow-hidden">
          <div className="p-5 sm:p-6 border-b border-slate-100 bg-linear-to-b from-slate-50/50 to-white">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded bg-rose-50 border border-rose-200/70 text-rose-600 flex items-center justify-center text-lg shadow-2xs shrink-0">
                  <FaTrashAlt />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono font-bold uppercase px-1.5 py-0.5 rounded bg-rose-100 text-rose-800">
                      Rule 02
                    </span>
                    <span className="text-xs font-medium text-slate-500">
                      Database Purge
                    </span>
                  </div>
                  <h2 className="text-base sm:text-lg font-bold text-slate-900 mt-0.5">
                    Remove Request Approval Data
                  </h2>
                </div>
              </div>

              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-rose-50 text-rose-700 border border-rose-200 text-xs font-semibold">
                {overview?.requests.totalRequests || 0} Total Requests
              </span>
            </div>

            <p className="text-xs text-slate-600 mt-3 leading-relaxed">
              Purge request approval records such as teacher quota requests
              (packs &amp; exam limits). Engineered with a modular architecture
              so future request approval types can be cleared via one click.
            </p>
          </div>

          <div className="p-5 sm:p-6 space-y-4 text-xs">
            <div>
              <label className="text-slate-700 font-bold block mb-1.5">
                Target Request Approval Category:
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedTarget("quota")}
                  className={`p-2.5 rounded text-left border transition cursor-pointer ${
                    selectedTarget === "quota"
                      ? "border-rose-500 bg-rose-50/40 text-slate-900 ring-1 ring-rose-500/20"
                      : "border-slate-200 bg-white hover:bg-slate-50 text-slate-700"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-xs">Quota Requests</span>
                    <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-slate-100 text-slate-700">
                      {quotaCat?.total || 0}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 line-clamp-1">
                    Pack &amp; limit requests
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedTarget("all")}
                  className={`p-2.5 rounded text-left border transition cursor-pointer ${
                    selectedTarget === "all"
                      ? "border-rose-500 bg-rose-50/40 text-slate-900 ring-1 ring-rose-500/20"
                      : "border-slate-200 bg-white hover:bg-slate-50 text-slate-700"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-xs">All Categories</span>
                    <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-slate-100 text-slate-700">
                      {overview?.requests.totalRequests || 0}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 line-clamp-1">
                    Purge all request types
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedTarget("institution")}
                  className={`p-2.5 rounded text-left border transition cursor-pointer ${
                    selectedTarget === "institution"
                      ? "border-rose-500 bg-rose-50/40 text-slate-900 ring-1 ring-rose-500/20"
                      : "border-slate-200 bg-white hover:bg-slate-50 text-slate-700"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-xs">Institutions</span>
                    <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-slate-100 text-slate-700">
                      {instCat?.total || 0}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 line-clamp-1">
                    Name suggestions
                  </p>
                </button>
              </div>
            </div>

            <div>
              <label className="text-slate-700 font-bold block mb-1.5">
                Removal Scope:
              </label>
              <div className="flex flex-wrap gap-2">
                {[
                  { id: "all", label: "All Records (Total Purge)" },
                  {
                    id: "resolved",
                    label: "Handled Only (Approved & Rejected)",
                  },
                  { id: "pending", label: "Pending Only" },
                ].map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setSelectedScope(s.id as any)}
                    className={`px-3 py-1.5 rounded text-xs font-semibold border transition cursor-pointer ${
                      selectedScope === s.id
                        ? "bg-slate-900 text-white border-slate-900 shadow-2xs"
                        : "bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200/70"
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 pt-1">
              <div className="p-2.5 bg-slate-50 border border-slate-200/80 rounded">
                <span className="text-slate-400 block text-[10px] font-bold uppercase">
                  Pending
                </span>
                <span className="font-bold text-amber-600 text-sm mt-0.5 block">
                  {selectedTarget === "quota"
                    ? quotaCat?.pending || 0
                    : selectedTarget === "institution"
                      ? instCat?.pending || 0
                      : overview?.requests.totalPending || 0}
                </span>
              </div>
              <div className="p-2.5 bg-slate-50 border border-slate-200/80 rounded">
                <span className="text-slate-400 block text-[10px] font-bold uppercase">
                  Approved
                </span>
                <span className="font-bold text-emerald-600 text-sm mt-0.5 block">
                  {selectedTarget === "quota"
                    ? quotaCat?.approved || 0
                    : selectedTarget === "institution"
                      ? instCat?.approved || 0
                      : (quotaCat?.approved || 0) + (instCat?.approved || 0)}
                </span>
              </div>
              <div className="p-2.5 bg-slate-50 border border-slate-200/80 rounded">
                <span className="text-slate-400 block text-[10px] font-bold uppercase">
                  Rejected
                </span>
                <span className="font-bold text-rose-600 text-sm mt-0.5 block">
                  {selectedTarget === "quota"
                    ? quotaCat?.rejected || 0
                    : selectedTarget === "institution"
                      ? instCat?.rejected || 0
                      : (quotaCat?.rejected || 0) + (instCat?.rejected || 0)}
                </span>
              </div>
            </div>

            {lastRequestsPurged && (
              <div className="flex items-center gap-1.5 text-slate-500 text-[11px]">
                <FaClock className="text-slate-400" />
                <span>Last purge: </span>
                <strong className="text-slate-700">
                  {lastRequestsPurged.count} records removed at{" "}
                  {lastRequestsPurged.timestamp}
                </strong>
              </div>
            )}
          </div>

          <div className="p-5 sm:p-6 bg-slate-50/70 border-t border-slate-200/80 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="text-xs text-slate-600">
              <span>Impact: </span>
              <strong className="text-rose-600 font-bold">
                {previewCount}
              </strong>
              <span className="text-slate-500">
                {" "}
                record(s) queued for deletion
              </span>
            </div>

            <button
              id="btn-clear-requests"
              onClick={() => setShowRequestConfirm(true)}
              disabled={clearingRequests || previewCount === 0}
              className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white text-xs font-bold transition shadow-xs disabled:opacity-50 cursor-pointer"
            >
              <FaTrashAlt className={clearingRequests ? "animate-spin" : ""} />
              <span>
                {clearingRequests
                  ? "Purging Records..."
                  : `Purge ${selectedTarget === "quota" ? "Quota Requests" : "Approval Data"} Now`}
              </span>
            </button>
          </div>
        </div>
      </div>

      <div className="bg-slate-900 text-slate-200 border border-slate-800 rounded p-5 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded bg-slate-800 border border-slate-700 text-amber-400 flex items-center justify-center text-base shrink-0 mt-0.5">
            <FaShieldAlt />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">
              Extensible Request Purge Architecture
            </h3>
            <p className="text-xs text-slate-400 mt-0.5 leading-relaxed max-w-2xl">
              The request removal engine is built on a category registry. When
              additional approval workflows (such as teacher verifications, exam
              publish approvals, or refund requests) are integrated into the
              platform, they automatically appear here for administrative
              one-click clearance.
            </p>
          </div>
        </div>

        <span className="text-[11px] font-mono font-semibold px-2.5 py-1 rounded bg-slate-800 text-slate-300 border border-slate-700 shrink-0">
          Future-Proof Ready
        </span>
      </div>

      {showCacheConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded border border-slate-200 shadow-xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded bg-cyan-50 text-cyan-600 border border-cyan-200 flex items-center justify-center text-lg shrink-0">
                <FaBroom />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Confirm Backend Cache Clear
                </h3>
                <p className="text-xs text-slate-500">
                  Flush all in-memory Redis cache
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Are you sure you want to flush the backend cache? This will
              invalidate all cached exam packs, user summaries, dashboard
              analytics, and rate-limiting counters. The next queries will hit
              the database directly.
            </p>

            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowCacheConfirm(false)}
                className="px-3.5 py-2 rounded text-xs font-semibold text-slate-600 hover:bg-slate-100 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleClearCache}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded bg-cyan-600 hover:bg-cyan-700 text-white text-xs font-bold transition shadow-2xs cursor-pointer"
              >
                <FaCheck />
                <span>Confirm &amp; Flush Now</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {showRequestConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded border border-slate-200 shadow-xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded bg-rose-50 text-rose-600 border border-rose-200 flex items-center justify-center text-lg shrink-0">
                <FaExclamationTriangle />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Confirm Request Data Purge
                </h3>
                <p className="text-xs text-slate-500">
                  Permanent database deletion
                </p>
              </div>
            </div>

            <div className="p-3 bg-rose-50/70 border border-rose-200 rounded text-rose-900 text-xs space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-600">Category:</span>
                <strong className="uppercase font-bold text-rose-700">
                  {selectedTarget}
                </strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Scope:</span>
                <strong className="capitalize font-bold text-rose-700">
                  {selectedScope}
                </strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Records to Delete:</span>
                <strong className="font-bold text-rose-700">
                  {previewCount} items
                </strong>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              This action permanently deletes the selected request approval rows
              from the database. This cannot be undone. Do you wish to continue?
            </p>

            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowRequestConfirm(false)}
                className="px-3.5 py-2 rounded text-xs font-semibold text-slate-600 hover:bg-slate-100 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleClearRequests}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition shadow-2xs cursor-pointer"
              >
                <FaTrashAlt />
                <span>Confirm &amp; Delete Records</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </PageContainer>
  );
}
