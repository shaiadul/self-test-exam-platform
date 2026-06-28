"use client";

import { motion } from "framer-motion";
import { FaGraduationCap, FaRegChartBar, FaGlobeAsia, FaLongArrowAltRight } from "react-icons/fa";

const features = [
  {
    icon: <FaGraduationCap />,
    iconColor: "text-orange-600 bg-orange-50 border-orange-100",
    title: "Curated Practice Exams",
    description: "Take unlimited course assessments and mocks mapped precisely to school, college, and competitive boards syllabus patterns."
  },
  {
    icon: <FaRegChartBar />,
    iconColor: "text-blue-600 bg-blue-50 border-blue-100",
    title: "Granular Performance Charts",
    description: "Break down your results down to per-question markings, negative-marks ratios, rankings, and average speed analytics."
  },
  {
    icon: <FaGlobeAsia />,
    iconColor: "text-purple-600 bg-purple-50 border-purple-100",
    title: "Seamless Universal Syncing",
    description: "Assess yourself on the go. Self Test works seamlessly across mobile phones, tablets, and desktop workstations."
  }
];

export const Features = () => {
  return (
    <section id="features" className="w-full py-28 bg-white relative">
      <div className="max-w-7xl mx-auto px-6">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-20 space-y-4">
          <span className="text-xs text-primary font-bold uppercase tracking-widest bg-primary/10 border border-primary/20 px-3 py-1 rounded-full">
            Key Features
          </span>
          <h2 className="text-3xl md:text-4xl font-black text-gray-900 tracking-tight">
            Assessing your skills has <br />
            never been this seamless.
          </h2>
          <p className="text-gray-500 font-medium text-sm leading-relaxed">
            Discover a professional suite of tools designed to help you prepare, track, and execute assessments flawlessly.
          </p>
        </div>

        {/* Features Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.15 }}
              className="flex flex-col text-left p-8 bg-white border border-gray-100 rounded-3xl shadow-sm hover:shadow-xl hover:border-primary/20 transition-all duration-300 group"
            >
              {/* Icon container */}
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-lg mb-6 border shadow-sm ${feature.iconColor} transform group-hover:scale-110 transition-transform duration-300`}>
                {feature.icon}
              </div>
              
              <h3 className="text-lg font-black text-gray-900 mb-3 group-hover:text-primary transition-colors duration-300">
                {feature.title}
              </h3>
              
              <p className="text-gray-500 text-sm font-semibold leading-relaxed mb-6 flex-1">
                {feature.description}
              </p>

              {/* Action link */}
              <div className="flex items-center gap-2 text-xs font-bold text-primary hover:text-primary-dark transition-colors cursor-pointer w-fit">
                <span>Explore assessments</span>
                <FaLongArrowAltRight className="transform group-hover:translate-x-1.5 transition-transform duration-300" />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
