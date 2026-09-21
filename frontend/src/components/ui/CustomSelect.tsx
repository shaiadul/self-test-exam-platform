"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { FaChevronDown, FaSearch } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";

interface CustomSelectProps {
  label?: string;
  placeholder?: string;
  options: string[];
  value: string;
  onChange: (val: string) => void;
  disabled?: boolean;
  alwaysShowOptions?: string[];
  onSelectOptionWithSearch?: (option: string, currentSearch: string) => void;
}

export default function CustomSelect({
  label,
  placeholder = "Select an option",
  options,
  value,
  onChange,
  disabled = false,
  alwaysShowOptions,
  onSelectOptionWithSearch,
}: CustomSelectProps) {
  const [open, setOpen] = useState(false);
  const [openUp, setOpenUp] = useState(false);
  const [search, setSearch] = useState("");
  const [highlightIdx, setHighlightIdx] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  const filteredOptions = options.filter(
    (opt) =>
      opt.toLowerCase().includes(search.toLowerCase()) ||
      alwaysShowOptions?.includes(opt)
  );

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, []);

  // Calculate if dropdown should open upward or downward based on viewport space
  const updateDropdownDirection = useCallback(() => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      const spaceAbove = rect.top;
      // Estimate dropdown height: search bar (~44px) + options (up to ~208px) + padding (~12px)
      const estimatedHeight = Math.min(filteredOptions.length * 36 + 56, 260);

      // Open upward if not enough space below AND there is more space above
      if (spaceBelow < estimatedHeight && spaceAbove > spaceBelow) {
        setOpenUp(true);
      } else {
        setOpenUp(false);
      }
    }
  }, [filteredOptions.length]);

  // Update direction on open, window resize, or scroll
  useEffect(() => {
    if (open) {
      updateDropdownDirection();
      window.addEventListener("resize", updateDropdownDirection);
      window.addEventListener("scroll", updateDropdownDirection, { passive: true });
      return () => {
        window.removeEventListener("resize", updateDropdownDirection);
        window.removeEventListener("scroll", updateDropdownDirection);
      };
    }
  }, [open, updateDropdownDirection]);

  // Focus search input when opened
  useEffect(() => {
    if (open && searchRef.current) {
      setTimeout(() => searchRef.current?.focus(), 50);
    }
    if (!open) {
      setSearch("");
      setHighlightIdx(-1);
    }
  }, [open]);

  // Keyboard navigation
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (!open) {
        if (e.key === "Enter" || e.key === " " || e.key === "ArrowDown") {
          e.preventDefault();
          setOpen(true);
        }
        return;
      }

      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          setHighlightIdx((prev) =>
            prev < filteredOptions.length - 1 ? prev + 1 : 0
          );
          break;
        case "ArrowUp":
          e.preventDefault();
          setHighlightIdx((prev) =>
            prev > 0 ? prev - 1 : filteredOptions.length - 1
          );
          break;
        case "Enter":
          e.preventDefault();
          if (highlightIdx >= 0 && highlightIdx < filteredOptions.length) {
            const selectedOpt = filteredOptions[highlightIdx];
            onChange(selectedOpt);
            onSelectOptionWithSearch?.(selectedOpt, search);
            setOpen(false);
          }
          break;
        case "Escape":
          setOpen(false);
          break;
      }
    },
    [open, filteredOptions, highlightIdx, onChange, onSelectOptionWithSearch, search]
  );

  // Scroll highlighted item into view
  useEffect(() => {
    if (highlightIdx >= 0 && listRef.current) {
      const items = listRef.current.querySelectorAll("li[data-option]");
      items[highlightIdx]?.scrollIntoView({ block: "nearest" });
    }
  }, [highlightIdx]);

  return (
    <div className="w-full space-y-1.5" ref={containerRef} onKeyDown={handleKeyDown}>
      {label && (
        <label className="text-xs font-bold text-slate-700 ml-0.5 block">
          {label}
        </label>
      )}
      <div className="relative group">
        <div
          className={`flex items-center bg-white border rounded transition-all duration-150 overflow-hidden ${
            disabled
              ? "opacity-50 cursor-not-allowed bg-slate-100 border-slate-200"
              : open
              ? "border-primary ring-2 ring-primary/15"
              : "border-slate-300 hover:border-slate-400 group-focus-within:border-primary"
          }`}
        >
          <button
            type="button"
            disabled={disabled}
            onClick={() => setOpen(!open)}
            className="w-full px-3 py-2 text-xs sm:text-sm text-left outline-none flex items-center justify-between bg-transparent cursor-pointer"
          >
            <span className={`font-medium truncate ${value ? "text-slate-800" : "text-slate-400"}`}>
              {value || placeholder}
            </span>
            <FaChevronDown
              className={`text-slate-400 text-xs ml-2 shrink-0 transition-transform duration-200 group-hover:text-primary ${
                open ? "rotate-180 text-primary" : "rotate-0"
              }`}
            />
          </button>
        </div>

        {/* Dropdown Menu - Opens above or below based on available space */}
        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0, y: openUp ? 4 : -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: openUp ? 4 : -4 }}
              transition={{ duration: 0.15 }}
              className={`absolute left-0 w-full bg-white border border-slate-200 rounded shadow-lg z-[999] overflow-hidden ${
                openUp ? "bottom-full mb-1" : "top-full mt-1"
              }`}
            >
              {/* Search input */}
              <div className="p-1.5 border-b border-slate-100">
                <div className="flex items-center gap-2 px-2.5 py-1.5 rounded bg-slate-50 border border-slate-200/80">
                  <FaSearch className="text-slate-400 text-[10px] shrink-0" />
                  <input
                    ref={searchRef}
                    type="text"
                    value={search}
                    onChange={(e) => {
                      setSearch(e.target.value);
                      setHighlightIdx(0);
                    }}
                    placeholder="Search..."
                    className="w-full text-xs font-medium text-slate-800 placeholder:text-slate-400 bg-transparent outline-none"
                  />
                </div>
              </div>

              {/* Options list */}
              <ul
                ref={listRef}
                className="max-h-52 overflow-y-auto custom-scrollbar p-1"
              >
                {filteredOptions.length > 0 ? (
                  filteredOptions.map((opt, idx) => (
                    <li
                      key={idx}
                      data-option
                      className={`px-3 py-2 rounded text-xs font-medium cursor-pointer transition-colors mb-0.5 last:mb-0 ${
                        value === opt
                          ? "bg-primary text-white font-bold"
                          : highlightIdx === idx
                          ? "bg-slate-100 text-primary font-semibold"
                          : "text-slate-700 hover:bg-slate-50 hover:text-primary"
                      }`}
                      onClick={() => {
                        onChange(opt);
                        onSelectOptionWithSearch?.(opt, search);
                        setOpen(false);
                      }}
                      onMouseEnter={() => setHighlightIdx(idx)}
                    >
                      {opt}
                    </li>
                  ))
                ) : (
                  <li className="px-3 py-4 text-center text-slate-400 text-xs font-medium">
                    <FaSearch className="text-slate-300 text-sm mx-auto mb-1.5" />
                    No matches for &ldquo;{search}&rdquo;
                  </li>
                )}
              </ul>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
