"use client";

import { useRef, useState } from "react";
import { toast } from "sonner";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Input } from "../../../components/ui/Input";
import CustomSelect from "../../../components/ui/CustomSelect";
import { PrimaryBtn } from "../../../components/ui/PrimaryBtn";
import { OutlineBtn } from "../../../components/ui/OutlineBtn";
import {
  FaEdit,
  FaUser,
  FaEnvelope,
  FaPhoneAlt,
  FaMapMarkerAlt,
  FaBuilding,
  FaBriefcase,
  FaGlobe,
} from "react-icons/fa";
import { PageContainer } from "../../../components/common/PageContainer";

import { updateProfileAction } from "../../../lib/actions";

interface EditProfileClientViewProps {
  initialProfile: any;
  initialAssets: any[];
}

export default function EditProfileClientView({
  initialProfile,
  initialAssets,
}: EditProfileClientViewProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const userRole = initialProfile?.role || "student";
  const [loading, setLoading] = useState(false);

  // Dynamic options from system assets
  const levelOptions = (initialAssets || [])
    .filter((a: any) => a.type === "level")
    .map((a: any) => a.value);
  const batchOptions = (initialAssets || [])
    .filter((a: any) => a.type === "batch")
    .map((a: any) => a.value);
  const boardOptions = (initialAssets || [])
    .filter((a: any) => a.type === "board")
    .map((a: any) => a.value);

  // Core profile state mapping
  const [profileData, setProfileData] = useState({
    image: initialProfile?.image || "/user/md-saidul.jpeg",
    name: initialProfile?.name || "",
    email: initialProfile?.email || "",
    phone: initialProfile?.phone || "",
    address: initialProfile?.address || "",

    // Student specific fields
    level: initialProfile?.level || "HSC",
    batch: initialProfile?.batch || "2023",
    board: initialProfile?.board || "Dhaka",
    institution: initialProfile?.institution || "",

    // Teacher specific fields
    subject: initialProfile?.subject || "",
    designation: initialProfile?.designation || "",

    // Admin specific fields
    adminTier: initialProfile?.adminTier || "",
    adminDept: initialProfile?.adminDept || "",
    adminBase: initialProfile?.adminBase || "",
  });

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

    try {
      const res = await updateProfileAction(profileData);
      if (res.success) {
        toast.success("Profile saved successfully!");
        router.push("/dashboard");
      } else {
        toast.error(res.error || "Failed to update profile.");
      }
    } catch {
      toast.error("Failed to update profile.");
    } finally {
      setLoading(false);
    }
  };

  const normRole = userRole.toLowerCase();

  return (
    <PageContainer>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-gray-100 pb-8 mb-8">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Edit Profile</h1>
          <p className="text-gray-500 font-semibold text-sm mt-1">
            Update your account details and profile information.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Profile Picture Upload */}
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-md flex flex-col sm:flex-row items-center gap-6">
          <div className="relative">
            <Image
              src={profileData.image}
              alt="Profile Picture"
              width={100}
              height={100}
              className="rounded-full object-cover w-24 h-24 border-4 border-[#dd6b01]/20 shadow"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="absolute bottom-0 right-0 p-2 bg-[#dd6b01] text-white rounded-full shadow hover:bg-orange-600 transition"
              title="Upload Photo"
            >
              <FaEdit className="text-xs" />
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageUpload}
              accept="image/*"
              className="hidden"
            />
          </div>
          <div className="text-center sm:text-left space-y-1">
            <h3 className="font-bold text-gray-900 text-lg">{profileData.name || "User"}</h3>
            <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider">{userRole} Account</p>
            <p className="text-xs text-gray-400">Click icon to upload a new profile photo</p>
          </div>
        </div>

        {/* Basic Personal Information */}
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-md space-y-6">
          <h3 className="text-lg font-black text-gray-900 border-b border-gray-100 pb-3">Personal Information</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="text-xs font-bold text-gray-700 block mb-1">Full Name</label>
              <Input
                icon={<FaUser className="text-gray-400" />}
                value={profileData.name}
                onChange={(e) => handleChange("name", e.target.value)}
                required
              />
            </div>

            <div>
              <label className="text-xs font-bold text-gray-700 block mb-1">Email Address</label>
              <Input
                icon={<FaEnvelope className="text-gray-400" />}
                type="email"
                value={profileData.email}
                onChange={(e) => handleChange("email", e.target.value)}
                disabled
              />
            </div>

            <div>
              <label className="text-xs font-bold text-gray-700 block mb-1">Phone Number</label>
              <Input
                icon={<FaPhoneAlt className="text-gray-400" />}
                value={profileData.phone}
                onChange={(e) => handleChange("phone", e.target.value)}
              />
            </div>

            <div>
              <label className="text-xs font-bold text-gray-700 block mb-1">Address / Location</label>
              <Input
                icon={<FaMapMarkerAlt className="text-gray-400" />}
                value={profileData.address}
                onChange={(e) => handleChange("address", e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Role Specific Additional Fields */}
        {normRole === "student" && (
          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-md space-y-6">
            <h3 className="text-lg font-black text-gray-900 border-b border-gray-100 pb-3">Academic Configuration</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">Academic Level</label>
                <CustomSelect
                  options={levelOptions.length ? levelOptions : ["Class 10", "HSC", "Admission", "Undergraduate"]}
                  value={profileData.level}
                  onChange={(val) => handleChange("level", val)}
                  placeholder="Select Academic Level"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">Target Batch Year</label>
                <CustomSelect
                  options={batchOptions.length ? batchOptions : ["2023", "2024", "2025", "2026"]}
                  value={profileData.batch}
                  onChange={(val) => handleChange("batch", val)}
                  placeholder="Select Target Batch"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">Education Board</label>
                <CustomSelect
                  options={boardOptions.length ? boardOptions : ["Dhaka", "Rajshahi", "Chittagong", "Cambridge"]}
                  value={profileData.board}
                  onChange={(val) => handleChange("board", val)}
                  placeholder="Select Education Board"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">Educational Institution</label>
                <Input
                  icon={<FaBuilding className="text-gray-400" />}
                  value={profileData.institution}
                  onChange={(e) => handleChange("institution", e.target.value)}
                  placeholder="Titiumir College, NDC, etc."
                />
              </div>
            </div>
          </div>
        )}

        {normRole === "teacher" && (
          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-md space-y-6">
            <h3 className="text-lg font-black text-gray-900 border-b border-gray-100 pb-3">Faculty Details</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">Department / Subject</label>
                <Input
                  icon={<FaBriefcase className="text-gray-400" />}
                  value={profileData.subject}
                  onChange={(e) => handleChange("subject", e.target.value)}
                  placeholder="Physics, Mathematics, etc."
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">Designation</label>
                <Input
                  icon={<FaGlobe className="text-gray-400" />}
                  value={profileData.designation}
                  onChange={(e) => handleChange("designation", e.target.value)}
                  placeholder="Senior Instructor, Lecturer"
                />
              </div>
            </div>
          </div>
        )}

        {normRole === "admin" && (
          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-md space-y-6">
            <h3 className="text-lg font-black text-gray-900 border-b border-gray-100 pb-3">Admin Diagnostics</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">Admin Tier</label>
                <Input
                  value={profileData.adminTier}
                  onChange={(e) => handleChange("adminTier", e.target.value)}
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">Operations Node</label>
                <Input
                  value={profileData.adminDept}
                  onChange={(e) => handleChange("adminDept", e.target.value)}
                />
              </div>
            </div>
          </div>
        )}

        {/* Submit Actions */}
        <div className="flex justify-end gap-4">
          <OutlineBtn type="button" onClick={() => router.back()}>
            Cancel
          </OutlineBtn>
          <PrimaryBtn type="submit" disabled={loading}>
            {loading ? "Saving Profile..." : "Save Changes"}
          </PrimaryBtn>
        </div>
      </form>
    </PageContainer>
  );
}
