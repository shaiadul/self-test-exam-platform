"use client";

import { useRef, useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/Input";
import CustomSelect from "@/components/ui/CustomSelect";
import { PrimaryBtn } from "@/components/ui/PrimaryBtn";
import { OutlineBtn } from "@/components/ui/OutlineBtn";
import { FaEdit, FaCheckCircle, FaUser, FaEnvelope, FaPhoneAlt, FaMapMarkerAlt, FaBuilding, FaBriefcase, FaGlobe } from "react-icons/fa";
import { PageContainer } from "@/components/common/PageContainer";

export default function EditProfile() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [userRole, setUserRole] = useState<string>("student");
  const [loading, setLoading] = useState(false);
  const [showSuccessToast, setShowSuccessToast] = useState(false);

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

  useEffect(() => {
    const role = localStorage.getItem("userRole") || "student";
    setUserRole(role);

    // Load initial values from localStorage if they exist
    const savedName = localStorage.getItem("userName");
    const savedEmail = localStorage.getItem("userEmail");
    const savedPhone = localStorage.getItem("userPhone") || "01700000000";
    const savedAddress = localStorage.getItem("userAddress") || "Dhaka, Bangladesh";
    const savedImage = localStorage.getItem("userImage") || "/user/md-saidul.jpeg";

    setProfileData(prev => {
      const updated = {
        ...prev,
        name: savedName || (role === "admin" ? "Super Admin" : role === "teacher" ? "Prof. Abdus Salam" : "Md Saidul Basar"),
        email: savedEmail || (role === "admin" ? "admin@test.com" : role === "teacher" ? "teacher@test.com" : "student@test.com"),
        phone: savedPhone,
        address: savedAddress,
        image: savedImage,
      };

      if (role === "student") {
        updated.board = localStorage.getItem("studentBoard") || "Dhaka";
        updated.level = localStorage.getItem("studentLevel") || "HSC";
        updated.batch = localStorage.getItem("studentBatch") || "2023";
        updated.institution = localStorage.getItem("studentInstitution") || "Govt. Titumir College";
      } else if (role === "teacher") {
        updated.subject = localStorage.getItem("teacherSubject") || "Physics Department";
        updated.designation = localStorage.getItem("teacherDesignation") || "Lead Physics Instructor";
        updated.institution = localStorage.getItem("teacherInstitution") || "Govt. Titumir College Dhaka";
      } else if (role === "admin") {
        updated.adminTier = localStorage.getItem("adminTier") || "Super Admin";
        updated.adminDept = localStorage.getItem("adminDept") || "Core Control Operations";
        updated.adminBase = localStorage.getItem("adminBase") || "Primary Server Node";
      }

      return updated;
    });
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Save fields to localStorage
    localStorage.setItem("userName", profileData.name);
    localStorage.setItem("userEmail", profileData.email);
    localStorage.setItem("userPhone", profileData.phone);
    localStorage.setItem("userAddress", profileData.address);
    localStorage.setItem("userImage", profileData.image);

    if (userRole === "student") {
      localStorage.setItem("studentBoard", profileData.board);
      localStorage.setItem("studentLevel", profileData.level);
      localStorage.setItem("studentBatch", profileData.batch);
      localStorage.setItem("studentInstitution", profileData.institution);
    } else if (userRole === "teacher") {
      localStorage.setItem("teacherSubject", profileData.subject);
      localStorage.setItem("teacherDesignation", profileData.designation);
      localStorage.setItem("teacherInstitution", profileData.institution);
    } else if (userRole === "admin") {
      localStorage.setItem("adminTier", profileData.adminTier);
      localStorage.setItem("adminDept", profileData.adminDept);
      localStorage.setItem("adminBase", profileData.adminBase);
    }

    setTimeout(() => {
      setLoading(false);
      setShowSuccessToast(true);
      
      setTimeout(() => {
        router.push("/dashboard");
      }, 1500);
    }, 800);
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
                  onError={() => setProfileData(prev => ({ ...prev, image: "" }))}
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
            <p className="text-xs text-gray-400 mt-1">Accepts JPG, PNG formats. Maximum size allowed is 5MB.</p>
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
              onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
              required
            />

            {/* Email */}
            <Input
              label="Email Address"
              type="email"
              placeholder="Enter email address"
              icon={<FaEnvelope className="text-[#dd6b01]" />}
              value={profileData.email}
              onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
              required
            />

            {/* Phone */}
            <Input
              label="Contact Phone"
              type="text"
              placeholder="Enter telephone number"
              icon={<FaPhoneAlt className="text-[#dd6b01]" />}
              value={profileData.phone}
              onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
              required
            />

            {/* Address */}
            <Input
              label="Location Address"
              type="text"
              placeholder="Enter city address"
              icon={<FaMapMarkerAlt className="text-[#dd6b01]" />}
              value={profileData.address}
              onChange={(e) => setProfileData({ ...profileData, address: e.target.value })}
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
              <div>
                <label className="text-sm font-bold text-gray-700 ml-1 block mb-2">Academic Level</label>
                <CustomSelect
                  label="Select level"
                  options={["PSC", "SSC", "HSC", "BCS", "BSS", "BS", "BBA"]}
                  value={profileData.level}
                  onChange={(val) => setProfileData({ ...profileData, level: val })}
                />
              </div>
              <div>
                <label className="text-sm font-bold text-gray-700 ml-1 block mb-2">Class Batch</label>
                <CustomSelect
                  label="Select batch"
                  options={["2018", "2019", "2020", "2021", "2022", "2023", "2024", "2025", "2026"]}
                  value={profileData.batch}
                  onChange={(val) => setProfileData({ ...profileData, batch: val })}
                />
              </div>
              <div>
                <label className="text-sm font-bold text-gray-700 ml-1 block mb-2">Education Board</label>
                <CustomSelect
                  label="Select board"
                  options={["Dhaka", "Chattogram", "Rajshahi", "Khulna", "Sylhet", "Mymensingh"]}
                  value={profileData.board}
                  onChange={(val) => setProfileData({ ...profileData, board: val })}
                />
              </div>
              <Input
                label="Educational Institution"
                type="text"
                placeholder="Enter college/school name"
                icon={<FaBuilding className="text-[#dd6b01]" />}
                value={profileData.institution}
                onChange={(e) => setProfileData({ ...profileData, institution: e.target.value })}
                required
              />
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
                onChange={(e) => setProfileData({ ...profileData, subject: e.target.value })}
                required
              />
              <Input
                label="Educator Title / Designation"
                type="text"
                placeholder="e.g. Lead Instructor"
                icon={<FaBriefcase className="text-[#dd6b01]" />}
                value={profileData.designation}
                onChange={(e) => setProfileData({ ...profileData, designation: e.target.value })}
                required
              />
              <div className="md:col-span-2">
                <Input
                  label="Affiliated Academic Institution"
                  type="text"
                  placeholder="Enter college/university name"
                  icon={<FaBuilding className="text-[#dd6b01]" />}
                  value={profileData.institution}
                  onChange={(e) => setProfileData({ ...profileData, institution: e.target.value })}
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
                onChange={(e) => setProfileData({ ...profileData, adminTier: e.target.value })}
                required
              />
              <Input
                label="Authorized Control Department"
                type="text"
                placeholder="e.g. Security & Portal Operations"
                icon={<FaBuilding className="text-[#dd6b01]" />}
                value={profileData.adminDept}
                onChange={(e) => setProfileData({ ...profileData, adminDept: e.target.value })}
                required
              />
              <div className="md:col-span-2">
                <Input
                  label="Primary Operations Base"
                  type="text"
                  placeholder="e.g. Primary Server Node"
                  icon={<FaGlobe className="text-[#dd6b01]" />}
                  value={profileData.adminBase}
                  onChange={(e) => setProfileData({ ...profileData, adminBase: e.target.value })}
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
