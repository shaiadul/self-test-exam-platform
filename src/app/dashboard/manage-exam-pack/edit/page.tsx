"use client";

import React, { useRef, useState, DragEvent, useEffect } from "react";
import Image from "next/image";
import { FaCloudUploadAlt } from "react-icons/fa";
import CustomSelect from "@/components/ui/CustomSelect"; // adjust path if needed
import { PageContainer } from "@/components/common/PageContainer";

export default function EditExamPackPage() {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [examPackData, setExamPackData] = useState({
    id: "",
    name: "",
    details: "",
    level: "",
    batch: "",
    image: "",
  });

  // ✅ Simulate fetching existing data
  useEffect(() => {
    // Replace this with an API call (e.g., fetch(`/api/exam-pack/${id}`))
    const existingData = {
      id: "EP-101",
      name: "SSC Exam Preparation 2025",
      details:
        "A complete mock test package designed to prepare SSC students for board exams. Includes practice sets, previous year questions, and detailed solutions.",
      level: "SSC",
      batch: "2025",
      image: "/global/test.png", // existing image
    };
    setExamPackData(existingData);
  }, []);

  // --- Image Upload Handlers ---
  const handleFileChange = (file: File) => {
    const imageUrl = URL.createObjectURL(file);
    setExamPackData({ ...examPackData, image: imageUrl });
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragActive(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragActive(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFileChange(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Updated Exam Pack:", examPackData);
    // TODO: call PUT API endpoint here
  };

  return (
    <PageContainer>
        <h1 className="text-2xl md:text-3xl font-semibold mb-8 text-[#dd6b01]">
          Edit Exam Pack
        </h1>

        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 md:grid-cols-2 gap-10 items-start"
        >
          {/* --- Image Upload (Drag & Drop) --- */}
          <div
            className={`w-full h-96 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-300 ${
              dragActive
                ? "border-[#dd6b01] bg-orange-50"
                : "border-gray-300 bg-gray-100 hover:border-[#dd6b01] hover:bg-orange-50/30"
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            {examPackData.image ? (
              <div className="relative w-full h-full rounded-2xl overflow-hidden">
                <Image
                  src={examPackData.image}
                  alt="Exam Pack"
                  fill
                  className="object-cover object-center w-full h-full rounded-2xl"
                />
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setExamPackData({ ...examPackData, image: "" });
                  }}
                  className="absolute top-3 right-3 bg-white text-gray-700 hover:text-red-500 shadow-md px-3 py-1 rounded-md text-sm font-medium"
                >
                  Remove
                </button>
              </div>
            ) : (
              <>
                <FaCloudUploadAlt className="text-5xl text-[#dd6b01] mb-3" />
                <p className="text-gray-700 font-medium">
                  Drag & drop image here
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  or click to upload (JPG, PNG)
                </p>
              </>
            )}

            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              className="hidden"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  handleFileChange(e.target.files[0]);
                }
              }}
            />
          </div>

          {/* --- Form Inputs --- */}
          <div className="space-y-5">
            <div>
              <label className="text-sm font-semibold text-gray-800 block mb-1">
                Exam Pack Name
              </label>
              <input
                type="text"
                placeholder="Exam Pack Name*"
                className="w-full px-4 py-3 text-base outline-none border border-[#f97a00] rounded-lg focus:ring-2 focus:ring-[#f97a00]"
                value={examPackData.name}
                onChange={(e) =>
                  setExamPackData({ ...examPackData, name: e.target.value })
                }
                required
              />
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-800 block mb-1">
                Details (description)
              </label>
              <textarea
                placeholder="Details*"
                className="w-full px-4 py-3 text-base outline-none border border-[#f97a00] rounded-lg resize-none focus:ring-2 focus:ring-[#f97a00] min-h-[120px]"
                value={examPackData.details}
                onChange={(e) =>
                  setExamPackData({ ...examPackData, details: e.target.value })
                }
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-semibold text-gray-800 block mb-1">
                  Level
                </label>
                <CustomSelect
                  label="Select Level"
                  options={[
                    "PSC",
                    "SSC",
                    "HSC",
                    "BCS",
                    "BS",
                    "BA",
                    "BBA",
                    "MA",
                    "PHD",
                  ]}
                  value={examPackData.level}
                  onChange={(val) =>
                    setExamPackData({ ...examPackData, level: val })
                  }
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-800 block mb-1">
                  Batch
                </label>
                <CustomSelect
                  label="Select Batch"
                  options={Array.from({ length: 20 }, (_, i) =>
                    (2010 + i).toString()
                  )}
                  value={examPackData.batch}
                  onChange={(val) =>
                    setExamPackData({ ...examPackData, batch: val })
                  }
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-[#dd6b01] to-[#f0b176] text-white font-semibold text-base py-3 rounded-full hover:opacity-90 transition-all duration-500 cursor-pointer"
            >
              Update Exam Pack
            </button>
          </div>
        </form>

        {/* --- Relevant Rules Section --- */}
        <div className="mt-14 bg-orange-50 border border-[#fcd6aa] rounded-2xl p-6 md:p-10 shadow-sm">
          <h2 className="text-xl md:text-2xl font-semibold text-[#dd6b01] mb-4">
            📘 Relevant Rules for Editing Exam Packs
          </h2>

          <ul className="list-disc list-inside space-y-2 text-gray-700 text-base leading-relaxed">
            <li>
              The <span className="font-bold">Exam Pack Name</span> must be
              unique and descriptive.
            </li>
            <li>
              Ensure the uploaded image is high-quality and under{" "}
              <span className="font-bold">2MB</span> in size.
            </li>
            <li>
              Use accurate <span className="font-bold">Level</span> and{" "}
              <span className="font-bold">Batch</span> to categorize properly.
            </li>
            <li>
              Include detailed information in the{" "}
              <span className="font-bold">“Details”</span> section for better
              clarity.
            </li>
            <li>
              Once published, exam packs can be edited but not deleted directly
              without admin permission.
            </li>
          </ul>

          <p className="mt-5 text-gray-600 text-sm italic">
            Tip: Well-organized exam packs help students quickly find relevant
            materials.
          </p>
        </div>
    </PageContainer>
  );
}
