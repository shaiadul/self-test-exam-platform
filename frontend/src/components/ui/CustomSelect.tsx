"use client";

import { useState, useRef, useEffect } from "react";
import { FaChevronDown } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";

interface CustomSelectProps {
  label?: string;
  placeholder?: string;
  options: string[];
  value: string;
  onChange: (val: string) => void;
  disabled?: boolean;
}

export default function CustomSelect({
  label,
  placeholder = "Select an option",
  options,
  value,
  onChange,
  disabled = false,
}: CustomSelectProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="w-full space-y-1.5" ref={containerRef}>
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

        <AnimatePresence>
          {open && (
            <motion.ul
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.15 }}
              className="absolute mt-1 w-full bg-white border border-slate-200 rounded shadow-lg z-[999] max-h-60 overflow-y-auto custom-scrollbar p-1"
            >
              {options.length > 0 ? (
                options.map((opt, idx) => (
                  <li
                    key={idx}
                    className={`px-3 py-2 rounded text-xs font-medium cursor-pointer transition-colors mb-0.5 last:mb-0 ${
                      value === opt 
                        ? "bg-primary text-white font-bold" 
                        : "text-slate-700 hover:bg-slate-50 hover:text-primary"
                    }`}
                    onClick={() => {
                      onChange(opt);
                      setOpen(false);
                    }}
                  >
                    {opt}
                  </li>
                ))
              ) : (
                <li className="px-3 py-2 text-slate-400 italic text-xs">No options available</li>
              )}
            </motion.ul>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
