"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import logo2 from "../../../../public/global/logo2.png";
import Image from "next/image";
import { useRouter } from "next/navigation";
import CustomSelect from "../../../components/ui/CustomSelect";
import ImageUploader from "../../../components/ui/ImageUploader";
import { completeProfile } from "../../../lib/auth";
import { PrimaryBtn } from "../../../components/ui/PrimaryBtn";
import { FaUser, FaEnvelope, FaPhoneAlt, FaBuilding, FaMapMarkerAlt, FaShieldAlt } from "react-icons/fa";

interface CompleteProfileClientViewProps {
  initialAssets: any[];
}

export default function CompleteProfileClientView({
  initialAssets,
}: CompleteProfileClientViewProps) {
  const router = useRouter();

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
    <div className="min-h-screen bg-slate-50/70 flex flex-col justify-center items-center py-10 px-4">
      <div className="w-full max-w-xl space-y-5">
        {/* Header Branding */}
        <div className="flex flex-col items-center text-center space-y-2">
          <Link href="/" className="inline-block transition-transform hover:scale-[1.02]">
            <Image src={logo2} alt="logo" width={140} height={36} priority className="w-auto h-8" />
          </Link>
          <div>
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
              ONBOARDING // CANDIDATE_INITIALIZATION
            </span>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Complete Your Candidate Profile
            </h1>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Configure curriculum mapping and identity metadata to unlock your portal.
            </p>
          </div>
        </div>

        {error && (
          <div className="w-full bg-rose-50 text-rose-700 text-xs font-semibold p-3 rounded border border-rose-200 text-center">
            {error}
          </div>
        )}

        {/* Form Container */}
        <div className="relative overflow-hidden bg-white border border-slate-200/80 rounded p-4 sm:p-7 shadow-2xs">
          {/* Subtle Telemetry Matrix Grid */}
          <svg
            className="absolute -right-10 -bottom-10 w-48 h-48 text-slate-700 opacity-[0.03] pointer-events-none"
            viewBox="0 0 120 120"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle cx="60" cy="60" r="50" stroke="currentColor" strokeWidth="1" strokeDasharray="3 3" />
            <circle cx="60" cy="60" r="35" stroke="currentColor" strokeWidth="1.5" />
            <path d="M60 10 V110 M10 60 H110" stroke="currentColor" strokeWidth="0.8" />
          </svg>

          <form onSubmit={handleSubmit} className="relative z-10 space-y-5">
            {/* Avatar Row */}
            <div className="flex flex-col items-center justify-center text-center pb-2 border-b border-slate-100">
              <ImageUploader
                variant="avatar"
                folder="avatars"
                value={profileData.image}
                onChange={(url) => setProfileData((prev) => ({ ...prev, image: url || "" }))}
              />
              <span className="text-[10px] font-mono text-slate-400 mt-2">
                UPLOAD PROFILE AVATAR (OPTIONAL)
              </span>
            </div>

            {/* Core Info */}
            <div className="space-y-3">
              <div>
                <label className="text-xs font-mono font-bold uppercase tracking-wider text-slate-600 block mb-1">
                  Full Name *
                </label>
                <div className="flex items-center bg-white border border-slate-300 rounded overflow-hidden focus-within:border-primary focus-within:ring-1 focus-within:ring-primary/20">
                  <span className="pl-3 text-slate-400 text-xs">
                    <FaUser />
                  </span>
                  <input
                    type="text"
                    placeholder="Candidate Legal Name"
                    value={profileData.name}
                    onChange={(e) => handleChange("name", e.target.value)}
                    className="w-full p-2.5 text-xs text-slate-900 placeholder:text-slate-400 bg-transparent outline-none font-medium"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-mono font-bold uppercase tracking-wider text-slate-600 block mb-1">
                    Email Address *
                  </label>
                  <div className="flex items-center bg-slate-50 border border-slate-200 rounded overflow-hidden">
                    <span className="pl-3 text-slate-400 text-xs">
                      <FaEnvelope />
                    </span>
                    <input
                      type="email"
                      value={profileData.email}
                      disabled
                      className="w-full p-2.5 text-xs text-slate-600 font-mono bg-transparent outline-none cursor-not-allowed"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-mono font-bold uppercase tracking-wider text-slate-600 block mb-1">
                    Phone Number
                  </label>
                  <div className="flex items-center bg-white border border-slate-300 rounded overflow-hidden focus-within:border-primary focus-within:ring-1 focus-within:ring-primary/20">
                    <span className="pl-3 text-slate-400 text-xs">
                      <FaPhoneAlt />
                    </span>
                    <input
                      type="text"
                      placeholder="01XXXXXXXXX"
                      value={profileData.phone}
                      onChange={(e) => handleChange("phone", e.target.value)}
                      className="w-full p-2.5 text-xs text-slate-900 placeholder:text-slate-400 bg-transparent outline-none font-medium"
                    />
                  </div>
                </div>
              </div>

              {/* Academic Dropdowns */}
              <div>
                <label className="text-xs font-mono font-bold uppercase tracking-wider text-slate-600 block mb-1">
                  Academic Mapping
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
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
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-mono font-bold uppercase tracking-wider text-slate-600 block mb-1">
                    Educational Institution
                  </label>
                  <div className="flex items-center bg-white border border-slate-300 rounded overflow-hidden focus-within:border-primary focus-within:ring-1 focus-within:ring-primary/20">
                    <span className="pl-3 text-slate-400 text-xs">
                      <FaBuilding />
                    </span>
                    <input
                      type="text"
                      placeholder="e.g. Dhaka College"
                      value={profileData.institution}
                      onChange={(e) => handleChange("institution", e.target.value)}
                      className="w-full p-2.5 text-xs text-slate-900 placeholder:text-slate-400 bg-transparent outline-none font-medium"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-mono font-bold uppercase tracking-wider text-slate-600 block mb-1">
                    Location / Address
                  </label>
                  <div className="flex items-center bg-white border border-slate-300 rounded overflow-hidden focus-within:border-primary focus-within:ring-1 focus-within:ring-primary/20">
                    <span className="pl-3 text-slate-400 text-xs">
                      <FaMapMarkerAlt />
                    </span>
                    <input
                      type="text"
                      placeholder="City, District"
                      value={profileData.address}
                      onChange={(e) => handleChange("address", e.target.value)}
                      className="w-full p-2.5 text-xs text-slate-900 placeholder:text-slate-400 bg-transparent outline-none font-medium"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-2">
              <PrimaryBtn
                type="submit"
                disabled={loading}
                className="w-full !py-2.5 !rounded !text-xs shadow-2xs font-bold gap-2"
              >
                {loading ? (
                  <>
                    <span className="animate-spin inline-block w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full" />
                    <span>Configuring Account…</span>
                  </>
                ) : (
                  <>
                    <FaShieldAlt className="text-xs" />
                    <span>Complete Setup & Enter Portal</span>
                  </>
                )}
              </PrimaryBtn>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
