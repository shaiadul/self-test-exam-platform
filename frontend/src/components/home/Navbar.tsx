"use client";

import Link from "next/link";
import Image from "next/image";
import { PrimaryBtn } from "../ui/PrimaryBtn";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { FaBars, FaTimes, FaGraduationCap, FaLayerGroup, FaChartLine, FaQuestionCircle, FaArrowRight } from "react-icons/fa";

export const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("");

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);

      // Section active detection
      const sections = ["features", "how-it-works", "statistics", "faq"];
      const scrollPosition = window.scrollY + 200;

      for (const section of sections) {
        const el = document.getElementById(section);
        if (el) {
          const top = el.offsetTop;
          const height = el.offsetHeight;
          if (scrollPosition >= top && scrollPosition < top + height) {
            setActiveSection(section);
            break;
          }
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
  }, [mobileMenuOpen]);

  const navLinks = [
    { label: "Features", href: "#features", icon: <FaGraduationCap className="text-primary" /> },
    { label: "How It Works", href: "#how-it-works", icon: <FaLayerGroup className="text-primary" /> },
    { label: "Performance", href: "#statistics", icon: <FaChartLine className="text-primary" /> },
    { label: "FAQ", href: "#faq", icon: <FaQuestionCircle className="text-primary" /> },
  ];

  return (
    <>
      <motion.header
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${
          scrolled
            ? "bg-white/90 backdrop-blur-md border-b border-gray-100 shadow-sm py-3.5"
            : "bg-transparent py-5"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="relative overflow-hidden rounded-xl p-1 transition-transform duration-300 group-hover:scale-105">
              <Image
                src="/global/logo2.png"
                alt="Self Test Logo"
                width={150}
                height={36}
                priority
                className="w-auto h-8 sm:h-9 object-contain"
              />
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1 xl:gap-2 text-sm font-semibold text-gray-600 bg-gray-50/80 p-1.5 rounded-full border border-gray-100 backdrop-blur-sm">
            {navLinks.map((link) => {
              const isActive = activeSection === link.href.substring(1);
              return (
                <Link
                  key={link.label}
                  href={link.href}
                  className={`px-4 py-2 rounded-full transition-all duration-200 ${
                    isActive
                      ? "bg-white text-primary shadow-xs font-bold"
                      : "hover:text-primary hover:bg-white/60 text-gray-700"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* CTA Buttons (Desktop) */}
          <div className="hidden lg:flex items-center gap-3">
            <Link
              href="/auth"
              className="text-sm font-bold text-gray-700 hover:text-primary transition-colors px-4 py-2 rounded-full hover:bg-orange-50/60"
            >
              Sign In
            </Link>
            <PrimaryBtn link="/auth/register" className="!px-5 !py-2.5 !text-sm shadow-md hover-lift">
              Register Now
            </PrimaryBtn>
          </div>

          {/* Mobile Menu Hamburger Button */}
          <div className="flex items-center gap-2 lg:hidden">
            <Link
              href="/auth"
              className="text-xs font-bold text-gray-700 hover:text-primary px-3 py-2 rounded-lg bg-gray-100 sm:hidden"
            >
              Sign In
            </Link>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2.5 rounded-xl bg-gray-100 text-gray-800 hover:bg-orange-50 hover:text-primary transition-colors focus:outline-none"
              aria-label="Toggle Mobile Menu"
            >
              {mobileMenuOpen ? <FaTimes size={20} /> : <FaBars size={20} />}
            </button>
          </div>
        </div>
      </motion.header>

      {/* Mobile Drawer Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-40 lg:hidden">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm"
            />

            {/* Slide Drawer */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 250 }}
              className="fixed top-0 right-0 h-full w-[85%] max-w-sm bg-white shadow-2xl z-50 flex flex-col justify-between p-6 overflow-y-auto"
            >
              <div>
                {/* Header in Drawer */}
                <div className="flex items-center justify-between pb-6 border-b border-gray-100">
                  <Image
                    src="/global/logo2.png"
                    alt="Self Test Logo"
                    width={130}
                    height={32}
                    className="w-auto h-8 object-contain"
                  />
                  <button
                    onClick={() => setMobileMenuOpen(false)}
                    className="p-2 rounded-lg bg-gray-100 text-gray-600 hover:text-primary"
                  >
                    <FaTimes size={18} />
                  </button>
                </div>

                {/* Navigation Links List */}
                <div className="py-6 space-y-2">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider px-3 mb-2">Navigation</p>
                  {navLinks.map((link) => (
                    <Link
                      key={link.label}
                      href={link.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center justify-between p-3.5 rounded-xl font-bold text-gray-700 hover:bg-orange-50 hover:text-primary transition-all group"
                    >
                      <div className="flex items-center gap-3">
                        <span className="p-2 rounded-lg bg-orange-100/60 group-hover:bg-primary/20 transition-colors">
                          {link.icon}
                        </span>
                        <span>{link.label}</span>
                      </div>
                      <FaArrowRight size={12} className="text-gray-300 group-hover:text-primary group-hover:translate-x-1 transition-all" />
                    </Link>
                  ))}
                </div>
              </div>

              {/* Bottom CTAs in Drawer */}
              <div className="pt-6 border-t border-gray-100 space-y-3">
                <PrimaryBtn
                  link="/auth/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full justify-center !py-3 shadow-md"
                >
                  Register Now
                </PrimaryBtn>

                <Link
                  href="/auth"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full flex items-center justify-center py-3 rounded-full border border-gray-200 text-gray-700 font-bold text-sm hover:bg-gray-50 transition-colors"
                >
                  Sign In to Dashboard
                </Link>

                <p className="text-center text-xs text-gray-400 pt-2">
                  Self Test © {new Date().getFullYear()} • All rights reserved
                </p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

