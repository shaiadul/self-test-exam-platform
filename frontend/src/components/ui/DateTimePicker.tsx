"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaCalendarAlt,
  FaClock,
  FaPlus,
  FaMinus,
  FaChevronLeft,
  FaChevronRight,
  FaCheck,
} from "react-icons/fa";

interface DateTimePickerProps {
  label?: string;
  value: string;
  onChange: (value: string) => void;
}

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export default function DateTimePicker({
  label,
  value,
  onChange,
}: DateTimePickerProps) {
  const today = new Date();
  const initialDate = value ? new Date(value) : null;

  const [isOpen, setIsOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(initialDate);
  const [hour, setHour] = useState<number>(initialDate?.getHours() ?? 12);
  const [minute, setMinute] = useState<number>(initialDate?.getMinutes() ?? 0);

  const containerRef = useRef<HTMLDivElement>(null);

  // Month & year state
  const [currentMonth, setCurrentMonth] = useState(
    initialDate?.getMonth() ?? today.getMonth()
  );
  const [currentYear, setCurrentYear] = useState(
    initialDate?.getFullYear() ?? today.getFullYear()
  );

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const changeMonth = (delta: number) => {
    let newMonth = currentMonth + delta;
    let newYear = currentYear;
    if (newMonth > 11) {
      newMonth = 0;
      newYear += 1;
    } else if (newMonth < 0) {
      newMonth = 11;
      newYear -= 1;
    }
    if (
      newYear < today.getFullYear() ||
      (newYear === today.getFullYear() && newMonth < today.getMonth())
    )
      return;
    setCurrentMonth(newMonth);
    setCurrentYear(newYear);
  };

  const getDaysInMonth = (month: number, year: number) => {
    const date = new Date(year, month, 1);
    const days: number[] = [];
    while (date.getMonth() === month) {
      days.push(date.getDate());
      date.setDate(date.getDate() + 1);
    }
    return days;
  };

  const updateDateTime = (date: Date, newHour = hour, newMinute = minute) => {
    const updated = new Date(date);
    updated.setHours(newHour);
    updated.setMinutes(newMinute);
    setSelectedDate(updated);
    onChange(updated.toISOString());
  };

  const handleTimeChange = (type: "hour" | "minute", delta: number) => {
    const newHour =
      type === "hour" ? Math.max(0, Math.min(23, hour + delta)) : hour;
    const newMinute =
      type === "minute" ? Math.max(0, Math.min(59, minute + delta)) : minute;

    setHour(newHour);
    setMinute(newMinute);

    if (selectedDate) {
      updateDateTime(selectedDate, newHour, newMinute);
    }
  };

  return (
    <div className="relative w-full space-y-1.5" ref={containerRef}>
      {label && (
        <label className="text-xs font-bold text-slate-700 ml-0.5 block">
          {label}
        </label>
      )}

      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-3 py-2 bg-white border border-slate-300 hover:border-slate-400 rounded text-xs sm:text-sm text-slate-800 transition-all duration-150 focus:border-primary focus:ring-2 focus:ring-primary/15 cursor-pointer shadow-2xs group"
      >
        <span className="flex items-center gap-2 font-medium">
          <FaCalendarAlt className="text-slate-400 group-hover:text-primary transition-colors text-xs" />
          <span className={selectedDate ? "text-slate-900 font-mono text-xs" : "text-slate-400"}>
            {selectedDate
              ? selectedDate.toLocaleString([], {
                  dateStyle: "medium",
                  timeStyle: "short",
                })
              : "Select Date & Time"}
          </span>
        </span>
        <FaClock className="text-slate-400 group-hover:text-primary transition-colors text-xs" />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15 }}
            className="absolute z-50 mt-1 w-full sm:w-80 bg-white border border-slate-200/80 rounded shadow-xl p-3.5 font-sans"
          >
            <div className="space-y-3">
              {/* Month & Year Header */}
              <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                <button
                  type="button"
                  onClick={() => changeMonth(-1)}
                  className="p-1.5 rounded hover:bg-slate-100 text-slate-600 disabled:text-slate-300 transition cursor-pointer"
                  disabled={
                    currentYear === today.getFullYear() &&
                    currentMonth === today.getMonth()
                  }
                >
                  <FaChevronLeft className="text-[10px]" />
                </button>
                <span className="font-mono text-xs font-bold text-slate-900">
                  {MONTHS[currentMonth]} {currentYear}
                </span>
                <button
                  type="button"
                  onClick={() => changeMonth(1)}
                  className="p-1.5 rounded hover:bg-slate-100 text-slate-600 transition cursor-pointer"
                >
                  <FaChevronRight className="text-[10px]" />
                </button>
              </div>

              {/* Weekdays */}
              <div className="grid grid-cols-7 text-center text-[10px] font-mono font-bold text-slate-400 uppercase">
                {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((d) => (
                  <div key={d}>{d}</div>
                ))}
              </div>

              {/* Days Grid */}
              <div className="grid grid-cols-7 gap-1 text-center text-xs">
                {getDaysInMonth(currentMonth, currentYear).map((day) => {
                  const dayDate = new Date(currentYear, currentMonth, day);
                  const isToday =
                    today.getDate() === day &&
                    today.getMonth() === currentMonth &&
                    today.getFullYear() === currentYear;

                  const isSelected =
                    selectedDate?.getDate() === day &&
                    selectedDate?.getMonth() === currentMonth &&
                    selectedDate?.getFullYear() === currentYear;

                  const isPast =
                    dayDate <
                    new Date(
                      today.getFullYear(),
                      today.getMonth(),
                      today.getDate()
                    );

                  return (
                    <button
                      type="button"
                      key={day}
                      onClick={() => {
                        const newDate = new Date(
                          currentYear,
                          currentMonth,
                          day,
                          hour,
                          minute
                        );
                        updateDateTime(newDate);
                      }}
                      disabled={isPast}
                      className={`py-1.5 rounded text-xs font-mono font-medium transition-colors cursor-pointer ${
                        isSelected
                          ? "bg-primary text-white font-bold shadow-2xs"
                          : isToday
                          ? "border border-primary/40 text-primary font-bold"
                          : isPast
                          ? "text-slate-300 cursor-not-allowed"
                          : "hover:bg-slate-100 text-slate-700"
                      }`}
                    >
                      {day}
                    </button>
                  );
                })}
              </div>

              {/* Time Selector */}
              <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">
                    TIME (24H)
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  {/* Hour */}
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleTimeChange("hour", -1)}
                      className="p-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-600 transition cursor-pointer"
                    >
                      <FaMinus size={8} />
                    </button>
                    <span className="w-6 text-center font-mono font-bold text-xs text-slate-900">
                      {hour.toString().padStart(2, "0")}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleTimeChange("hour", 1)}
                      className="p-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-600 transition cursor-pointer"
                    >
                      <FaPlus size={8} />
                    </button>
                  </div>

                  <span className="text-slate-400 font-bold font-mono">:</span>

                  {/* Minute */}
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleTimeChange("minute", -1)}
                      className="p-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-600 transition cursor-pointer"
                    >
                      <FaMinus size={8} />
                    </button>
                    <span className="w-6 text-center font-mono font-bold text-xs text-slate-900">
                      {minute.toString().padStart(2, "0")}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleTimeChange("minute", 1)}
                      className="p-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-600 transition cursor-pointer"
                    >
                      <FaPlus size={8} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Confirm HUD Button */}
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="w-full bg-primary hover:bg-primary-hover text-white py-1.5 rounded text-xs font-bold font-mono shadow-2xs transition flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <FaCheck className="text-[10px]" />
                <span>CONFIRM_DATE_TIME</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
