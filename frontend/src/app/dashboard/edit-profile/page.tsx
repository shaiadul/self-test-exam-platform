"use client";

import { useRef, useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Input } from "../../../components/ui/Input";
import CustomSelect from "../../../components/ui/CustomSelect";
import { PrimaryBtn } from "../../../components/ui/PrimaryBtn";
import { OutlineBtn } from "../../../components/ui/OutlineBtn";
import {
  FaEdit,
  FaCheckCircle,
  FaUser,
  FaEnvelope,
  FaPhoneAlt,
  FaMapMarkerAlt,
  FaBuilding,
  FaBriefcase,
  FaGlobe,
} from "react-icons/fa";
import { PageContainer } from "../../../components/common/PageContainer";

import { getProfileAction, updateProfileAction, getSystemAssetsAction } from "../../../lib/actions";

export default function EditProfile() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [userRole, setUserRole] = useState<string>("student");
  const [loading, setLoading] = useState(false);
  const [showSuccessToast, setShowSuccessToast] = useState(false);

  // Dynamic options from system assets API
  const [levelOptions, setLevelOptions] = useState<string[]>([]);
  const [batchOptions, setBatchOptions] = useState<string[]>([]);
  const [boardOptions, setBoardOptions] = useState<string[]>([]);

  // Core profile state mapping
  const [profileData, setProfileData] = useState({
    image: "/user/md-saidul.jpeg",
    name: "Md Saidul Basar",
    email: "saidul@test.com",
    phone: "01700000000",
    address: "Dhaka, Bangladesh",

    // Student specific fields
    level: "HSC",
    batch: "2023",
    board: "Dhaka",
    institution: "Govt. Titumir College",

    // Teacher specific fields
    subject: "Physics Department",
    designation: "Lead Physics Instructor",

    // Admin specific fields
    adminTier: "Super Admin",
    adminDept: "Core Control Operations",
    adminBase: "Primary Server Node",
  });

  // Load system assets for dynamic select options
  useEffect(() => {
    async function loadAssets() {
      try {
        const assets = await getSystemAssetsAction();
        if (Array.isArray(assets)) {
          setLevelOptions(assets.filter((a: any) => a.type === "level").map((a: any) => a.value));
          setBatchOptions(assets.filter((a: any) => a.type === "batch").map((a: any) => a.value));
          setBoardOptions(assets.filter((a: any) => a.type === "board").map((a: any) => a.value));
        }
      } catch (err) {
        console.error("Failed to load system assets:", err);
      }
    }
    loadAssets();
  }, []);

  useEffect(() => {
    async function loadProfile() {
      const role = localStorage.getItem("userRole") || "student";
      setUserRole(role);

      try {
        const profile = await getProfileAction();
        if (profile) {
          setProfileData({
            name: profile.name || "",
            email: profile.email || "",
            phone: profile.phone || "",
            address: profile.address || "",
            image: profile.image || "/user/md-saidul.jpeg",
            level: profile.level || "HSC",
            batch: profile.batch || "2023",
            board: profile.board || "Dhaka",
            institution: profile.institution || "",
            subject: profile.subject || "",
            designation: profile.designation || "",
            adminTier: profile.adminTier || "",
            adminDept: profile.adminDept || "",
            adminBase: profile.adminBase || "",
          });
        }
      } catch (err) {
        console.error("Failed to load profile:", err);
      }
    }
    loadProfile();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await updateProfileAction(profileData);
      if (res.success && res.user) {
        // Save fields to localStorage
        localStorage.setItem("userName", res.user.name || "");
        localStorage.setItem("userEmail", res.user.email || "");
        localStorage.setItem("userPhone", res.user.phone || "");
        localStorage.setItem("userAddress", res.user.address || "");
        localStorage.setItem("userImage", res.user.image || "/user/md-saidul.jpeg");

        if (userRole === "student") {
          localStorage.setItem("studentBoard", res.user.board || "");
          localStorage.setItem("studentLevel", res.user.level || "");
          localStorage.setItem("studentBatch", res.user.batch || "");
          localStorage.setItem("studentInstitution", res.user.institution || "");
        } else if (userRole === "teacher") {
          localStorage.setItem("teacherSubject", res.user.subject || "");
          localStorage.setItem("teacherDesignation", res.user.designation || "");
          localStorage.setItem("teacherInstitution", res.user.institution || "");
        } else if (userRole === "admin") {
          localStorage.setItem("adminTier", res.user.adminTier || "");
          localStorage.setItem("adminDept", res.user.adminDept || "");
          localStorage.setItem("adminBase", res.user.adminBase || "");
        }

        setLoading(false);
        setShowSuccessToast(true);

        setTimeout(() => {
          router.push("/dashboard");
        }, 1500);
      } else {
        alert(res.error || "Failed to update profile.");
        setLoading(false);
      }
    } catch (err) {
      alert("An error occurred updating profile.");
      setLoading(false);
    }
  };

  return (
    <PageContainer className="space-y-6">
      {/* Dynamic Success Toast */}
      {showSuccessToast && (
        <div className="fixed top-6 right-6 z-[9999] bg-[#dd6b01] text-white font-bold px-6 py-4 rounded-xl shadow-xl shadow-orange-500/20 border border-[#dd6b01] flex items-center gap-3 animate-slideIn">
          <FaCheckCircle className="text-xl" />
          <span>Profile updated successfully!</span>
        </div>
      )}

      {/* Main Title Aligned with Dashboard Layout Color theme */}
      <h1 className="text-3xl font-bold text-[#dd6b01] mb-6">
        Edit Your Profile
      </h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Profile Image card (Uses standard dashboard container styling) */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col sm:flex-row items-center gap-6">
          <div className="relative group shrink-0">
            <div className="absolute -inset-1 bg-gradient-to-tr from-[#dd6b01] to-[#f0b176] rounded-full blur opacity-25 group-hover:opacity-45 transition duration-500"></div>
            <div className="relative border-4 border-white rounded-full overflow-hidden shadow-md w-28 h-28 bg-gray-50 flex items-center justify-center">
              {profileData.image ? (
                <Image
                  src={profileData.image}
                  alt="Profile"
                  width={112}
                  height={112}
                  className="w-full h-full object-cover"
                  onError={() =>
                    setProfileData((prev) => ({ ...prev, image: "" }))
                  }
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-3xl font-black text-white bg-gradient-to-tr from-[#dd6b01] to-[#f0b176]">
                  {profileData.name.charAt(0).toUpperCase()}
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="absolute bottom-0 right-0 bg-[#dd6b01] text-white p-2 rounded-full shadow-md hover:bg-[#c35f00] cursor-pointer transition active:scale-95"
            >
              <FaEdit size={14} />
            </button>

            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  const file = e.target.files[0];
                  const imageUrl = URL.createObjectURL(file);
                  setProfileData({ ...profileData, image: imageUrl });
                }
              }}
              className="hidden"
            />
          </div>
          <div className="text-center sm:text-left">
            <h3 className="text-lg font-bold text-gray-800">Profile Image</h3>
            <p className="text-xs text-gray-400 mt-1">
              Accepts JPG, PNG formats. Maximum size allowed is 5MB.
            </p>
          </div>
        </div>

        {/* Core Profile Fields (Uses Custom Reusable <Input> component) */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-6">
          <h3 className="text-md font-bold text-gray-800 border-b border-gray-50 pb-3 flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#dd6b01]"></span>
            Core Contact Details
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Name */}
            <Input
              label="Full Name"
              type="text"
              placeholder="Enter full name"
              icon={<FaUser className="text-[#dd6b01]" />}
              value={profileData.name}
              onChange={(e) =>
                setProfileData({ ...profileData, name: e.target.value })
              }
              required
            />

            {/* Email */}
            <Input
              label="Email Address"
              type="email"
              placeholder="Enter email address"
              icon={<FaEnvelope className="text-[#dd6b01]" />}
              value={profileData.email}
              onChange={(e) =>
                setProfileData({ ...profileData, email: e.target.value })
              }
              required
            />

            {/* Phone */}
            <Input
              label="Contact Phone"
              type="text"
              placeholder="Enter telephone number"
              icon={<FaPhoneAlt className="text-[#dd6b01]" />}
              value={profileData.phone}
              onChange={(e) =>
                setProfileData({ ...profileData, phone: e.target.value })
              }
              required
            />

            {/* Address */}
            <Input
              label="Location Address"
              type="text"
              placeholder="Enter city address"
              icon={<FaMapMarkerAlt className="text-[#dd6b01]" />}
              value={profileData.address}
              onChange={(e) =>
                setProfileData({ ...profileData, address: e.target.value })
              }
              required
            />
          </div>
        </div>

        {/* ========================================================
            Dynamic Section Per Role
            ======================================================== */}

        {/* STUDENT METADATA */}
        {userRole === "student" && (
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-6 animate-fadeIn">
            <h3 className="text-md font-bold text-gray-800 border-b border-gray-50 pb-3 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#dd6b01]"></span>
              Student Academic Info
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <CustomSelect
                label="Academic Level"
                placeholder="Select level"
                options={levelOptions}
                value={profileData.level}
                onChange={(val) =>
                  setProfileData({ ...profileData, level: val })
                }
              />
              <CustomSelect
                label="Class Batch"
                placeholder="Select batch"
                options={batchOptions}
                value={profileData.batch}
                onChange={(val) =>
                  setProfileData({ ...profileData, batch: val })
                }
              />
              <CustomSelect
                label="Education Board"
                placeholder="Select board"
                options={boardOptions}
                value={profileData.board}
                onChange={(val) =>
                  setProfileData({ ...profileData, board: val })
                }
              />
              <div className="md:col-span-2">
                <Input
                  label="Educational Institution"
                  type="text"
                  placeholder="Enter college/school name"
                  icon={<FaBuilding className="text-[#dd6b01]" />}
                  value={profileData.institution}
                  onChange={(e) =>
                    setProfileData({
                      ...profileData,
                      institution: e.target.value,
                    })
                  }
                  required
                />
              </div>
            </div>
          </div>
        )}

        {/* TEACHER METADATA */}
        {userRole === "teacher" && (
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-6 animate-fadeIn">
            <h3 className="text-md font-bold text-gray-800 border-b border-gray-50 pb-3 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#dd6b01]"></span>
              Educator Profile Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="Faculty Department"
                type="text"
                placeholder="e.g. Physics Department"
                icon={<FaBriefcase className="text-[#dd6b01]" />}
                value={profileData.subject}
                onChange={(e) =>
                  setProfileData({ ...profileData, subject: e.target.value })
                }
                required
              />
              <Input
                label="Educator Title / Designation"
                type="text"
                placeholder="e.g. Lead Instructor"
                icon={<FaBriefcase className="text-[#dd6b01]" />}
                value={profileData.designation}
                onChange={(e) =>
                  setProfileData({
                    ...profileData,
                    designation: e.target.value,
                  })
                }
                required
              />
              <div className="md:col-span-2">
                <Input
                  label="Affiliated Academic Institution"
                  type="text"
                  placeholder="Enter college/university name"
                  icon={<FaBuilding className="text-[#dd6b01]" />}
                  value={profileData.institution}
                  onChange={(e) =>
                    setProfileData({
                      ...profileData,
                      institution: e.target.value,
                    })
                  }
                  required
                />
              </div>
            </div>
          </div>
        )}

        {/* ADMIN METADATA */}
        {userRole === "admin" && (
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-6 animate-fadeIn">
            <h3 className="text-md font-bold text-gray-800 border-b border-gray-50 pb-3 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#dd6b01]"></span>
              Administrative Configuration Nodes
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="Access Operations Tier"
                type="text"
                placeholder="e.g. Super Admin"
                icon={<FaBriefcase className="text-[#dd6b01]" />}
                value={profileData.adminTier}
                onChange={(e) =>
                  setProfileData({ ...profileData, adminTier: e.target.value })
                }
                required
              />
              <Input
                label="Authorized Control Department"
                type="text"
                placeholder="e.g. Security & Portal Operations"
                icon={<FaBuilding className="text-[#dd6b01]" />}
                value={profileData.adminDept}
                onChange={(e) =>
                  setProfileData({ ...profileData, adminDept: e.target.value })
                }
                required
              />
              <div className="md:col-span-2">
                <Input
                  label="Primary Operations Base"
                  type="text"
                  placeholder="e.g. Primary Server Node"
                  icon={<FaGlobe className="text-[#dd6b01]" />}
                  value={profileData.adminBase}
                  onChange={(e) =>
                    setProfileData({
                      ...profileData,
                      adminBase: e.target.value,
                    })
                  }
                  required
                />
              </div>
            </div>
          </div>
        )}

        {/* Form Controls (Uses Reusable <OutlineBtn> and <PrimaryBtn> components) */}
        <div className="flex flex-row gap-3 justify-end pt-4">
          <OutlineBtn
            link="/dashboard"
            type="button"
            className="text-sm py-2.5 text-[#dd6b01] border-[#dd6b01] hover:bg-[#fff4ec]"
          >
            Cancel
          </OutlineBtn>
          <PrimaryBtn
            type="submit"
            disabled={loading}
            className="shadow-md shadow-orange-500/10 text-sm py-2.5"
          >
            {loading ? "Saving Changes..." : "Save Profile Changes"}
          </PrimaryBtn>
        </div>
      </form>
    </PageContainer>
  );
}
