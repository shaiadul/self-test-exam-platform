"use client";

import { motion } from "framer-motion";
import { FaSlidersH, FaClock, FaChartPie } from "react-icons/fa";

const steps = [
  {
    step: "01",
    icon: <FaSlidersH className="text-primary" />,
    title: "Select or Customize Exam",
    description: "Choose from pre-built curriculum mocks or create custom quizzes tailored to specific subjects, difficulty levels, and time limits.",
    badge: "Step 1 • Target",
    bgColor: "bg-orange-50/70 border-orange-100",
  },
  {
    step: "02",
    icon: <FaClock className="text-amber-500" />,
    title: "Attempt Timed Assessment",
    description: "Take distraction-free assessments with real-time countdown timers, question bookmarking, and automated autosave technology.",
    badge: "Step 2 • Practice",
    bgColor: "bg-amber-50/70 border-amber-100",
  },
  {
    step: "03",
    icon: <FaChartPie className="text-purple-600" />,
    title: "Review Instant Analytics",
    description: "Access instant scorecards, per-question step-by-step explanations, speed analytics, and topic mastery recommendations.",
    badge: "Step 3 • Excel",
    bgColor: "bg-purple-50/70 border-purple-100",
  },
];

export const HowItWorks = () => {
  return (
    <section id="how-it-works" className="w-full py-20 sm:py-28 bg-gradient-to-b from-white via-slate-50/50 to-white relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-14 sm:mb-20 space-y-4">
          <span className="text-xs text-primary font-bold uppercase tracking-widest bg-primary/10 border border-primary/20 px-3.5 py-1.5 rounded-full inline-block">
            Simple 3-Step Process
          </span>
          <h2 className="text-2xl sm:text-4xl font-black text-gray-900 tracking-tight">
            How Self Test Powers Your Exam Prep
          </h2>
          <p className="text-gray-500 font-medium text-sm sm:text-base leading-relaxed">
            From exam selection to deep analytical insights, master any subject with our intuitive workflow.
          </p>
        </div>

        {/* Step Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {steps.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.15 }}
              className="relative flex flex-col p-8 bg-white border border-gray-200/80 rounded-3xl shadow-sm hover:shadow-xl hover:border-primary/30 transition-all duration-300 group"
            >
              {/* Step Badge */}
              <div className="flex items-center justify-between mb-6">
                <span className="text-xs font-black uppercase tracking-wider px-3 py-1 rounded-lg bg-gray-100 text-gray-600">
                  {item.badge}
                </span>
                <span className="text-3xl font-black text-gray-200 group-hover:text-primary/30 transition-colors">
                  {item.step}
                </span>
              </div>

              {/* Icon */}
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-xl mb-6 border shadow-xs ${item.bgColor} transform group-hover:scale-108 transition-transform duration-300`}>
                {item.icon}
              </div>

              {/* Title */}
              <h3 className="text-xl font-black text-gray-900 mb-3 group-hover:text-primary transition-colors">
                {item.title}
              </h3>

              {/* Description */}
              <p className="text-gray-500 text-sm font-medium leading-relaxed mb-4 flex-1">
                {item.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
