"use client";

import { motion } from "framer-motion";
import { FaChartLine, FaTrophy, FaStopwatch, FaBullseye } from "react-icons/fa";

export const AnalyticsShowcase = () => {
  return (
    <section id="statistics" className="w-full py-20 sm:py-28 bg-white relative overflow-hidden">
      {/* Decorative Orbs */}
      <div className="absolute top-1/2 left-0 w-80 h-80 bg-orange-100/40 rounded-full blur-3xl pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          
          {/* Left Text Column */}
          <div className="space-y-6 text-left">
            <span className="text-xs text-primary font-mono font-bold uppercase tracking-widest bg-primary/10 border border-primary/20 px-3 py-1 rounded inline-block">
              Performance Insights
            </span>
            <h2 className="text-2xl sm:text-4xl font-bold text-gray-900 leading-tight tracking-tight">
              Actionable Performance Analytics <br className="hidden sm:inline" />
              That Drive Continuous Improvement
            </h2>
            <p className="text-gray-600 text-sm sm:text-base font-medium leading-relaxed">
              Never guess your prep standing again. Our dynamic analytics dashboard transforms raw score metrics into actionable study insights, identifying precise strengths and key areas for focus.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
              <div className="p-3.5 rounded bg-orange-50/60 border border-orange-100 flex items-start gap-3">
                <div className="p-2 rounded bg-orange-100 text-primary">
                  <FaTrophy size={16} />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 text-xs sm:text-sm">Instant Scorecards</h4>
                  <p className="text-xs text-gray-500 font-medium mt-0.5">Automated scoring with accuracy breakdown.</p>
                </div>
              </div>

              <div className="p-3.5 rounded bg-blue-50/60 border border-blue-100 flex items-start gap-3">
                <div className="p-2 rounded bg-blue-100 text-blue-600">
                  <FaStopwatch size={16} />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 text-xs sm:text-sm">Pacing & Time Metrics</h4>
                  <p className="text-xs text-gray-500 font-medium mt-0.5">Per-question time spent analysis.</p>
                </div>
              </div>

              <div className="p-3.5 rounded bg-purple-50/60 border border-purple-100 flex items-start gap-3">
                <div className="p-2 rounded bg-purple-100 text-purple-600">
                  <FaBullseye size={16} />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 text-xs sm:text-sm">Topic Weakness Radar</h4>
                  <p className="text-xs text-gray-500 font-medium mt-0.5">Pinpoint exact sub-topics needing practice.</p>
                </div>
              </div>

              <div className="p-3.5 rounded bg-emerald-50/60 border border-emerald-100 flex items-start gap-3">
                <div className="p-2 rounded bg-emerald-100 text-emerald-600">
                  <FaChartLine size={16} />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 text-xs sm:text-sm">Historical Progress</h4>
                  <p className="text-xs text-gray-500 font-medium mt-0.5">Track improvement over weekly tests.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Visual Dashboard Preview */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="relative"
          >
            <div className="bg-slate-900 text-white rounded p-5 sm:p-7 shadow-xs border border-slate-800 space-y-5">
              {/* Dashboard Header */}
              <div className="flex items-center justify-between pb-3.5 border-b border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded bg-orange-500/20 text-orange-400 flex items-center justify-center font-bold text-xs">
                    <FaChartLine />
                  </div>
                  <div>
                    <h3 className="font-bold text-xs sm:text-sm text-white">Mock Exam Assessment Report</h3>
                    <p className="text-[10px] font-mono text-slate-400">Mathematics Final Prep • Completed Today</p>
                  </div>
                </div>
                <span className="px-2.5 py-0.5 rounded font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold">
                  PASSED (88%)
                </span>
              </div>

              {/* Progress Metric Bars */}
              <div className="space-y-3 font-mono">
                <div>
                  <div className="flex justify-between text-[11px] font-bold mb-1">
                    <span className="text-slate-300">Algebra & Functions</span>
                    <span className="text-emerald-400">95% Mastery</span>
                  </div>
                  <div className="w-full bg-slate-800 h-2 rounded overflow-hidden">
                    <div className="bg-emerald-500 h-full rounded" style={{ width: "95%" }}></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-[11px] font-bold mb-1">
                    <span className="text-slate-300">Calculus & Limits</span>
                    <span className="text-amber-400">82% Mastery</span>
                  </div>
                  <div className="w-full bg-slate-800 h-2 rounded overflow-hidden">
                    <div className="bg-amber-500 h-full rounded" style={{ width: "82%" }}></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-[11px] font-bold mb-1">
                    <span className="text-slate-300">Probability & Statistics</span>
                    <span className="text-rose-400">64% Mastery (Needs Review)</span>
                  </div>
                  <div className="w-full bg-slate-800 h-2 rounded overflow-hidden">
                    <div className="bg-rose-500 h-full rounded" style={{ width: "64%" }}></div>
                  </div>
                </div>
              </div>

              {/* Summary Stats Row */}
              <div className="grid grid-cols-3 gap-2.5 pt-3.5 border-t border-slate-800 text-center font-mono">
                <div className="p-2.5 rounded bg-slate-800/80 border border-slate-700/50">
                  <span className="text-[9px] text-slate-400 uppercase tracking-wider block">Score</span>
                  <span className="text-sm sm:text-base font-bold text-emerald-400">44 / 50</span>
                </div>
                <div className="p-2.5 rounded bg-slate-800/80 border border-slate-700/50">
                  <span className="text-[9px] text-slate-400 uppercase tracking-wider block">Avg Time/Q</span>
                  <span className="text-sm sm:text-base font-bold text-amber-400">42s</span>
                </div>
                <div className="p-2.5 rounded bg-slate-800/80 border border-slate-700/50">
                  <span className="text-[9px] text-slate-400 uppercase tracking-wider block">Accuracy</span>
                  <span className="text-sm sm:text-base font-bold text-blue-400">88.0%</span>
                </div>
              </div>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
};
