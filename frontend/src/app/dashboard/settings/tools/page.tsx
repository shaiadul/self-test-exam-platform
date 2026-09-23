"use client";

import { FaTools, FaArrowLeft } from "react-icons/fa";
import { PageContainer } from "../../../../components/common/PageContainer";
import EmptyState from "../../../../components/common/EmptyState";
import { OutlineBtn } from "../../../../components/ui/OutlineBtn";

export default function ToolsPage() {
  return (
    <PageContainer className="space-y-6 animate-fadeIn pb-20 sm:pb-6">
      {/* Top Header Command Strip */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200/80 pb-4">
        <div className="flex items-center gap-3">
          <OutlineBtn
            link="/dashboard/settings"
            className="!p-2 !rounded !text-slate-600 hover:!text-primary shadow-2xs border-slate-200"
            title="Back to Settings"
          >
            <FaArrowLeft className="text-xs" />
          </OutlineBtn>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Developer Tools &amp; Maintenance
            </h1>
          </div>
        </div>

        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-amber-50 text-amber-700 border border-amber-200 text-xs font-bold">
          Under Development
        </span>
      </div>

      <EmptyState
        type="general"
        title="Maintenance Utilities in Staging"
        description="Administrative database migration tools, automated mock question scrapers, and batch export diagnostics will be deployed here."
        actionLabel="Return to Settings Hub"
          actionHref="/dashboard/settings"
        />
    </PageContainer>
  );
}
