"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  FaClipboardList,
  FaPlus,
  FaCheck,
  FaTimes,
  FaBoxOpen,
  FaLayerGroup,
} from "react-icons/fa";
import { Input } from "../../../components/ui/Input";
import CustomSelect from "../../../components/ui/CustomSelect";
import { PrimaryBtn } from "../../../components/ui/PrimaryBtn";
import { PageContainer } from "../../../components/common/PageContainer";
import EmptyState from "../../../components/common/EmptyState";
import {
  createRequestAction,
  reviewRequestAction,
} from "../../../lib/actions/requests";

interface RequestsClientViewProps {
  profile: any;
  initialRequests: any[];
  packs: any[];
}

const statusStyles: Record<string, string> = {
  pending: "bg-amber-50 text-amber-700 border-amber-200",
  approved: "bg-emerald-50 text-emerald-700 border-emerald-200",
  rejected: "bg-rose-50 text-rose-700 border-rose-200",
};

const TYPE_OPTIONS = ["More exam packs", "Higher exam limit for a pack"];

export default function RequestsClientView({
  profile,
  initialRequests,
  packs,
}: RequestsClientViewProps) {
  const router = useRouter();
  const role = (profile?.role || "student").toLowerCase();
  const isAdmin = role === "admin";
  const isTeacher = role === "teacher";

  const [requests, setRequests] = useState<any[]>(initialRequests || []);
  const [typeLabel, setTypeLabel] = useState<string>(TYPE_OPTIONS[0]);
  const [packLabel, setPackLabel] = useState<string>(
    packs && packs.length > 0 ? `${packs[0].title} (#${packs[0].id})` : "",
  );
  const [requestedLimit, setRequestedLimit] = useState<number>(3);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [message, setMessage] = useState<{
    type: "ok" | "err";
    text: string;
  } | null>(null);
  const [busy, setBusy] = useState(false);

  const type: "pack" | "limit" =
    typeLabel === TYPE_OPTIONS[0] ? "pack" : "limit";

  const packOptions = (packs || []).map((p) => `${p.title} (#${p.id})`);
  const selectedPack = (packs || []).find(
    (p) => `${p.title} (#${p.id})` === packLabel,
  );

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (!title.trim()) {
      setMessage({ type: "err", text: "Please add a short title." });
      return;
    }
    if (type === "limit" && !selectedPack) {
      setMessage({ type: "err", text: "Please choose an exam pack." });
      return;
    }

    setBusy(true);
    const res = await createRequestAction({
      type,
      packId: type === "limit" ? selectedPack?.id : undefined,
      title: title.trim(),
      description: description.trim(),
      requestedLimit: Number(requestedLimit) || 0,
    });
    setBusy(false);

    if (res.success) {
      setMessage({ type: "ok", text: "Request submitted for admin review." });
      setTitle("");
      setDescription("");
      router.refresh();
    } else {
      setMessage({
        type: "err",
        text: res.error || "Failed to submit request.",
      });
    }
  };

  const review = async (id: number, status: "approved" | "rejected") => {
    setBusy(true);
    const res = await reviewRequestAction(id, status);
    setBusy(false);
    if (res.success) {
      setRequests((prev) =>
        prev.map((r) => (r.id === id ? { ...r, status } : r)),
      );
      router.refresh();
    } else {
      setMessage({
        type: "err",
        text: res.error || "Failed to review request.",
      });
    }
  };

  return (
    <PageContainer className="space-y-6 animate-fadeIn pb-20 sm:pb-6">
      {/* Top Header Command Strip */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded bg-blue-50 text-blue-600 flex items-center justify-center text-base border border-blue-200/60 shadow-2xs">
            <FaClipboardList />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              {isAdmin
                ? "Request Approvals & Quotas"
                : "Exam Pack & Quota Requests"}
            </h1>
          </div>
        </div>

        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-100 text-slate-600 border border-slate-200 text-xs font-bold">
          {requests.filter((r) => r.status === "pending").length} Pending Review
        </span>
      </div>

      {message && (
        <div
          className={`rounded px-4 py-2.5 text-xs font-mono font-bold border ${
            message.type === "ok"
              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
              : "bg-rose-50 text-rose-700 border-rose-200"
          }`}
        >
          {message.text}
        </div>
      )}

      {isTeacher && (
        <form
          onSubmit={submit}
          className="rounded bg-white border border-slate-200/80 p-5 sm:p-6 shadow-2xs space-y-4"
        >
          <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h2 className="text-xs sm:text-sm font-bold text-slate-900">
                Submit New Quota Request
              </h2>
            </div>
            <span className="text-[10px] font-mono text-slate-400">
              ROUTED TO ADMIN
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-700 ml-0.5 block mb-1">
                Request Type
              </label>
              <CustomSelect
                options={TYPE_OPTIONS}
                value={typeLabel}
                onChange={(val) => {
                  setTypeLabel(val);
                  setRequestedLimit(val === TYPE_OPTIONS[0] ? 3 : 6);
                }}
              />
            </div>

            {type === "limit" && (
              <div>
                <label className="text-xs font-bold text-slate-700 ml-0.5 block mb-1">
                  Target Exam Pack
                </label>
                <CustomSelect
                  placeholder="Select a pack"
                  options={packOptions}
                  value={packLabel}
                  onChange={setPackLabel}
                />
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Request Title / Identifier"
              placeholder={
                type === "pack"
                  ? "Need 2 more exam packs for HSC batch"
                  : "Increase Physics pack limit to 10"
              }
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
            <Input
              label="Requested Quota / Limit"
              type="number"
              min={1}
              value={requestedLimit}
              onChange={(e) => setRequestedLimit(Number(e.target.value))}
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 ml-0.5 block">
              Reason / Justification Details
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="State the academic requirements or batch expansion reasons..."
              className="w-full border border-slate-200 rounded px-3.5 py-2.5 text-xs text-slate-800 placeholder:text-slate-400 outline-none bg-white font-medium transition-all duration-150 focus:border-primary focus:ring-1 focus:ring-primary/20"
            />
          </div>

          <div className="flex justify-end pt-2">
            <PrimaryBtn
              type="submit"
              disabled={busy}
              className="!text-xs !py-2 !px-5 !rounded disabled:opacity-60 gap-1.5"
            >
              <FaPlus className="text-[10px]" />
              <span>Submit Quota Request</span>
            </PrimaryBtn>
          </div>
        </form>
      )}

      {/* Requests Ledger */}
      <div className="rounded bg-white border border-slate-200/80 shadow-2xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-700">
              {isAdmin ? "Submitted Teacher Requests" : "My Requests"}
            </span>
            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-200/70 text-slate-700 font-bold">
              {requests.length} Total
            </span>
          </div>
        </div>

        {requests.length === 0 ? (
          <EmptyState
            compact
            type="tasks"
            title="No Requests in Queue"
            description={
              isAdmin
                ? "There are currently no pending or historical quota requests from teachers."
                : "You haven't submitted any quota or exam pack expansion requests yet."
            }
          />
        ) : (
          <div className="p-4 space-y-3">
            {requests.map((r) => (
              <div
                key={r.id}
                className="rounded border border-slate-200/80 p-3.5 flex flex-col sm:flex-row sm:items-center gap-3 justify-between hover:bg-slate-50/50 transition-colors shadow-2xs"
              >
                <div className="flex items-start gap-3 min-w-0">
                  <div
                    className={`w-8 h-8 rounded flex items-center justify-center text-xs shrink-0 border ${
                      r.type === "pack"
                        ? "bg-blue-50 text-blue-600 border-blue-200/60"
                        : "bg-emerald-50 text-emerald-600 border-emerald-200/60"
                    }`}
                  >
                    {r.type === "pack" ? <FaLayerGroup /> : <FaBoxOpen />}
                  </div>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-bold text-slate-900 text-xs truncate">
                        {r.title}
                      </p>
                      <span
                        className={`text-[9px] font-mono font-bold px-1.5 py-0.2 rounded uppercase border ${
                          statusStyles[r.status] || statusStyles.pending
                        }`}
                      >
                        {r.status}
                      </span>
                      <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 border border-slate-200">
                        {r.type === "pack" ? "Pack Limit" : "Exam Limit"}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1">
                      {isAdmin && r.teacherName ? `${r.teacherName} · ` : ""}
                      {r.type === "limit" && r.packTitle
                        ? `${r.packTitle} · `
                        : ""}
                      Requested:{" "}
                      <span className="font-bold font-mono text-slate-700">
                        {r.requestedLimit}
                      </span>
                      {r.description ? ` · ${r.description}` : ""}
                    </p>
                  </div>
                </div>

                {isAdmin && r.status === "pending" && (
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => review(r.id, "approved")}
                      className="inline-flex items-center gap-1 text-[11px] font-semibold px-3 py-1.5 rounded bg-emerald-600 hover:bg-emerald-700 text-white shadow-2xs transition cursor-pointer disabled:opacity-60"
                    >
                      <FaCheck className="text-[9px]" />
                      Approve
                    </button>
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => review(r.id, "rejected")}
                      className="inline-flex items-center gap-1 text-[11px] font-semibold px-3 py-1.5 rounded border border-rose-200 bg-rose-50/50 hover:bg-rose-100 text-rose-700 shadow-2xs transition cursor-pointer disabled:opacity-60"
                    >
                      <FaTimes className="text-[9px]" />
                      Reject
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </PageContainer>
  );
}
