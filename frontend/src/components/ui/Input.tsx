"use client";

import { ReactNode } from "react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  icon?: ReactNode;
  error?: string;
  prefix?: string;
}

export const Input = ({
  label,
  icon,
  error,
  prefix,
  className,
  ...props
}: InputProps) => {
  return (
    <div className="w-full space-y-2">
      {label && (
        <label className="text-sm font-bold text-gray-700 ml-1">
          {label}
        </label>
      )}
      <div className="relative group">
        <div className={cn(
          "flex items-center bg-white border rounded transition-all duration-150 overflow-hidden",
          error 
            ? "border-destructive ring-2 ring-destructive/10" 
            : "border-slate-300 hover:border-slate-400 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/15"
        )}>
          {prefix && (
            <span className="px-3 py-2 bg-slate-50 border-r border-slate-200 text-slate-500 font-semibold text-xs">
              {prefix}
            </span>
          )}
          
          {icon && (
            <span className="pl-3 text-slate-400 group-focus-within:text-primary transition-colors text-xs">
              {icon}
            </span>
          )}
          
          <input
            {...props}
            className={cn(
              "w-full px-3 py-2 text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 outline-none bg-transparent font-medium",
              className
            )}
          />
        </div>
        
        {error && (
          <p className="text-xs text-red-500 font-bold mt-1 ml-1 animate-in fade-in slide-in-from-top-1">
            {error}
          </p>
        )}
      </div>
    </div>
  );
};
