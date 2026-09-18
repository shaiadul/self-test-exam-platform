"use client";

import { useState } from "react";
import Link from "next/link";
import logo2 from "../../../../public/global/logo2.png";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Input } from "../../../components/ui/Input";
import { FaLock, FaArrowLeft } from "react-icons/fa";
import { motion } from "framer-motion";

export default function ConfirmPassword() {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log(
      "New Password:",
      newPassword,
      "Confirm Password:",
      confirmPassword
    );
    // TODO: Handle API call for login
    if (newPassword !== confirmPassword) {
      setErrorMessage("Passwords do not match");
      return;
    }
    router.push("/auth/login");
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
              Set New Password
            </h2>
            <p className="text-slate-500 text-xs font-medium">
              Create a strong password to secure your account
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {errorMessage && (
              <div className="p-2.5 bg-rose-50 border border-rose-200 text-rose-600 text-xs font-mono font-semibold rounded text-center">
                {errorMessage}
              </div>
            )}

            <Input
              label="New Password"
              type="password"
              placeholder="Enter your new password"
              icon={<FaLock />}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />

            <Input
              label="Confirm Password"
              type="password"
              placeholder="Confirm your new password"
              icon={<FaLock />}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />

            <button
              type="submit"
              className="w-full bg-primary hover:bg-primary-dark text-white font-bold text-sm px-4 py-2.5 rounded shadow-xs transition-all active:scale-[0.99] cursor-pointer"
            >
              Reset Password
            </button>

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
