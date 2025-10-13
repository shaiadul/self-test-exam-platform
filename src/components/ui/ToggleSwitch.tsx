"use client";

import { motion } from "framer-motion";
import React from "react";

interface ToggleSwitchProps {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}

export default function ToggleSwitch({
  label,
  checked,
  onChange,
}: ToggleSwitchProps) {
  return (
    <div className="flex items-center justify-between py-2 px-3 bg-orange-50 rounded-lg border border-orange-200 hover:border-[#f97a00]/60 transition-all duration-300">
      <span className="text-gray-800 font-medium">{label}</span>

      <button
        type="button"
        onClick={() => onChange(!checked)}
        className={`relative w-14 h-7 rounded-full transition-colors duration-500 cursor-pointer ${
          checked ? "bg-[#f97a00]" : "bg-gray-300"
        }`}
      >
        <motion.div
          layout
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
          className={`absolute top-[2px] w-6 h-6 rounded-full bg-white shadow-md ${
            checked ? "left-[calc(100%-1.75rem)]" : "left-[2px]"
          }`}
        />
      </button>
    </div>
  );
}
