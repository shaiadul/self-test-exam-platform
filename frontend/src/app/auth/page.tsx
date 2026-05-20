"use client";

import { OutlineBtn } from "../../components/ui/OutlineBtn";
import { PrimaryBtn } from "../../components/ui/PrimaryBtn";
import Lottie from "lottie-react";
import onlineExamAnimation from "../../../public/animations/online-exam.json";
import Image from "next/image";
import { motion } from "framer-motion";

export default function Auth() {
  return (
    <main className="min-h-screen bg-white">
      <section className="flex flex-col md:flex-row min-h-screen">
        {/* Left Side - Visual */}
        <div className="bg-gradient-to-br from-primary to-primary-dark w-full md:w-1/2 flex flex-col items-center justify-center p-12 text-white relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
            <div className="absolute top-10 left-10 w-64 h-64 border-8 border-white rounded-full"></div>
            <div className="absolute bottom-20 right-20 w-96 h-96 border-4 border-white rounded-full"></div>
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            className="relative z-10 flex flex-col items-center"
          >
            <Image
              src="/global/logo.png"
              alt="Self Test Logo"
              width={400}
              height={80}
              priority
              className="mb-12 w-auto h-20"
            />
            <div className="w-72 sm:w-96">
              <Lottie animationData={onlineExamAnimation} loop={true} />
            </div>
          </motion.div>
        </div>

        {/* Right Side - Content */}
        <div className="w-full md:w-1/2 flex items-center justify-center p-8 bg-gray-50/50">
          <div className="max-w-md w-full text-center md:text-left">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-6 leading-tight">
                Your Future Starts <span className="gradient-text">Here.</span>
              </h1>
              <p className="text-lg text-gray-600 mb-12 leading-relaxed">
                Practice your skills, take exams, and achieve your goals with
                our professional online exam platform. Join over 1,200+ students
                today.
              </p>

              <div className="flex flex-col gap-4">
                <PrimaryBtn
                  className="w-full h-14 text-lg font-bold hover-lift"
                  link="/auth/login"
                >
                  Sign In to Account
                </PrimaryBtn>
                <div className="relative flex items-center py-4">
                  <div className="flex-grow border-t border-gray-200"></div>
                  <span className="flex-shrink mx-4 text-gray-400 text-sm font-bold uppercase tracking-wider">
                    or
                  </span>
                  <div className="flex-grow border-t border-gray-200"></div>
                </div>
                <OutlineBtn
                  className="w-full h-14 text-lg font-bold border-2 hover-lift"
                  link="/auth/register"
                >
                  Create New Account
                </OutlineBtn>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </main>
  );
}
