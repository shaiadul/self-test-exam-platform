"use client";

import Image from "next/image";

type UpcomingExamCardProps = {
  image: string;
  title: string;
  dateTime: string;
};

export default function UpcomingExamCard({ image, title, dateTime }: UpcomingExamCardProps) {
  return (
    <div className="flex flex-col gap-2 mt-2 items-start">
      <Image
        src={image}
        alt={title}
        width={200}
        height={200}
        className="rounded-lg object-cover"
      />
      <p className="text-xl font-semibold text-[#dd6b01]">{title}</p>
      <p className="text-md text-gray-600">{dateTime}</p>
    </div>
  );
}
