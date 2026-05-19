"use client";

import React, { useState, useEffect, useRef } from "react";
import { FaBell, FaSearch, FaTimes, FaBookOpen, FaCheckCircle, FaExclamationCircle } from "react-icons/fa";
import Image from "next/image";
import { useRouter } from "next/navigation";

// --- SEARCH MOCK DATA ---
interface SearchItem {
  id: string;
  title: string;
  category: string;
  desc: string;
  href: string;
}

const searchData: SearchItem[] = [
  { id: "1", title: "Science Explorer", category: "Exam Pack", desc: "HSC level evaluation pack", href: "/dashboard/exam-pack/exam-pack-details/1" },
  { id: "2", title: "Physics Mechanics Prep", category: "Physics", desc: "Core mechanics evaluation pack", href: "/dashboard/exam-pack/exam-pack-details/2" },
  { id: "3", title: "HSC Chemistry Prep", category: "Chemistry", desc: "Inorganic & organic chemistry pack", href: "/dashboard/exam-pack/exam-pack-details/3" },
  { id: "4", title: "Math Olympiad Challenge", category: "Mathematics", desc: "Advanced mathematical puzzles", href: "/dashboard/exam-pack/exam-pack-details/4" },
];

// --- NOTIFICATION MOCK DATA ---
interface NotifItem {
  id: string;
  title: string;
  desc: string;
  time: string;
  unread: boolean;
  type: "success" | "info";
}

const initialNotifications: NotifItem[] = [
  { id: "1", title: "Exam Submission Successful", desc: "Your exam 'Science Explorer' was submitted. Score: 15/20", time: "2 mins ago", unread: true, type: "success" },
  { id: "2", title: "New Exam Pack Released", desc: "HSC Physics Pack is now available in your batch.", time: "1 hour ago", unread: true, type: "info" },
  { id: "3", title: "Merit Rank Published", desc: "You placed #3 out of all candidates in Science Explorer.", time: "1 day ago", unread: false, type: "success" },
];

