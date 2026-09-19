"use client";

import { useState } from "react";
import Link from "next/link";
import logo2 from "../../../../public/global/logo2.png";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Input } from "../../../components/ui/Input";
import { PrimaryBtn } from "../../../components/ui/PrimaryBtn";
import { FaKey, FaArrowLeft } from "react-icons/fa";
import { motion } from "framer-motion";

export default function Otp() {
  const [otp, setOtp] = useState("");

  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("OTP:", otp);
    // TODO: Handle API call for login
    router.push("/auth/confirm-password");
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
            href="/"
            className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-gray-500 hover:text-primary font-bold transition-colors"
          >
            <FaArrowLeft className="text-xs" />
            <span>Back to Home</span>
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
              Email Verification Code
            </h2>
            <p className="text-slate-500 text-xs font-medium">
              Enter the OTP sent to your registered email address
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="OTP Code"
              type="number"
              placeholder="Enter your OTP"
              icon={<FaKey />}
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              required
            />

            <PrimaryBtn
              type="submit"
              className="w-full py-2.5 text-sm font-bold"
            >
              Submit OTP
            </PrimaryBtn>

            <div className="text-center pt-2">
              <p className="text-slate-500 text-xs font-medium">
                Didn&apos;t receive the code?{" "}
                <button
                  type="button"
                  className="font-bold text-primary hover:underline cursor-pointer"
                >
                  Resend OTP
                </button>
              </p>
            </div>
          </form>
        </motion.div>
      </section>
    </main>
  );
}
