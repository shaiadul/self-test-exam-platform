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
        <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-14 space-y-3">
          <span className="text-xs text-primary font-mono font-bold uppercase tracking-widest bg-primary/10 border border-primary/20 px-3 py-1 rounded inline-block">
            Student Feedback
          </span>
          <h2 className="text-2xl sm:text-4xl font-bold text-gray-900 tracking-tight">
            Trusted by Ambitious Learners Nationwide
          </h2>
          <p className="text-gray-500 font-medium text-xs sm:text-sm leading-relaxed">
            See how students and educators use Self Test to reach top academic results.
          </p>
        </div>

        {/* Reviews Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {reviews.map((review, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, delay: index * 0.08 }}
              className="flex flex-col p-6 bg-white border border-slate-200/80 rounded shadow-xs hover:border-slate-300 transition-all duration-200 relative group"
            >
              {/* Quote Icon */}
              <FaQuoteLeft className="text-gray-200 group-hover:text-primary/20 text-2xl mb-3 transition-colors" />

              {/* Rating Stars */}
              <div className="flex gap-1 text-amber-400 text-xs mb-3">
                {[...Array(review.rating)].map((_, i) => (
                  <FaStar key={i} />
                ))}
              </div>

              {/* Review Text */}
              <p className="text-gray-600 text-xs sm:text-sm font-medium leading-relaxed mb-5 flex-1 italic">
                &quot;{review.text}&quot;
              </p>

              {/* Author Footer */}
              <div className="flex items-center gap-3 pt-3.5 border-t border-slate-100">
                <div className={`w-9 h-9 rounded ${review.color} text-white font-mono font-bold text-xs flex items-center justify-center shadow-2xs`}>
                  {review.avatar}
                </div>
                <div className="text-left">
                  <h4 className="font-bold text-gray-900 text-xs">{review.name}</h4>
                  <p className="text-[11px] text-gray-500 font-medium">{review.role} • {review.school}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

