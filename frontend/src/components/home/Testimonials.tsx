"use client";

import { motion } from "framer-motion";
import { FaStar, FaQuoteLeft } from "react-icons/fa";

const reviews = [
  {
    name: "Alex Rivera",
    role: "Computer Science Major",
    school: "University Exam Candidate",
    avatar: "AR",
    color: "bg-orange-500",
    text: "Self Test completely shifted how I prepare for midterms. Taking timed mock exams with instant step-by-step solutions gave me the confidence to score in the top 5% of my cohort.",
    rating: 5,
  },
  {
    name: "Sarah Chen",
    role: "Pre-Med Aspirant",
    school: "Competitive Entrance Prep",
    avatar: "SC",
    color: "bg-purple-600",
    text: "The per-question time tracking and topic radar revealed my exact weak spots in organic chemistry. Fixing those specific gaps boosted my practice test score by 22 points!",
    rating: 5,
  },
  {
    name: "Prof. David Miller",
    role: "Department Instructor",
    school: "STEM Academic Advisor",
    avatar: "DM",
    color: "bg-blue-600",
    text: "As an instructor, recommending Self Test to my students has made revision structured and measurable. The analytics feedback loop is top-tier.",
    rating: 5,
  },
];

export const Testimonials = () => {
  return (
    <section className="w-full py-20 sm:py-28 bg-gradient-to-b from-slate-50 via-white to-slate-50 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-14 sm:mb-20 space-y-4">
          <span className="text-xs text-primary font-bold uppercase tracking-widest bg-primary/10 border border-primary/20 px-3.5 py-1.5 rounded-full inline-block">
            Student Feedback
          </span>
          <h2 className="text-2xl sm:text-4xl font-black text-gray-900 tracking-tight">
            Trusted by Ambitious Learners Nationwide
          </h2>
          <p className="text-gray-500 font-medium text-sm sm:text-base leading-relaxed">
            See how students and educators use Self Test to reach top academic results.
          </p>
        </div>

        {/* Reviews Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {reviews.map((review, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.15 }}
              className="flex flex-col p-8 bg-white border border-gray-200/80 rounded-3xl shadow-sm hover:shadow-xl transition-all duration-300 relative group"
            >
              {/* Quote Icon */}
              <FaQuoteLeft className="text-gray-200 group-hover:text-primary/20 text-3xl mb-4 transition-colors" />

              {/* Rating Stars */}
              <div className="flex gap-1 text-amber-400 text-xs mb-4">
                {[...Array(review.rating)].map((_, i) => (
                  <FaStar key={i} />
                ))}
              </div>

              {/* Review Text */}
              <p className="text-gray-600 text-sm font-medium leading-relaxed mb-6 flex-1 italic">
                &quot;{review.text}&quot;
              </p>

              {/* Author Footer */}
              <div className="flex items-center gap-3.5 pt-4 border-t border-gray-100">
                <div className={`w-11 h-11 rounded-full ${review.color} text-white font-black text-sm flex items-center justify-center shadow-sm`}>
                  {review.avatar}
                </div>
                <div className="text-left">
                  <h4 className="font-bold text-gray-900 text-sm">{review.name}</h4>
                  <p className="text-xs text-gray-500 font-medium">{review.role} • {review.school}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

