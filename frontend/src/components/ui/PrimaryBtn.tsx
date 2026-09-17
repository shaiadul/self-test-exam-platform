"use client";

import Link from "next/link";
import { ButtonHTMLAttributes } from "react";
import { cn } from "../../lib/utils";

interface GradientButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  link?: string;
}

export function PrimaryBtn({
  link,
  onClick,
  className,
  children,
  ...props
}: GradientButtonProps) {
  const baseClasses = cn(
    "inline-flex items-center justify-center px-3.5 py-2 sm:px-4 sm:py-2",
    "rounded text-white font-semibold text-xs sm:text-sm whitespace-nowrap",
    "bg-primary hover:bg-primary-dark transition duration-150 active:scale-[0.99] cursor-pointer shadow-xs",
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
