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
import { OutlineBtn } from "../../../components/ui/OutlineBtn";
import { PageContainer } from "../../../components/common/PageContainer";
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
    packs && packs.length > 0 ? `${packs[0].title} (#${packs[0].id})` : ""
  );
  const [requestedLimit, setRequestedLimit] = useState<number>(3);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [message, setMessage] = useState<{ type: "ok" | "err"; text: string } | null>(null);
  const [busy, setBusy] = useState(false);

  const type: "pack" | "limit" =
    typeLabel === TYPE_OPTIONS[0] ? "pack" : "limit";

  const packOptions = (packs || []).map((p) => `${p.title} (#${p.id})`);
  const selectedPack = (packs || []).find(
    (p) => `${p.title} (#${p.id})` === packLabel
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
      setMessage({ type: "err", text: res.error || "Failed to submit request." });
    }
  };

  const review = async (id: number, status: "approved" | "rejected") => {
    setBusy(true);
    const res = await reviewRequestAction(id, status);
    setBusy(false);
    if (res.success) {
      setRequests((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)));
      router.refresh();
    } else {
      setMessage({ type: "err", text: res.error || "Failed to review request." });
    }
  };

  return (
    <PageContainer>
    <div className="space-y-8 animate-fadeIn">
      <div className="flex items-center gap-3">
        <div className="w-11 h-11 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center text-lg">
          <FaClipboardList />
        </div>
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            {isAdmin ? "Request Approvals" : "Exam Pack Requests"}
          </h1>
          <p className="text-sm text-slate-500 font-medium">
            {isAdmin
              ? "Review and approve teacher requests for more packs or exam limits."
              : "Request more exam packs or a higher exam limit for a pack."}
          </p>
        </div>
      </div>

      {message && (
        <div
          className={`rounded-2xl px-4 py-3 text-sm font-semibold border ${
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
          className="rounded-3xl bg-white border border-slate-200/80 p-6 shadow-sm space-y-5"
        >
          <div className="flex items-center gap-2">
            <FaPlus className="text-blue-600" />
            <h2 className="text-base font-black text-slate-900 tracking-tight">
              New Request
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <CustomSelect
              label="Request Type"
              options={TYPE_OPTIONS}
              value={typeLabel}
              onChange={(val) => {
                setTypeLabel(val);
                setRequestedLimit(val === TYPE_OPTIONS[0] ? 3 : 6);
              }}
            />

            {type === "limit" && (
              <CustomSelect
                label="Exam Pack"
                placeholder="Select a pack"
                options={packOptions}
                value={packLabel}
                onChange={setPackLabel}
              />
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Title"
              placeholder={
                type === "pack"
                  ? "Need 2 more exam packs for HSC batch"
                  : "Increase Physics pack limit to 10"
              }
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            <Input
              label="Requested Limit"
              type="number"
              min={1}
              value={requestedLimit}
              onChange={(e) => setRequestedLimit(Number(e.target.value))}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-700 ml-1 block">
              Reason / Details
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-gray-700 placeholder:text-gray-400 outline-none bg-white font-medium transition-all duration-200 focus:border-primary focus:ring-4 focus:ring-primary/10"
            />
          </div>

          <PrimaryBtn
            type="submit"
            disabled={busy}
            className="!text-sm !py-2.5 !px-6 disabled:opacity-60"
          >
            <FaPlus className="mr-2 text-xs" />
            Submit Request
          </PrimaryBtn>
        </form>
      )}

      <div className="rounded-3xl bg-white border border-slate-200/80 p-6 shadow-sm">
        <h2 className="text-base font-black text-slate-900 tracking-tight mb-4">
          {isAdmin ? "All Requests" : "My Requests"}
        </h2>

        {requests.length === 0 ? (
          <div className="py-10 text-center text-slate-400">
            <FaClipboardList className="mx-auto text-2xl mb-2 opacity-50" />
            <p className="text-sm font-bold text-slate-600">No requests yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {requests.map((r) => (
              <div
                key={r.id}
                className="rounded-2xl border border-slate-200/80 p-4 flex flex-col sm:flex-row sm:items-center gap-3 justify-between hover:bg-slate-50/50 transition-colors"
              >
                <div className="flex items-start gap-3 min-w-0">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center text-sm shrink-0 ${
                      r.type === "pack"
                        ? "bg-blue-50 text-blue-600"
                        : "bg-emerald-50 text-emerald-600"
                    }`}
                  >
                    {r.type === "pack" ? <FaLayerGroup /> : <FaBoxOpen />}
                  </div>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-bold text-slate-900 text-sm truncate">
                        {r.title}
                      </p>
                      <span
                        className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full border uppercase ${
                          statusStyles[r.status] || statusStyles.pending
                        }`}
                      >
                        {r.status}
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200 uppercase">
                        {r.type === "pack" ? "Pack limit" : "Exam limit"}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                      {isAdmin && r.teacherName ? `${r.teacherName} · ` : ""}
                      {r.type === "limit" && r.packTitle ? `${r.packTitle} · ` : ""}
                      Requested: <span className="font-bold">{r.requestedLimit}</span>
                      {r.description ? ` · ${r.description}` : ""}
                    </p>
                  </div>
                </div>

                {isAdmin && r.status === "pending" && (
                  <div className="flex items-center gap-2 shrink-0">
                    <PrimaryBtn
                      type="button"
                      disabled={busy}
                      onClick={() => review(r.id, "approved")}
                      className="!text-xs !py-2 !px-4 !from-emerald-500 !to-emerald-400 disabled:opacity-60"
                    >
                      <FaCheck className="mr-1.5 text-[10px]" />
                      Approve
                    </PrimaryBtn>
                    <OutlineBtn
                      type="button"
                      disabled={busy}
                      onClick={() => review(r.id, "rejected")}
                      className="!text-xs !py-2 !px-4 !border-rose-300 !text-rose-600 disabled:opacity-60"
                    >
                      <FaTimes className="mr-1.5 text-[10px]" />
                      Reject
                    </OutlineBtn>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
    </PageContainer>
  );
}
