"use client";

import React, { useState, useEffect, useRef } from "react";
import { FaBell, FaSearch, FaTimes, FaBookOpen, FaCheckCircle, FaExclamationCircle } from "react-icons/fa";
import Image from "next/image";
import { useRouter } from "next/navigation";

import { getAllExamsAction, PaginationMeta } from "../../lib/actions";
import { useUser } from "../../context/UserContext";

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
  const { user } = useUser();
  
  // Search state
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searchMeta, setSearchMeta] = useState<PaginationMeta | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  
  // Notifications state
  const [notifications, setNotifications] = useState<NotifItem[]>(initialNotifications);
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);

  // User Profile from Context
  const [avatarError, setAvatarError] = useState(false);
  const userName = user?.name || "User";
  const rawAvatar = user?.image && user.image.trim() !== "" ? user.image : null;
  const userAvatar = avatarError ? null : rawAvatar;
  const userRole = user?.role?.toLowerCase() || "student";
  const userRoleLabel =
    userRole === "admin"
      ? "System Administrator"
      : userRole === "teacher"
      ? "Lead Instructor"
      : "Student Account";

  // Refs for clicking outside
  const searchRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter(n => n.unread).length;

  useEffect(() => {
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
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);


  // Fetch real exams from server based on search query / on focus
  useEffect(() => {
    if (!showSearchDropdown) return;

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const token = typeof window !== "undefined" ? localStorage.getItem("token") || undefined : undefined;
        const res = await getAllExamsAction(
          {
            search: searchQuery.trim() || undefined,
            page: 1,
            per_page: 8,
          },
          token
        );
        setSearchResults(res?.data || []);
        setSearchMeta(res?.meta || null);
      } catch (err) {
        console.error("Failed to search exams:", err);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery, showSearchDropdown]);

  const inputRef = useRef<HTMLInputElement>(null);

  // Keyboard shortcut Ctrl+K / Cmd+K to focus search, ESC to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        inputRef.current?.focus();
        setShowSearchDropdown(true);
      }
      if (e.key === "Escape") {
        setShowSearchDropdown(false);
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

  const handleSearchSelect = (examId: string) => {
    setSearchQuery("");
    setShowSearchDropdown(false);
    router.push(`/dashboard/exam-pack/exam-pack-details/${examId}`);
  };

  return (
    <header className="h-16 bg-white/95 backdrop-blur-md border-b border-slate-200/80 fixed top-0 left-0 lg:left-72 right-0 z-40 transition-all select-none">
      <div className="max-w-7xl mx-auto h-full flex items-center justify-between px-3.5 sm:px-6">
        
        {/* Functional Search Bar */}
        <div ref={searchRef} className="flex items-center gap-4 w-full max-w-sm sm:max-w-md relative">
          <div className="relative w-full">
            <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs pointer-events-none" />
            <input 
              ref={inputRef}
              type="text" 
              placeholder="Search all exams..." 
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setShowSearchDropdown(true);
              }}
              onFocus={() => setShowSearchDropdown(true)}
              className="w-full pl-9 pr-14 py-2 bg-slate-50 hover:bg-slate-100/70 border border-slate-200/80 rounded focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-xs font-medium text-slate-800 placeholder:text-slate-400 shadow-2xs"
            />
            {searchQuery ? (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery("");
                  inputRef.current?.focus();
                }}
                className="absolute right-9 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
                aria-label="Clear search"
              >
                <FaTimes className="text-[10px]" />
              </button>
            ) : null}
            <kbd className="hidden sm:inline-flex absolute right-2.5 top-1/2 -translate-y-1/2 px-1.5 py-0.5 text-[10px] font-bold text-slate-400 bg-white border border-slate-200 rounded shadow-2xs pointer-events-none">
              ⌘K
            </kbd>
          </div>

          {/* Search Dropdown Overlay */}
          {showSearchDropdown && (
            <div className="absolute top-full left-0 w-full mt-2 bg-white border border-slate-200/80 rounded shadow-xl z-50 p-2 text-left font-sans max-h-96 overflow-y-auto custom-scrollbar animate-in fade-in zoom-in-95">
              <div className="flex items-center justify-between px-3 py-1.5 border-b border-slate-100">
                <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider">
                  {searchQuery.trim() ? "Search Results" : "All Exams"}
                </span>
                {searchMeta && searchMeta.total_items > 0 && (
                  <span className="text-[10px] text-slate-500 font-bold bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                    {searchMeta.total_items} total
                  </span>
                )}
              </div>

              {isSearching ? (
                <div className="py-8 text-center text-slate-400">
                  <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                  <p className="text-xs font-medium">Searching exams...</p>
                </div>
              ) : searchResults.length > 0 ? (
                <>
                  <div className="space-y-1 mt-1.5">
                    {searchResults.map((exam) => (
                      <button
                        key={exam.id}
                        type="button"
                        onClick={() => handleSearchSelect(exam.id)}
                        className="w-full flex items-start gap-3 p-2.5 rounded hover:bg-primary/5 hover:text-primary text-left transition-all group cursor-pointer border border-transparent hover:border-primary/20"
                      >
                        <div className="w-8 h-8 rounded bg-primary/10 text-primary flex items-center justify-center text-xs shrink-0 mt-0.5 group-hover:bg-primary group-hover:text-white transition-colors">
                          <FaBookOpen />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <p className="text-xs font-bold text-slate-800 truncate group-hover:text-primary">
                              {exam.name}
                            </p>
                            <div className="flex items-center gap-1 shrink-0">
                              {exam.level && (
                                <span className="text-[9px] bg-slate-100 text-slate-600 font-semibold px-1.5 py-0.5 rounded border border-slate-200 uppercase leading-none">
                                  {exam.level}
                                </span>
                              )}
                              {exam.batch && (
                                <span className="text-[9px] bg-primary/10 text-primary font-bold px-1.5 py-0.5 rounded border border-primary/20 uppercase leading-none">
                                  {exam.batch}
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-1">
                            <span>{exam.durationMinutes || 30} mins</span>
                            <span>•</span>
                            <span>{exam.totalMarks || 10} marks</span>
                            {exam.isPrivate && (
                              <>
                                <span>•</span>
                                <span className="text-amber-600 font-semibold text-[10px]">Private</span>
                              </>
                            )}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>

                  {searchMeta && searchMeta.total_pages > 1 && (
                    <div className="mt-2 pt-2 border-t border-slate-100 px-3 py-1 text-center">
                      <p className="text-[10px] text-slate-400 font-medium">
                        Showing {searchResults.length} of {searchMeta.total_items} exams (Page {searchMeta.current_page} of {searchMeta.total_pages})
                      </p>
                    </div>
                  )}
                </>
              ) : (
                <div className="py-8 text-center text-slate-400">
                  <FaSearch className="mx-auto text-lg mb-1.5 opacity-30" />
                  <p className="text-xs font-semibold text-slate-600">
                    {searchQuery.trim() ? `No exams found for "${searchQuery}"` : "No exams currently available"}
                  </p>
                  <p className="text-[11px] text-slate-400 mt-0.5">Try searching with a different keyword</p>
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

            {showNotifDropdown && (
              <div className="absolute top-full -right-10 sm:right-0 w-80 sm:w-88 mt-2 bg-white border border-slate-200/80 rounded shadow-xl z-50 p-4 text-left font-sans animate-in fade-in zoom-in-95">
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
                <Image 
                  src={userAvatar} 
                  alt={userName} 
                  width={36}
                  height={36}
                  unoptimized
                  className="object-cover w-full h-full"
                  onError={() => setAvatarError(true)}
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
