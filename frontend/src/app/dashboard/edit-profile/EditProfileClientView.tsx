"use client";

import { useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { PrimaryBtn } from "../../../components/ui/PrimaryBtn";
import { OutlineBtn } from "../../../components/ui/OutlineBtn";
import {
  FaUser,
  FaArrowLeft,
  FaShieldAlt,
  FaGraduationCap,
  FaChalkboardTeacher,
  FaSave,
} from "react-icons/fa";
import { PageContainer } from "../../../components/common/PageContainer";
import { updateProfileAction, submitInstitutionSuggestionAction } from "../../../lib/actions";
import { useUser } from "../../../context/UserContext";
import { ProfileFormData, RoleBadgeConfig } from "./types";
import { ProfileIdentityCard } from "./components/ProfileIdentityCard";
import { ProfileGeneralForm } from "./components/ProfileGeneralForm";
import { ProfileRoleSpecificForm } from "./components/ProfileRoleSpecificForm";

interface EditProfileClientViewProps {
  initialProfile: any;
  initialAssets: any[];
}

export default function EditProfileClientView({
  initialProfile,
  initialAssets,
}: EditProfileClientViewProps) {
  const router = useRouter();
  const { updateUser } = useUser();

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
  const institutionOptions = (initialAssets || [])
    .filter((a: any) => a.type === "institution")
    .map((a: any) => a.value);

  // Tracks a custom institution value that should be submitted as a suggestion on save
  const pendingSuggestionRef = useRef<string | null>(null);

  function handleInstitutionSuggestion(value: string) {
    pendingSuggestionRef.current = value || null;
  }

  // Core profile state
  const [profileData, setProfileData] = useState<ProfileFormData>({
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

    const filled = fieldsToCheck.filter((f) =>
      Boolean((profileData as any)[f]?.trim?.()),
    ).length;
    const pct = Math.round((filled / fieldsToCheck.length) * 100);

    return {
      completeness: pct,
      filledCount: filled,
      totalCount: fieldsToCheck.length,
    };
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
        if (profileData.institution)
          payload.institution = profileData.institution;
      } else if (normRole === "teacher") {
        if (profileData.subject) payload.subject = profileData.subject;
        if (profileData.designation)
          payload.designation = profileData.designation;
        if (profileData.institution)
          payload.institution = profileData.institution;
      } else if (normRole === "admin") {
        if (profileData.adminTier) payload.adminTier = profileData.adminTier;
        if (profileData.adminDept) payload.adminDept = profileData.adminDept;
        if (profileData.adminBase) payload.adminBase = profileData.adminBase;
      }

      const res = await updateProfileAction(payload);
      if (res.success) {
        // Fire institution suggestion in background if user typed a custom value
        const customInst =
          profileData.institution?.trim() ||
          pendingSuggestionRef.current?.trim();
        if (customInst && !institutionOptions.includes(customInst)) {
          submitInstitutionSuggestionAction(customInst).catch(() => {});
          pendingSuggestionRef.current = null;
        }

        if (typeof window !== "undefined") {
          localStorage.setItem("userName", payload.name || "");
          if (payload.image) {
            localStorage.setItem("userImage", payload.image);
          } else {
            localStorage.removeItem("userImage");
          }
          updateUser(res.user || payload);
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
  const roleBadgeMap: Record<string, RoleBadgeConfig> = {
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
    <PageContainer className="space-y-6 animate-fadeIn pb-20 sm:pb-6">
      {/* Top Header Command Strip */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-4">
        <div className="flex items-center gap-3">
          <OutlineBtn
            link="/dashboard"
            className="!p-2 !rounded !text-slate-600 hover:!text-primary shadow-2xs border-slate-200"
            title="Return to Dashboard"
          >
            <FaArrowLeft className="text-xs" />
          </OutlineBtn>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Candidate Identity &amp; Profile
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
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 items-start">
          <div className="lg:col-span-4">
            <ProfileIdentityCard
              profileData={profileData}
              initialProfile={initialProfile}
              roleConfig={roleConfig}
              completeness={completeness}
              filledCount={filledCount}
              totalCount={totalCount}
              onAvatarChange={(url) => handleChange("image", url)}
            />
          </div>

          <div className="lg:col-span-8 space-y-4 sm:space-y-5">
            <ProfileGeneralForm
              name={profileData.name}
              email={profileData.email}
              phone={profileData.phone}
              address={profileData.address}
              onChange={handleChange}
            />

            <ProfileRoleSpecificForm
              normRole={normRole}
              profileData={profileData}
              levelOptions={levelOptions}
              batchOptions={batchOptions}
              boardOptions={boardOptions}
              institutionOptions={institutionOptions}
              onInstitutionSuggestion={handleInstitutionSuggestion}
              onChange={handleChange}
            />

            <div className="rounded bg-white border border-slate-200/80 p-3.5 sm:p-4 shadow-2xs flex flex-col sm:flex-row items-center justify-center sm:justify-between mx-auto gap-3">
              <div className="text-xs text-slate-500">
                Ready to save your profile changes
              </div>

              <div className="flex items-center gap-2.5 w-full sm:w-auto justify-center sm:justify-end">
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
