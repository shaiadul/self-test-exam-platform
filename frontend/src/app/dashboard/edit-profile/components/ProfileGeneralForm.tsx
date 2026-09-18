import React from "react";
import { FaUser, FaEnvelope, FaLock, FaPhoneAlt, FaMapMarkerAlt } from "react-icons/fa";
import { Input } from "../../../../components/ui/Input";

interface ProfileGeneralFormProps {
  name: string;
  email: string;
  phone: string;
  address: string;
  onChange: (field: string, value: string) => void;
}

export const ProfileGeneralForm: React.FC<ProfileGeneralFormProps> = ({
  name,
  email,
  phone,
  address,
  onChange,
}) => {
  return (
    <>
      {/* Primary Identity & Access Keys */}
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
              value={name}
              onChange={(e) => onChange("name", e.target.value)}
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
              value={email}
              disabled
            />
            <div className="flex items-center gap-1.5 mt-1 text-xs text-slate-500">
              <FaLock className="text-[10px] text-slate-400" />
              <span>Primary account email (read-only)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Communication & Geographic Node */}
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
            value={phone}
            onChange={(e) => onChange("phone", e.target.value)}
            placeholder="01XXXXXXXXX"
          />

          <Input
            label="Residential / Station Address"
            icon={<FaMapMarkerAlt className="text-slate-400 text-xs" />}
            value={address}
            onChange={(e) => onChange("address", e.target.value)}
            placeholder="City, District, Country"
          />
        </div>
      </div>
    </>
  );
};
