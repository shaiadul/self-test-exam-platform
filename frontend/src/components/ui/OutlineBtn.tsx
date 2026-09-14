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
  sm: "px-2 py-0.5 rounded text-[10px] font-bold",
  md: "px-4 md:px-6 py-3 rounded-full text-sm md:text-lg font-semibold",
  lg: "px-6 md:px-8 py-3.5 rounded-full text-base md:text-xl font-bold",
};

const variantClasses: Record<OutlineBtnVariant, string> = {
  primary: "bg-white border border-solid border-[#f97a00]",
  neutral:
    "bg-white border border-solid border-gray-200 text-gray-600 hover:border-[#dd6b01] hover:text-[#dd6b01]",
  danger:
    "bg-white border border-solid border-gray-200 text-gray-600 hover:border-red-400 hover:text-red-600",
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
