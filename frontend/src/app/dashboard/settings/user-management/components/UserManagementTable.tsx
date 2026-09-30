import React from "react";
import { FaUserCog, FaGraduationCap, FaTrashAlt } from "react-icons/fa";
import { User } from "../types";

interface UserManagementTableProps {
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

export const UserManagementTable: React.FC<UserManagementTableProps> = ({
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
    <div className="hidden sm:block overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-slate-50/70 border-b border-slate-200/80 text-slate-500 font-mono font-bold text-[10px] uppercase tracking-wider">
            <th className="py-3 px-4">ID</th>
            <th className="py-3 px-4">Name</th>
            <th className="py-3 px-4">Email Address</th>
            <th className="py-3 px-4">Assigned Role</th>
            <th className="py-3 px-4">Quotas (Packs / Exams)</th>
            <th className="py-3 px-4 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 text-xs">
          {users.map((u) => (
            <tr key={u.id} className="hover:bg-slate-50/50 transition">
              <td className="py-3.5 px-4 font-mono text-[11px] text-slate-400">#{u.id}</td>
              <td className="py-3.5 px-4 font-bold text-slate-900">{u.name}</td>
              <td className="py-3.5 px-4 text-slate-600 font-mono text-[11px]">{u.email}</td>
              <td className="py-3.5 px-4">
                {editingUserId === u.id ? (
                  <div className="flex items-center gap-2">
                    <select
                      value={selectedRole}
                      onChange={(e) => onRoleSelectChange(e.target.value)}
                      className="border border-slate-200 rounded px-2 py-1 text-xs font-semibold focus:outline-none focus:border-primary bg-white"
                    >
                      <option value="student">Student</option>
                      <option value="teacher">Teacher</option>
                      <option value="admin">Admin</option>
                    </select>
                    <button
                      onClick={() => onSaveRole(u.id, selectedRole)}
                      className="bg-emerald-600 text-white px-2 py-1 rounded text-xs font-semibold hover:bg-emerald-700 cursor-pointer"
                    >
                      Save
                    </button>
                    <button
                      onClick={onCancelEditRole}
                      className="text-slate-400 hover:text-slate-600 text-xs px-1 cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase border ${
                      u.role === "admin"
                        ? "bg-purple-50 text-purple-700 border-purple-200"
                        : u.role === "teacher"
                        ? "bg-blue-50 text-blue-700 border-blue-200"
                        : "bg-slate-100 text-slate-700 border-slate-200"
                    }`}
                  >
                    {u.role}
                  </span>
                )}
              </td>

              {/* Quotas column (both Packs and Exams) */}
              <td className="py-3.5 px-4">
                {u.role === "teacher" ? (
                  <div className="flex flex-col gap-1.5 min-w-[140px]">
                    {/* Pack Quota */}
                    <div className="flex items-center justify-between text-[11px] font-mono">
                      <span className="text-slate-500 font-semibold">Packs:</span>
                      <div className="flex items-center gap-1">
                        <span className="font-bold text-slate-900">{u.createdPacksCount ?? 0}</span>
                        <span className="text-slate-400">/</span>
                        <span
                          className={`font-bold ${
                            u.examPackLimit === -1
                              ? "text-emerald-600"
                              : (u.createdPacksCount ?? 0) >= (u.examPackLimit ?? 3)
                              ? "text-rose-600"
                              : "text-slate-700"
                          }`}
                        >
                          {u.examPackLimit === -1 ? "∞" : u.examPackLimit ?? 3}
                        </span>
                        {u.examPackLimit !== -1 && (u.createdPacksCount ?? 0) >= (u.examPackLimit ?? 3) && (
                          <span className="text-[8px] font-bold px-1 py-0.2 bg-rose-50 text-rose-600 border border-rose-200 rounded">
                            FULL
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Exam Quota */}
                    <div className="flex items-center justify-between text-[11px] font-mono">
                      <span className="text-slate-500 font-semibold">Exams:</span>
                      <div className="flex items-center gap-1">
                        <span className="font-bold text-slate-900">{u.createdExamsCount ?? 0}</span>
                        <span className="text-slate-400">/</span>
                        <span
                          className={`font-bold ${
                            u.examLimit === -1
                              ? "text-emerald-600"
                              : (u.createdExamsCount ?? 0) >= (u.examLimit ?? 5)
                              ? "text-rose-600"
                              : "text-slate-700"
                          }`}
                        >
                          {u.examLimit === -1 ? "∞" : u.examLimit ?? 5}
                        </span>
                        {u.examLimit !== -1 && (u.createdExamsCount ?? 0) >= (u.examLimit ?? 5) && (
                          <span className="text-[8px] font-bold px-1 py-0.2 bg-rose-50 text-rose-600 border border-rose-200 rounded">
                            FULL
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  <span className="text-[11px] font-mono text-slate-400">—</span>
                )}
              </td>

              <td className="py-3.5 px-4 text-right space-x-1.5">
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
              </td>
            </tr>
          ))}

          {users.length === 0 && (
            <tr>
              <td colSpan={6} className="py-8 text-center text-slate-400 font-medium">
                No users registered in system.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};
