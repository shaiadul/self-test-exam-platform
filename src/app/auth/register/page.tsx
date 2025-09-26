"use client";

import { useState } from "react";
import Link from "next/link";
import logo2 from "../../../../public/global/logo2.png";
import Image from "next/image";
import { useRouter } from "next/navigation";

export default function Register() {
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Phone:", phone, "Password:", password);
    // TODO: Handle API call for login
    router.push("/auth/verify");
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
            Sign Up
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex items-center overflow-hidden border border-solid border-[#f97a00] rounded-lg cursor-not-allowed">
              <span className="px-3 py-4 text-lg text-[#f97a00] font-semibold">
                +880
              </span>
              <span className="w-[2px] h-6 bg-[#f97a00]"></span>
              <input
                type="tel"
                placeholder="Enter your phone number"
                className="w-full px-3 py-4 text-lg outline-none cursor-not-allowed`"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                disabled
                pattern="[0-9]{11}"
                title="Phone number should be 11 digits"
                maxLength={11}
                minLength={11}
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="off"
                spellCheck="false"
                inputMode="numeric"
                name="phone"
                id="phone"
              />
            </div>

            <div>
              <input
                type="email"
                placeholder="Enter your email"
                className="w-full px-3 py-4 outline-none text-lg border border-solid border-[#f97a00] rounded-lg"
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

            <div>
              <input
                type="password"
                placeholder="Enter your password"
                className="w-full px-3 py-4 outline-none border border-solid border-[#f97a00] rounded-lg"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="off"
                spellCheck="false"
                name="password"
                id="password"
              />
            </div>

            {/* Links */}
            <div className="flex flex-col items-center justify-between text-lg my-5">
              <span className="text-gray-700">
                Already have an account?{" "}
                <Link
                  href="/auth/login"
                  className="font-semibold text-black underline"
                >
                  Sign In
                </Link>
              </span>
            </div>

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-[#dd6b01] to-[#f0b176] text-white font-semibold text-md md:text-lg px-4 md:px-6 py-3 md:py-3 rounded-full hover:opacity-90 transition cursor-pointer"
            >
              Register Now
            </button>
          </form>
        </div>
      </section>
    </main>
  );
}
