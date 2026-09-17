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
  totalMarks?: number;
  passingPercent?: number;
}

export default function Scorecard({ result, totalMarks, passingPercent }: ScorecardProps) {
  const { total, correct, wrong, negative, finalScore, passed } = result;

  const maxMarks = totalMarks || total;
  const rawPercentage = maxMarks > 0 ? (finalScore / maxMarks) * 100 : 0;
  const percentage = Math.max(0, Math.min(100, Math.round(rawPercentage)));
  const passThreshold = maxMarks * ((passingPercent && passingPercent > 0 ? passingPercent : 33) / 100);
  
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
      <div className="flex-1 flex flex-col items-center justify-center p-5 bg-white border border-slate-200/80 rounded shadow-xs">
        {/* Radial Progress SVG */}
        <div className="relative w-32 h-32 flex items-center justify-center mb-3">
          <svg className="w-full h-full transform -rotate-90">
            {/* Background Track */}
            <circle
              cx="64"
              cy="64"
              r={radius}
              className="stroke-slate-100 fill-none"
              strokeWidth={strokeWidth}
            />
            {/* Progress Stroke */}
            <circle
              cx="64"
              cy="64"
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
            <span className="text-2xl font-mono font-black text-slate-900 leading-none">{percentage}%</span>
            <span className="text-[9px] font-mono text-slate-400 font-bold uppercase tracking-wider mt-1">SCORE</span>
          </div>
        </div>

        {/* Pass/Fail Status Pill */}
        <div className={`flex items-center gap-1.5 px-3 py-1 rounded border text-xs font-mono font-bold shadow-xs ${accentBgClass}`}>
          {passed ? (
            <>
              <FaTrophy className="text-xs" />
              <span>Passed Assessment</span>
            </>
          ) : (
            <>
              <FaTimesCircle className="text-xs" />
              <span>Result: Failed</span>
            </>
          )}
        </div>
      </div>

      {/* Right Column: Stats Details Grid & Final Score Summary */}
      <div className="flex-1 flex flex-col justify-between gap-3">
        {/* Stats Details Grid */}
        <div className="grid grid-cols-2 gap-2.5">
          {/* Total Questions */}
          <div className="bg-white border border-slate-200/80 rounded p-2.5 flex flex-col items-center justify-center text-center">
            <div className="w-6 h-6 rounded bg-orange-50 text-[#dd6b01] flex items-center justify-center text-xs mb-1">
              <FaListUl />
            </div>
            <span className="text-[9px] font-mono text-slate-400 font-bold uppercase tracking-wider">Total Questions</span>
            <span className="text-base font-mono font-bold text-slate-800 mt-0.5">{total}</span>
          </div>

          {/* Accuracy */}
          <div className="bg-white border border-slate-200/80 rounded p-2.5 flex flex-col items-center justify-center text-center">
            <div className="w-6 h-6 rounded bg-green-50 text-green-600 flex items-center justify-center text-xs mb-1">
              <FaBullseye />
            </div>
            <span className="text-[9px] font-mono text-slate-400 font-bold uppercase tracking-wider">Correct</span>
            <span className="text-base font-mono font-bold text-green-600 mt-0.5">{correct}</span>
          </div>

          {/* Wrong */}
          <div className="bg-white border border-slate-200/80 rounded p-2.5 flex flex-col items-center justify-center text-center">
            <div className="w-6 h-6 rounded bg-red-50 text-red-600 flex items-center justify-center text-xs mb-1">
              <FaTimesCircle />
            </div>
            <span className="text-[9px] font-mono text-slate-400 font-bold uppercase tracking-wider">Wrong</span>
            <span className="text-base font-mono font-bold text-red-600 mt-0.5">{wrong}</span>
          </div>

          {/* Negative Marks */}
          <div className="bg-white border border-slate-200/80 rounded p-2.5 flex flex-col items-center justify-center text-center">
            <div className="w-6 h-6 rounded bg-yellow-50 text-yellow-600 flex items-center justify-center text-xs mb-1">
              <FaMinusCircle />
            </div>
            <span className="text-[9px] font-mono text-slate-400 font-bold uppercase tracking-wider">Negative</span>
            <span className="text-base font-mono font-bold text-yellow-600 mt-0.5">-{Math.abs(negative).toFixed(2)}</span>
          </div>
        </div>

        {/* Summary Score Bar */}
        <div className="bg-orange-50/50 border border-orange-200 rounded p-2.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded bg-primary" />
            <span className="text-xs font-bold text-slate-700">Final Evaluated Mark</span>
          </div>
          <span className="text-base font-mono font-bold text-primary">
            {finalScore.toFixed(2)} / {maxMarks}
          </span>
        </div>
      </div>
    </div>
  );
}
