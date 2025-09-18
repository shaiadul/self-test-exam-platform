"use client";
import { OutlineBtn } from "@/components/ui/OutlineBtn";
import { PrimaryBtn } from "@/components/ui/PrimaryBtn";
import Lottie from "lottie-react";
import onlineExamAnimation from "../../../public/animations/online-exam.json";
import Image from "next/image";

export default function Auth() {
  return (
    <main>
      <section className="flex min-w-full min-h-screen">
        <div className="bg-gradient-to-tr from-[#dd6b01] to-[#f0b176] w-full">
          <div className="flex justify-center items-center h-full">
            <Image
              className=""
              src="/global/logo.png"
              alt="Next.js logo"
              width={500}
              height={38}
              priority
            />
          </div>
        </div>
        <div className="w-full">
          <div className="flex flex-col justify-center items-center h-full">
            <div className="w-60 h-60">
              <Lottie animationData={onlineExamAnimation} loop={true} />
            </div>
            <h1 className="md:text-5xl text-center font-bold gradient-text ">
              Online Exam Platform
            </h1>
            <p className="text-lg text-center font-normal py-10 max-w-2xl">
              Practice your skills, take your exam! all in one place. There is
              no need to go anywhere else. 1200+ students are using our
              platform.
            </p>

            <div className="flex flex-col gap-5 w-full justify-center items-center">
              <PrimaryBtn className="w-1/3 " link="/courses">
                Sign In
              </PrimaryBtn>
              <OutlineBtn className=" w-1/3 rounded-full" link="/courses">
                Register Now
              </OutlineBtn>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
