"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Input } from "../../../components/ui/Input";
import CustomSelect from "../../../components/ui/CustomSelect";
import { PrimaryBtn } from "../../../components/ui/PrimaryBtn";
import { OutlineBtn } from "../../../components/ui/OutlineBtn";
import {
  FaUser,
  FaEnvelope,
  FaPhoneAlt,
  FaMapMarkerAlt,
  FaBuilding,
  FaBriefcase,
  FaGlobe,
  FaArrowLeft,
  FaCheckCircle,
  FaShieldAlt,
  FaGraduationCap,
  FaChalkboardTeacher,
  FaLock,
  FaSave,
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

  // Core profile state
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

  const normRole = userRole.toLowerCase();

  // Calculate dynamic completeness score
  const { completeness, filledCount, totalCount } = useMemo(() => {
    const fieldsToCheck: string[] = ["name", "email", "phone", "address"];
    if (normRole === "student") {
      fieldsToCheck.push("level", "batch", "board", "institution");
    } else if (normRole === "teacher") {
      fieldsToCheck.push("subject", "designation", "institution");
    } else if (normRole === "admin") {
      fieldsToCheck.push("adminTier", "adminDept", "adminBase");
    }

    const filled = fieldsToCheck.filter(
      (f) => Boolean((profileData as any)[f]?.trim?.())
    ).length;
    const pct = Math.round((filled / fieldsToCheck.length) * 100);

    return { completeness: pct, filledCount: filled, totalCount: fieldsToCheck.length };
  }, [profileData, normRole]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!profileData.name.trim()) {
      toast.error("Name is required.");
      return;
    }

    setLoading(true);

    try {
      const payload: Record<string, string> = {
        name: profileData.name,
      };

      if (profileData.image) payload.image = profileData.image;
      if (profileData.phone) payload.phone = profileData.phone;
      if (profileData.address) payload.address = profileData.address;

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
          window.dispatchEvent(
            new CustomEvent("profileUpdated", { detail: res.user || payload })
          );
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

  // Role badge configuration
  const roleBadgeMap: Record<
    string,
    { icon: React.ReactNode; label: string; color: string; code: string }
  > = {
    student: {
      icon: <FaGraduationCap />,
      label: "Student Candidate",
      color: "bg-blue-50 text-blue-700 border-blue-200",
      code: "ROLE_STUDENT",
    },
    teacher: {
      icon: <FaChalkboardTeacher />,
      label: "Lead Instructor",
      color: "bg-emerald-50 text-emerald-700 border-emerald-200",
      code: "ROLE_FACULTY",
    },
    admin: {
      icon: <FaShieldAlt />,
      label: "System Admin",
      color: "bg-purple-50 text-purple-700 border-purple-200",
      code: "ROLE_SUPERADMIN",
    },
  };

  const roleConfig = roleBadgeMap[normRole] || {
    icon: <FaUser />,
    label: userRole,
    color: "bg-slate-50 text-slate-700 border-slate-200",
    code: "ROLE_STANDARD",
  };

  return (
    <PageContainer className="space-y-6 animate-fadeIn pb-12">
      {/* Top Header & Breadcrumb Command Strip */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200/80 pb-4">
        <div className="flex items-center gap-3">
          <OutlineBtn
            link="/dashboard"
            className="!p-2 !rounded !text-slate-600 hover:!text-primary shadow-2xs border-slate-200"
            title="Return to Dashboard"
          >
            <FaArrowLeft className="text-xs" />
          </OutlineBtn>
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">
                SYSTEM // USER_SETTINGS
              </span>
              <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 border border-slate-200">
                {roleConfig.code}
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Candidate Identity & Profile
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <div
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded border text-xs font-bold ${roleConfig.color}`}
          >
            {roleConfig.icon}
            <span>{roleConfig.label}</span>
          </div>
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-mono font-bold uppercase">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            LIVE SYNC
          </span>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
         
          <div className="lg:col-span-4 space-y-4 lg:sticky lg:top-4">
            {/* Identity Card with Ambient Banner & Telemetry HUD */}
            <div className="relative overflow-hidden rounded bg-white border border-slate-200/80 shadow-2xs group">
              <div className="h-24 sm:h-28 relative overflow-hidden bg-gradient-to-br from-primary/15 via-orange-500/10 to-amber-500/5 border-b border-slate-100 p-3 flex items-start justify-between">
                <svg
                  className="absolute inset-0 w-full h-full pointer-events-none opacity-40"
                  viewBox="0 0 300 100"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  preserveAspectRatio="none"
                >
                  <path
                    d="M-20,90 Q80,20 180,60 T320,30"
                    stroke="#f97a00"
                    strokeWidth="1.2"
                    strokeOpacity="0.3"
                    fill="none"
                  />
                  <circle cx="260" cy="30" r="35" stroke="#f97a00" strokeWidth="0.8" strokeOpacity="0.25" strokeDasharray="3 3" fill="none" />
                  <circle cx="260" cy="30" r="2" fill="#f97a00" fillOpacity="0.6" />
                </svg>
                <span className="relative z-10 inline-flex items-center ml-auto gap-1.5 px-2 py-0.5 rounded bg-emerald-500 text-white text-[9px] font-mono font-black tracking-wider uppercase shadow-2xs">
                  <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                  ONLINE
                </span>
              </div>

              {/* Main Card Content */}
              <div className="p-5 pt-0 -mt-12 sm:-mt-14 relative z-10 flex flex-col items-center text-center">
                {/* Avatar with Crisp High-Tech Ring */}
                <div className="p-1 rounded bg-transparent mb-2">
                  <ImageUploader
                    variant="avatar"
                    folder="avatars"
                    value={profileData.image}
                    onChange={(url) => setProfileData((prev) => ({ ...prev, image: url || "" }))}
                  />
                </div>

                {/* User Identity Details */}
                <h3 className="font-black text-slate-900 text-base sm:text-lg tracking-tight mb-0.5">
                  {profileData.name || "Candidate"}
                </h3>

                {/* Role pill */}
                <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[10px] font-mono font-semibold border ${roleConfig.color} mb-1.5`}>
                  {roleConfig.label}
                </span>

                {/* Email Chip */}
                <div className="flex items-center justify-center gap-1.5 px-2.5 py-1 rounded bg-slate-50 border border-slate-200/70 text-slate-600 text-xs font-mono max-w-full truncate mb-2">
                  <FaEnvelope className="text-primary text-[10px] shrink-0" />
                  <span className="truncate max-w-[220px]">{profileData.email}</span>
                </div>

                {/* Staged Avatar Change Alert */}
                {profileData.image && profileData.image !== initialProfile?.image && (
                  <span className="text-[10px] font-mono font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded flex items-center gap-1.5 mb-2 animate-fadeIn">
                    <FaCheckCircle className="text-[10px] text-emerald-600" />
                    IMAGE STAGED (CLICK SAVE)
                  </span>
                )}

                {/* Profile Integrity Gauge */}
                <div className="w-full pt-3.5 mt-2 border-t border-slate-100">
                  <div className="flex items-center justify-between text-[10px] font-mono font-bold mb-1.5">
                    <span className="flex items-center gap-1.5 text-slate-500">
                      <FaShieldAlt className="text-primary text-[10px]" />
                      PROFILE INTEGRITY
                    </span>
                    <span className={completeness >= 80 ? "text-emerald-600 font-black" : "text-amber-600 font-black"}>
                      {completeness}% ({filledCount}/{totalCount})
                    </span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded overflow-hidden p-0.5 border border-slate-200/60">
                    <div
                      className={`h-full rounded-xs transition-all duration-500 ${
                        completeness >= 80
                          ? "bg-gradient-to-r from-emerald-500 to-teal-500"
                          : completeness >= 50
                          ? "bg-gradient-to-r from-amber-400 to-orange-500"
                          : "bg-gradient-to-r from-primary to-orange-600"
                      }`}
                      style={{ width: `${completeness}%` }}
                    />
                  </div>
                  <p className="text-[10px] font-medium text-slate-400 text-left mt-1.5">
                    {completeness === 100
                      ? "All critical profile parameters verified."
                      : `${totalCount - filledCount} fields remaining for complete accreditation.`}
                  </p>
                </div>

                {/* 2x2 Telemetry Engineering Matrix */}
                <div className="w-full mt-3.5 pt-3 border-t border-slate-100">
                  <div className="grid grid-cols-2 gap-2 text-left">
                    <div className="p-2 rounded bg-slate-50 border border-slate-200/60">
                      <span className="text-[9px] font-mono font-bold text-slate-400 block uppercase">
                        ACCOUNT ID
                      </span>
                      <span className="text-xs font-mono font-bold text-slate-800 truncate block mt-0.5">
                        #{initialProfile?.id || "USR-001"}
                      </span>
                    </div>
                    <div className="p-2 rounded bg-slate-50 border border-slate-200/60">
                      <span className="text-[9px] font-mono font-bold text-slate-400 block uppercase">
                        STATUS
                      </span>
                      <span className="text-xs font-mono font-bold text-emerald-600 flex items-center gap-1 mt-0.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        VERIFIED
                      </span>
                    </div>
                    <div className="p-2 rounded bg-slate-50 border border-slate-200/60">
                      <span className="text-[9px] font-mono font-bold text-slate-400 block uppercase">
                        AUTH PROVIDER
                      </span>
                      <span className="text-xs font-mono font-bold text-slate-700 truncate block mt-0.5">
                        DIRECT SESSION
                      </span>
                    </div>
                    <div className="p-2 rounded bg-slate-50 border border-slate-200/60">
                      <span className="text-[9px] font-mono font-bold text-slate-400 block uppercase">
                        DISCIPLINE
                      </span>
                      <span className="text-xs font-mono font-bold text-primary truncate block mt-0.5">
                        {profileData.board || "ACADEMIC"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Security & Encryption Strip - Dark Executive Theme */}
            <div className="rounded bg-slate-950 text-white p-4 border border-slate-800 shadow-xs relative overflow-hidden group">
              <div className="absolute -right-6 -bottom-6 w-28 h-28 bg-primary/15 rounded-full blur-2xl pointer-events-none" />

              <div className="relative z-10">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded bg-slate-900 border border-slate-800 flex items-center justify-center text-primary text-xs shadow-2xs">
                      <FaLock />
                    </div>
                    <span className="font-mono text-[10px] font-bold text-emerald-400 uppercase tracking-wider">
                      ENCRYPTION_ACTIVE
                    </span>
                  </div>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                </div>

                <p className="text-xs font-bold text-slate-200 tracking-tight">
                  Cryptographic Identity Binding
                </p>
                <p className="text-slate-400 text-[10px] font-mono leading-relaxed mt-1">
                  Exam attempts, certificates, and leaderboard ranks are cryptographically tied to this verified credentials profile.
                </p>
              </div>
            </div>
          </div>

        
          <div className="lg:col-span-8 space-y-5">
            <div className="relative overflow-hidden rounded bg-white border border-slate-200/80 shadow-2xs">
              <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/60 flex items-center justify-between">
                <div>
                  <h3 className="text-xs sm:text-sm font-bold text-slate-900">
                    Primary Identity & Access Keys
                  </h3>
                </div>
                <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded bg-white text-slate-500 border border-slate-200">
                  REQUIRED
                </span>
              </div>

              <div className="p-4 sm:p-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Input
                    label="Full Name *"
                    icon={<FaUser className="text-slate-400 text-xs" />}
                    value={profileData.name}
                    onChange={(e) => handleChange("name", e.target.value)}
                    placeholder="e.g. John Doe"
                    required
                  />
                  <span className="text-[10px] font-mono text-slate-400 mt-1 block">
                    Displayed on your certificates & merit leaderboard
                  </span>
                </div>

                <div>
                  <Input
                    label="Registered Email Address"
                    icon={<FaEnvelope className="text-slate-400 text-xs" />}
                    type="email"
                    value={profileData.email}
                    disabled
                  />
                  <div className="flex items-center gap-1.5 mt-1 text-[10px] font-mono text-slate-500">
                    <FaLock className="text-[9px] text-slate-400" />
                    <span>IMMUTABLE // System Login Handle</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative overflow-hidden rounded bg-white border border-slate-200/80 shadow-2xs">
              <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/60 flex items-center justify-between">
                <div>
                  <h3 className="text-xs sm:text-sm font-bold text-slate-900">
                    Communication & Geographic Node
                  </h3>
                </div>
                <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded bg-white text-slate-500 border border-slate-200">
                  OPTIONAL
                </span>
              </div>

              <div className="p-4 sm:p-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Contact Phone Number"
                  icon={<FaPhoneAlt className="text-slate-400 text-xs" />}
                  value={profileData.phone}
                  onChange={(e) => handleChange("phone", e.target.value)}
                  placeholder="01XXXXXXXXX"
                />

                <Input
                  label="Residential / Station Address"
                  icon={<FaMapMarkerAlt className="text-slate-400 text-xs" />}
                  value={profileData.address}
                  onChange={(e) => handleChange("address", e.target.value)}
                  placeholder="City, District, Country"
                />
              </div>
            </div>

            {normRole === "student" && (
              <div className="relative rounded bg-white border border-slate-200/80 shadow-2xs">
                <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/60 flex items-center justify-between">
                  <div>
                    <h3 className="text-xs sm:text-sm font-bold text-slate-900">
                      Academic Level & Institution Allocation
                    </h3>
                  </div>
                  <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded bg-blue-50 text-blue-700 border border-blue-200">
                    ACADEMIC
                  </span>
                </div>

                <div className="p-4 sm:p-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <CustomSelect
                    label="Academic Curriculum Level"
                    options={
                      levelOptions.length
                        ? levelOptions
                        : ["Class 10", "HSC", "Admission", "Undergraduate"]
                    }
                    value={profileData.level}
                    onChange={(val) => handleChange("level", val)}
                    placeholder="Select Level"
                  />

                  <CustomSelect
                    label="Target Batch Year"
                    options={
                      batchOptions.length
                        ? batchOptions
                        : ["2023", "2024", "2025", "2026"]
                    }
                    value={profileData.batch}
                    onChange={(val) => handleChange("batch", val)}
                    placeholder="Select Batch Year"
                  />

                  <CustomSelect
                    label="Education Board Authority"
                    options={
                      boardOptions.length
                        ? boardOptions
                        : ["Dhaka", "Rajshahi", "Chittagong", "Cambridge", "Edexcel"]
                    }
                    value={profileData.board}
                    onChange={(val) => handleChange("board", val)}
                    placeholder="Select Board"
                  />

                  <Input
                    label="College / School Institution"
                    icon={<FaBuilding className="text-slate-400 text-xs" />}
                    value={profileData.institution}
                    onChange={(e) => handleChange("institution", e.target.value)}
                    placeholder="e.g. Dhaka College"
                  />
                </div>
              </div>
            )}

            {normRole === "teacher" && (
              <div className="relative overflow-hidden rounded bg-white border border-slate-200/80 shadow-2xs">
                <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/60 flex items-center justify-between">
                  <div>
                    <h3 className="text-xs sm:text-sm font-bold text-slate-900">
                      Department & Teaching Specialization
                    </h3>
                  </div>
                  <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                    FACULTY
                  </span>
                </div>

                <div className="p-4 sm:p-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Subject / Academic Department"
                    icon={<FaBriefcase className="text-slate-400 text-xs" />}
                    value={profileData.subject}
                    onChange={(e) => handleChange("subject", e.target.value)}
                    placeholder="e.g. Advanced Physics"
                  />

                  <Input
                    label="Academic Designation"
                    icon={<FaGlobe className="text-slate-400 text-xs" />}
                    value={profileData.designation}
                    onChange={(e) => handleChange("designation", e.target.value)}
                    placeholder="e.g. Senior Lecturer"
                  />

                  <div className="sm:col-span-2">
                    <Input
                      label="Institution / University Name"
                      icon={<FaBuilding className="text-slate-400 text-xs" />}
                      value={profileData.institution}
                      onChange={(e) => handleChange("institution", e.target.value)}
                      placeholder="e.g. Dhaka University"
                    />
                  </div>
                </div>
              </div>
            )}

            {normRole === "admin" && (
              <div className="relative overflow-hidden rounded bg-white border border-slate-200/80 shadow-2xs">
                <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/60 flex items-center justify-between">
                  <div>
                    <h3 className="text-xs sm:text-sm font-bold text-slate-900">
                      System Administration Parameters
                    </h3>
                  </div>
                  <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded bg-purple-50 text-purple-700 border border-purple-200">
                    GOVERNANCE
                  </span>
                </div>

                <div className="p-4 sm:p-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Admin Tier Clearance"
                    value={profileData.adminTier}
                    onChange={(e) => handleChange("adminTier", e.target.value)}
                    placeholder="Super Admin / Moderator"
                  />

                  <Input
                    label="Operations Department"
                    value={profileData.adminDept}
                    onChange={(e) => handleChange("adminDept", e.target.value)}
                    placeholder="IT, Evaluation, Finance"
                  />

                  <div className="sm:col-span-2">
                    <Input
                      label="Regional Operations Base"
                      value={profileData.adminBase}
                      onChange={(e) => handleChange("adminBase", e.target.value)}
                      placeholder="Central Headquarters / Campus Node"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Commit & Save Action HUD */}
            <div className="rounded bg-white border border-slate-200/80 p-4 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="text-[11px] font-mono text-slate-500">
                <span>COMMIT_STATUS: </span>
                <span className="text-slate-800 font-bold">READY TO DEPLOY</span>
              </div>

              <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
                <OutlineBtn
                  type="button"
                  onClick={() => router.back()}
                  className="!text-xs !py-1.5 !px-3.5 !rounded"
                >
                  Discard Changes
                </OutlineBtn>

                <PrimaryBtn
                  type="submit"
                  disabled={loading}
                  className="!text-xs !py-1.5 !px-4 gap-1.5 !rounded shadow-2xs"
                >
                  {loading ? (
                    <>
                      <span className="animate-spin inline-block w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full" />
                      <span>Saving Profile…</span>
                    </>
                  ) : (
                    <>
                      <FaSave className="text-[11px]" />
                      <span>Commit Changes</span>
                    </>
                  )}
                </PrimaryBtn>
              </div>
            </div>
          </div>
        </div>
      </form>
    </PageContainer>
  );
}
