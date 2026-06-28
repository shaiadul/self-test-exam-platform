"use client";

import { motion } from "framer-motion";
import { PrimaryBtn } from "../ui/PrimaryBtn";
import { OutlineBtn } from "../ui/OutlineBtn";

export const CTA = () => {
  return (
    <section className="w-full py-20 bg-white px-6">
      <div className="max-w-7xl mx-auto">
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-[#7c3aed]/90 text-white text-center py-20 px-6 sm:px-12 shadow-2xl">
          {/* High-tech glow overlays */}
          <div className="absolute top-[-50%] left-[-20%] w-[600px] h-[600px] bg-primary/10 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute bottom-[-50%] right-[-20%] w-[600px] h-[600px] bg-purple-500/10 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute inset-0 z-0 opacity-10 bg-[linear-gradient(to_right,#334155_1px,transparent_1px),linear-gradient(to_bottom,#334155_1px,transparent_1px)] bg-[size:3rem_3rem]"></div>

          <div className="relative z-10 space-y-6 max-w-3xl mx-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="inline-block px-3.5 py-1 rounded-full bg-white/10 border border-white/20 text-white/90 font-bold text-xs uppercase tracking-wider mb-2"
            >
              🚀 Assessment Onboarding
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight leading-tight"
            >
              Start measuring your performance <br className="hidden sm:inline" />
              and excel today.
            </motion.h2>

            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="text-base sm:text-lg text-slate-300 font-medium leading-relaxed max-w-2xl mx-auto"
            >
              Join a community of students mapping out their path to academic and competitive excellence. No credit card required.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-6"
            >
              <PrimaryBtn
                link="/auth/register"
                className="w-full sm:w-52 !bg-white !text-slate-900 hover:!bg-slate-100 py-3 text-base shadow-xl shadow-slate-950/20"
              >
                Register Now
              </PrimaryBtn>
              <OutlineBtn
                link="/auth"
                className="w-full sm:w-52 !bg-transparent !border-white/30 hover:!bg-white/10 hover:!border-white/50 text-white py-3 text-base"
              >
                Sign In Portal
              </OutlineBtn>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};
