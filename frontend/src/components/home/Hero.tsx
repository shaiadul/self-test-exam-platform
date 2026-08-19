"use client";

import Lottie from "lottie-react";
import landingAnimation from "../../../public/animations/online-exam.json";
import { PrimaryBtn } from "../ui/PrimaryBtn";
import { OutlineBtn } from "../ui/OutlineBtn";
import { motion } from "framer-motion";
import { FaCheckCircle, FaChartLine, FaShieldAlt, FaBolt } from "react-icons/fa";

export const Hero = () => {
  return (
    <section className="relative w-full min-h-screen flex items-center pt-24 sm:pt-32 pb-16 sm:pb-24 px-4 sm:px-6 md:px-12 overflow-hidden bg-gradient-to-b from-orange-50/50 via-white to-white">
      {/* Background Grid Pattern & Glows */}
      <div className="absolute inset-0 z-0 opacity-30 bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] bg-[size:3rem_3rem] sm:bg-[size:4rem_4rem]"></div>
      
      <div className="absolute top-10 right-[-10%] sm:right-[-5%] w-[300px] sm:w-[500px] h-[300px] sm:h-[500px] rounded-full bg-orange-200/30 blur-3xl pointer-events-none z-0"></div>
      <div className="absolute bottom-10 left-[-10%] sm:left-[-5%] w-[250px] sm:w-[400px] h-[250px] sm:h-[400px] rounded-full bg-amber-200/25 blur-3xl pointer-events-none z-0"></div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14 items-center relative z-10 w-full">
        {/* Left Content Column */}
        <div className="text-left space-y-5 sm:space-y-6 max-w-2xl mx-auto lg:mx-0">
          {/* Announcement Pill Badge */}
          <motion.div
            initial={{ opacity: 0, y: -15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-orange-100/80 border border-orange-200/80 text-primary font-bold text-xs uppercase tracking-wider shadow-xs"
          >
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
            </span>
            <span className="flex items-center gap-1.5">
              <FaBolt className="text-amber-500" /> Next-Gen Online Assessment Platform
            </span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-3xl sm:text-5xl lg:text-5xl font-black text-gray-900 leading-[1.15] tracking-tight"
          >
            Test Your Knowledge. <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-amber-500 to-orange-600">
              Excel in Assessments.
            </span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-sm sm:text-lg md:text-xl text-gray-600 leading-relaxed font-medium"
          >
            Practice structured mock exams, analyze real-time dynamic scorecards, and skyrocket your academic performance. Join 1,200+ active learners mastering their curriculum today.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-3.5 pt-2"
          >
            <PrimaryBtn link="/auth" className="w-full sm:w-auto px-7 shadow-lg shadow-primary/20 hover-lift py-3 text-sm sm:text-base font-bold whitespace-nowrap">
              Start Practice Free
            </PrimaryBtn>
            <OutlineBtn link="/auth/register" className="w-full sm:w-auto px-7 hover-lift py-3 text-sm sm:text-base font-bold whitespace-nowrap">
              Create Free Account
            </OutlineBtn>
          </motion.div>

          {/* Trust Highlights */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="grid grid-cols-3 gap-3 sm:gap-6 pt-6 sm:pt-8 border-t border-gray-200/70"
          >
            <div className="flex flex-col">
              <span className="text-xl sm:text-3xl font-black text-gray-900">1,200+</span>
              <span className="text-[11px] sm:text-xs text-gray-500 font-bold mt-0.5">Active Learners</span>
            </div>
            <div className="flex flex-col">
              <span className="text-xl sm:text-3xl font-black text-gray-900">10,000+</span>
              <span className="text-[11px] sm:text-xs text-gray-500 font-bold mt-0.5">Mock Tests Taken</span>
            </div>
            <div className="flex flex-col">
              <span className="text-xl sm:text-3xl font-black text-gray-900">94.2%</span>
              <span className="text-[11px] sm:text-xs text-gray-500 font-bold mt-0.5">Success Rate</span>
            </div>
          </motion.div>
        </div>

        {/* Right Lottie Column with Frame */}
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="relative flex items-center justify-center mt-4 lg:mt-0"
        >
          {/* Glass background frame */}
          <div className="absolute inset-0 bg-gradient-to-tr from-orange-100/50 to-amber-50/50 border border-white/80 rounded-3xl backdrop-blur-sm -rotate-1 sm:-rotate-2 transform scale-102 sm:scale-105 pointer-events-none shadow-xl"></div>
          
          <div className="relative bg-white/90 border border-white/80 rounded-3xl p-4 sm:p-8 backdrop-blur-md shadow-2xl flex flex-col items-center w-full z-10">
            <div className="w-full max-w-xs sm:max-w-md aspect-square flex items-center justify-center">
              <Lottie animationData={landingAnimation} loop={true} className="w-full h-full" />
            </div>

            {/* Responsive floating achievements */}
            <div className="hidden sm:flex absolute top-6 -left-4 bg-white/95 border border-gray-100 rounded-2xl p-3 shadow-xl items-center gap-3 animate-bounce" style={{ animationDuration: "5s" }}>
              <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-base font-bold shadow-xs">
                <FaCheckCircle />
              </div>
              <div className="text-left">
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Instant Review</p>
                <p className="text-xs font-black text-gray-800">100% Detailed Scoring</p>
              </div>
            </div>

            <div className="hidden sm:flex absolute bottom-6 -right-4 bg-white/95 border border-gray-100 rounded-2xl p-3 shadow-xl items-center gap-3 animate-bounce" style={{ animationDuration: "7s" }}>
              <div className="w-9 h-9 rounded-xl bg-orange-50 text-primary flex items-center justify-center text-base font-bold shadow-xs">
                <FaChartLine />
              </div>
              <div className="text-left">
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">LMS Tracks</p>
                <p className="text-xs font-black text-gray-800">Real-time Analytics</p>
              </div>
            </div>

            {/* Mobile bottom badges */}
            <div className="flex sm:hidden items-center justify-between w-full pt-4 gap-2 border-t border-gray-100 mt-2">
              <div className="flex items-center gap-2 bg-emerald-50/80 px-2.5 py-1.5 rounded-xl border border-emerald-100">
                <FaCheckCircle className="text-emerald-500 text-xs" />
                <span className="text-[11px] font-bold text-emerald-800">Instant Evaluation</span>
              </div>
              <div className="flex items-center gap-2 bg-orange-50/80 px-2.5 py-1.5 rounded-xl border border-orange-100">
                <FaShieldAlt className="text-primary text-xs" />
                <span className="text-[11px] font-bold text-orange-800">Secure Testing</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