export const DashboardHeader = () => {
  const router = useRouter();
  
  // Search state
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  
  // Notifications state
  const [notifications, setNotifications] = useState<NotifItem[]>(initialNotifications);
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);

  // User Profile Session state
  const [userName, setUserName] = useState("Md Saidul Basar");
  const [userRoleLabel, setUserRoleLabel] = useState("Student Account");
  const [userAvatar, setUserAvatar] = useState("/user/md-saidul.jpeg");

  // Refs for clicking outside
  const searchRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter(n => n.unread).length;

  const matchingItems = searchQuery.trim() === "" ? [] : searchData.filter(item => 
    item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  useEffect(() => {
    // Populate session user role data on client mount
    const role = localStorage.getItem("userRole") || "student";
    const name = localStorage.getItem("userName") || "Md Saidul Basar";
    setUserName(name);
    
    if (role === "admin") {
      setUserRoleLabel("System Administrator");
      setUserAvatar("/global/logo2.png");
    } else if (role === "teacher") {
      setUserRoleLabel("Lead Instructor");
      setUserAvatar("/global/logo2.png");
    } else {
      setUserRoleLabel("Student Account");
      setUserAvatar("/user/md-saidul.jpeg");
    }

    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSearchDropdown(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setShowNotifDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, unread: false })));
  };

  const deleteNotification = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const handleSearchSelect = (href: string) => {
    setSearchQuery("");
    setShowSearchDropdown(false);
    router.push(href);
  };

  return (
    <header className="h-20 bg-white/95 backdrop-blur-md border-b border-[#dd6b01]/10 fixed top-0 left-0 lg:left-72 right-0 z-40 transition-all">
      <div className="max-w-7xl mx-auto h-full flex items-center justify-between px-6">
        
        {/* Functional Search Bar */}
        <div ref={searchRef} className="flex items-center gap-4 w-full max-w-md relative">
          <div className="relative w-full">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search exams, packs..." 
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setShowSearchDropdown(true);
              }}
              onFocus={() => setShowSearchDropdown(true)}
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#dd6b01]/20 focus:border-[#dd6b01] transition-all font-sans text-sm"
            />
          </div>

          {/* Search Dropdown Overlay */}
          {showSearchDropdown && searchQuery.trim() !== "" && (
            <div className="absolute top-full left-0 w-full mt-2 bg-white border border-gray-100 rounded-2xl shadow-xl z-50 p-2 text-left font-sans max-h-80 overflow-y-auto">
              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider px-3 py-1.5 block">Search Results</span>
              {matchingItems.length > 0 ? (
                <div className="space-y-1 mt-1">
                  {matchingItems.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => handleSearchSelect(item.href)}
                      className="w-full flex items-start gap-3 p-2.5 rounded-xl hover:bg-orange-50/50 hover:text-[#dd6b01] text-left transition-all group"
                    >
                      <div className="w-8 h-8 rounded-lg bg-orange-50 text-[#dd6b01] flex items-center justify-center text-sm shrink-0">
                        <FaBookOpen />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-sm font-semibold text-gray-800 truncate group-hover:text-[#dd6b01]">{item.title}</p>
                          <span className="text-[9px] bg-orange-100/50 text-[#dd6b01] font-bold px-1.5 py-0.5 rounded border border-orange-200 uppercase leading-none shrink-0">{item.category}</span>
                        </div>
                        <p className="text-xs text-gray-400 truncate mt-0.5">{item.desc}</p>
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="py-6 text-center text-gray-400">
                  <FaSearch className="mx-auto text-xl mb-2 opacity-50" />
                  <p className="text-xs font-semibold">No results found for &quot;{searchQuery}&quot;</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Action Controls & Notifications */}
        <div className="flex items-center gap-6">
          
          {/* Functional Notification Center */}
          <div ref={notifRef} className="relative">
            <button 
              onClick={() => setShowNotifDropdown(!showNotifDropdown)}
              className="relative p-2 text-gray-500 hover:bg-gray-50 rounded-full transition-colors cursor-pointer"
            >
              <FaBell className="text-xl" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-red-500 text-white rounded-full border border-white text-[9px] font-bold flex items-center justify-center animate-pulse">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Notifications Dropdown Panel */}
            {showNotifDropdown && (
              <div className="absolute top-full right-0 w-80 mt-2 bg-white border border-gray-100 rounded-2xl shadow-xl z-50 p-4 text-left font-sans">
                <div className="flex items-center justify-between border-b border-gray-100 pb-3 mb-3">
                  <div>
                    <h3 className="text-sm font-bold text-gray-800">Notifications</h3>
                    <p className="text-[10px] text-gray-400 mt-0.5">{unreadCount} unread items</p>
                  </div>
                  {unreadCount > 0 && (
                    <button 
                      onClick={markAllAsRead}
                      className="text-[10px] font-bold text-[#dd6b01] hover:underline"
                    >
                      Mark all as read
                    </button>
                  )}
                </div>

                {notifications.length > 0 ? (
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {notifications.map((n) => (
                      <div 
                        key={n.id} 
                        className={`flex items-start gap-2.5 p-2.5 rounded-xl border border-transparent transition relative group ${
                          n.unread ? "bg-orange-50/20 border-orange-100/50" : "hover:bg-gray-50"
                        }`}
                      >
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs shrink-0 mt-0.5 ${
                          n.type === "success" ? "bg-green-50 text-green-600" : "bg-blue-50 text-blue-600"
                        }`}>
                          {n.type === "success" ? <FaCheckCircle /> : <FaExclamationCircle />}
                        </div>
                        <div className="flex-1 pr-4">
                          <p className={`text-xs ${n.unread ? "font-bold text-gray-800" : "text-gray-600"}`}>{n.title}</p>
                          <p className="text-[10px] text-gray-400 mt-0.5 leading-normal">{n.desc}</p>
                          <span className="text-[9px] text-gray-400 mt-1 block">{n.time}</span>
                        </div>
                        <button
                          onClick={(e) => deleteNotification(n.id, e)}
                          className="absolute top-2 right-2 p-1 text-gray-300 hover:text-gray-600 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <FaTimes className="text-[10px]" />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-8 text-center text-gray-400">
                    <FaBell className="mx-auto text-2xl mb-2 opacity-50" />
                    <p className="text-xs font-semibold">All caught up!</p>
                    <p className="text-[10px] text-gray-400 mt-0.5">No new notifications here.</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* User Account Info */}
          <div className="flex items-center gap-3 pl-6 border-l border-gray-100">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-bold text-gray-800 leading-none">{userName}</p>
              <p className="text-xs text-gray-500 mt-1">{userRoleLabel}</p>
            </div>
            <div className="w-10 h-10 rounded-full border-2 border-[#dd6b01]/20 overflow-hidden shadow-sm hover:border-[#dd6b01]/50 transition-all cursor-pointer relative bg-orange-50 flex items-center justify-center font-bold text-[#dd6b01]">
              {userAvatar && (userAvatar.includes(".jpeg") || userAvatar.includes(".png") || userAvatar.includes(".jpg")) ? (
                <Image 
                  src={userAvatar} 
                  alt="Profile" 
                  width={40} 
                  height={40}
                  className="object-cover w-full h-full"
                  onError={() => setUserAvatar("")}
                />
              ) : (
                userName.charAt(0)
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
