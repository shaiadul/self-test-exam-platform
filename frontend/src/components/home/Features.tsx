"use client";

import { motion } from "framer-motion";

const features = [
  {
    icon: "📝",
    title: "Practice Exams",
    description: "Take multiple practice exams to improve your skills and performance before the real test."
  },
  {
    icon: "📊",
    title: "Track Progress",
    description: "Monitor your performance with detailed analytics and progress tracking to improve efficiently."
  },
  {
    icon: "🌐",
    title: "Accessible Anywhere",
    description: "Our platform is responsive and works seamlessly on mobile, tablet, and desktop devices."
  }
];

export const Features = () => {
  return (
    <section className="w-full py-20 bg-gray-50/50">
      <div className="max-w-6xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="flex flex-col items-center text-center p-8 glass-card hover-lift rounded-2xl group"
            >
              <div className="text-5xl mb-6 transform group-hover:scale-110 transition-transform duration-300">
                {feature.icon}
              </div>
              <h3 className="text-xl font-bold mb-3 text-gray-800">{feature.title}</h3>
              <p className="text-gray-600 leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
