"use client";

import Link from "next/link";
import { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface OutlineButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  link?: string;
}

export function OutlineBtn({
  link,
  onClick,
  className,
  children,
  ...props
}: OutlineButtonProps) {
  const baseClasses = cn(
    "inline-flex items-center justify-center px-4 md:px-6 py-3",
    "rounded-full text-sm md:text-lg font-semibold",
    "bg-white border border-solid border-[#f97a00]",
    "relative overflow-hidden",
    "hover:opacity-90 transition duration-300",
    className
  );

  const inner = <span className="relative z-10">{children}</span>;

  if (link) {
    return (
      <Link href={link} className={baseClasses}>
        {inner}
      </Link>
    );
  }

  return (
    <button onClick={onClick} className={baseClasses} {...props}>
      {inner}
    </button>
  );
}
