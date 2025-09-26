"use client";

import { useState } from "react";
import { FaCaretDown } from "react-icons/fa";

interface CustomSelectProps {
  label?: string;                 // Optional label placeholder
  options: string[];              // Dropdown options
  value: string;                  // Current selected value
  onChange: (val: string) => void; // Callback when value changes
}

export default function CustomSelect({
  label = "Select an option",
  options,
  value,
  onChange,
}: CustomSelectProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative w-full">
      {/* Trigger button */}
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full px-3 py-4 text-lg text-left outline-none border border-solid border-[#f97a00] rounded-lg flex items-center justify-between"
      >
        <span className={value ? "text-black" : "text-gray-400"}>
          {value || label}
        </span>
        <FaCaretDown
          className={`text-[#f97a00] transition-transform ${
            open ? "rotate-180" : "rotate-0"
          }`}
        />
      </button>

      {/* Dropdown */}
      {open && (
        <ul className="absolute mt-2 w-full bg-white border border-[#f97a00] rounded-lg shadow-lg z-10 max-h-56 overflow-auto">
          {options.map((opt, idx) => (
            <li
              key={idx}
              className={`px-4 py-2 cursor-pointer hover:bg-[#f97a00] hover:text-white ${
                value === opt ? "bg-[#f97a00] text-white" : ""
              }`}
              onClick={() => {
                onChange(opt);
                setOpen(false);
              }}
            >
              {opt}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
