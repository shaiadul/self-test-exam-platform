"use client";

import Link from "next/link";
import Image from "next/image";
import { PrimaryBtn } from "../ui/PrimaryBtn";
import { OutlineBtn } from "../ui/OutlineBtn";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";

export const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <motion.header
      initial={{ y: -50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${
        scrolled
          ? "bg-white/80 backdrop-blur-md border-b border-gray-100 shadow-sm py-4"
          : "bg-transparent py-6"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <Image
            src="/global/logo2.png"
            alt="Self Test Logo"
            width={150}
            height={36}
            priority
            className="w-auto h-9"
          />
        </Link>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-gray-600">
          <Link href="#features" className="hover:text-primary transition-colors">
            Features
          </Link>
          <Link href="#statistics" className="hover:text-primary transition-colors">
            Performance
          </Link>
          <Link href="#about" className="hover:text-primary transition-colors">
            About Us
          </Link>
        </nav>

        {/* CTA Buttons */}
        <div className="flex items-center gap-4">
          <Link
            href="/auth"
            className="text-sm font-bold text-gray-700 hover:text-primary transition-colors px-3 py-2"
          >
            Sign In
          </Link>
          <PrimaryBtn link="/auth/register" className="!px-5 !py-2.5 !text-sm shadow-md hover-lift">
            Register Now
          </PrimaryBtn>
        </div>
      </div>
    </motion.header>
  );
};
