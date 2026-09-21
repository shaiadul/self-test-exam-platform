import React from "react";
import { FaEnvelope, FaCheckCircle, FaShieldAlt, FaLock } from "react-icons/fa";
import ImageUploader from "../../../../components/ui/ImageUploader";
import { ProfileFormData, RoleBadgeConfig } from "../types";

interface ProfileIdentityCardProps {
  profileData: ProfileFormData;
  initialProfile: any;
  roleConfig: RoleBadgeConfig;
  completeness: number;
  filledCount: number;
  totalCount: number;
  onAvatarChange: (url: string) => void;
}

export const ProfileIdentityCard: React.FC<ProfileIdentityCardProps> = ({
  profileData,
  initialProfile,
  roleConfig,
  completeness,
  filledCount,
  totalCount,
  onAvatarChange,
}) => {
  return (
    <div className="space-y-4 lg:sticky lg:top-4">
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
            <circle
              cx="260"
              cy="30"
              r="35"
              stroke="#f97a00"
              strokeWidth="0.8"
              strokeOpacity="0.25"
              strokeDasharray="3 3"
              fill="none"
            />
            <circle
              cx="260"
              cy="30"
              r="2"
              fill="#f97a00"
              fillOpacity="0.6"
            />
          </svg>
          <span className="relative z-10 inline-flex items-center ml-auto gap-1.5 px-2 py-0.5 rounded bg-emerald-500 text-white text-[9px] font-mono font-black tracking-wider uppercase shadow-2xs">
            <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
            ONLINE
          </span>
        </div>

        {/* Main Card Content */}
        <div className="p-3.5 sm:p-5 pt-0 -mt-12 sm:-mt-14 relative z-10 flex flex-col items-center text-center">
          {/* Avatar with Crisp High-Tech Ring */}
          <div className="p-1 rounded bg-transparent mb-2">
            <ImageUploader
              variant="avatar"
              folder="avatars"
              value={profileData.image}
              onChange={(url) => onAvatarChange(url || "")}
            />
          </div>

          {/* User Identity Details */}
          <h3 className="font-black text-slate-900 text-base sm:text-lg tracking-tight mb-0.5">
            {profileData.name || "Candidate"}
          </h3>

          {/* Role pill */}
          <span
            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[10px] font-mono font-semibold border ${roleConfig.color} mb-1.5`}
          >
            {roleConfig.label}
          </span>

          {/* Email Chip */}
          <div className="flex items-center justify-center gap-1.5 px-2.5 py-1 rounded bg-slate-50 border border-slate-200/70 text-slate-600 text-xs font-mono max-w-full truncate mb-2">
            <FaEnvelope className="text-primary text-[10px] shrink-0" />
            <span className="truncate max-w-[220px]">
              {profileData.email}
            </span>
          </div>

          {/* Staged Avatar Change Alert */}
          {profileData.image &&
            profileData.image !== initialProfile?.image && (
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
              <span
                className={
                  completeness >= 80
                    ? "text-emerald-600 font-black"
                    : "text-amber-600 font-black"
                }
              >
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
              <span className="text-[11px] font-semibold text-emerald-400">
                Security Active
              </span>
            </div>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          </div>

          <p className="text-xs font-bold text-slate-200 tracking-tight">
            Cryptographic Identity Binding
          </p>
          <p className="text-slate-400 text-[10px] font-mono leading-relaxed mt-1">
            Exam attempts, certificates, and leaderboard ranks are
            cryptographically tied to this verified credentials profile.
          </p>
        </div>
      </div>
    </div>
  );
};
