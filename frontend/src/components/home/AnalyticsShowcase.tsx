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
            <span className="text-xs text-primary font-bold uppercase tracking-widest bg-primary/10 border border-primary/20 px-3.5 py-1.5 rounded-full inline-block">
              Performance Insights
            </span>
            <h2 className="text-2xl sm:text-4xl font-black text-gray-900 leading-tight tracking-tight">
              Actionable Performance Analytics <br className="hidden sm:inline" />
              That Drive Continuous Improvement
            </h2>
            <p className="text-gray-600 text-sm sm:text-base font-medium leading-relaxed">
              Never guess your prep standing again. Our dynamic analytics dashboard transforms raw score metrics into actionable study insights, identifying precise strengths and key areas for focus.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="p-4 rounded-2xl bg-orange-50/60 border border-orange-100 flex items-start gap-3">
                <div className="p-2.5 rounded-xl bg-orange-100 text-primary">
                  <FaTrophy size={18} />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 text-sm">Instant Scorecards</h4>
                  <p className="text-xs text-gray-500 font-medium mt-0.5">Automated scoring with accuracy breakdown.</p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-blue-50/60 border border-blue-100 flex items-start gap-3">
                <div className="p-2.5 rounded-xl bg-blue-100 text-blue-600">
                  <FaStopwatch size={18} />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 text-sm">Pacing & Time Metrics</h4>
                  <p className="text-xs text-gray-500 font-medium mt-0.5">Per-question time spent analysis.</p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-purple-50/60 border border-purple-100 flex items-start gap-3">
                <div className="p-2.5 rounded-xl bg-purple-100 text-purple-600">
                  <FaBullseye size={18} />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 text-sm">Topic Weakness Radar</h4>
                  <p className="text-xs text-gray-500 font-medium mt-0.5">Pinpoint exact sub-topics needing practice.</p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-100 flex items-start gap-3">
                <div className="p-2.5 rounded-xl bg-emerald-100 text-emerald-600">
                  <FaChartLine size={18} />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 text-sm">Historical Progress</h4>
                  <p className="text-xs text-gray-500 font-medium mt-0.5">Track improvement over weekly tests.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Visual Dashboard Preview */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="relative"
          >
            <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-800 space-y-6">
              {/* Dashboard Header */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-orange-500/20 text-orange-400 flex items-center justify-center font-bold">
                    <FaChartLine />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm sm:text-base text-white">Mock Exam Assessment Report</h3>
                    <p className="text-xs text-slate-400">Mathematics Final Prep • Completed Today</p>
                  </div>
                </div>
                <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-bold">
                  PASSED (88%)
                </span>
              </div>

              {/* Progress Metric Bars */}
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-xs font-bold mb-1">
                    <span className="text-slate-300">Algebra & Functions</span>
                    <span className="text-emerald-400">95% Mastery</span>
                  </div>
                  <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
                    <div className="bg-emerald-500 h-full rounded-full" style={{ width: "95%" }}></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-bold mb-1">
                    <span className="text-slate-300">Calculus & Limits</span>
                    <span className="text-amber-400">82% Mastery</span>
                  </div>
                  <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
                    <div className="bg-amber-500 h-full rounded-full" style={{ width: "82%" }}></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-bold mb-1">
                    <span className="text-slate-300">Probability & Statistics</span>
                    <span className="text-rose-400">64% Mastery (Needs Review)</span>
                  </div>
                  <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
                    <div className="bg-rose-500 h-full rounded-full" style={{ width: "64%" }}></div>
                  </div>
                </div>
              </div>

              {/* Summary Stats Row */}
              <div className="grid grid-cols-3 gap-3 pt-4 border-t border-slate-800 text-center">
                <div className="p-3 rounded-xl bg-slate-800/80">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Score</span>
                  <span className="text-base sm:text-lg font-black text-emerald-400">44 / 50</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-800/80">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Avg Time/Q</span>
                  <span className="text-base sm:text-lg font-black text-amber-400">42 sec</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-800/80">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Accuracy</span>
                  <span className="text-base sm:text-lg font-black text-blue-400">88.0%</span>
                </div>
              </div>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
};
