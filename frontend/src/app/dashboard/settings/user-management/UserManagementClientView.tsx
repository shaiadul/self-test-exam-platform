"use client";

import { useState } from "react";
import { toast } from "sonner";
import { FaUserPlus, FaUsers, FaUserCog, FaTrashAlt, FaTimes, FaEnvelope, FaLock, FaUser, FaGraduationCap } from "react-icons/fa";
import { PageContainer } from "../../../../components/common/PageContainer";
import { adminUpdateUserAction, adminDeleteUserAction, registerAction } from "../../../../lib/actions";
import { Input } from "../../../../components/ui/Input";
import CustomSelect from "../../../../components/ui/CustomSelect";

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  status?: string;
  examLimit?: number;
  createdExamsCount?: number;
}

interface UserManagementClientViewProps {
  initialUsers: User[];
}

export default function UserManagementClientView({ initialUsers }: UserManagementClientViewProps) {
  const [users, setUsers] = useState<User[]>(initialUsers || []);

  // Edit role states
  const [editingUserId, setEditingUserId] = useState<number | null>(null);
  const [selectedRole, setSelectedRole] = useState<string>("");

  // Edit exam limit modal states
  const [limitModalUser, setLimitModalUser] = useState<User | null>(null);
  const [limitValue, setLimitValue] = useState<number>(5);
  const [savingLimit, setSavingLimit] = useState(false);

  // Add User modal states
  const [addUserOpen, setAddUserOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newRole, setNewRole] = useState("student");
  const [newExamLimit, setNewExamLimit] = useState<number>(5);
  const [submitting, setSubmitting] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);

  async function handleRoleChange(userId: number, role: string) {
    try {
      const res = await adminUpdateUserAction(userId, { role });
      if (res.success) {
        setUsers((prev) =>
          prev.map((u) => (u.id === userId ? { ...u, role } : u))
        );
        setEditingUserId(null);
        toast.success("Role updated successfully.");
      } else {
        toast.error(res.error || "Failed to update role");
      }
    } catch (err) {
      console.error(err);
      toast.error("An error occurred while updating the role.");
    }
  }

  async function handleSaveLimit(e: React.FormEvent) {
    e.preventDefault();
    if (!limitModalUser) return;

    setSavingLimit(true);
    try {
      const res = await adminUpdateUserAction(limitModalUser.id, { examLimit: limitValue });
      if (res.success) {
        setUsers((prev) =>
          prev.map((u) => (u.id === limitModalUser.id ? { ...u, examLimit: limitValue } : u))
        );
        toast.success(`Exam creation limit updated to ${limitValue === -1 ? "Unlimited" : limitValue}.`);
        setLimitModalUser(null);
      } else {
        toast.error(res.error || "Failed to update exam limit");
      }
    } catch {
      toast.error("Failed to update exam limit.");
    } finally {
      setSavingLimit(false);
    }
  }

  async function handleDeleteUser(userId: number, name: string) {
    if (!confirm(`Are you sure you want to permanently delete user "${name}"?`)) {
      return;
    }

    try {
      const res = await adminDeleteUserAction(userId);
      if (res.success) {
        setUsers((prev) => prev.filter((u) => u.id !== userId));
        toast.success("User deleted successfully.");
      } else {
        toast.error(res.error || "Failed to delete user");
      }
    } catch (err) {
      console.error(err);
      toast.error("An error occurred while deleting the user.");
    }
  }

  async function handleAddUser(e: React.FormEvent) {
    e.preventDefault();
    setAddError(null);
    setSubmitting(true);

    try {
      const res = await registerAction(newName, newEmail, newPassword);
      if (res.success && res.user) {
        if (newRole !== "student" && res.user.id) {
          const updateData: { role: string; examLimit?: number } = { role: newRole };
          if (newRole === "teacher") {
            updateData.examLimit = newExamLimit;
          }
          await adminUpdateUserAction(res.user.id, updateData);
          res.user.role = newRole;
          if (newRole === "teacher") {
            res.user.examLimit = newExamLimit;
          }
        }

        setUsers((prev) => [res.user, ...prev]);
        toast.success("New user account created successfully.");
        setAddUserOpen(false);
        setNewName("");
        setNewEmail("");
        setNewPassword("");
        setNewRole("student");
        setNewExamLimit(5);
      } else {
        setAddError(res.error || "Failed to register new user.");
      }
    } catch (err: any) {
      setAddError(err.message || "An unexpected error occurred.");
    } finally {
      setSubmitting(false);
    }
  }

  const roleOptions = ["student", "teacher", "admin"];

  return (
    <PageContainer className="space-y-6 animate-fadeIn pb-20 sm:pb-6">
      {/* Top Header Command Strip */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200/80 pb-4">
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 border border-slate-200 font-bold">
              {users.length} Users Registered
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            User &amp; Role Management
          </h1>
        </div>

        <button
          onClick={() => setAddUserOpen(true)}
          className="inline-flex items-center gap-1.5 bg-primary hover:bg-primary-hover text-white px-3.5 py-2 rounded font-bold text-xs shadow-2xs transition cursor-pointer"
        >
          <FaUserPlus className="text-xs" /> Add User Account
        </button>
      </div>

      <div className="bg-white rounded-none border border-slate-200/80 shadow-2xs overflow-hidden">
        {/* Desktop Table View */}
        <div className="hidden sm:block overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/70 border-b border-slate-200/80 text-slate-500 font-mono font-bold text-[10px] uppercase tracking-wider">
                <th className="py-3 px-4">ID</th>
                <th className="py-3 px-4">Name</th>
                <th className="py-3 px-4">Email Address</th>
                <th className="py-3 px-4">Assigned Role</th>
                <th className="py-3 px-4">Exam Quota</th>
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
                          onChange={(e) => setSelectedRole(e.target.value)}
                          className="border border-slate-200 rounded px-2 py-1 text-xs font-semibold focus:outline-none focus:border-primary bg-white"
                        >
                          <option value="student">Student</option>
                          <option value="teacher">Teacher</option>
                          <option value="admin">Admin</option>
                        </select>
                        <button
                          onClick={() => handleRoleChange(u.id, selectedRole)}
                          className="bg-emerald-600 text-white px-2 py-1 rounded text-xs font-bold hover:bg-emerald-700 cursor-pointer font-mono"
                        >
                          SAVE
                        </button>
                        <button
                          onClick={() => setEditingUserId(null)}
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

                  {/* Exam Quota column */}
                  <td className="py-3.5 px-4">
                    {u.role === "teacher" ? (
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-1.5 font-mono">
                          <span className="text-xs font-bold text-slate-800">
                            {(u.createdExamsCount ?? 0)}
                          </span>
                          <span className="text-xs text-slate-400">/</span>
                          <span className={`text-xs font-bold ${
                            u.examLimit === -1
                              ? "text-emerald-600"
                              : (u.createdExamsCount ?? 0) >= (u.examLimit ?? 5)
                              ? "text-rose-600"
                              : "text-slate-700"
                          }`}>
                            {u.examLimit === -1 ? "∞" : (u.examLimit ?? 5)}
                          </span>
                          {u.examLimit !== -1 && (
                            <span className={`ml-1 text-[9px] font-mono font-bold px-1.5 py-0.2 rounded border uppercase ${
                              (u.createdExamsCount ?? 0) >= (u.examLimit ?? 5)
                                ? "bg-rose-50 text-rose-600 border-rose-200"
                                : "bg-emerald-50 text-emerald-700 border-emerald-200"
                            }`}>
                              {(u.createdExamsCount ?? 0) >= (u.examLimit ?? 5) ? "LIMIT_REACHED" : "AVAILABLE"}
                            </span>
                          )}
                        </div>
                        <div className="w-24 h-1 bg-slate-100 rounded overflow-hidden">
                          {u.examLimit !== -1 && (
                            <div
                              className={`h-full rounded transition-all ${
                                (u.createdExamsCount ?? 0) >= (u.examLimit ?? 5)
                                  ? "bg-rose-500"
                                  : (u.createdExamsCount ?? 0) >= (u.examLimit ?? 5) * 0.8
                                  ? "bg-amber-400"
                                  : "bg-emerald-500"
                              }`}
                              style={{
                                width: `${Math.min(100, ((u.createdExamsCount ?? 0) / (u.examLimit ?? 5)) * 100)}%`,
                              }}
                            />
                          )}
                          {u.examLimit === -1 && (
                            <div className="h-full w-full bg-emerald-400 rounded" />
                          )}
                        </div>
                      </div>
                    ) : (
                      <span className="text-[11px] font-mono text-slate-400">—</span>
                    )}
                  </td>

                  <td className="py-3.5 px-4 text-right space-x-1.5">
                    <button
                      onClick={() => {
                        setEditingUserId(u.id);
                        setSelectedRole(u.role);
                      }}
                      className="inline-flex items-center gap-1 text-[11px] text-blue-600 hover:text-blue-800 font-bold px-2 py-1 hover:bg-blue-50 rounded transition cursor-pointer font-mono"
                    >
                      <FaUserCog /> ROLE
                    </button>
                    {u.role === "teacher" && (
                      <button
                        onClick={() => {
                          setLimitModalUser(u);
                          setLimitValue(u.examLimit ?? 5);
                        }}
                        className="inline-flex items-center gap-1 text-[11px] text-violet-600 hover:text-violet-800 font-bold px-2 py-1 hover:bg-violet-50 rounded transition cursor-pointer font-mono"
                      >
                        <FaGraduationCap /> QUOTA
                      </button>
                    )}
                    <button
                      onClick={() => handleDeleteUser(u.id, u.name)}
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

        {/* Mobile Cards View */}
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
                    onChange={(e) => setSelectedRole(e.target.value)}
                    className="flex-1 border border-slate-200 rounded px-2 py-1 text-xs font-semibold focus:outline-none focus:border-primary bg-white"
                  >
                    <option value="student">Student</option>
                    <option value="teacher">Teacher</option>
                    <option value="admin">Admin</option>
                  </select>
                  <button
                    onClick={() => handleRoleChange(u.id, selectedRole)}
                    className="bg-emerald-600 text-white px-2.5 py-1 rounded text-xs font-bold hover:bg-emerald-700 cursor-pointer font-mono"
                  >
                    SAVE
                  </button>
                  <button
                    onClick={() => setEditingUserId(null)}
                    className="text-slate-400 hover:text-slate-600 text-xs px-1 cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              )}

              {u.role === "teacher" && (
                <div className="bg-slate-50 p-2 rounded border border-slate-100 space-y-1">
                  <div className="flex items-center justify-between text-[10px] font-mono">
                    <span className="font-bold text-slate-400 uppercase">Exam Quota</span>
                    <span className="font-bold text-slate-700">
                      {u.createdExamsCount ?? 0} / {u.examLimit === -1 ? "∞" : (u.examLimit ?? 5)}
                    </span>
                  </div>
                  <div className="w-full h-1 bg-slate-200 rounded overflow-hidden">
                    {u.examLimit !== -1 ? (
                      <div
                        className={`h-full rounded transition-all ${
                          (u.createdExamsCount ?? 0) >= (u.examLimit ?? 5)
                            ? "bg-rose-500"
                            : (u.createdExamsCount ?? 0) >= (u.examLimit ?? 5) * 0.8
                            ? "bg-amber-400"
                            : "bg-emerald-500"
                        }`}
                        style={{
                          width: `${Math.min(100, ((u.createdExamsCount ?? 0) / (u.examLimit ?? 5)) * 100)}%`,
                        }}
                      />
                    ) : (
                      <div className="h-full w-full bg-emerald-400 rounded" />
                    )}
                  </div>
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-1 border-t border-slate-50">
                <button
                  onClick={() => {
                    setEditingUserId(u.id);
                    setSelectedRole(u.role);
                  }}
                  className="inline-flex items-center gap-1 text-[11px] text-blue-600 hover:text-blue-800 font-bold px-2 py-1 hover:bg-blue-50 rounded transition cursor-pointer font-mono"
                >
                  <FaUserCog /> ROLE
                </button>
                {u.role === "teacher" && (
                  <button
                    onClick={() => {
                      setLimitModalUser(u);
                      setLimitValue(u.examLimit ?? 5);
                    }}
                    className="inline-flex items-center gap-1 text-[11px] text-violet-600 hover:text-violet-800 font-bold px-2 py-1 hover:bg-violet-50 rounded transition cursor-pointer font-mono"
                  >
                    <FaGraduationCap /> QUOTA
                  </button>
                )}
                <button
                  onClick={() => handleDeleteUser(u.id, u.name)}
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
      </div>

      {/* ── Exam Limit Edit Modal ─────────────────────────────────── */}
      {limitModalUser && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded border border-slate-200/80 max-w-sm w-full p-5 shadow-2xl animate-fadeIn">
            <div className="flex justify-between items-center pb-3 mb-4 border-b border-slate-100">
              <div>
                <h3 className="text-base font-black text-slate-900">Set Exam Creation Limit</h3>
              </div>
              <button
                onClick={() => setLimitModalUser(null)}
                className="text-slate-400 hover:text-slate-600 transition cursor-pointer"
              >
                <FaTimes />
              </button>
            </div>

            <form onSubmit={handleSaveLimit} className="space-y-4">
              <div className="bg-slate-50 border border-slate-200/80 rounded p-2.5 text-xs text-slate-700 font-mono">
                Teacher: <span className="font-bold text-slate-900">{limitModalUser.name}</span>
                <br />
                Currently created: <span className="font-bold text-primary">{limitModalUser.createdExamsCount ?? 0} exam(s)</span>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5">
                  Maximum Exams Allowed <span className="text-slate-400 font-normal">(-1 = unlimited)</span>
                </label>

                {/* Quick presets */}
                <div className="flex flex-wrap gap-1.5 mb-3 font-mono">
                  {[-1, 3, 5, 10, 20, 50].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setLimitValue(preset)}
                      className={`px-2.5 py-1 rounded text-xs font-bold border transition cursor-pointer ${
                        limitValue === preset
                          ? "bg-violet-600 text-white border-violet-600 shadow-2xs"
                          : "bg-slate-50 text-slate-700 border-slate-200 hover:border-violet-400 hover:text-violet-600"
                      }`}
                    >
                      {preset === -1 ? "∞ Unlimited" : preset}
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-500 font-medium">Custom:</span>
                  <input
                    type="number"
                    min={-1}
                    max={999}
                    value={limitValue}
                    onChange={(e) => setLimitValue(parseInt(e.target.value) || 0)}
                    className="w-24 border border-slate-200 rounded px-2.5 py-1.5 text-xs font-bold font-mono outline-none focus:border-violet-500 transition"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setLimitModalUser(null)}
                  className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingLimit}
                  className="flex-1 py-2 bg-violet-600 hover:bg-violet-700 text-white font-bold text-xs rounded transition shadow-2xs cursor-pointer disabled:opacity-50 font-mono"
                >
                  {savingLimit ? "Saving..." : "Commit Quota"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Add User Modal ─────────────────────────────────────────── */}
      {addUserOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded border border-slate-200/80 max-w-md w-full p-5 sm:p-6 shadow-2xl animate-fadeIn">
            <div className="flex justify-between items-center pb-3 mb-4 border-b border-slate-100">
              <div>
                <h3 className="text-base font-black text-slate-900">Provision New User Account</h3>
              </div>
              <button
                onClick={() => setAddUserOpen(false)}
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

            <form onSubmit={handleAddUser} className="space-y-3.5">
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
                  onClick={() => setAddUserOpen(false)}
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
      )}
    </PageContainer>
  );
}
