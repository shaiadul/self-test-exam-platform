"use client";

import React from "react";
import Image from "next/image";

interface CertificatePrintLayoutProps {
  candidateName?: string;
  examName: string;
  examDate?: string;
  result: {
    total: number;
    correct: number;
    wrong: number;
    negative: number;
    finalScore: number;
    passed: boolean;
  };
  totalMarks?: number;
}

export default function CertificatePrintLayout({
  candidateName = "Md Saidul Basar",
  examName,
  examDate = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  }),
  result,
  totalMarks,
}: CertificatePrintLayoutProps) {
  const { total, correct, wrong, negative, finalScore, passed } = result;
  
  const maxMarks = totalMarks || total;
  const rawPercentage = maxMarks > 0 ? (finalScore / maxMarks) * 100 : 0;
  const percentage = Math.max(0, Math.min(100, Math.round(rawPercentage)));

  return (
    <div className="hidden print:block w-full h-[100vh] print-single-page bg-white text-black p-8 font-serif box-border">
      {/* Dynamic Print Style Rules to guarantee exactly one PDF page */}
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          @page {
            size: A4 landscape;
            margin: 0 !important;
          }
          body {
            margin: 0 !important;
            padding: 0 !important;
            background-color: white !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          .print-single-page {
            width: 297mm !important;
            height: 210mm !important;
            max-width: 297mm !important;
            max-height: 210mm !important;
            overflow: hidden !important;
            box-sizing: border-box !important;
            position: relative !important;
            page-break-inside: avoid !important;
            page-break-after: avoid !important;
            page-break-before: avoid !important;
            margin: 0 !important;
            padding: 10mm !important;
            background-color: white !important;
          }
        }
      `}} />

      {/* Decorative Ornate Frame */}
      <div className="border-8 border-double border-[#dd6b01] rounded-3xl p-6 h-full flex flex-col justify-between relative bg-white box-border">
        
        {/* Certificate Corners */}
        <div className="absolute top-4 left-4 w-12 h-12 border-t-4 border-l-4 border-[#dd6b01]" />
        <div className="absolute top-4 right-4 w-12 h-12 border-t-4 border-r-4 border-[#dd6b01]" />
        <div className="absolute bottom-4 left-4 w-12 h-12 border-b-4 border-l-4 border-[#dd6b01]" />
        <div className="absolute bottom-4 right-4 w-12 h-12 border-b-4 border-r-4 border-[#dd6b01]" />

        {/* Logo & Portal Info */}
        <div className="flex flex-col items-center text-center mt-2">
          <div className="relative w-48 h-12 flex flex-col items-center justify-center">
            <h3 className="text-[#dd6b01] font-sans font-black text-2xl tracking-widest uppercase">SelfTest</h3>
            <p className="text-[8px] tracking-widest text-gray-500 font-sans font-bold uppercase">Online Examination Portal</p>
          </div>
          <div className="h-0.5 w-32 bg-[#dd6b01] mt-1 opacity-50" />
        </div>

        {/* Certificate Title */}
        <div className="text-center my-2">
          <h1 className="text-3xl font-extrabold tracking-widest text-gray-800 uppercase font-sans">
            Certificate of Exam Completion
          </h1>
          <p className="text-xs italic text-gray-500 mt-1 font-serif">
            This official transcript certifies that the candidate listed below has successfully completed the examination.
          </p>
        </div>

        {/* Candidate Detail */}
        <div className="text-center my-2">
          <span className="text-[9px] uppercase tracking-widest text-gray-400 font-sans font-bold">CANDIDATE NAME</span>
          <h2 className="text-2xl font-bold text-gray-900 border-b border-[#dd6b01]/30 max-w-md mx-auto py-1">
            {candidateName}
          </h2>
        </div>

        {/* Exam Detail */}
        <div className="text-center my-1">
          <p className="text-xs text-gray-600">
            has successfully completed the online evaluation for
          </p>
          <h3 className="text-lg font-bold text-[#dd6b01] mt-0.5 font-sans uppercase">
            {examName}
          </h3>
          <p className="text-[10px] text-gray-400 mt-1 font-sans">
            Date of Assessment: <span className="font-semibold text-gray-700">{examDate}</span>
          </p>
        </div>

        {/* Divider */}
        <div className="my-3 border-t border-[#dd6b01]/25 border-dashed max-w-xl mx-auto w-full" />

        {/* Scorecard Table inside Certificate */}
        <div className="max-w-xl mx-auto w-full mb-4 font-sans">
          <div className="grid grid-cols-5 gap-2 border-b border-gray-800 pb-1 text-center text-[10px] font-bold text-gray-500 uppercase tracking-wider">
            <div>Questions</div>
            <div>Correct</div>
            <div>Wrong</div>
            <div>Acc. Rate</div>
            <div>Final Score</div>
          </div>
          <div className="grid grid-cols-5 gap-2 pt-2 text-center text-xs font-semibold text-gray-800">
            <div>{total}</div>
            <div className="text-green-600">{correct}</div>
            <div className="text-red-600">{wrong}</div>
            <div>{percentage}%</div>
            <div className="text-base font-black text-gray-900">
              {finalScore.toFixed(2)} <span className="text-[10px] font-normal text-gray-500">/ {maxMarks}</span>
            </div>
          </div>
        </div>

        {/* Bottom Section: Pass/Fail Seal and Signatures */}
        <div className="flex justify-between items-end px-16 my-2">
          {/* Status Seal */}
          <div className="flex flex-col items-center">
            <div className={`w-16 h-16 rounded-full border-2 flex flex-col items-center justify-center text-center font-bold tracking-widest uppercase font-sans ${
              passed 
                ? "border-emerald-600 text-emerald-600 bg-emerald-50/20" 
                : "border-red-600 text-red-600 bg-red-50/20"
            }`}>
              <span className="text-[8px] opacity-75 leading-none">STATUS</span>
              <span className="text-xs font-black mt-0.5">{passed ? "PASSED" : "FAILED"}</span>
            </div>
          </div>

          {/* Signature Seal */}
          <div className="text-center font-sans">
            <div className="h-8 flex items-center justify-center italic text-[#dd6b01] font-bold text-xl font-serif">
              Saidul Basar
            </div>
            <div className="w-36 border-t border-gray-300 my-0.5 mx-auto" />
            <span className="text-[8px] text-gray-400 font-bold uppercase tracking-wider">PORTAL ADMINISTRATOR</span>
          </div>
        </div>

        {/* Footnote */}
        <div className="text-center text-[8px] text-gray-400 font-sans mt-2">
          Verification ID: ST-{result.correct}{result.wrong}-{Date.now().toString().slice(-6)} • Secure Online Transcripts by SelfTest Portal
        </div>
      </div>
    </div>
  );
}
