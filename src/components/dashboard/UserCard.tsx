import Image from "next/image";
import { motion } from "framer-motion";

interface UserCardProps {
  name: string;
  board: string;
  level: string;
  batch: string;
  institution: string;
  image: string;
}

export default function UserCard({
  name,
  board,
  level,
  batch,
  institution,
  image,
}: UserCardProps) {
  return (
    <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 p-6 glass-card rounded-2xl hover-lift">
      <div className="relative group">
        <div className="absolute -inset-1 bg-gradient-to-r from-primary to-primary-light rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
        <div className="relative border-4 border-white rounded-2xl overflow-hidden shadow-lg w-28 h-28 sm:w-32 sm:h-32">
          <Image
            src={image}
            alt={name}
            fill
            className="object-cover transform group-hover:scale-110 transition-transform duration-500"
          />
        </div>
      </div>
      <div className="text-center sm:text-left flex-1">
        <div className="inline-flex items-center px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold mb-3 uppercase tracking-wider">
          {board} • {level} • {batch}
        </div>
        <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900 mb-2 leading-tight">
          {name}
        </h2>
        <p className="text-gray-600 font-medium flex items-center justify-center sm:justify-start gap-2">
          <span className="w-2 h-2 bg-primary rounded-full"></span>
          {institution}
        </p>
      </div>
    </div>
  );
}
