"use client";

import Image from "next/image";
import Link from "next/link";
import { GoPackage } from "react-icons/go";

type ExamPackCardProps = {
  image: string;
  title: string;
  description: string;
  totalExams: number;
  link: string;
};

export default function ExamPackCard({
  image,
  title,
  description,
  totalExams,
  // link,
}: ExamPackCardProps) {
  return (
    <div className="flex flex-col gap-3 mt-4 items-start w-full bg-white rounded-2xl shadow-md p-4 border border-gray-100 hover:shadow-lg transition-shadow duration-300">
      {/* Image */}
      <Image
        src={image}
        alt={title}
        width={260}
        height={180}
        className="rounded-lg object-cover w-full h-[180px]"
      />

      {/* Title */}
      <p className="text-lg font-bold text-[#dd6b01]">{title}</p>

      {/* Description */}
      <p className="text-sm text-gray-600 line-clamp-2">{description}</p>

      {/* Bottom Section */}
      <div className="flex items-center justify-between w-full mt-2">
        <span className="flex items-center gap-2 text-md text-gray-500">
          <GoPackage />
          {totalExams} Exams
        </span>
        <Link
          href="/dashboard/exam-pack/exam-pack-details"
          className="px-4 py-2 text-sm text-[#dd6b01] rounded-lg hover:text-[#c95f00] underline"
        >
          View Pack
        </Link>
      </div>
    </div>
  );
}
