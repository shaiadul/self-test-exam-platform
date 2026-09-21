"use client";

import Image from "next/image";
import Link from "next/link";
import { GoPackage } from "react-icons/go";
import { FaArrowRight, FaBookOpen } from "react-icons/fa";
import { cn } from "../../lib/utils";

import { ShareBtn } from "../ui/ShareBtn";

type ExamPackCardProps = {
  image: string;
  title: string;
  description: string;
  totalExams: number;
  link: string;
  category?: string;
};

export default function ExamPackCard({
  image,
  title,
  description,
  totalExams,
  link,
  category,
}: ExamPackCardProps) {
  const imgSrc =
    image && (image.startsWith("/") || image.startsWith("http"))
      ? image
      : "/global/no-picture.jpg";

  return (
    <div className="group flex flex-col justify-between w-full bg-white rounded border border-slate-200/80 shadow-2xs hover:shadow-xs hover:border-primary/40 transition-all duration-150 overflow-hidden">
      <div>
        {/* Image Container with Badge */}
        <div className="relative w-full h-40 bg-slate-100 overflow-hidden">
          <Image
            src={imgSrc}
            alt={title}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent pointer-events-none" />

          <div className="absolute bottom-2 left-2 flex items-center gap-1.5 px-2 py-0.5 rounded bg-slate-950/90 text-white text-[10px] font-mono font-bold uppercase tracking-wider border border-white/20">
            <GoPackage className="text-primary text-xs" />
            <span>
              {totalExams} {totalExams === 1 ? "Exam" : "Exams"}
            </span>
          </div>

          {/* Top Floating Controls: Left = ShareBtn, Right = Category */}
          <div className="absolute top-2.5 inset-x-2.5 flex items-center justify-between z-10 pointer-events-none">
            <div className="pointer-events-auto">
              <ShareBtn
                metadata={{
                  title: title,
                  text:
                    description || `Explore the ${title} exam pack on Self Test!`,
                  path: link,
                }}
                variant="glass"
                size="xs"
                title={`Share ${title}`}
              />
            </div>

            {category && (
              <div className="pointer-events-auto px-2 py-0.5 rounded-full bg-slate-900/70 backdrop-blur-md text-white text-[10px] font-mono font-bold uppercase border border-white/20 shadow-xs">
                {category}
              </div>
            )}
          </div>
        </div>

        <div className="p-3.5 space-y-1.5">
          <h3 className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-primary transition-colors line-clamp-1">
            {title}
          </h3>

          <p className="text-[11px] sm:text-xs text-slate-500 line-clamp-2 leading-relaxed font-medium">
            {description ||
              "Comprehensive evaluation package designed to assess candidate mastery."}
          </p>
        </div>
      </div>

      <div className="px-3.5 py-2 flex items-center justify-between border-t border-slate-100 mt-1 bg-slate-50/30">
        <span className="text-[10px] font-mono font-bold text-slate-400 flex items-center gap-1.5">
          <FaBookOpen className="text-slate-400 text-[11px]" />
          <span>Curriculum Pack</span>
        </span>

        <div className="flex items-center gap-1.5">
          <Link
            href={link}
            prefetch={false}
            className="inline-flex items-center gap-1.5 h-7 px-3 text-xs font-semibold text-primary bg-primary/10 hover:bg-primary hover:text-white rounded transition-all duration-150 cursor-pointer group/btn shadow-2xs"
          >
            <span>View Pack</span>
            <FaArrowRight className="text-[9px] group-hover/btn:translate-x-0.5 transition-transform" />
          </Link>
        </div>
      </div>
    </div>
  );
}
