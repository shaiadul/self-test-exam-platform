"use client";

import { motion } from "framer-motion";
import { FaGraduationCap, FaRegChartBar, FaGlobeAsia, FaClock, FaCheckDouble, FaBrain, FaLongArrowAltRight } from "react-icons/fa";
import Link from "next/link";

const features = [
  {
    icon: <FaGraduationCap />,
    iconColor: "text-orange-600 bg-orange-50 border-orange-100",
    title: "Curated Practice Exams",
    description: "Take unlimited course assessments and mock tests mapped precisely to academic curriculum and competitive syllabus patterns."
  },
  {
    icon: <FaRegChartBar />,
    iconColor: "text-blue-600 bg-blue-50 border-blue-100",
    title: "Granular Performance Analytics",
    description: "Break down your results down to per-question markings, negative-marks ratios, class rankings, and pacing statistics."
  },
  {
    icon: <FaGlobeAsia />,
    iconColor: "text-purple-600 bg-purple-50 border-purple-100",
    title: "Seamless Cross-Device Sync",
    description: "Assess yourself on the go. Self Test works seamlessly across mobile phones, tablets, laptops, and desktop workstations."
  },
  {
    icon: <FaClock />,
    iconColor: "text-amber-600 bg-amber-50 border-amber-100",
    title: "Real-Time Exam Timer",
    description: "Build time-management discipline under exam conditions with custom countdown timers and section pacing indicators."
  },
  {
    icon: <FaCheckDouble />,
    iconColor: "text-emerald-600 bg-emerald-50 border-emerald-100",
    title: "Instant Step-by-Step Solutions",
    description: "Review detailed answer keys, step-by-step mathematical proofs, and conceptual hints immediately upon test completion."
  },
  {
    icon: <FaBrain />,
    iconColor: "text-rose-600 bg-rose-50 border-rose-100",
    title: "Topic Weakness Identification",
    description: "Identify exact sub-topic knowledge gaps with automated topic mastery recommendations tailored to your score history."
  }
];

export const Features = () => {
  return (
    <section id="features" className="w-full py-20 sm:py-28 bg-white relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-14 sm:mb-20 space-y-4">
          <span className="text-xs text-primary font-bold uppercase tracking-widest bg-primary/10 border border-primary/20 px-3.5 py-1.5 rounded-full inline-block">
            Comprehensive Feature Suite
          </span>
          <h2 className="text-2xl sm:text-4xl font-black text-gray-900 tracking-tight leading-tight">
            Assessing your knowledge has <br className="hidden sm:inline" />
            never been this seamless.
          </h2>
          <p className="text-gray-500 font-medium text-sm sm:text-base leading-relaxed">
            Discover a professional suite of tools designed to help you prepare, track, and execute assessments flawlessly.
          </p>
        </div>

        {/* Features Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              className="flex flex-col text-left p-6 sm:p-8 bg-white border border-gray-200/80 rounded-3xl shadow-xs hover:shadow-xl hover:border-primary/30 transition-all duration-300 group"
            >
              {/* Icon container */}
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-lg mb-6 border shadow-xs ${feature.iconColor} transform group-hover:scale-110 transition-transform duration-300`}>
                {feature.icon}
              </div>
              
              <h3 className="text-lg font-black text-gray-900 mb-3 group-hover:text-primary transition-colors duration-300">
                {feature.title}
              </h3>
              
              <p className="text-gray-500 text-sm font-medium leading-relaxed mb-6 flex-1">
                {feature.description}
              </p>

              {/* Action link */}
              <Link href="/auth" className="flex items-center gap-2 text-xs font-bold text-primary hover:text-primary-dark transition-colors cursor-pointer w-fit group/link">
                <span>Explore assessments</span>
                <FaLongArrowAltRight className="transform group-hover/link:translate-x-1.5 transition-transform duration-300" />
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

