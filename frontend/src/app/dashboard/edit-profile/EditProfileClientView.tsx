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
    let fieldsToCheck: string[] = ["name", "email", "phone", "address"];
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
          {/* ========================================================
              LEFT COLUMN: Identity HUD & Telemetry Card (Sticky)
              ======================================================== */}
          <div className="lg:col-span-4 space-y-4 lg:sticky lg:top-4">
            {/* Identity Card with Telemetry Watermark */}
            <div className="relative overflow-hidden rounded bg-white border border-slate-200/80 shadow-2xs p-5">
              {/* Subtle Background SVG Telemetry Watermark */}
              <svg
                className="absolute -right-6 -bottom-6 w-36 h-36 text-slate-700 opacity-[0.035] pointer-events-none"
                viewBox="0 0 100 100"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <circle cx="50" cy="50" r="45" stroke="currentColor" strokeWidth="1" strokeDasharray="3 3" />
                <circle cx="50" cy="50" r="32" stroke="currentColor" strokeWidth="1.5" />
                <path d="M50 5 V95 M5 50 H95" stroke="currentColor" strokeWidth="0.8" />
                <circle cx="50" cy="50" r="4" fill="currentColor" />
              </svg>

              <div className="relative z-10 flex flex-col items-center text-center">
                {/* Avatar with subtle ring */}
                <div className="mb-3">
                  <ImageUploader
                    variant="avatar"
                    folder="avatars"
                    value={profileData.image}
                    onChange={(url) => setProfileData((prev) => ({ ...prev, image: url || "" }))}
                  />
                </div>

                <h3 className="font-bold text-slate-900 text-base tracking-tight mb-0.5">
                  {profileData.name || "Candidate"}
                </h3>
                <p className="text-xs text-slate-500 font-mono flex items-center gap-1.5 mb-2">
                  <FaEnvelope className="text-[10px] text-slate-400" />
                  <span className="truncate max-w-[200px]">{profileData.email}</span>
                </p>

                {profileData.image && profileData.image !== initialProfile?.image && (
                  <span className="text-[10px] font-mono font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded flex items-center gap-1 mb-2">
                    <FaCheckCircle className="text-[9px]" />
                    IMAGE REPLACED
                  </span>
                )}

                <div className="w-full pt-3 mt-1 border-t border-slate-100">
                  {/* Completeness Bar */}
                  <div className="flex items-center justify-between text-[10px] font-mono font-bold text-slate-500 mb-1.5">
                    <span>PROFILE INTEGRITY</span>
                    <span className={completeness >= 80 ? "text-emerald-600" : "text-amber-600"}>
                      {completeness}% ({filledCount}/{totalCount})
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-100 rounded overflow-hidden">
                    <div
                      className={`h-full transition-all duration-300 ${
                        completeness >= 80
                          ? "bg-emerald-500"
                          : completeness >= 50
                          ? "bg-amber-400"
                          : "bg-primary"
                      }`}
                      style={{ width: `${completeness}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Monospace Metadata Specs */}
              <div className="relative z-10 mt-4 pt-3 border-t border-slate-100 space-y-1.5 text-[11px]">
                <div className="flex items-center justify-between py-1">
                  <span className="text-slate-400 font-mono">ACCOUNT_ID</span>
                  <span className="font-mono font-bold text-slate-700">
                    #{initialProfile?.id || "USR-001"}
                  </span>
                </div>
                <div className="flex items-center justify-between py-1 border-t border-slate-50">
                  <span className="text-slate-400 font-mono">AUTH_PROVIDER</span>
                  <span className="font-mono font-bold text-slate-700 uppercase">
                    DIRECT_SESSION
                  </span>
                </div>
                <div className="flex items-center justify-between py-1 border-t border-slate-50">
                  <span className="text-slate-400 font-mono">INTEGRITY_CHECK</span>
                  <span className="font-mono font-bold text-emerald-600 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    VERIFIED
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Security & Encryption Strip */}
            <div className="rounded bg-slate-50 border border-slate-200/80 p-3.5 flex items-start gap-2.5">
              <div className="w-7 h-7 rounded bg-white border border-slate-200 flex items-center justify-center text-slate-500 shrink-0 text-xs shadow-2xs">
                <FaLock />
              </div>
              <div className="text-[11px] leading-relaxed">
                <p className="font-bold text-slate-800">Identity Security</p>
                <p className="text-slate-500 text-[10px] mt-0.5">
                  Examination answer logs, certificates, and leaderboard ranks are cryptographically associated with this profile record.
                </p>
              </div>
            </div>
          </div>

          {/* ========================================================
              RIGHT COLUMN: Parameter Form Sections
              ======================================================== */}
          <div className="lg:col-span-8 space-y-5">
            {/* [SEC-01] Core Identity Parameters */}
            <div className="relative overflow-hidden rounded bg-white border border-slate-200/80 shadow-2xs">
              <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/60 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 block">
                    [SEC-01] CORE CREDENTIALS
                  </span>
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

            {/* [SEC-02] Contact & Telemetry */}
            <div className="relative overflow-hidden rounded bg-white border border-slate-200/80 shadow-2xs">
              <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/60 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 block">
                    [SEC-02] CONTACT & TELEMETRY
                  </span>
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

            {/* [SEC-03] Role-Specific Academic / Faculty / Governance */}
            {normRole === "student" && (
              <div className="relative overflow-hidden rounded bg-white border border-slate-200/80 shadow-2xs">
                <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/60 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 block">
                      [SEC-03] CURRICULUM MAPPING
                    </span>
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
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 block">
                      [SEC-03] FACULTY CREDENTIALS
                    </span>
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
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 block">
                      [SEC-03] GOVERNANCE ROLES
                    </span>
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
