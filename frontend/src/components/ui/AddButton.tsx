"use client";

import { AiOutlinePlus } from "react-icons/ai";
import Link from "next/link";
import React from "react";
import { motion } from "framer-motion";

interface AddButtonProps {
  href: string;
  label?: string;
  icon?: React.ReactNode;
  className?: string;
}

const AddButton: React.FC<AddButtonProps> = ({
  href,
  label = "Add Item",
  icon = <AiOutlinePlus />,
  className = "",
}) => {
  return (
    <motion.div
      className={`flex items-center justify-end ml-auto w-fit p-4 ${className}`}
    >
      <Link
        href={href}
        className="flex items-center gap-2 bg-[#dd6b01] hover:bg-[#c85f00] duration-500 text-white font-medium py-2 px-5 rounded-lg shadow-md hover:shadow-lg text-sm sm:text-base"
      >
        <span className="text-lg">{icon}</span>
        <span>{label}</span>
      </Link>
    </motion.div>
  );
};

export default AddButton;
