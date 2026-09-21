import React from "react";
import { FaBuilding, FaBriefcase, FaGlobe } from "react-icons/fa";
import { Input } from "../../../../components/ui/Input";
import CustomSelect from "../../../../components/ui/CustomSelect";
import { ProfileFormData } from "../types";

interface ProfileRoleSpecificFormProps {
  normRole: string;
  profileData: ProfileFormData;
  levelOptions: string[];
  batchOptions: string[];
  boardOptions: string[];
  onChange: (field: string, value: string) => void;
}

export const ProfileRoleSpecificForm: React.FC<ProfileRoleSpecificFormProps> = ({
  normRole,
  profileData,
  levelOptions,
  batchOptions,
  boardOptions,
  onChange,
}) => {
  if (normRole === "student") {
    return (
      <div className="relative rounded bg-white border border-slate-200/80 shadow-2xs">
        <div className="px-3.5 sm:px-4 py-2.5 sm:py-3 border-b border-slate-100 bg-slate-50/60 flex items-center justify-between">
          <div>
            <h3 className="text-xs sm:text-sm font-bold text-slate-900">
              Academic Level & Institution Allocation
            </h3>
          </div>
          <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded bg-blue-50 text-blue-700 border border-blue-200">
            ACADEMIC
          </span>
        </div>

        <div className="p-3.5 sm:p-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <CustomSelect
            label="Academic Curriculum Level"
            options={
              levelOptions.length
                ? levelOptions
                : ["Class 10", "HSC", "Admission", "Undergraduate"]
            }
            value={profileData.level}
            onChange={(val) => onChange("level", val)}
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
            onChange={(val) => onChange("batch", val)}
            placeholder="Select Batch Year"
          />

          <CustomSelect
            label="Education Board Authority"
            options={
              boardOptions.length
                ? boardOptions
                : [
                    "Dhaka",
                    "Rajshahi",
                    "Chittagong",
                    "Cambridge",
                    "Edexcel",
                  ]
            }
            value={profileData.board}
            onChange={(val) => onChange("board", val)}
            placeholder="Select Board"
          />

          <Input
            label="College / School Institution"
            icon={<FaBuilding className="text-slate-400 text-xs" />}
            value={profileData.institution}
            onChange={(e) => onChange("institution", e.target.value)}
            placeholder="e.g. Dhaka College"
          />
        </div>
      </div>
    );
  }

  if (normRole === "teacher") {
    return (
      <div className="relative overflow-hidden rounded bg-white border border-slate-200/80 shadow-2xs">
        <div className="px-3.5 sm:px-4 py-2.5 sm:py-3 border-b border-slate-100 bg-slate-50/60 flex items-center justify-between">
          <div>
            <h3 className="text-xs sm:text-sm font-bold text-slate-900">
              Department & Teaching Specialization
            </h3>
          </div>
          <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
            FACULTY
          </span>
        </div>

        <div className="p-3.5 sm:p-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Subject / Academic Department"
            icon={<FaBriefcase className="text-slate-400 text-xs" />}
            value={profileData.subject}
            onChange={(e) => onChange("subject", e.target.value)}
            placeholder="e.g. Advanced Physics"
          />

          <Input
            label="Academic Designation"
            icon={<FaGlobe className="text-slate-400 text-xs" />}
            value={profileData.designation}
            onChange={(e) => onChange("designation", e.target.value)}
            placeholder="e.g. Senior Lecturer"
          />

          <div className="sm:col-span-2">
            <Input
              label="Institution / University Name"
              icon={<FaBuilding className="text-slate-400 text-xs" />}
              value={profileData.institution}
              onChange={(e) => onChange("institution", e.target.value)}
              placeholder="e.g. Dhaka University"
            />
          </div>
        </div>
      </div>
    );
  }

  if (normRole === "admin") {
    return (
      <div className="relative overflow-hidden rounded bg-white border border-slate-200/80 shadow-2xs">
        <div className="px-3.5 sm:px-4 py-2.5 sm:py-3 border-b border-slate-100 bg-slate-50/60 flex items-center justify-between">
          <div>
            <h3 className="text-xs sm:text-sm font-bold text-slate-900">
              System Administration Parameters
            </h3>
          </div>
          <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded bg-purple-50 text-purple-700 border border-purple-200">
            GOVERNANCE
          </span>
        </div>

        <div className="p-3.5 sm:p-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Admin Tier Clearance"
            value={profileData.adminTier}
            onChange={(e) => onChange("adminTier", e.target.value)}
            placeholder="Super Admin / Moderator"
          />

          <Input
            label="Operations Department"
            value={profileData.adminDept}
            onChange={(e) => onChange("adminDept", e.target.value)}
            placeholder="IT, Evaluation, Finance"
          />

          <div className="sm:col-span-2">
            <Input
              label="Regional Operations Base"
              value={profileData.adminBase}
              onChange={(e) => onChange("adminBase", e.target.value)}
              placeholder="Central Headquarters / Campus Node"
            />
          </div>
        </div>
      </div>
    );
  }

  return null;
};
