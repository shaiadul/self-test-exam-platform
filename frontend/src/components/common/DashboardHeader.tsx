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
  const [userName, setUserName] = useState("User");
  const [userRoleLabel, setUserRoleLabel] = useState("Student Account");
  const [userAvatar, setUserAvatar] = useState<string | null>(null);

  // Refs for clicking outside
  const searchRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter(n => n.unread).length;

  const matchingItems = searchQuery.trim() === "" ? [] : searchData.filter(item => 
    item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const syncUserData = (userData?: any) => {
    if (typeof window === "undefined") return;

    const role = userData?.role || localStorage.getItem("userRole") || "student";
    const name = userData?.name || localStorage.getItem("userName") || "User";
    const image = userData?.image !== undefined 
      ? userData.image 
      : (localStorage.getItem("userImage") || null);

    setUserName(name);
    setUserAvatar(image && image.trim() !== "" ? image : null);

    if (role === "admin") {
      setUserRoleLabel("System Administrator");
    } else if (role === "teacher") {
      setUserRoleLabel("Lead Instructor");
    } else {
      setUserRoleLabel("Student Account");
    }
  };

  useEffect(() => {
    // 1. Initial sync from localStorage
    syncUserData();

    // 2. Fetch fresh profile from backend
    const fetchFreshProfile = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;
        const res = await fetch("http://localhost:8080/api/auth/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const profile = await res.json();
          if (profile) {
            if (profile.name) localStorage.setItem("userName", profile.name);
            if (profile.image) {
              localStorage.setItem("userImage", profile.image);
            }
            syncUserData(profile);
          }
        }
      } catch (e) {
        // Silently keep localStorage values
      }
    };
    fetchFreshProfile();

    // 3. Listen for profile updates dispatched across components
    const handleProfileUpdate = (e: any) => {
      syncUserData(e.detail);
    };

    window.addEventListener("profileUpdated", handleProfileUpdate);
    window.addEventListener("storage", () => syncUserData());

    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSearchDropdown(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setShowNotifDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      window.removeEventListener("profileUpdated", handleProfileUpdate);
      window.removeEventListener("storage", () => syncUserData());
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);


  const inputRef = useRef<HTMLInputElement>(null);

  // Keyboard shortcut Ctrl+K / Cmd+K to focus search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        inputRef.current?.focus();
        setShowSearchDropdown(true);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
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
    <header className="h-16 bg-white/95 backdrop-blur-md border-b border-slate-200/80 fixed top-0 left-0 lg:left-72 right-0 z-40 transition-all select-none">
      <div className="max-w-7xl mx-auto h-full flex items-center justify-between px-4 sm:px-6">
        
        {/* Functional Search Bar */}
        <div ref={searchRef} className="flex items-center gap-4 w-full max-w-sm sm:max-w-md relative">
          <div className="relative w-full">
            <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs" />
            <input 
              ref={inputRef}
              type="text" 
              placeholder="Search exams, packs..." 
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setShowSearchDropdown(true);
              }}
              onFocus={() => setShowSearchDropdown(true)}
              className="w-full pl-9 pr-14 py-2 bg-slate-50 hover:bg-slate-100/70 border border-slate-200/80 rounded focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-xs font-medium text-slate-800 placeholder:text-slate-400 shadow-2xs"
            />
            <kbd className="hidden sm:inline-flex absolute right-2.5 top-1/2 -translate-y-1/2 px-1.5 py-0.5 text-[10px] font-bold text-slate-400 bg-white border border-slate-200 rounded shadow-2xs pointer-events-none">
              ⌘K
            </kbd>
          </div>

          {/* Search Dropdown Overlay */}
          {showSearchDropdown && searchQuery.trim() !== "" && (
            <div className="absolute top-full left-0 w-full mt-2 bg-white border border-slate-200/80 rounded shadow-lg z-50 p-2 text-left font-sans max-h-80 overflow-y-auto custom-scrollbar">
              <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider px-3 py-1.5 block">Search Results</span>
              {matchingItems.length > 0 ? (
                <div className="space-y-1 mt-1">
                  {matchingItems.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => handleSearchSelect(item.href)}
                      className="w-full flex items-start gap-3 p-2.5 rounded hover:bg-primary/5 hover:text-primary text-left transition-all group cursor-pointer"
                    >
                      <div className="w-8 h-8 rounded bg-primary/10 text-primary flex items-center justify-center text-xs shrink-0">
                        <FaBookOpen />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-xs font-bold text-slate-800 truncate group-hover:text-primary">{item.title}</p>
                          <span className="text-[9px] bg-primary/10 text-primary font-extrabold px-1.5 py-0.5 rounded border border-primary/20 uppercase leading-none shrink-0">{item.category}</span>
                        </div>
                        <p className="text-[11px] text-slate-400 truncate mt-0.5">{item.desc}</p>
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="py-6 text-center text-slate-400">
                  <FaSearch className="mx-auto text-lg mb-1.5 opacity-40" />
                  <p className="text-xs font-semibold">No results found for &quot;{searchQuery}&quot;</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Action Controls & Notifications */}
        <div className="flex items-center gap-3 sm:gap-5">
          
          {/* Functional Notification Center */}
          <div ref={notifRef} className="relative">
            <button 
              onClick={() => setShowNotifDropdown(!showNotifDropdown)}
              className="relative p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded transition-colors cursor-pointer"
              aria-label="View notifications"
            >
              <FaBell className="text-lg" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-rose-500 text-white rounded-full border-2 border-white text-[9px] font-black flex items-center justify-center animate-pulse">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Notifications Dropdown Panel */}
            {showNotifDropdown && (
              <div className="absolute top-full right-0 w-80 sm:w-88 mt-2 bg-white border border-slate-200/80 rounded shadow-xl z-50 p-4 text-left font-sans animate-in fade-in zoom-in-95">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-3">
                  <div>
                    <h3 className="text-xs font-bold text-slate-900">Notifications</h3>
                    <p className="text-[10px] text-slate-400">{unreadCount} unread update(s)</p>
                  </div>
                  {unreadCount > 0 && (
                    <button 
                      onClick={markAllAsRead}
                      className="text-[10px] font-bold text-primary hover:underline cursor-pointer"
                    >
                      Mark all read
                    </button>
                  )}
                </div>

                {notifications.length > 0 ? (
                  <div className="space-y-1.5 max-h-64 overflow-y-auto custom-scrollbar pr-1">
                    {notifications.map((n) => (
                      <div 
                        key={n.id} 
                        className={`flex items-start gap-2.5 p-2.5 rounded border transition-all relative group ${
                          n.unread ? "bg-primary/5 border-primary/20" : "border-transparent hover:bg-slate-50"
                        }`}
                      >
                        <div className={`w-6 h-6 rounded flex items-center justify-center text-xs shrink-0 mt-0.5 ${
                          n.type === "success" ? "bg-emerald-50 text-emerald-600" : "bg-sky-50 text-sky-600"
                        }`}>
                          {n.type === "success" ? <FaCheckCircle /> : <FaExclamationCircle />}
                        </div>
                        <div className="flex-1 pr-4">
                          <p className={`text-xs ${n.unread ? "font-bold text-slate-900" : "text-slate-700"}`}>{n.title}</p>
                          <p className="text-[10px] text-slate-500 mt-0.5 leading-normal">{n.desc}</p>
                          <span className="text-[9px] text-slate-400 mt-1 block">{n.time}</span>
                        </div>
                        <button
                          onClick={(e) => deleteNotification(n.id, e)}
                          className="absolute top-2 right-2 p-1 text-slate-300 hover:text-slate-600 rounded opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                          aria-label="Delete notification"
                        >
                          <FaTimes className="text-[9px]" />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-8 text-center text-slate-400">
                    <FaBell className="mx-auto text-xl mb-1.5 opacity-40" />
                    <p className="text-xs font-semibold text-slate-600">All caught up!</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">No new notifications here.</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* User Account Info */}
          <div className="flex items-center gap-3 pl-3 sm:pl-4 border-l border-slate-200/80">
            <div className="text-right hidden sm:block">
              <p className="text-xs font-bold text-slate-900 leading-none">{userName}</p>
              <p className="text-[10px] text-slate-400 mt-1 font-semibold">{userRoleLabel}</p>
            </div>
            <div 
              onClick={() => router.push("/dashboard/edit-profile")}
              className="w-9 h-9 rounded border border-slate-200/80 overflow-hidden shadow-2xs hover:border-primary transition-all cursor-pointer relative bg-gradient-to-br from-primary to-amber-500 flex items-center justify-center font-bold text-white text-xs shrink-0 select-none"
              title="View & Edit Profile"
            >
              {userAvatar ? (
                <img 
                  src={userAvatar} 
                  alt={userName} 
                  className="object-cover w-full h-full"
                  onError={() => setUserAvatar(null)}
                />
              ) : (
                <span>{(userName || "U").trim().charAt(0).toUpperCase()}</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
