import React from "react";
import { FaTimes } from "react-icons/fa";
import { Input } from "../../../../../components/ui/Input";
import CustomSelect from "../../../../../components/ui/CustomSelect";

interface AddUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  newName: string;
  setNewName: (val: string) => void;
  newEmail: string;
  setNewEmail: (val: string) => void;
  newPassword: string;
  setNewPassword: (val: string) => void;
  newRole: string;
  setNewRole: (val: string) => void;
  newExamLimit: number;
  setNewExamLimit: (val: number) => void;
  submitting: boolean;
  addError: string | null;
  roleOptions: string[];
}

export const AddUserModal: React.FC<AddUserModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  newName,
  setNewName,
  newEmail,
  setNewEmail,
  newPassword,
  setNewPassword,
  newRole,
  setNewRole,
  newExamLimit,
  setNewExamLimit,
  submitting,
  addError,
  roleOptions,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded border border-slate-200/80 max-w-md w-full p-4 sm:p-6 shadow-2xl animate-fadeIn">
        <div className="flex justify-between items-center pb-3 mb-4 border-b border-slate-100">
          <div>
            <h3 className="text-base font-black text-slate-900">Provision New User Account</h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition cursor-pointer"
          >
            <FaTimes />
          </button>
        </div>

        {addError && (
          <div className="mb-4 p-2.5 bg-rose-50 text-rose-700 border border-rose-200 rounded text-xs font-mono font-semibold">
            [ERROR] {addError}
          </div>
        )}

        <form onSubmit={onSubmit} className="space-y-3.5">
          <div>
            <Input
              label="Full Name"
              placeholder="e.g. John Doe"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              required
            />
          </div>

          <div>
            <Input
              label="Email Address"
              type="email"
              placeholder="e.g. john@example.com"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <Input
              label="Temporary Password"
              type="password"
              placeholder="••••••••"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Assigned Access Role</label>
            <CustomSelect
              options={roleOptions}
              value={newRole}
              onChange={(val) => setNewRole(val)}
              placeholder="Select Role"
            />
          </div>

          {/* Exam limit — only shown when teacher is selected */}
          {newRole === "teacher" && (
            <div className="p-3 bg-violet-50/70 border border-violet-200/60 rounded space-y-2">
              <label className="text-xs font-bold text-violet-900 block">
                Teacher Exam Creation Quota <span className="text-violet-500 font-normal">(-1 = unlimited)</span>
              </label>
              <div className="flex flex-wrap gap-1.5 font-mono">
                {[-1, 3, 5, 10, 20].map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setNewExamLimit(preset)}
                    className={`px-2.5 py-1 rounded text-xs font-bold border transition cursor-pointer ${
                      newExamLimit === preset
                        ? "bg-violet-600 text-white border-violet-600"
                        : "bg-white text-slate-700 border-slate-200 hover:border-violet-400"
                    }`}
                  >
                    {preset === -1 ? "∞" : preset}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-2 pt-1">
                <span className="text-xs text-violet-700 font-medium">Custom:</span>
                <input
                  type="number"
                  min={-1}
                  max={999}
                  value={newExamLimit}
                  onChange={(e) => setNewExamLimit(parseInt(e.target.value) || 0)}
                  className="w-20 border border-violet-200 rounded px-2 py-1 text-xs font-mono font-bold outline-none focus:border-violet-500 bg-white"
                />
              </div>
            </div>
          )}

          <div className="flex gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 py-2 bg-primary hover:bg-primary-hover text-white font-bold text-xs rounded transition shadow-2xs font-mono"
            >
              {submitting ? "PROVISIONING..." : "CREATE ACCOUNT"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
