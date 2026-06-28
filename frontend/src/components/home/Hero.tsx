"use client";

import Lottie from "lottie-react";
import landingAnimation from "../../../public/animations/online-exam.json";
import { PrimaryBtn } from "../ui/PrimaryBtn";
import { OutlineBtn } from "../ui/OutlineBtn";
import { motion } from "framer-motion";
import { FaGraduationCap, FaCheckCircle, FaChartLine } from "react-icons/fa";

export const Hero = () => {
  return (
    <section className="relative w-full min-h-screen flex items-center pt-32 pb-20 px-6 md:px-12 overflow-hidden bg-gradient-to-b from-orange-50/40 via-white to-white">
      {/* Dynamic Background Grid Pattern & Glowing Orbs */}
      <div className="absolute inset-0 z-0 opacity-40 bg-[linear-gradient(to_right,#f1f5f9_1px,transparent_1px),linear-gradient(to_bottom,#f1f5f9_1px,transparent_1px)] bg-[size:4rem_4rem]"></div>
      
      <div className="absolute top-20 right-[-10%] w-[500px] h-[500px] rounded-full bg-orange-100/40 blur-3xl pointer-events-none z-0"></div>
      <div className="absolute bottom-10 left-[-10%] w-[400px] h-[400px] rounded-full bg-amber-100/30 blur-3xl pointer-events-none z-0"></div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center relative z-10 w-full">
        {/* Left Copy Column */}
        <div className="text-left space-y-6 max-w-2xl">
          {/* Announcement Pill Badge */}
          <motion.div
            initial={{ opacity: 0, y: -15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary font-bold text-xs uppercase tracking-wider"
          >
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
            </span>
            Next-Gen Online Assessments
          </motion.div>

          {/* Premium Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl sm:text-5xl md:text-6xl font-black text-gray-900 leading-tight tracking-tight"
          >
            Test Your Knowledge. <br className="hidden sm:inline" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-amber-500">
              Excel in Assessments.
            </span>
          </motion.h1>

          {/* Value Subtitle */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-base sm:text-lg md:text-xl text-gray-600 leading-relaxed font-medium"
          >
            Practice structured mock exams, analyze real-time dynamic scorecards, and skyrocket your academic results. 1,200+ students are already mastering their curriculum with Self Test.
          </motion.p>

          {/* Interactive CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4 pt-2"
          >
            <PrimaryBtn link="/auth" className="w-full sm:w-48 shadow-lg shadow-primary/15 hover-lift py-3 text-base">
              Start Practice Free
            </PrimaryBtn>
            <OutlineBtn link="/auth/register" className="w-full sm:w-48 hover-lift py-3 text-base">
              Create Account
            </OutlineBtn>
          </motion.div>

          {/* Credibility / Trust List */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="grid grid-cols-3 gap-4 pt-8 border-t border-gray-150"
          >
            <div className="flex flex-col">
              <span className="text-2xl font-black text-gray-900">1200+</span>
              <span className="text-xs text-gray-500 font-semibold mt-0.5">Active Learners</span>
            </div>
            <div className="flex flex-col">
              <span className="text-2xl font-black text-gray-900">10k+</span>
              <span className="text-xs text-gray-500 font-semibold mt-0.5">Mock Submissions</span>
            </div>
            <div className="flex flex-col">
              <span className="text-2xl font-black text-gray-900">94.2%</span>
              <span className="text-xs text-gray-500 font-semibold mt-0.5">Passing Success</span>
            </div>
          </motion.div>
        </div>

        {/* Right Lottie Column with Glassmorphic Card Frame */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="relative flex items-center justify-center"
        >
          {/* Dynamic glassmorphic background frame */}
          <div className="absolute inset-0 bg-white/40 border border-white/60 rounded-3xl backdrop-blur-sm -rotate-2 transform scale-105 pointer-events-none shadow-premium"></div>
          
          <div className="relative bg-white/80 border border-white/60 rounded-3xl p-6 sm:p-10 backdrop-blur-md shadow-2xl flex flex-col items-center w-full z-10">
            <div className="w-full max-w-sm sm:max-w-md aspect-square">
              <Lottie animationData={landingAnimation} loop={true} />
            </div>

            {/* floating achievements */}
            <div className="absolute top-10 left-[-20px] bg-white border border-gray-150 rounded-2xl p-3 shadow-xl flex items-center gap-3 animate-bounce" style={{ animationDuration: "6s" }}>
              <div className="w-8 h-8 rounded-xl bg-green-50 text-[#10b981] flex items-center justify-center text-sm">
                <FaCheckCircle />
              </div>
              <div className="text-left">
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Instant Review</p>
                <p className="text-xs font-black text-gray-800">100% Detailed Scoring</p>
              </div>
            </div>

            <div className="absolute bottom-10 right-[-20px] bg-white border border-gray-150 rounded-2xl p-3 shadow-xl flex items-center gap-3 animate-bounce" style={{ animationDuration: "8s" }}>
              <div className="w-8 h-8 rounded-xl bg-orange-50 text-[#dd6b01] flex items-center justify-center text-sm">
                <FaChartLine />
              </div>
              <div className="text-left">
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">LMS Tracks</p>
                <p className="text-xs font-black text-gray-800">Real-time Analytics</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
