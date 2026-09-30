"use client";

import { motion } from "framer-motion";
import { PrimaryBtn } from "../ui/PrimaryBtn";
import { OutlineBtn } from "../ui/OutlineBtn";
import { FaRocket, FaShieldAlt } from "react-icons/fa";

export const CTA = () => {
  return (
    <section className="w-full py-16 sm:py-24 bg-white px-4 sm:px-6">
      <div className="max-w-7xl mx-auto">
        <div className="relative rounded overflow-hidden bg-slate-950 text-white text-center py-12 sm:py-16 px-4 sm:px-10 shadow-xs border border-slate-800">
          {/* Ambient Glows */}
          <div className="absolute top-[-40%] left-[-20%] w-[500px] h-[500px] bg-primary/15 rounded blur-3xl pointer-events-none"></div>
          <div className="absolute bottom-[-40%] right-[-20%] w-[500px] h-[500px] bg-amber-500/10 rounded blur-3xl pointer-events-none"></div>
          <div className="absolute inset-0 z-0 opacity-15 bg-[linear-gradient(to_right,#334155_1px,transparent_1px),linear-gradient(to_bottom,#334155_1px,transparent_1px)] bg-[size:3rem_3rem]"></div>

          <div className="relative z-10 space-y-4 sm:space-y-5 max-w-3xl mx-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="inline-flex items-center gap-2 px-3 py-1 rounded bg-white/10 border border-white/20 text-orange-300 font-mono font-bold text-xs uppercase tracking-wider mb-1"
            >
              <FaRocket className="text-primary" /> Assessment Onboarding
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-2xl sm:text-4xl font-bold tracking-tight leading-tight"
            >
              Start measuring your performance <br className="hidden sm:inline" />
              and excel today.
            </motion.h2>

            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="text-xs sm:text-sm text-slate-300 font-medium leading-relaxed max-w-2xl mx-auto"
            >
              Join 1,200+ students mapping out their path to academic and competitive excellence. Free account registration in under 60 seconds.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="flex flex-col sm:flex-row gap-3 justify-center items-center pt-3 sm:pt-4"
            >
              <PrimaryBtn
                link="/auth/register"
                className="w-full sm:w-52 !bg-primary hover:!bg-primary-dark text-white font-bold !py-2.5 text-xs sm:text-sm shadow-xs !rounded"
              >
                Register Now Free
              </PrimaryBtn>
              <OutlineBtn
                link="/auth"
                className="w-full sm:w-52 !bg-slate-900 !border-slate-750 hover:!bg-slate-800 hover:!border-slate-700 text-white font-bold !py-2.5 text-xs sm:text-sm !rounded"
              >
                Sign In to Portal
              </OutlineBtn>
            </motion.div>

            <div className="flex items-center justify-center gap-5 pt-3 text-[11px] font-mono text-slate-400">
              <span className="flex items-center gap-1.5">
                <FaShieldAlt className="text-emerald-400" /> Instant Access
              </span>
              <span>•</span>
              <span>No Credit Card Required</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

