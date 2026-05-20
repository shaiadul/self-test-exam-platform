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
          "flex items-center bg-white border-2 rounded-xl transition-all duration-200 overflow-hidden",
          error 
            ? "border-red-500 ring-4 ring-red-500/10" 
            : "border-gray-100 group-hover:border-primary/50 focus-within:border-primary focus-within:ring-4 focus-within:ring-primary/10"
        )}>
          {prefix && (
            <span className="px-4 py-3 bg-gray-50 border-r-2 border-gray-100 text-gray-500 font-bold text-sm">
              {prefix}
            </span>
          )}
          
          {icon && (
            <span className="pl-4 text-gray-400 group-focus-within:text-primary transition-colors">
              {icon}
            </span>
          )}
          
          <input
            {...props}
            className={cn(
              "w-full px-4 py-3.5 text-gray-700 placeholder:text-gray-400 outline-none bg-transparent font-medium",
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
