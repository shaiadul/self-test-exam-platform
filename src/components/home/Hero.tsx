"use client";

import Lottie from "lottie-react";
import landingAnimation from "../../../public/animations/online-exam.json";
import { PrimaryBtn } from "../ui/PrimaryBtn";
import { OutlineBtn } from "../ui/OutlineBtn";
import { motion } from "framer-motion";

export const Hero = () => {
  return (
    <section className="w-full flex flex-col justify-center items-center text-center py-20 px-4 md:px-10 overflow-hidden">
      <motion.h1 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-4xl md:text-6xl font-bold mb-6 gradient-text"
      >
        Online Exam Platform
      </motion.h1>

      <motion.div 
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="w-64 sm:w-96 mb-8"
      >
        <Lottie animationData={landingAnimation} loop={true} />
      </motion.div>

      <motion.p 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        className="max-w-2xl text-lg md:text-xl text-gray-700 mb-10"
      >
        Practice your skills, take exams, and track your progress. 1200+
        students are using our platform worldwide. Learn, test, and improve in
        one place.
      </motion.p>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.6 }}
        className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center items-center"
      >
        <PrimaryBtn link="/auth" className="w-48 hover-lift">
          Start Now
        </PrimaryBtn>
        <OutlineBtn link="/auth/register" className="w-48 hover-lift">
          Register Now
        </OutlineBtn>
      </motion.div>
    </section>
  );
};
