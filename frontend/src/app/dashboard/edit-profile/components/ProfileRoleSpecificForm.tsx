import React, { useState } from "react";
import { FaBuilding, FaBriefcase, FaGlobe, FaInfoCircle } from "react-icons/fa";
import { Input } from "../../../../components/ui/Input";
import CustomSelect from "../../../../components/ui/CustomSelect";
import { ProfileFormData } from "../types";

interface ProfileRoleSpecificFormProps {
  normRole: string;
  profileData: ProfileFormData;
  levelOptions: string[];
  batchOptions: string[];
  boardOptions: string[];
  institutionOptions: string[];
  onInstitutionSuggestion?: (value: string) => void;
  onChange: (field: string, value: string) => void;
}

const OTHER_LABEL = "Other (type your institution)";

/** Shared institution searchable select + "Other" text input used by both student and teacher forms. */
function InstitutionField({
  value,
  options,
  onChange,
  onSuggestion,
  label = "Institution Name",
  placeholder = "e.g. Dhaka College",
  colSpan2 = false,
}: {
  value: string;
  options: string[];
  onChange: (val: string) => void;
  onSuggestion?: (val: string) => void;
  label?: string;
  placeholder?: string;
  colSpan2?: boolean;
}) {
  // Determine if the current value is a known option
  const isKnownOption = options.includes(value) || value === "";
  const [isOther, setIsOther] = useState(!isKnownOption && value !== "");
  const [customValue, setCustomValue] = useState(isOther ? value : "");

  // Options including "Other"
  const selectOptions = options.includes(OTHER_LABEL)
    ? options
    : [...options, OTHER_LABEL];

  const selectValue = isOther ? OTHER_LABEL : value;

  function handleSelectChange(val: string) {
    if (val === OTHER_LABEL) {
      setIsOther(true);
      onChange(customValue);
      onSuggestion?.(customValue);
    } else {
      setIsOther(false);
      setCustomValue("");
      onChange(val);
      onSuggestion?.("");
    }
  }

  function handleSelectOptionWithSearch(opt: string, currentSearch: string) {
    if (opt === OTHER_LABEL && currentSearch.trim() && !customValue.trim()) {
      const typed = currentSearch.trim();
      setCustomValue(typed);
      onChange(typed);
      onSuggestion?.(typed);
    }
  }

  function handleCustomChange(e: React.ChangeEvent<HTMLInputElement>) {
    const v = e.target.value;
    setCustomValue(v);
    onChange(v);
    onSuggestion?.(v);
  }

  const wrapper = colSpan2 ? "sm:col-span-2" : "";

  return (
    <div className={`flex flex-col gap-2 ${wrapper}`}>
      <CustomSelect
        label={label}
        placeholder="Search or select institution..."
        options={selectOptions}
        alwaysShowOptions={[OTHER_LABEL]}
        value={selectValue}
        onChange={handleSelectChange}
        onSelectOptionWithSearch={handleSelectOptionWithSearch}
      />

      {/* Custom value text input (shown only when "Other" selected) */}
      {isOther && (
        <div className="flex flex-col gap-1">
          <Input
            icon={<FaBuilding className="text-slate-400 text-xs" />}
            value={customValue}
            onChange={handleCustomChange}
            placeholder={placeholder}
            autoFocus
          />
          <p className="flex items-center gap-1 text-[10px] text-slate-400 font-medium">
            <FaInfoCircle className="text-[9px] shrink-0" />
            Your suggestion will be sent to admins for review. Your profile saves immediately.
          </p>
        </div>
      )}
    </div>
  );
}

export const ProfileRoleSpecificForm: React.FC<ProfileRoleSpecificFormProps> = ({
  normRole,
  profileData,
  levelOptions,
  batchOptions,
  boardOptions,
  institutionOptions,
  onInstitutionSuggestion,
  onChange,
}) => {
  if (normRole === "student") {
    return (
      <div className="relative rounded bg-white border border-slate-200/80 shadow-2xs">
        <div className="px-3.5 sm:px-4 py-2.5 sm:py-3 border-b border-slate-100 bg-slate-50/60 flex items-center justify-between">
          <div>
            <h3 className="text-xs sm:text-sm font-bold text-slate-900">
              Academic Level &amp; Institution Allocation
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
                : ["Dhaka", "Rajshahi", "Chittagong", "Cambridge", "Edexcel"]
            }
            value={profileData.board}
            onChange={(val) => onChange("board", val)}
            placeholder="Select Board"
          />

          <InstitutionField
            label="College / School Institution"
            value={profileData.institution}
            options={institutionOptions}
            onChange={(val) => onChange("institution", val)}
            onSuggestion={onInstitutionSuggestion}
            placeholder="e.g. Dhaka College"
          />
        </div>
      </div>
    );
  }

  if (normRole === "teacher") {
    return (
      <div className="relative rounded bg-white border border-slate-200/80 shadow-2xs">
        <div className="px-3.5 sm:px-4 py-2.5 sm:py-3 border-b border-slate-100 bg-slate-50/60 flex items-center justify-between">
          <div>
            <h3 className="text-xs sm:text-sm font-bold text-slate-900">
              Department &amp; Teaching Specialization
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

          <InstitutionField
            label="Institution / University Name"
            value={profileData.institution}
            options={institutionOptions}
            onChange={(val) => onChange("institution", val)}
            onSuggestion={onInstitutionSuggestion}
            placeholder="e.g. Dhaka University"
            colSpan2
          />
        </div>
      </div>
    );
  }

  if (normRole === "admin") {
    return (
      <div className="relative rounded bg-white border border-slate-200/80 shadow-2xs">
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
