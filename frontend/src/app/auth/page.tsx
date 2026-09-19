"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  FaArrowLeft,
  FaArrowRight,
  FaCheckCircle,
  FaGraduationCap,
  FaShieldAlt,
} from "react-icons/fa";
import Lottie from "lottie-react";
import onlineExamAnimation from "../../../public/animations/online-exam.json";
import { PrimaryBtn } from "../../components/ui/PrimaryBtn";
import { OutlineBtn } from "../../components/ui/OutlineBtn";
import { SocialAuthButtons } from "../../components/auth/SocialAuthButtons";

export default function Auth() {
  return (
    <main className="min-h-screen bg-slate-50 flex flex-col overflow-x-hidden">
      {/* Mobile Top Navigation */}
      <div className="md:hidden flex items-center justify-between px-4 py-3 bg-white border-b border-slate-200/80 sticky top-0 z-30 shadow-2xs">
        <Link href="/" className="flex items-center gap-2">
          <Image
            src="/global/logo2.png"
            alt="Self Test Logo"
            width={130}
            height={28}
            priority
            className="w-auto h-7"
          />
        </Link>
        <Link
          href="/"
          className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-primary transition-colors py-1 px-2.5 rounded hover:bg-slate-100"
        >
          <FaArrowLeft className="text-[10px]" />
          <span>Home</span>
        </Link>
      </div>

      <section className="flex flex-col md:flex-row flex-1 min-h-[calc(100vh-53px)] md:min-h-screen">
        {/* Left Side - Visual Banner */}
        <div className="bg-gradient-to-br from-primary via-primary-dark to-primary-dark w-full md:w-1/2 lg:w-5/12 hidden sm:flex flex-col items-center justify-between p-6 sm:p-8 md:p-10 lg:p-12 text-white relative overflow-hidden">
          {/* Subtle Ambient Shapes */}
          <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none overflow-hidden">
            <div className="absolute -top-12 -left-12 w-48 sm:w-64 h-48 sm:h-64 border-8 border-white rounded-full"></div>
            <div className="absolute -bottom-16 -right-16 w-64 sm:w-96 h-64 sm:h-96 border-4 border-white rounded-full"></div>
          </div>

          {/* Desktop Top Back Link */}
          <div className="hidden md:flex w-full items-center justify-between relative z-10">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-xs font-bold text-white/80 hover:text-white transition-colors group px-2.5 py-1.5 rounded-lg hover:bg-white/10"
            >
              <FaArrowLeft className="text-xs group-hover:-translate-x-0.5 transition-transform" />
              <span>Back to Home</span>
            </Link>
          </div>

          {/* Main Visual Center */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            className="relative z-10 flex flex-col items-center my-auto py-4 sm:py-6 w-full max-w-sm"
          >
            <Link
              href="/"
              className="mb-4 sm:mb-6 md:mb-8 transition-transform hover:scale-102"
            >
              <Image
                src="/global/logo.png"
                alt="Self Test Logo"
                width={320}
                height={64}
                priority
                className="w-auto h-10 sm:h-12 md:h-14 lg:h-16 drop-shadow-sm"
              />
            </Link>

            {/* Responsive Animation Container */}
            <div className="w-full max-w-[170px] xs:max-w-[200px] sm:max-w-[240px] md:max-w-[260px] lg:max-w-[300px] aspect-square flex items-center justify-center">
              <Lottie
                animationData={onlineExamAnimation}
                loop={true}
                className="w-full h-full"
              />
            </div>

            {/* Feature Pills */}
            <div className="hidden sm:flex flex-wrap items-center justify-center gap-2 mt-4 sm:mt-6 text-[11px] font-medium text-white/90">
              <span className="inline-flex items-center gap-1.5 bg-white/15 backdrop-blur-xs px-2.5 py-1 rounded-full border border-white/20">
                <FaCheckCircle className="text-emerald-300 text-[10px]" />{" "}
                Instant Scoring
              </span>
              <span className="inline-flex items-center gap-1.5 bg-white/15 backdrop-blur-xs px-2.5 py-1 rounded-full border border-white/20">
                <FaShieldAlt className="text-amber-300 text-[10px]" />{" "}
                Anti-Cheating
              </span>
              <span className="inline-flex items-center gap-1.5 bg-white/15 backdrop-blur-xs px-2.5 py-1 rounded-full border border-white/20">
                <FaGraduationCap className="text-sky-300 text-[10px]" />{" "}
                Verified Certs
              </span>
            </div>
          </motion.div>

          {/* Left Footer Note */}
          <div className="relative z-10 hidden md:block text-center text-white/70 text-xs font-medium">
            Empowering students & educators worldwide
          </div>
        </div>

        {/* Right Side - Action Content */}
        <div className="w-full md:w-1/2 lg:w-7/12 flex items-center justify-center p-5 sm:p-8 md:p-12 lg:p-16 bg-slate-50/70">
          <div className="max-w-md w-full bg-white md:bg-transparent p-5 sm:p-8 md:p-0 rounded-xl md:rounded-none border border-slate-200/80 md:border-0 shadow-2xs md:shadow-none">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15, duration: 0.5 }}
            >
              <div className="text-center md:text-left mb-6 sm:mb-8">
                <span className="inline-block md:hidden text-[10px] font-mono font-bold uppercase tracking-wider text-primary bg-primary/10 px-2 py-0.5 rounded mb-2">
                  Online Exam Platform
                </span>
                <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-tight mb-2.5 sm:mb-3.5">
                  Your Future Starts{" "}
                  <span className="gradient-text">Here.</span>
                </h1>
                <p className="text-xs sm:text-sm md:text-base text-slate-600 leading-relaxed max-w-md">
                  Practice your skills, take live exams, and achieve your
                  educational goals with our professional online exam platform.
                  Join over 1,200+ students today.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col gap-3 sm:gap-4">
                <PrimaryBtn
                  className="w-full text-sm sm:text-base md:text-lg font-bold hover-lift flex items-center justify-center gap-2 group"
                  link="/auth/login"
                >
                  <span>Sign In to Account</span>
                  <FaArrowRight className="text-xs group-hover:translate-x-1 transition-transform" />
                </PrimaryBtn>

                <div className="relative flex items-center py-2 sm:py-3">
                  <div className="flex-grow border-t border-slate-200"></div>
                  <span className="flex-shrink mx-3 text-slate-400 text-[11px] sm:text-xs font-bold uppercase tracking-wider font-mono">
                    or
                  </span>
                  <div className="flex-grow border-t border-slate-200"></div>
                </div>

                <OutlineBtn
                  className="w-full text-sm sm:text-base md:text-lg font-bold border-2 hover-lift"
                  link="/auth/register"
                >
                  Create New Account
                </OutlineBtn>

                <div className="relative flex items-center py-2 sm:py-3">
                  <div className="flex-grow border-t border-slate-200"></div>
                  <span className="flex-shrink mx-3 text-slate-400 text-[11px] font-bold uppercase tracking-wider font-mono">
                    or quick social access
                  </span>
                  <div className="flex-grow border-t border-slate-200"></div>
                </div>

                <SocialAuthButtons mode="login" />
              </div>

              {/* Trust Footer Note */}
              <p className="text-[11px] sm:text-xs text-slate-400 text-center font-medium mt-6 sm:mt-8 leading-normal">
                By continuing, you agree to the Self Test{" "}
                <Link
                  href="/"
                  className="text-slate-600 hover:text-primary underline"
                >
                  Terms of Service
                </Link>{" "}
                &{" "}
                <Link
                  href="/"
                  className="text-slate-600 hover:text-primary underline"
                >
                  Privacy Policy
                </Link>
                .
              </p>
            </motion.div>
          </div>
        </div>
      </section>
    </main>
  );
}
