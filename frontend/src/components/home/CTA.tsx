"use client";

import { motion } from "framer-motion";
import { PrimaryBtn } from "../ui/PrimaryBtn";
import { OutlineBtn } from "../ui/OutlineBtn";
import { FaRocket, FaShieldAlt } from "react-icons/fa";

export const CTA = () => {
  return (
    <section className="w-full py-16 sm:py-24 bg-white px-4 sm:px-6">
      <div className="max-w-7xl mx-auto">
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-orange-950/90 text-white text-center py-14 sm:py-20 px-4 sm:px-12 shadow-2xl border border-slate-800">
          {/* Ambient Glows */}
          <div className="absolute top-[-40%] left-[-20%] w-[500px] h-[500px] bg-primary/20 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute bottom-[-40%] right-[-20%] w-[500px] h-[500px] bg-amber-500/15 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute inset-0 z-0 opacity-15 bg-[linear-gradient(to_right,#334155_1px,transparent_1px),linear-gradient(to_bottom,#334155_1px,transparent_1px)] bg-[size:3rem_3rem]"></div>

          <div className="relative z-10 space-y-5 sm:space-y-6 max-w-3xl mx-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 border border-white/20 text-orange-300 font-bold text-xs uppercase tracking-wider mb-2"
            >
              <FaRocket className="text-primary" /> Assessment Onboarding
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight"
            >
              Start measuring your performance <br className="hidden sm:inline" />
              and excel today.
            </motion.h2>

            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="text-sm sm:text-lg text-slate-300 font-medium leading-relaxed max-w-2xl mx-auto"
            >
              Join 1,200+ students mapping out their path to academic and competitive excellence. Free account registration in under 60 seconds.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4 sm:pt-6"
            >
              <PrimaryBtn
                link="/auth/register"
                className="w-full sm:w-56 !bg-gradient-to-r from-primary to-amber-500 text-white font-bold py-3.5 text-base shadow-xl shadow-orange-500/20 hover-lift"
              >
                Register Now Free
              </PrimaryBtn>
              <OutlineBtn
                link="/auth"
                className="w-full sm:w-56 !bg-slate-800/80 !border-slate-700 hover:!bg-slate-800 hover:!border-slate-600 text-white font-bold py-3.5 text-base hover-lift"
              >
                Sign In to Portal
              </OutlineBtn>
            </motion.div>

            <div className="flex items-center justify-center gap-6 pt-4 text-xs font-semibold text-slate-400">
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

