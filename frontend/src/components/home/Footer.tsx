"use client";

import Link from "next/link";
import Image from "next/image";
import { FaFacebookF, FaTwitter, FaLinkedinIn, FaGithub } from "react-icons/fa";

export const Footer = () => {
  return (
    <footer className="w-full bg-slate-900 text-slate-400 py-16 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-10">
        {/* Brand Column */}
        <div className="space-y-4">
          <Image
            src="/global/logo2.png"
            alt="Self Test"
            width={140}
            height={32}
            className="brightness-200 contrast-200"
          />
          <p className="text-sm text-slate-400 leading-relaxed">
            Unleashing potential through structured mock assessments and dynamic performance evaluations.
          </p>
          <div className="flex gap-4 pt-2">
            <a href="#" className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-white hover:bg-primary transition-colors">
              <FaFacebookF size={14} />
            </a>
            <a href="#" className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-white hover:bg-primary transition-colors">
              <FaTwitter size={14} />
            </a>
            <a href="#" className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-white hover:bg-primary transition-colors">
              <FaLinkedinIn size={14} />
            </a>
            <a href="#" className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-white hover:bg-primary transition-colors">
              <FaGithub size={14} />
            </a>
          </div>
        </div>

        {/* Links Column 1 */}
        <div>
          <h4 className="text-white font-bold mb-4 text-sm uppercase tracking-wider">Features</h4>
          <ul className="space-y-2.5 text-sm">
            <li><Link href="#features" className="hover:text-white transition-colors">Dynamic Mock Exams</Link></li>
            <li><Link href="#features" className="hover:text-white transition-colors">Progress Analytics</Link></li>
            <li><Link href="#features" className="hover:text-white transition-colors">Instant Grading</Link></li>
            <li><Link href="#features" className="hover:text-white transition-colors">Custom Exam Creator</Link></li>
          </ul>
        </div>

        {/* Links Column 2 */}
        <div>
          <h4 className="text-white font-bold mb-4 text-sm uppercase tracking-wider">Company</h4>
          <ul className="space-y-2.5 text-sm">
            <li><a href="#" className="hover:text-white transition-colors">About Us</a></li>
            <li><a href="#" className="hover:text-white transition-colors">Contact Support</a></li>
            <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
            <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
          </ul>
        </div>

        {/* Links Column 3 */}
        <div>
          <h4 className="text-white font-bold mb-4 text-sm uppercase tracking-wider">Newsletter</h4>
          <p className="text-sm mb-4 leading-relaxed">
            Subscribe for platform updates, new features and prep materials.
          </p>
          <div className="flex gap-2">
            <input
              type="email"
              placeholder="Your email address"
              className="flex-1 px-4 py-2 rounded-xl bg-slate-800 border border-slate-700 text-sm text-white focus:outline-none focus:border-primary transition-colors"
            />
            <button className="px-4 py-2 bg-primary hover:bg-primary-dark text-white font-bold rounded-xl text-sm transition-colors">
              Join
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 border-t border-slate-800 mt-12 pt-8 text-center text-xs">
        <p>© {new Date().getFullYear()} Self Test assessment platform. All rights reserved.</p>
      </div>
    </footer>
  );
};
