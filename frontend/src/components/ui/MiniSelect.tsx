"use client";

import CustomSelect, { CustomSelectProps } from "./CustomSelect";

export interface MiniSelectProps extends Omit<CustomSelectProps, "size" | "searchable"> {
  size?: "xxs" | "sm";
}

/**
 * MiniSelect is a compact, elegant select dropdown designed for pagination,
 * table toolbars, and micro-controls where a search bar is unnecessary.
 * Inherits all standard styling, smooth motion animations, and keyboard navigation.
 */
export default function MiniSelect({
  size = "xxs",
  ...props
}: MiniSelectProps) {
  return (
    <CustomSelect
      size={size}
      searchable={false}
      {...props}
    />
  );
}
