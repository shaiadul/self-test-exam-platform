"use client";

import { useState, useRef, useEffect } from "react";
import { FaCaretDown } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";

interface CustomSelectProps {
  label?: string;
  options: string[];
  value: string;
  onChange: (val: string) => void;
}

export default function CustomSelect({
  label = "Select an option",
  options,
  value,
  onChange,
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
    <div className="relative w-full" ref={containerRef}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={`w-full px-4 py-3.5 text-left outline-none border-2 rounded-xl flex items-center justify-between transition-all duration-200 ${
          open 
            ? "border-primary ring-4 ring-primary/10 bg-white" 
            : "border-gray-100 hover:border-primary/50 bg-gray-50/50"
        }`}
      >
        <span className={`font-medium ${value ? "text-gray-900" : "text-gray-400"}`}>
          {value || label}
        </span>
        <FaCaretDown
          className={`text-primary transition-transform duration-300 ${
            open ? "rotate-180" : "rotate-0"
          }`}
        />
      </button>

      <AnimatePresence>
        {open && (
          <motion.ul
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute mt-2 w-full bg-white border border-gray-100 rounded-xl shadow-xl z-[999] max-h-64 overflow-y-auto custom-scrollbar p-1.5"
          >
            {options.length > 0 ? (
              options.map((opt, idx) => (
                <li
                  key={idx}
                  className={`px-4 py-3 rounded-lg cursor-pointer transition-colors font-medium mb-0.5 last:mb-0 ${
                    value === opt 
                      ? "bg-primary text-white" 
                      : "text-gray-700 hover:bg-primary/10 hover:text-primary"
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
  );
}
