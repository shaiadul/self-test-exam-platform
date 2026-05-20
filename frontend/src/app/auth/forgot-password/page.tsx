"use client";

import { useState } from "react";
import Link from "next/link";
import logo2 from "../../../../public/global/logo2.png";
import Image from "next/image";
import { useRouter } from "next/navigation";

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
    <main className="">
      <section className="flex items-center justify-between mx-auto max-w-7xl w-full px-4 md:px-10 py-10">
        <div>
          <Link href="/">
            <Image src={logo2} alt="logo" className="w-40 md:w-60" />
          </Link>
        </div>
        <div className="">
          <Link href="/" className="text-sm md:text-lg font-semibold underline">
            Back to Home
          </Link>
        </div>
      </section>

      <section className="flex-1 flex items-center justify-center py-20 px-4">
        <div className="w-full max-w-md">
          <h2 className="text-3xl md:text-4xl font-bold text-center gradient-text mb-6">
            Forgot Password
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <input
                type="email"
                placeholder="Enter your email"
                className="w-full px-3 py-4 text-lg outline-none border border-solid border-[#f97a00] rounded-lg"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="off"
                spellCheck="false"
                inputMode="email"
                name="email"
                id="email"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-[#dd6b01] to-[#f0b176] text-white font-semibold text-md md:text-lg px-4 md:px-6 py-3 md:py-3 rounded-full hover:opacity-90 transition cursor-pointer"
            >
              Click For OTP
            </button>
          </form>
        </div>
      </section>
    </main>
  );
}
