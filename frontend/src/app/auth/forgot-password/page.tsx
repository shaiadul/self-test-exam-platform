"use client";

import { useState } from "react";
import Link from "next/link";
import logo2 from "../../../../public/global/logo2.png";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Input } from "../../../components/ui/Input";
import { PrimaryBtn } from "../../../components/ui/PrimaryBtn";
import { FaEnvelope, FaArrowLeft } from "react-icons/fa";
import { motion } from "framer-motion";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");

  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Email:", email);
    // TODO: Handle API call for login
    router.push("/auth/otp");
  };

  return (
    <main className="min-h-screen bg-gray-50 flex flex-col">
      <section className="flex items-center justify-between mx-auto max-w-7xl w-full px-4 py-4 sm:px-6 sm:py-8">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <Link href="/">
            <Image
              src={logo2}
              alt="logo"
              width={180}
              height={40}
              className="w-auto h-8 sm:h-10"
            />
          </Link>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <Link
            href="/auth/login"
            className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-gray-500 hover:text-primary font-bold transition-colors"
          >
            <FaArrowLeft className="text-xs" />
            <span>Back to Login</span>
          </Link>
        </motion.div>
      </section>

      <section className="flex-1 flex items-center justify-center p-3 sm:p-4 pb-12 sm:pb-16">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md bg-white p-4 sm:p-8 rounded border border-slate-200/80 shadow-xs"
        >
          <div className="text-center mb-6">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight mb-1.5">
              Forgot Password
            </h2>
            <p className="text-slate-500 text-xs font-medium">
              Enter your registered email and we&apos;ll send you a recovery OTP
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Email Address"
              type="email"
              placeholder="name@example.com"
              icon={<FaEnvelope />}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <PrimaryBtn
              type="submit"
              className="w-full py-2.5 text-sm font-bold"
            >
              Send Recovery OTP
            </PrimaryBtn>

            <div className="text-center pt-2">
              <p className="text-slate-500 text-xs font-medium">
                Remember your password?{" "}
                <Link
                  href="/auth/login"
                  className="font-bold text-primary hover:underline"
                >
                  Sign In
                </Link>
              </p>
            </div>
          </form>
        </motion.div>
      </section>
    </main>
  );
}
