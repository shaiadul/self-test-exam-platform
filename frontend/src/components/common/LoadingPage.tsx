"use client";

import Lottie from "lottie-react";
import loadingAnimation from "../../../public/animations/online-exam.json";

export default function LoadingPage() {
  return (
    <div className="w-screen h-screen flex justify-center items-center bg-white">
      <div className="w-40 sm:w-60 md:w-80">
        <Lottie animationData={loadingAnimation} loop={true} />
      </div>
    </div>
  );
}
