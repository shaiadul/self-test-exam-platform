"use client";

import Link from "next/link";
import { ButtonHTMLAttributes } from "react";
import { cn } from "../../lib/utils";

type OutlineBtnVariant = "primary" | "neutral" | "danger";
type OutlineBtnSize = "sm" | "md" | "lg";

interface OutlineButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  link?: string;
  variant?: OutlineBtnVariant;
  size?: OutlineBtnSize;
}

const sizeClasses: Record<OutlineBtnSize, string> = {
  sm: "px-2.5 py-1 rounded text-[11px] font-semibold",
  md: "px-3.5 py-1.5 sm:px-4 sm:py-2 rounded text-xs sm:text-sm font-semibold",
  lg: "px-5 py-2.5 rounded text-sm font-semibold",
};

const variantClasses: Record<OutlineBtnVariant, string> = {
  primary: "bg-white border border-solid border-primary text-primary hover:bg-primary/5",
  neutral:
    "bg-white border border-solid border-slate-200 text-slate-700 hover:border-primary/40 hover:text-primary hover:bg-slate-50",
  danger:
    "bg-white border border-solid border-rose-200 text-rose-600 hover:border-rose-400 hover:bg-rose-50",
};

export function OutlineBtn({
  link,
  onClick,
  className,
  children,
  variant = "primary",
  size = "md",
  ...props
}: OutlineButtonProps) {
  const baseClasses = cn(
    "inline-flex items-center justify-center whitespace-nowrap relative overflow-hidden cursor-pointer",
    "hover:opacity-90 transition duration-300",
    sizeClasses[size],
    variantClasses[variant],
    className,
  );

  if (link) {
    return (
      <Link href={link} className={baseClasses}>
        {children}
      </Link>
    );
  }

  return (
    <button onClick={onClick} className={baseClasses} {...props}>
      {children}
    </button>
  );
}
