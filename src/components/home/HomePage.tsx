"use client";

import Lottie from "lottie-react";
import landingAnimation from "../../../public/animations/online-exam.json";
import { PrimaryBtn } from "../ui/PrimaryBtn";
import { OutlineBtn } from "../ui/OutlineBtn";

// SEO Meta
import { Metadata } from "next";
export const metadata: Metadata = {
  title: "Self Test - Online Exam Platform",
  description:
    "Practice your skills, take exams, and track your progress. 1200+ students are using our platform worldwide. Learn, test, and improve in one place.",
};

export default function HomePage() {
  return (
    <main className="w-full min-h-screen bg-white">
      <section className="w-full flex flex-col justify-center items-center text-center py-20 px-4 md:px-10">
        <h1 className="text-4xl md:text-6xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-[#f97a00] to-[#f0b176]">
          Online Exam Platform
        </h1>

        <div className="w-64 sm:w-96 mb-8">
          <Lottie animationData={landingAnimation} loop={true} />
        </div>

        <p className="max-w-2xl text-lg md:text-xl text-gray-700 mb-10">
          Practice your skills, take exams, and track your progress. 1200+
          students are using our platform worldwide. Learn, test, and improve in
          one place.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center items-center">
          <PrimaryBtn link="/auth" className="w-48">
            Start Now
          </PrimaryBtn>
          <OutlineBtn link="/auth" className="w-48">
            Register Now
          </OutlineBtn>
        </div>
      </section>

      <section className="w-full py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-10 px-4">
          <div className="flex flex-col items-center text-center p-6 rounded-lg shadow hover:shadow-lg transition">
            <div className="text-4xl mb-4" style={{ color: "#f97a00" }}>
              📝
            </div>
            <h3 className="text-xl font-semibold mb-2">Practice Exams</h3>
            <p className="text-gray-600">
              Take multiple practice exams to improve your skills and
              performance before the real test.
            </p>
          </div>

          <div className="flex flex-col items-center text-center p-6 rounded-lg shadow hover:shadow-lg transition">
            <div className="text-4xl mb-4" style={{ color: "#f97a00" }}>
              📊
            </div>
            <h3 className="text-xl font-semibold mb-2">Track Progress</h3>
            <p className="text-gray-600">
              Monitor your performance with detailed analytics and progress
              tracking to improve efficiently.
            </p>
          </div>

          <div className="flex flex-col items-center text-center p-6 rounded-lg shadow hover:shadow-lg transition">
            <div className="text-4xl mb-4" style={{ color: "#f97a00" }}>
              🌐
            </div>
            <h3 className="text-xl font-semibold mb-2">Accessible Anywhere</h3>
            <p className="text-gray-600">
              Our platform is responsive and works seamlessly on mobile, tablet,
              and desktop devices.
            </p>
          </div>
        </div>
      </section>

      <section className="w-full py-20 bg-gradient-to-r from-[#f97a00] to-[#f0b176] text-white text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-6">
          Ready to start your journey?
        </h2>
        <p className="max-w-2xl mx-auto mb-10">
          Join thousands of learners improving their skills with our online
          exams platform.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center items-center">
          <PrimaryBtn link="/auth" className="bg-white text-[#f97a00] w-48">
            Sign In
          </PrimaryBtn>
          <OutlineBtn link="/auth" className="w-48 text-[#f97a00]">
            Register Now
          </OutlineBtn>
        </div>
      </section>
    </main>
  );
}
