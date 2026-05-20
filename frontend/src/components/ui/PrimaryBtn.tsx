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
    "inline-flex items-center justify-center px-4 md:px-6 py-3",
    "rounded-full text-white font-semibold text-md md:text-lg",
    "bg-gradient-to-r from-[#dd6b01] to-[#f0b176]",
    "hover:opacity-90 transition duration-300",
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
