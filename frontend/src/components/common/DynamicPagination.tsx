"use client";

import React from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import {
  FaChevronLeft,
  FaChevronRight,
  FaAngleDoubleLeft,
  FaAngleDoubleRight,
} from "react-icons/fa";
import { PaginationMeta } from "../../lib/actions/pagination";
import MiniSelect from "../ui/MiniSelect";

export interface DynamicPaginationProps {
  meta?: PaginationMeta | null;
  onPageChange?: (page: number) => void;
  onPerPageChange?: (perPage: number) => void;
  perPageOptions?: number[];
  showPerPage?: boolean;
  showInfo?: boolean;
  syncWithUrl?: boolean;
  className?: string;
}

export default function DynamicPagination({
  meta,
  onPageChange,
  onPerPageChange,
  perPageOptions = [10, 20, 50, 100],
  showPerPage = true,
  showInfo = true,
  syncWithUrl = true,
  className = "",
}: DynamicPaginationProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const currentPage = Math.max(1, meta?.current_page || 1);
  const totalPages = Math.max(1, meta?.total_pages || 1);
  const perPage = meta?.per_page || 10;
  const totalItems = meta?.total_items || 0;

  const availablePerPageOptions = React.useMemo(() => {
    const opts = new Set(perPageOptions);
    if (perPage > 0) opts.add(perPage);
    return Array.from(opts).sort((a, b) => a - b);
  }, [perPageOptions, perPage]);

  if (!meta || meta.total_items === 0) {
    return null;
  }

  const from = Math.min((currentPage - 1) * perPage + 1, totalItems);
  const to = Math.min(currentPage * perPage, totalItems);

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages || newPage === currentPage) return;

    if (onPageChange) {
      onPageChange(newPage);
    }

    if (syncWithUrl) {
      const params = new URLSearchParams(
        searchParams ? searchParams.toString() : "",
      );
      params.set("page", String(newPage));
      router.push(`${pathname}?${params.toString()}`, { scroll: false });
    }
  };

  const handlePerPageChange = (newPerPage: number) => {
    if (newPerPage === perPage) return;

    if (onPerPageChange) {
      onPerPageChange(newPerPage);
    }

    if (syncWithUrl) {
      const params = new URLSearchParams(
        searchParams ? searchParams.toString() : "",
      );
      params.set("per_page", String(newPerPage));
      params.set("page", "1");
      router.push(`${pathname}?${params.toString()}`, { scroll: false });
    }
  };

  // Generate smart pagination numbers with ellipsis
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible + 2) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);

      if (currentPage <= 3) {
        pages.push(2, 3, 4);
        pages.push("...");
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push("...");
        pages.push(totalPages - 3, totalPages - 2, totalPages - 1);
        pages.push(totalPages);
      } else {
        pages.push("...");
        pages.push(currentPage - 1, currentPage, currentPage + 1);
        pages.push("...");
        pages.push(totalPages);
      }
    }

    return pages;
  };

  const pageNumbers = getPageNumbers();

  return (
    <div
      className={`flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4 p-3 sm:p-4 px-1 select-none ${className}`}
      role="navigation"
      aria-label="Pagination Navigation"
    >
      {/* Left: Summary Info */}
      {showInfo && (
        <div className="text-xs text-slate-500 font-medium text-center sm:text-left order-2 sm:order-1">
          Showing <span className="font-bold text-slate-800">{from}</span> to{" "}
          <span className="font-bold text-slate-800">{to}</span> of{" "}
          <span className="font-bold text-slate-800">{totalItems}</span> items
        </div>
      )}

      {/* Right: Controls & Page Buttons */}
      <div className="flex flex-wrap items-center justify-center sm:justify-end gap-2 sm:gap-3 order-1 sm:order-2 w-full sm:w-auto">
        {/* Per-Page Selector */}
        {showPerPage && perPageOptions.length > 0 && (
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <span className="hidden md:inline text-[11px] font-semibold text-slate-400">
              Rows:
            </span>
            <div className="w-[100px]">
              <MiniSelect
                value={`${perPage} / page`}
                options={availablePerPageOptions.map((opt) => `${opt} / page`)}
                onChange={(val) => {
                  const num = parseInt(val, 10);
                  if (!isNaN(num)) {
                    handlePerPageChange(num);
                  }
                }}
              />
            </div>
          </div>
        )}

        {/* Vertical Divider on Desktop */}
        {showPerPage && perPageOptions.length > 0 && (
          <div className="hidden sm:block h-4 w-[1px] bg-slate-200 mx-0.5" />
        )}

        {/* Page Nav Buttons */}
        <div className="flex items-center gap-1">
          {/* First Page */}
          <button
            type="button"
            onClick={() => handlePageChange(1)}
            disabled={currentPage <= 1}
            aria-label="First page"
            className="hidden sm:inline-flex items-center justify-center w-8 h-8 rounded border border-slate-200/80 bg-white text-slate-500 hover:bg-orange-50 hover:text-orange-600 hover:border-orange-300 disabled:opacity-40 disabled:pointer-events-none transition-all shadow-2xs cursor-pointer text-xs focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
          >
            <FaAngleDoubleLeft className="text-[11px]" />
          </button>

          {/* Previous Page */}
          <button
            type="button"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage <= 1}
            aria-label="Previous page"
            className="inline-flex items-center justify-center w-8 h-8 rounded border border-slate-200/80 bg-white text-slate-600 hover:bg-orange-50 hover:text-orange-600 hover:border-orange-300 disabled:opacity-40 disabled:pointer-events-none transition-all shadow-2xs cursor-pointer text-xs focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
          >
            <FaChevronLeft className="text-[10px]" />
          </button>

          {/* Page Numbers */}
          <div className="flex items-center gap-1">
            {pageNumbers.map((p, idx) => {
              if (typeof p === "string") {
                return (
                  <span
                    key={`ellipsis-${idx}`}
                    className="inline-flex items-center justify-center w-6 h-8 text-xs font-bold text-slate-400 select-none cursor-default"
                  >
                    …
                  </span>
                );
              }

              const isActive = p === currentPage;
              return (
                <button
                  key={p}
                  type="button"
                  onClick={() => handlePageChange(p)}
                  aria-current={isActive ? "page" : undefined}
                  className={`inline-flex items-center justify-center min-w-[32px] h-8 px-2 rounded text-xs font-bold transition-all cursor-pointer shadow-2xs focus:outline-none focus:ring-2 focus:ring-orange-500/20 ${
                    isActive
                      ? "bg-orange-500 text-white border border-orange-500 shadow-xs ring-2 ring-orange-500/20"
                      : "bg-white border border-slate-200/80 text-slate-700 hover:bg-orange-50 hover:text-orange-600 hover:border-orange-300"
                  }`}
                >
                  {p}
                </button>
              );
            })}
          </div>

          {/* Next Page */}
          <button
            type="button"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage >= totalPages}
            aria-label="Next page"
            className="inline-flex items-center justify-center w-8 h-8 rounded border border-slate-200/80 bg-white text-slate-600 hover:bg-orange-50 hover:text-orange-600 hover:border-orange-300 disabled:opacity-40 disabled:pointer-events-none transition-all shadow-2xs cursor-pointer text-xs focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
          >
            <FaChevronRight className="text-[10px]" />
          </button>

          {/* Last Page */}
          <button
            type="button"
            onClick={() => handlePageChange(totalPages)}
            disabled={currentPage >= totalPages}
            aria-label="Last page"
            className="hidden sm:inline-flex items-center justify-center w-8 h-8 rounded border border-slate-200/80 bg-white text-slate-500 hover:bg-orange-50 hover:text-orange-600 hover:border-orange-300 disabled:opacity-40 disabled:pointer-events-none transition-all shadow-2xs cursor-pointer text-xs focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
          >
            <FaAngleDoubleRight className="text-[11px]" />
          </button>
        </div>
      </div>
    </div>
  );
}
