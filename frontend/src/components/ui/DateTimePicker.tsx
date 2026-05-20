// // components/ui/DateTimePicker.tsx
// "use client";

// import React from "react";

// interface DateTimePickerProps {
//   label: string;
//   value: string;
//   onChange: (value: string) => void;
// }

// export default function DateTimePicker({ label, value, onChange }: DateTimePickerProps) {
//   return (
//     <div className="flex flex-col gap-1 w-full">
//       <label className="text-sm font-medium text-gray-700">{label}</label>
//       <input
//         type="datetime-local"
//         value={value}
//         onChange={(e) => onChange(e.target.value)}
//         className="w-full px-4 py-3 text-base outline-none border border-[#f97a00] rounded-lg focus:ring-2 focus:ring-[#f97a00] bg-orange-50/20 text-gray-700 transition-all duration-300 hover:bg-orange-50"
//       />
//     </div>
//   );
// }
// components/ui/DateTimePicker.tsx

"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaCalendarAlt,
  FaClock,
  FaPlus,
  FaMinus,
  FaChevronLeft,
  FaChevronRight,
} from "react-icons/fa";

interface DateTimePickerProps {
  label: string;
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

  // Month & year state
  const [currentMonth, setCurrentMonth] = useState(
    initialDate?.getMonth() ?? today.getMonth()
  );
  const [currentYear, setCurrentYear] = useState(
    initialDate?.getFullYear() ?? today.getFullYear()
  );

  // Change month
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
    // Prevent selecting past months
    if (
      newYear < today.getFullYear() ||
      (newYear === today.getFullYear() && newMonth < today.getMonth())
    )
      return;
    setCurrentMonth(newMonth);
    setCurrentYear(newYear);
  };

  // Generate days for current month
  const getDaysInMonth = (month: number, year: number) => {
    const date = new Date(year, month, 1);
    const days: number[] = [];
    while (date.getMonth() === month) {
      days.push(date.getDate());
      date.setDate(date.getDate() + 1);
    }
    return days;
  };

  // Update selectedDate with time
  const updateDateTime = (date: Date, newHour = hour, newMinute = minute) => {
    const updated = new Date(date);
    updated.setHours(newHour);
    updated.setMinutes(newMinute);
    setSelectedDate(updated);
    onChange(updated.toISOString());
  };

  // Time change
  const handleTimeChange = (type: "hour" | "minute", delta: number) => {
    const newHour =
      type === "hour" ? Math.max(0, Math.min(23, hour + delta)) : hour;
    const newMinute =
      type === "minute" ? Math.max(0, Math.min(59, minute + delta)) : minute;

    setHour(newHour);
    setMinute(newMinute);

    // Immediately update date with latest time
    if (selectedDate) {
      updateDateTime(selectedDate, newHour, newMinute);
    }
  };

  // When user clicks a day, always use *latest* hour/minute
  const handleDateClick = (day: number) => {
    const newDate = new Date(currentYear, currentMonth, day);
    updateDateTime(newDate, hour, minute);
  };

  return (
    <div className="relative w-full">
      <label className="text-sm font-semibold text-gray-800 block mb-1">
        {label}
      </label>

      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-4 py-3 bg-gradient-to-r from-orange-50 to-white border-2 border-[#f97a00]/70 rounded-xl text-gray-700 hover:shadow-md hover:border-[#f97a00] transition-all duration-300 focus:ring-2 focus:ring-[#f97a00]"
      >
        <span className="flex items-center gap-2">
          <FaCalendarAlt className="text-[#f97a00]" />
          {selectedDate
            ? selectedDate.toLocaleString([], {
                dateStyle: "medium",
                timeStyle: "short",
              })
            : "Select Date & Time"}
        </span>
        <FaClock className="text-[#f97a00]" />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 25, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.98 }}
            transition={{ duration: 0.3 }}
            className="absolute z-50 mt-2 w-full bg-white/90 backdrop-blur-md border border-orange-200 rounded-2xl shadow-xl p-5"
          >
            <div className="flex flex-col gap-5">
              {/* Month & Year Header */}
              <div className="flex justify-between items-center mb-2">
                <button
                  type="button"
                  onClick={() => changeMonth(-1)}
                  className="p-2 rounded-full hover:bg-orange-100 text-[#f97a00] disabled:text-gray-400"
                  disabled={
                    currentYear === today.getFullYear() &&
                    currentMonth === today.getMonth()
                  }
                >
                  <FaChevronLeft />
                </button>
                <span className="font-semibold">
                  {MONTHS[currentMonth]} {currentYear}
                </span>
                <button
                  type="button"
                  onClick={() => changeMonth(1)}
                  className="p-2 rounded-full hover:bg-orange-100 text-[#f97a00]"
                >
                  <FaChevronRight />
                </button>
              </div>

              {/* Weekdays */}
              <div className="grid grid-cols-7 text-center text-xs text-gray-500 mb-2">
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
                  <div key={d}>{d}</div>
                ))}
              </div>

              {/* Days */}
              <div className="grid grid-cols-7 gap-2 text-center text-sm">
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

                  // Allow today but disable past days
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
                        updateDateTime(newDate); // now immediately updates time too
                      }}
                      disabled={isPast}
                      className={`py-2 rounded-lg font-medium transition-all duration-200 ${
                        isSelected
                          ? "bg-[#f97a00] text-white shadow-sm scale-105"
                          : isToday
                          ? "border border-[#f97a00]/50 text-[#f97a00]"
                          : isPast
                          ? "text-gray-400 cursor-not-allowed"
                          : "hover:bg-orange-100 text-gray-700"
                      }`}
                    >
                      {day}
                    </button>
                  );
                })}
              </div>

              {/* Time Selector */}
              <div className="flex items-center justify-between gap-4 mt-2">
                {/* Hour */}
                <div className="flex flex-col items-center gap-2">
                  <label className="text-xs text-gray-500 font-medium">
                    Hour
                  </label>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleTimeChange("hour", -1)}
                      className="p-2 rounded-full bg-orange-50 hover:bg-orange-100 border border-orange-300 text-[#f97a00] transition-all"
                    >
                      <FaMinus size={10} />
                    </button>
                    <span className="w-12 text-center font-semibold text-gray-800">
                      {hour.toString().padStart(2, "0")}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleTimeChange("hour", 1)}
                      className="p-2 rounded-full bg-orange-50 hover:bg-orange-100 border border-orange-300 text-[#f97a00] transition-all"
                    >
                      <FaPlus size={10} />
                    </button>
                  </div>
                </div>

                {/* Minute */}
                <div className="flex flex-col items-center gap-2">
                  <label className="text-xs text-gray-500 font-medium">
                    Minute
                  </label>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleTimeChange("minute", -1)}
                      className="p-2 rounded-full bg-orange-50 hover:bg-orange-100 border border-orange-300 text-[#f97a00] transition-all"
                    >
                      <FaMinus size={10} />
                    </button>
                    <span className="w-12 text-center font-semibold text-gray-800">
                      {minute.toString().padStart(2, "0")}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleTimeChange("minute", 1)}
                      className="p-2 rounded-full bg-orange-50 hover:bg-orange-100 border border-orange-300 text-[#f97a00] transition-all"
                    >
                      <FaPlus size={10} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Confirm */}
              <motion.button
                type="button"
                whileTap={{ scale: 0.97 }}
                onClick={() => setIsOpen(false)}
                className="w-full bg-gradient-to-r from-[#f97a00] to-[#ffb56b] text-white py-2 rounded-lg font-semibold shadow-md hover:shadow-lg transition-all"
              >
                Confirm Selection
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
