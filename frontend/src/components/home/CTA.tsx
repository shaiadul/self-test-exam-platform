"use client";

import { motion } from "framer-motion";
import { PrimaryBtn } from "../ui/PrimaryBtn";
import { OutlineBtn } from "../ui/OutlineBtn";

export const CTA = () => {
  return (
    <section className="w-full py-24 bg-gradient-to-br from-primary-dark to-primary text-white text-center relative overflow-hidden">
      {/* Decorative circles */}
      <div className="absolute top-0 left-0 w-64 h-64 bg-white/10 rounded-full -translate-x-1/2 -translate-y-1/2 blur-3xl"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-white/5 rounded-full translate-x-1/3 translate-y-1/3 blur-3xl"></div>

      <div className="relative z-10 px-4">
        <motion.h2 
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="text-3xl md:text-5xl font-extrabold mb-6"
        >
          Ready to start your journey?
        </motion.h2>
        <motion.p 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="max-w-2xl mx-auto mb-12 text-white/90 text-lg md:text-xl"
        >
          Join thousands of learners improving their skills with our online
          exams platform. Sign up today and get started for free.
        </motion.p>
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="flex flex-col sm:flex-row gap-6 justify-center items-center"
        >
          <PrimaryBtn link="/auth/login" className="bg-white text-primary-dark w-56 hover:bg-gray-100 hover-lift text-lg h-14">
            Sign In Now
          </PrimaryBtn>
          <OutlineBtn link="/auth/register" className="w-56 text-white border-white hover:bg-white/10 hover-lift text-lg h-14">
            Create Account
          </OutlineBtn>
        </motion.div>
      </div>
    </section>
  );
};
