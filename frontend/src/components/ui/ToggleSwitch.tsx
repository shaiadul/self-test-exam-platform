"use client";

import React from "react";

interface ToggleSwitchProps {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  description?: string;
}

export default function ToggleSwitch({
  label,
  checked,
  onChange,
  description,
}: ToggleSwitchProps) {
  return (
    <div className="flex items-center justify-between p-3 bg-white rounded border border-slate-200/80 hover:border-slate-300 transition-all shadow-2xs gap-3">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-800">{label}</span>
          <span
            className={`text-[9px] font-mono font-bold px-1.5 py-0.2 rounded border uppercase ${
              checked
                ? "bg-primary/10 text-primary border-primary/20"
                : "bg-slate-100 text-slate-500 border-slate-200"
            }`}
          >
            {checked ? "ACTIVE" : "INACTIVE"}
          </span>
        </div>
        {description && (
          <p className="text-[11px] text-slate-400 mt-0.5 leading-normal">{description}</p>
        )}
      </div>

      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 ${
          checked ? "bg-primary" : "bg-slate-300"
        }`}
      >
        <span
          className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-2xs ring-0 transition duration-200 ease-in-out ${
            checked ? "translate-x-4" : "translate-x-0"
          }`}
        />
      </button>
    </div>
  );
}
