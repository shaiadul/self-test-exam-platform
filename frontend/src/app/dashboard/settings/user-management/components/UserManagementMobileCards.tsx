import React from "react";
import { FaUserCog, FaGraduationCap, FaTrashAlt } from "react-icons/fa";
import { User } from "../types";

interface UserManagementMobileCardsProps {
  users: User[];
  editingUserId: number | null;
  selectedRole: string;
  onStartEditRole: (userId: number, currentRole: string) => void;
  onRoleSelectChange: (role: string) => void;
  onSaveRole: (userId: number, role: string) => void;
  onCancelEditRole: () => void;
  onOpenLimitModal: (user: User) => void;
  onDeleteUser: (userId: number, name: string) => void;
}

export const UserManagementMobileCards: React.FC<UserManagementMobileCardsProps> = ({
  users,
  editingUserId,
  selectedRole,
  onStartEditRole,
  onRoleSelectChange,
  onSaveRole,
  onCancelEditRole,
  onOpenLimitModal,
  onDeleteUser,
}) => {
  return (
    <div className="block sm:hidden divide-y divide-slate-100">
      {users.map((u) => (
        <div key={u.id} className="p-3.5 space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="font-mono text-[10px] text-slate-400">#{u.id}</span>
              <span className="font-bold text-slate-900 text-xs">{u.name}</span>
            </div>
            <span
              className={`inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-mono font-bold uppercase border ${
                u.role === "admin"
                  ? "bg-purple-50 text-purple-700 border-purple-200"
                  : u.role === "teacher"
                  ? "bg-blue-50 text-blue-700 border-blue-200"
                  : "bg-slate-100 text-slate-700 border-slate-200"
              }`}
            >
              {u.role}
            </span>
          </div>

          <div className="font-mono text-[11px] text-slate-500 break-all">
            {u.email}
          </div>

          {editingUserId === u.id && (
            <div className="flex items-center gap-2 pt-1 bg-slate-50 p-2 rounded border border-slate-200">
              <select
                value={selectedRole}
                onChange={(e) => onRoleSelectChange(e.target.value)}
                className="flex-1 border border-slate-200 rounded px-2 py-1 text-xs font-semibold focus:outline-none focus:border-primary bg-white"
              >
                <option value="student">Student</option>
                <option value="teacher">Teacher</option>
                <option value="admin">Admin</option>
              </select>
              <button
                onClick={() => onSaveRole(u.id, selectedRole)}
                className="bg-emerald-600 text-white px-2.5 py-1 rounded text-xs font-bold hover:bg-emerald-700 cursor-pointer font-mono"
              >
                SAVE
              </button>
              <button
                onClick={onCancelEditRole}
                className="text-slate-400 hover:text-slate-600 text-xs px-1 cursor-pointer"
              >
                Cancel
              </button>
            </div>
          )}

          {u.role === "teacher" && (
            <div className="bg-slate-50 p-2.5 rounded border border-slate-100 space-y-2">
              <div className="flex items-center justify-between text-[10px] font-mono">
                <span className="font-bold text-slate-500 uppercase">Pack Quota:</span>
                <span className="font-bold text-slate-800">
                  {u.createdPacksCount ?? 0} / {u.examPackLimit === -1 ? "∞" : u.examPackLimit ?? 3}
                </span>
              </div>
              <div className="flex items-center justify-between text-[10px] font-mono pt-1 border-t border-slate-200/50">
                <span className="font-bold text-slate-500 uppercase">Exam Quota:</span>
                <span className="font-bold text-slate-800">
                  {u.createdExamsCount ?? 0} / {u.examLimit === -1 ? "∞" : u.examLimit ?? 5}
                </span>
              </div>
            </div>
          )}

          <div className="flex items-center justify-end gap-2 pt-1 border-t border-slate-50">
            <button
              onClick={() => onStartEditRole(u.id, u.role)}
              className="inline-flex items-center gap-1 text-[11px] text-blue-600 hover:text-blue-800 font-bold px-2 py-1 hover:bg-blue-50 rounded transition cursor-pointer font-mono"
            >
              <FaUserCog /> ROLE
            </button>
            {u.role === "teacher" && (
              <button
                onClick={() => onOpenLimitModal(u)}
                className="inline-flex items-center gap-1 text-[11px] text-violet-600 hover:text-violet-800 font-bold px-2 py-1 hover:bg-violet-50 rounded transition cursor-pointer font-mono"
              >
                <FaGraduationCap /> QUOTA
              </button>
            )}
            <button
              onClick={() => onDeleteUser(u.id, u.name)}
              className="inline-flex items-center gap-1 text-[11px] text-rose-600 hover:text-rose-800 font-bold px-2 py-1 hover:bg-rose-50 rounded transition cursor-pointer font-mono"
            >
              <FaTrashAlt /> DEL
            </button>
          </div>
        </div>
      ))}

      {users.length === 0 && (
        <div className="py-8 px-4 text-center text-slate-400 font-medium text-xs">
          No users registered in system.
        </div>
      )}
    </div>
  );
};
