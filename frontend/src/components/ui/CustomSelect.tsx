"use client";

import { useState, useRef, useEffect } from "react";
import { FaCaretDown } from "react-icons/fa";
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
    <div className="w-full space-y-2" ref={containerRef}>
      {label && (
        <label className="text-sm font-bold text-gray-700 ml-1 block">
          {label}
        </label>
      )}
      <div className="relative group">
        {/* Wrapper mirrors Input.tsx: handles border, hover, and focus-within styling */}
        <div
          className={`flex items-center bg-white border-2 rounded-xl transition-all duration-200 overflow-hidden ${
            disabled
              ? "opacity-50 cursor-not-allowed bg-gray-100 border-gray-100"
              : open
              ? "border-primary ring-4 ring-primary/10"
              : "border-gray-200 group-hover:border-primary/50"
          }`}
        >
          <button
            type="button"
            disabled={disabled}
            onClick={() => setOpen(!open)}
            className="w-full px-4 py-3.5 text-left outline-none flex items-center justify-between bg-transparent"
          >
            <span className={`font-medium ${value ? "text-gray-900" : "text-gray-400"}`}>
              {value || placeholder}
            </span>
            <FaCaretDown
              className={`text-primary transition-transform duration-300 ${
                open ? "rotate-180" : "rotate-0"
              }`}
            />
          </button>
        </div>

        <AnimatePresence>
          {open && (
            <motion.ul
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="absolute mt-2 w-full bg-white border border-gray-150 rounded-xl shadow-xl z-[999] max-h-64 overflow-y-auto custom-scrollbar p-1.5"
            >
              {options.length > 0 ? (
                options.map((opt, idx) => (
                  <li
                    key={idx}
                    className={`px-4 py-3 rounded-lg cursor-pointer transition-colors font-medium mb-0.5 last:mb-0 ${
                      value === opt 
                        ? "bg-[#dd6b01] text-white" 
                        : "text-gray-700 hover:bg-[#dd6b01]/10 hover:text-[#dd6b01]"
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
                <li className="px-4 py-3 text-gray-400 italic text-sm">No options available</li>
              )}
            </motion.ul>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
