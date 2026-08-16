"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { FaFacebookF, FaTwitter, FaLinkedinIn, FaGithub, FaArrowUp } from "react-icons/fa";
import { toast } from "sonner";

export const Footer = () => {
  const [email, setEmail] = useState("");

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      toast.success("Thank you for subscribing to Self Test updates!");
      setEmail("");
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="w-full bg-slate-950 text-slate-400 py-16 border-t border-slate-900 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
        {/* Brand Column */}
        <div className="space-y-4">
          <Link href="/" className="inline-block">
            <Image
              src="/global/logo2.png"
              alt="Self Test"
              width={140}
              height={32}
              className="brightness-200 contrast-200 w-auto h-8"
            />
          </Link>
          <p className="text-sm text-slate-400 leading-relaxed font-medium">
            Unleashing academic potential through structured mock assessments, dynamic scorecards, and instant step-by-step evaluations.
          </p>
          <div className="flex gap-3 pt-2">
            <a href="#" aria-label="Facebook" className="w-9 h-9 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-300 hover:text-white hover:bg-primary hover:border-primary transition-all">
              <FaFacebookF size={14} />
            </a>
            <a href="#" aria-label="Twitter" className="w-9 h-9 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-300 hover:text-white hover:bg-primary hover:border-primary transition-all">
              <FaTwitter size={14} />
            </a>
            <a href="#" aria-label="LinkedIn" className="w-9 h-9 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-300 hover:text-white hover:bg-primary hover:border-primary transition-all">
              <FaLinkedinIn size={14} />
            </a>
            <a href="#" aria-label="GitHub" className="w-9 h-9 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-300 hover:text-white hover:bg-primary hover:border-primary transition-all">
              <FaGithub size={14} />
            </a>
          </div>
        </div>

        {/* Links Column 1 */}
        <div>
          <h4 className="text-white font-bold mb-4 text-xs uppercase tracking-widest">Platform Features</h4>
          <ul className="space-y-3 text-sm font-medium">
            <li><Link href="#features" className="hover:text-primary transition-colors">Practice Mock Exams</Link></li>
            <li><Link href="#statistics" className="hover:text-primary transition-colors">Performance Analytics</Link></li>
            <li><Link href="#how-it-works" className="hover:text-primary transition-colors">Instant Auto-Grading</Link></li>
            <li><Link href="#faq" className="hover:text-primary transition-colors">Interactive FAQ</Link></li>
          </ul>
        </div>

        {/* Links Column 2 */}
        <div>
          <h4 className="text-white font-bold mb-4 text-xs uppercase tracking-widest">Portal Navigation</h4>
          <ul className="space-y-3 text-sm font-medium">
            <li><Link href="/auth" className="hover:text-primary transition-colors">Student Login</Link></li>
            <li><Link href="/auth/register" className="hover:text-primary transition-colors">Register Free Account</Link></li>
            <li><Link href="#how-it-works" className="hover:text-primary transition-colors">Assessment Workflow</Link></li>
            <li><Link href="#statistics" className="hover:text-primary transition-colors">Pacing & Timer Metrics</Link></li>
          </ul>
        </div>

        {/* Newsletter Column */}
        <div>
          <h4 className="text-white font-bold mb-4 text-xs uppercase tracking-widest">Platform Updates</h4>
          <p className="text-sm text-slate-400 mb-4 leading-relaxed font-medium">
            Subscribe for platform feature updates, study tips, and mock exam additions.
          </p>
          <form onSubmit={handleSubscribe} className="space-y-2.5">
            <div className="flex gap-2">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="flex-1 px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-sm text-white focus:outline-none focus:border-primary transition-colors"
              />
              <button
                type="submit"
                className="px-4 py-2.5 bg-primary hover:bg-primary-dark text-white font-bold rounded-xl text-sm transition-all shadow-md shrink-0"
              >
                Join
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 border-t border-slate-900 mt-12 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 font-medium">
        <p>© {new Date().getFullYear()} Self Test Assessment Platform. All rights reserved.</p>
        
        <button
          onClick={scrollToTop}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700 transition-colors"
        >
          <span>Back to Top</span>
          <FaArrowUp size={10} />
        </button>
      </div>
    </footer>
  );
};

