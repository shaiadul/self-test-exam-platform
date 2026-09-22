"use client";

import { useState, useEffect, useMemo } from "react";
import { FaSpinner, FaSearch, FaPlus, FaBoxOpen } from "react-icons/fa";
import ExamPackCard from "../../../components/dashboard/ExamPackCard";
import { PrimaryBtn } from "../../../components/ui/PrimaryBtn";
import { PageContainer } from "../../../components/common/PageContainer";
import EmptyState from "../../../components/common/EmptyState";
import DynamicPagination from "../../../components/common/DynamicPagination";
import {
  PaginationMeta,
} from "../../../lib/actions";

interface ManageExamPackClientViewProps {
  initialPacks: any[];
  initialMeta?: PaginationMeta;
  currentUserId?: number;
  currentUserRole?: string;
}

export default function ManageExamPackClientView({
  initialPacks,
  initialMeta,
  currentUserId,
  currentUserRole,
}: ManageExamPackClientViewProps) {
  const [examPacks, setExamPacks] = useState<any[]>(initialPacks || []);
  const [meta, setMeta] = useState<PaginationMeta | undefined>(initialMeta);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (initialPacks) {
      setExamPacks(initialPacks);
    }
    if (initialMeta) {
      setMeta(initialMeta);
    }
  }, [initialPacks, initialMeta]);

  const userRole = currentUserRole || (typeof window !== "undefined" ? localStorage.getItem("userRole") : null);
  const userId = currentUserId || (typeof window !== "undefined" ? Number(localStorage.getItem("userID")) : null);

  const ownedPacks = useMemo(() => {
    let list = examPacks;
    if (userRole && String(userRole).toLowerCase() === "teacher" && userId) {
      list = list.filter((p) => p.createdBy && Number(p.createdBy) === Number(userId));
    }
    return list;
  }, [examPacks, userRole, userId]);

  const filteredPacks = useMemo(() => {
    if (!search.trim()) return ownedPacks;
    const query = search.toLowerCase();
    return ownedPacks.filter(
      (p) =>
        p.title?.toLowerCase().includes(query) ||
        p.description?.toLowerCase().includes(query) ||
        p.category?.toLowerCase().includes(query),
    );
  }, [ownedPacks, search]);

  return (
    <PageContainer className="space-y-6">
      {/* Top Header Command Strip */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200/80 pb-4">
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded bg-blue-50 text-blue-700 border border-blue-200">
              {ownedPacks.length} ACTIVE PACKS
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Manage Exam Packs
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Create and organize syllabus packs, manage question banks, and
            configure mock papers.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <PrimaryBtn
            link="/dashboard/manage-exam-pack/add"
            className="!text-xs !py-1.5 !px-3.5 !rounded shadow-2xs gap-1.5"
          >
            <FaPlus className="text-[10px]" />
            <span>Create Exam Pack</span>
          </PrimaryBtn>
        </div>
      </div>

      {/* Filter / Search Bar */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-md">
          <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs" />
          <input
            type="text"
            placeholder="Search exam pack by title, description or syllabus level..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 bg-white border border-slate-200 rounded text-xs font-medium text-slate-800 placeholder:text-slate-400 outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-colors"
          />
        </div>
        {search && (
          <button
            onClick={() => setSearch("")}
            className="text-xs font-mono text-slate-500 hover:text-slate-900 cursor-pointer"
          >
            Reset
          </button>
        )}
      </div>

      {/* Main Grid */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center gap-2 text-slate-400 font-mono text-xs">
          <FaSpinner className="animate-spin text-2xl text-primary" />
          <span>SYNCHRONIZING EXAM PACK REGISTRY…</span>
        </div>
      ) : filteredPacks.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
          {filteredPacks.map((pack) => (
            <ExamPackCard
              key={pack.id}
              image={pack.image || "/global/test.png"}
              title={pack.title}
              description={pack.description}
              totalExams={pack.totalExams || 0}
              category={pack.category}
              link={`/dashboard/manage-exam-pack/${pack.id}`}
              showShare={false}
            />
          ))}
        </div>
      ) : (
        <div className="bg-white border border-slate-200/80 rounded p-4 sm:p-6 shadow-2xs max-w-xl mx-auto">
          <EmptyState
            type="exam"
            title={search ? "No Matching Packs" : "No Exam Packs Configured"}
            description={
              search
                ? "No exam pack matches your search criteria. Try a different query or clear your filter."
                : "No curriculum packs have been created yet. Click 'Create Exam Pack' to deploy your first syllabus container."
            }
            actionLabel={search ? "Clear Search Filter" : "Create Exam Pack"}
            actionHref={search ? undefined : "/dashboard/manage-exam-pack/add"}
            onAction={search ? () => setSearch("") : undefined}
          />
        </div>
      )}

      <DynamicPagination meta={meta} />
    </PageContainer>
  );
}
