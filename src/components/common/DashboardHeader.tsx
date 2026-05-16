"use client";

import { FaBell, FaSearch } from "react-icons/fa";
import Image from "next/image";

export const DashboardHeader = () => {
  return (
    <header className="h-20 bg-white border-b border-gray-100 sticky top-0 z-20">
      <div className="max-w-7xl mx-auto h-full flex items-center justify-between px-6">
        <div className="flex items-center gap-4 w-full max-w-md">
          <div className="relative w-full">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search exams, packs..." 
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            />
          </div>
        </div>

        <div className="flex items-center gap-6">
          <button className="relative p-2 text-gray-500 hover:bg-gray-50 rounded-full transition-colors">
            <FaBell className="text-xl" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
          </button>

          <div className="flex items-center gap-3 pl-6 border-l border-gray-100">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-bold text-gray-800 leading-none">Md Saidul Basar</p>
              <p className="text-xs text-gray-500 mt-1">Student Account</p>
            </div>
            <div className="w-10 h-10 rounded-full border-2 border-primary/20 overflow-hidden shadow-sm">
              <Image 
                src="/user/md-saidul.jpeg" 
                alt="Profile" 
                width={40} 
                height={40}
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
