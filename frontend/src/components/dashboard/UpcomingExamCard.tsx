"use client";

import Image from "next/image";
import { FaCalendarAlt, FaClock } from "react-icons/fa";

type UpcomingExamCardProps = {
  image: string;
  title: string;
  dateTime: string;
};

export default function UpcomingExamCard({ image, title, dateTime }: UpcomingExamCardProps) {
  // Split dateTime if possible, assuming format "10:30 AM | Sunday, 14th May 2025"
  const [time, date] = dateTime.split(" | ");

  return (
    <div className="group flex flex-col gap-4 p-4 bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1">
      <div className="relative aspect-video w-full overflow-hidden rounded-xl">
        <Image
          src={image}
          alt={title}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
          <button className="w-full py-2 bg-primary text-white font-bold rounded-lg text-sm shadow-lg">
            View Details
          </button>
        </div>
      </div>
      
      <div className="space-y-2">
        <h3 className="text-lg font-bold text-gray-800 line-clamp-1 group-hover:text-primary transition-colors">
          {title}
        </h3>
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <FaCalendarAlt className="text-primary/70" />
            <span>{date || dateTime}</span>
          </div>
          {time && (
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <FaClock className="text-primary/70" />
              <span>{time}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
