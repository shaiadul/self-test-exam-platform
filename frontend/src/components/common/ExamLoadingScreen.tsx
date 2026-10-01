"use client";

import React, { useState, useEffect } from "react";
import Lottie from "lottie-react";
import onlineExamAnimation from "../../../public/animations/online-exam.json";

export default function ExamLoadingScreen() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="min-h-[70vh] w-full flex flex-col items-center justify-center p-6 text-center">
      <div className="w-32 h-32 sm:w-40 sm:h-40 flex items-center justify-center">
        {mounted && (
          <Lottie
            animationData={onlineExamAnimation}
            loop={true}
            className="w-full h-full"
          />
        )}
      </div>
    </div>
  );
}
