"use client";

import { ReactNode } from "react";
import { cn } from "../../lib/utils";

interface PageContainerProps {
  children: ReactNode;
  className?: string;
}

export const PageContainer = ({ children, className }: PageContainerProps) => {
  return <div className={cn("space-y-4 sm:space-y-5 pb-6", className)}>{children}</div>;
};
