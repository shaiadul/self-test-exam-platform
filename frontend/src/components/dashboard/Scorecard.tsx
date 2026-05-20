"use client";

import React from "react";
import { FaCheckCircle, FaTimesCircle, FaListUl, FaBullseye, FaMinusCircle, FaTrophy } from "react-icons/fa";

interface ScorecardProps {
  result: {
    total: number;
    correct: number;
    wrong: number;
    negative: number;
    finalScore: number;
    passed: boolean;
  };
}

export default function Scorecard({ result }: ScorecardProps) {
  const { total, correct, wrong, negative, finalScore, passed } = result;

  // Prevent division by zero
  const rawPercentage = total > 0 ? (finalScore / total) * 100 : 0;
  const percentage = Math.max(0, Math.min(100, Math.round(rawPercentage)));
  
  // Calculate SVG circle properties
  const radius = 60;
  const strokeWidth = 10;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  // Curated theme classes based on pass/fail status
  const accentColor = passed ? "#10b981" : "#ef4444"; // emerald vs red
  const accentBgClass = passed ? "bg-emerald-50 text-emerald-600 border-emerald-200" : "bg-red-50 text-red-600 border-red-200";

  return (
    <div className="w-full flex flex-col md:flex-row gap-6 items-stretch">
      {/* Left Column: Radial Gauge & Result Badge */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 bg-gradient-to-b from-gray-50/50 to-white border border-gray-100 rounded-3xl shadow-sm">
        {/* Radial Progress SVG */}
        <div className="relative w-36 h-36 flex items-center justify-center mb-4">
          <svg className="w-full h-full transform -rotate-90">
            {/* Background Track */}
            <circle
              cx="72"
              cy="72"
              r={radius}
              className="stroke-gray-100 fill-none"
              strokeWidth={strokeWidth}
            />
            {/* Progress Stroke */}
            <circle
              cx="72"
              cy="72"
              r={radius}
              className="fill-none transition-all duration-1000 ease-out"
              strokeWidth={strokeWidth}
              stroke={accentColor}
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
            />
          </svg>
          {/* Inner Text label */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <span className="text-3xl font-black text-gray-900 leading-none">{percentage}%</span>
            <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mt-1">SCORE</span>
          </div>
        </div>

        {/* Pass/Fail Status Pill */}
        <div className={`flex items-center gap-2 px-6 py-2 rounded-full border text-sm font-bold shadow-sm ${accentBgClass}`}>
          {passed ? (
            <>
              <FaTrophy className="animate-bounce" />
              <span>Congratulation! Passed</span>
            </>
          ) : (
            <>
              <FaTimesCircle className="animate-pulse" />
              <span>Failed - Try Again</span>
            </>
          )}
        </div>
      </div>

      {/* Right Column: Stats Details Grid & Final Score Summary */}
      <div className="flex-1 flex flex-col justify-between gap-4">
        {/* Stats Details Grid */}
        <div className="grid grid-cols-2 gap-3">
          {/* Total Questions */}
          <div className="bg-white border border-gray-100 rounded-2xl p-3 flex flex-col items-center justify-center text-center hover:shadow-md transition-shadow">
            <div className="w-8 h-8 rounded-lg bg-orange-50 text-[#dd6b01] flex items-center justify-center text-sm mb-1.5">
              <FaListUl />
            </div>
            <span className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">Total Questions</span>
            <span className="text-lg font-black text-gray-800 mt-0.5">{total}</span>
          </div>

          {/* Accuracy */}
          <div className="bg-white border border-gray-100 rounded-2xl p-3 flex flex-col items-center justify-center text-center hover:shadow-md transition-shadow">
            <div className="w-8 h-8 rounded-lg bg-green-50 text-green-600 flex items-center justify-center text-sm mb-1.5">
              <FaBullseye />
            </div>
            <span className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">Correct</span>
            <span className="text-lg font-black text-green-600 mt-0.5">{correct}</span>
          </div>

          {/* Wrong */}
          <div className="bg-white border border-gray-100 rounded-2xl p-3 flex flex-col items-center justify-center text-center hover:shadow-md transition-shadow">
            <div className="w-8 h-8 rounded-lg bg-red-50 text-red-600 flex items-center justify-center text-sm mb-1.5">
              <FaTimesCircle />
            </div>
            <span className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">Wrong</span>
            <span className="text-lg font-black text-red-600 mt-0.5">{wrong}</span>
          </div>

          {/* Negative Marks */}
          <div className="bg-white border border-gray-100 rounded-2xl p-3 flex flex-col items-center justify-center text-center hover:shadow-md transition-shadow">
            <div className="w-8 h-8 rounded-lg bg-yellow-50 text-yellow-600 flex items-center justify-center text-sm mb-1.5">
              <FaMinusCircle />
            </div>
            <span className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">Negative Marks</span>
            <span className="text-lg font-black text-yellow-600 mt-0.5">-{Math.abs(negative).toFixed(2)}</span>
          </div>
        </div>

        {/* Summary Score Bar */}
        <div className="bg-orange-50/50 border border-orange-100 rounded-2xl p-3.5 flex items-center justify-between">
          <div>
            <span className="text-[10px] text-gray-500 font-medium">Final Score</span>
            <p className="text-xl font-black text-gray-900 leading-tight">
              {finalScore.toFixed(2)} <span className="text-xs font-semibold text-gray-500">/ {total}</span>
            </p>
          </div>
          <div className="flex items-center gap-1 text-[10px] font-semibold text-[#dd6b01] bg-orange-100/50 px-2 py-1 rounded-lg border border-orange-200">
            <FaCheckCircle />
            <span>Pass: {(total * 0.5).toFixed(1)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
