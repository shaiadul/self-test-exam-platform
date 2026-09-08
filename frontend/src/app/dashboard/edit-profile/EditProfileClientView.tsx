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
  FaArrowLeft,
  FaCamera,
  FaCheckCircle,
  FaShieldAlt,
  FaGraduationCap,
  FaChalkboardTeacher,
  FaSpinner,
} from "react-icons/fa";
import { PageContainer } from "../../../components/common/PageContainer";
import ImageUploader from "../../../components/ui/ImageUploader";

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

  // Core profile state — use actual values from profile, don't inject hardcoded defaults
  const [profileData, setProfileData] = useState({
    image: initialProfile?.image || "",
    name: initialProfile?.name || "",
    email: initialProfile?.email || "",
    phone: initialProfile?.phone || "",
    address: initialProfile?.address || "",

    // Student specific fields
    level: initialProfile?.level || "",
    batch: initialProfile?.batch || "",
    board: initialProfile?.board || "",
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!profileData.name.trim()) {
      toast.error("Name is required.");
      return;
    }

    setLoading(true);

    try {
      // Build payload — exclude email (immutable) and only send changed fields
      const payload: Record<string, string> = {};

      // Always send name
      payload.name = profileData.name;

      // Send image if present
      if (profileData.image) {
        payload.image = profileData.image;
      }

      // Send optional fields only if they have values
      if (profileData.phone) payload.phone = profileData.phone;
      if (profileData.address) payload.address = profileData.address;

      // Role-specific fields
      const normRole = userRole.toLowerCase();
      if (normRole === "student") {
        if (profileData.level) payload.level = profileData.level;
        if (profileData.batch) payload.batch = profileData.batch;
        if (profileData.board) payload.board = profileData.board;
        if (profileData.institution) payload.institution = profileData.institution;
      } else if (normRole === "teacher") {
        if (profileData.subject) payload.subject = profileData.subject;
        if (profileData.designation) payload.designation = profileData.designation;
        if (profileData.institution) payload.institution = profileData.institution;
      } else if (normRole === "admin") {
        if (profileData.adminTier) payload.adminTier = profileData.adminTier;
        if (profileData.adminDept) payload.adminDept = profileData.adminDept;
        if (profileData.adminBase) payload.adminBase = profileData.adminBase;
      }

      const res = await updateProfileAction(payload);
      if (res.success) {
        if (typeof window !== "undefined") {
          localStorage.setItem("userName", payload.name || "");
          if (payload.image) {
            localStorage.setItem("userImage", payload.image);
          } else {
            localStorage.removeItem("userImage");
          }
          window.dispatchEvent(new CustomEvent("profileUpdated", { detail: res.user || payload }));
        }
        toast.success("Profile updated successfully!");
        router.push("/dashboard");
        router.refresh();
      } else {
        toast.error(res.error || "Failed to update profile.");
      }
    } catch {
      toast.error("An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const normRole = userRole.toLowerCase();

  // Role badge config
  const roleBadgeMap: Record<string, { icon: React.ReactNode; label: string; color: string }> = {
    student: { icon: <FaGraduationCap />, label: "Student", color: "bg-blue-50 text-blue-600 border-blue-200" },
    teacher: { icon: <FaChalkboardTeacher />, label: "Instructor", color: "bg-emerald-50 text-emerald-600 border-emerald-200" },
    admin: { icon: <FaShieldAlt />, label: "Administrator", color: "bg-purple-50 text-purple-600 border-purple-200" },
  };
  const roleBadge = roleBadgeMap[normRole] || { icon: <FaUser />, label: userRole, color: "bg-gray-50 text-gray-600 border-gray-200" };

  return (
    <PageContainer className="space-y-8 animate-fadeIn">
      {/* Header with back navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div className="flex items-center gap-3">
          <OutlineBtn
            link="/dashboard"
            className="!p-2.5 !rounded-xl !text-slate-600 hover:!text-[#dd6b01] shadow-xs"
            title="Back to Dashboard"
          >
            <FaArrowLeft className="text-xs" />
          </OutlineBtn>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Edit Profile
            </h1>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Update your account details and personal information.
            </p>
          </div>
        </div>
        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-bold ${roleBadge.color}`}>
          {roleBadge.icon}
          <span>{roleBadge.label} Account</span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Profile Picture + Identity Card */}
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="p-6 flex flex-col sm:flex-row items-center gap-6">
            <ImageUploader
              variant="avatar"
              folder="avatars"
              value={profileData.image}
              onChange={(url) => setProfileData((prev) => ({ ...prev, image: url || "" }))}
            />

            <div className="text-center sm:text-left space-y-1.5 flex-1">
              <h3 className="font-black text-slate-900 text-lg tracking-tight">
                {profileData.name || "Your Name"}
              </h3>
              <p className="text-xs text-slate-500 font-semibold flex items-center gap-1.5 justify-center sm:justify-start">
                <FaEnvelope className="text-[10px] text-slate-400" />
                {profileData.email}
              </p>
              <p className="text-[11px] text-slate-400 font-medium">
                JPG, PNG or WebP • Max 2MB
              </p>
            </div>

            {profileData.image && profileData.image !== initialProfile?.image && (
              <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full flex items-center gap-1 shrink-0">
                <FaCheckCircle className="text-[10px]" />
                Photo updated
              </span>
            )}
          </div>
        </div>

        {/* Personal Information */}
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100">
            <h3 className="text-lg font-black text-slate-900 tracking-tight">Personal Information</h3>
            <p className="text-[11px] text-slate-400 font-medium mt-0.5">Your basic account details</p>
          </div>

          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-5">
            <Input
              label="Full Name"
              icon={<FaUser className="text-gray-400" />}
              value={profileData.name}
              onChange={(e) => handleChange("name", e.target.value)}
              placeholder="Enter your full name"
              required
            />

            <Input
              label="Email Address"
              icon={<FaEnvelope className="text-gray-400" />}
              type="email"
              value={profileData.email}
              disabled
            />

            <Input
              label="Phone Number"
              icon={<FaPhoneAlt className="text-gray-400" />}
              value={profileData.phone}
              onChange={(e) => handleChange("phone", e.target.value)}
              placeholder="01XXXXXXXXX"
            />

            <Input
              label="Address / Location"
              icon={<FaMapMarkerAlt className="text-gray-400" />}
              value={profileData.address}
              onChange={(e) => handleChange("address", e.target.value)}
              placeholder="City, District"
            />
          </div>
        </div>

        {/* Student Academic Fields */}
        {normRole === "student" && (
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100">
              <h3 className="text-lg font-black text-slate-900 tracking-tight">Academic Configuration</h3>
              <p className="text-[11px] text-slate-400 font-medium mt-0.5">Your education board, level, and institution details</p>
            </div>

            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-5">
              <CustomSelect
                label="Academic Level"
                options={levelOptions.length ? levelOptions : ["Class 10", "HSC", "Admission", "Undergraduate"]}
                value={profileData.level}
                onChange={(val) => handleChange("level", val)}
                placeholder="Select Academic Level"
              />

              <CustomSelect
                label="Target Batch Year"
                options={batchOptions.length ? batchOptions : ["2023", "2024", "2025", "2026"]}
                value={profileData.batch}
                onChange={(val) => handleChange("batch", val)}
                placeholder="Select Target Batch"
              />

              <CustomSelect
                label="Education Board"
                options={boardOptions.length ? boardOptions : ["Dhaka", "Rajshahi", "Chittagong", "Cambridge"]}
                value={profileData.board}
                onChange={(val) => handleChange("board", val)}
                placeholder="Select Education Board"
              />

              <Input
                label="Educational Institution"
                icon={<FaBuilding className="text-gray-400" />}
                value={profileData.institution}
                onChange={(e) => handleChange("institution", e.target.value)}
                placeholder="e.g. Dhaka College"
              />
            </div>
          </div>
        )}

        {/* Teacher Faculty Fields */}
        {normRole === "teacher" && (
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100">
              <h3 className="text-lg font-black text-slate-900 tracking-tight">Faculty Details</h3>
              <p className="text-[11px] text-slate-400 font-medium mt-0.5">Your department, subject expertise, and designation</p>
            </div>

            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-5">
              <Input
                label="Department / Subject"
                icon={<FaBriefcase className="text-gray-400" />}
                value={profileData.subject}
                onChange={(e) => handleChange("subject", e.target.value)}
                placeholder="Physics, Mathematics, etc."
              />

              <Input
                label="Designation"
                icon={<FaGlobe className="text-gray-400" />}
                value={profileData.designation}
                onChange={(e) => handleChange("designation", e.target.value)}
                placeholder="Senior Instructor, Lecturer"
              />

              <Input
                label="Institution"
                icon={<FaBuilding className="text-gray-400" />}
                value={profileData.institution}
                onChange={(e) => handleChange("institution", e.target.value)}
                placeholder="University / College Name"
              />
            </div>
          </div>
        )}

        {/* Admin Fields */}
        {normRole === "admin" && (
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100">
              <h3 className="text-lg font-black text-slate-900 tracking-tight">Admin Configuration</h3>
              <p className="text-[11px] text-slate-400 font-medium mt-0.5">Administrative role and operations details</p>
            </div>

            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-5">
              <Input
                label="Admin Tier"
                value={profileData.adminTier}
                onChange={(e) => handleChange("adminTier", e.target.value)}
                placeholder="Super Admin, Moderator, etc."
              />

              <Input
                label="Operations Department"
                value={profileData.adminDept}
                onChange={(e) => handleChange("adminDept", e.target.value)}
                placeholder="IT, Academic, Finance"
              />

              <Input
                label="Administrative Base"
                value={profileData.adminBase}
                onChange={(e) => handleChange("adminBase", e.target.value)}
                placeholder="Headquarters, Branch, etc."
              />
            </div>
          </div>
        )}

        {/* Submit Actions */}
        <div className="flex items-center justify-between pt-2">
          <p className="text-[11px] text-slate-400 font-medium hidden sm:block">
            Fields marked with * are required
          </p>

          <div className="flex items-center gap-3 ml-auto">
            <OutlineBtn
              type="button"
              onClick={() => router.back()}
              className="!text-sm !py-2.5 !px-5"
            >
              Cancel
            </OutlineBtn>
            <PrimaryBtn
              type="submit"
              disabled={loading}
              className="!text-sm !py-2.5 !px-6 gap-2 shadow-md"
            >
              {loading ? (
                <>
                  <span className="animate-spin inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full" />
                  Saving...
                </>
              ) : (
                <>
                  <FaCheckCircle className="text-xs" />
                  Save Changes
                </>
              )}
            </PrimaryBtn>
          </div>
        </div>
      </form>
    </PageContainer>
  );
}
