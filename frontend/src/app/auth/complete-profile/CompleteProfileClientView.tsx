"use client";

import { useRef, useState, useEffect } from "react";
import Link from "next/link";
import logo2 from "../../../../public/global/logo2.png";
import Image from "next/image";
import { useRouter } from "next/navigation";
import CustomSelect from "../../../components/ui/CustomSelect";
import { FaEdit } from "react-icons/fa";
import { completeProfile } from "../../../lib/auth";

interface CompleteProfileClientViewProps {
  initialAssets: any[];
}

export default function CompleteProfileClientView({
  initialAssets,
}: CompleteProfileClientViewProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const levelOptions = (initialAssets || [])
    .filter((a: any) => a.type === "level")
    .map((a: any) => a.value);
  const batchOptions = (initialAssets || [])
    .filter((a: any) => a.type === "batch")
    .map((a: any) => a.value);
  const boardOptions = (initialAssets || [])
    .filter((a: any) => a.type === "board")
    .map((a: any) => a.value);

  const [profileData, setProfileData] = useState({
    image: "",
    name: "",
    email: "",
    phone: "",
    level: levelOptions[0] || "HSC",
    batch: batchOptions[0] || "2023",
    board: boardOptions[0] || "Dhaka",
    institution: "",
    address: "",
  });

  useEffect(() => {
    const savedName = localStorage.getItem("userName") || "";
    const savedEmail = localStorage.getItem("userEmail") || "";
    setProfileData((prev) => ({
      ...prev,
      name: savedName || prev.name,
      email: savedEmail || prev.email,
    }));
  }, []);

  const handleChange = (field: string, value: string) => {
    setProfileData((prev) => ({ ...prev, [field]: value }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileData((prev) => ({ ...prev, image: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await completeProfile(profileData);
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message || "Failed to save profile details.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-[#fcfcfc] min-h-screen py-10">
      <div className="mx-auto flex flex-col justify-center items-center gap-6 max-w-xl px-4">
        {/* Header Branding */}
        <div className="w-[120px] sm:w-[150px] space-y-3">
          <Link href="/">
            <Image src={logo2} alt="logo" width={200} height={100} />
          </Link>
        </div>

        {/* Title */}
        <div className="flex flex-col justify-center items-center text-center space-y-1">
          <h1 className="text-2xl font-bold">Complete Your Profile</h1>
          <p className="text-sm font-bold text-[#dd6b01]">
            Please provide your information to set up your account.
          </p>
        </div>

        {error && (
          <div className="w-full bg-red-50 text-red-600 text-xs font-semibold p-3 rounded-lg border border-red-200 text-center">
            {error}
          </div>
        )}

        {/* Form Container */}
        <form onSubmit={handleSubmit} className="w-full flex flex-col justify-center items-center gap-5">
          {/* Profile Image Upload */}
          <div className="relative">
            <div className="w-24 h-24 rounded-full border-2 border-[#dd6b01] overflow-hidden bg-gray-100 flex items-center justify-center">
              {profileData.image ? (
                <Image src={profileData.image} alt="Profile" width={96} height={96} className="object-cover w-full h-full" />
              ) : (
                <span className="text-gray-400 font-semibold text-xs">No Photo</span>
              )}
            </div>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="absolute bottom-0 right-0 p-2 bg-[#dd6b01] text-white rounded-full text-xs shadow hover:bg-orange-600 transition"
              title="Upload Photo"
            >
              <FaEdit />
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageUpload}
              accept="image/*"
              className="hidden"
            />
          </div>

          {/* Input Fields */}
          <div className="w-full space-y-3">
            <input
              type="text"
              placeholder="Full Name"
              value={profileData.name}
              onChange={(e) => handleChange("name", e.target.value)}
              className="w-full border border-gray-300 rounded-md p-2.5 text-sm focus:outline-[#dd6b01]"
              required
            />

            <input
              type="email"
              placeholder="Email Address"
              value={profileData.email}
              onChange={(e) => handleChange("email", e.target.value)}
              className="w-full border border-gray-300 rounded-md p-2.5 text-sm focus:outline-[#dd6b01]"
              required
            />

            <input
              type="text"
              placeholder="Phone Number"
              value={profileData.phone}
              onChange={(e) => handleChange("phone", e.target.value)}
              className="w-full border border-gray-300 rounded-md p-2.5 text-sm focus:outline-[#dd6b01]"
            />

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <CustomSelect
                options={levelOptions.length ? levelOptions : ["Class 10", "HSC", "Admission"]}
                value={profileData.level}
                onChange={(val) => handleChange("level", val)}
                placeholder="Level"
              />

              <CustomSelect
                options={batchOptions.length ? batchOptions : ["2023", "2024", "2025"]}
                value={profileData.batch}
                onChange={(val) => handleChange("batch", val)}
                placeholder="Batch"
              />

              <CustomSelect
                options={boardOptions.length ? boardOptions : ["Dhaka", "Rajshahi", "Chittagong"]}
                value={profileData.board}
                onChange={(val) => handleChange("board", val)}
                placeholder="Board"
              />
            </div>

            <input
              type="text"
              placeholder="Educational Institution"
              value={profileData.institution}
              onChange={(e) => handleChange("institution", e.target.value)}
              className="w-full border border-gray-300 rounded-md p-2.5 text-sm focus:outline-[#dd6b01]"
            />

            <input
              type="text"
              placeholder="Address / Location"
              value={profileData.address}
              onChange={(e) => handleChange("address", e.target.value)}
              className="w-full border border-gray-300 rounded-md p-2.5 text-sm focus:outline-[#dd6b01]"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#dd6b01] text-white py-3 rounded-lg font-bold text-sm hover:bg-orange-600 transition shadow cursor-pointer disabled:opacity-50"
          >
            {loading ? "Saving Profile..." : "Complete Setup"}
          </button>
        </form>
      </div>
    </div>
  );
}
