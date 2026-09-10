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
    <PageContainer className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-100 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <FaUsers className="text-[#dd6b01] text-2xl" />
            <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 tracking-tight">
              User &amp; Role Management
            </h1>
          </div>
          <p className="text-xs md:text-sm text-gray-500 font-medium mt-1">
            System administration tool to configure platform access rights, roles and teacher exam quotas.
          </p>
        </div>

        <button
          onClick={() => setAddUserOpen(true)}
          className="flex items-center gap-2 bg-[#dd6b01] text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-md hover:bg-orange-600 transition cursor-pointer"
        >
          <FaUserPlus /> Add User
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100 text-gray-500 font-bold text-xs uppercase tracking-wider">
                <th className="py-4 px-6">ID</th>
                <th className="py-4 px-6">Name</th>
                <th className="py-4 px-6">Email</th>
                <th className="py-4 px-6">Assigned Role</th>
                <th className="py-4 px-6">Exam Quota</th>
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-gray-50/50 transition">
                  <td className="py-4 px-6 font-mono text-xs text-gray-400">#{u.id}</td>
                  <td className="py-4 px-6 font-bold text-gray-900">{u.name}</td>
                  <td className="py-4 px-6 text-gray-600">{u.email}</td>
                  <td className="py-4 px-6">
                    {editingUserId === u.id ? (
                      <div className="flex items-center gap-2">
                        <select
                          value={selectedRole}
                          onChange={(e) => setSelectedRole(e.target.value)}
                          className="border border-gray-300 rounded-lg px-2 py-1 text-xs font-semibold focus:outline-none focus:border-[#dd6b01]"
                        >
                          <option value="student">Student</option>
                          <option value="teacher">Teacher</option>
                          <option value="admin">Admin</option>
                        </select>
                        <button
                          onClick={() => handleRoleChange(u.id, selectedRole)}
                          className="bg-emerald-600 text-white px-2.5 py-1 rounded text-xs font-bold hover:bg-emerald-700 cursor-pointer"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => setEditingUserId(null)}
                          className="text-gray-400 hover:text-gray-600 text-xs px-1 cursor-pointer"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border ${
                          u.role === "admin"
                            ? "bg-purple-50 text-purple-700 border-purple-200"
                            : u.role === "teacher"
                            ? "bg-blue-50 text-blue-700 border-blue-200"
                            : "bg-orange-50 text-[#dd6b01] border-orange-200"
                        }`}
                      >
                        {u.role.toUpperCase()}
                      </span>
                    )}
                  </td>

                  {/* Exam Quota column — only meaningful for teachers */}
                  <td className="py-4 px-6">
                    {u.role === "teacher" ? (
                      <div className="flex flex-col gap-0.5">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-bold text-gray-700">
                            {(u.createdExamsCount ?? 0)}
                          </span>
                          <span className="text-xs text-gray-400">/</span>
                          <span className={`text-xs font-bold ${
                            u.examLimit === -1
                              ? "text-emerald-600"
                              : (u.createdExamsCount ?? 0) >= (u.examLimit ?? 5)
                              ? "text-red-500"
                              : "text-gray-700"
                          }`}>
                            {u.examLimit === -1 ? "∞" : (u.examLimit ?? 5)}
                          </span>
                          {u.examLimit !== -1 && (
                            <span className={`ml-1 text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                              (u.createdExamsCount ?? 0) >= (u.examLimit ?? 5)
                                ? "bg-red-50 text-red-600 border border-red-200"
                                : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            }`}>
                              {(u.createdExamsCount ?? 0) >= (u.examLimit ?? 5) ? "LIMIT REACHED" : "OK"}
                            </span>
                          )}
                        </div>
                        <div className="w-24 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          {u.examLimit !== -1 && (
                            <div
                              className={`h-full rounded-full transition-all ${
                                (u.createdExamsCount ?? 0) >= (u.examLimit ?? 5)
                                  ? "bg-red-500"
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
                            <div className="h-full w-full bg-emerald-400 rounded-full" />
                          )}
                        </div>
                      </div>
                    ) : (
                      <span className="text-xs text-gray-300 italic">N/A</span>
                    )}
                  </td>

                  <td className="py-4 px-6 text-right space-x-2">
                    <button
                      onClick={() => {
                        setEditingUserId(u.id);
                        setSelectedRole(u.role);
                      }}
                      className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 font-bold p-1 hover:bg-blue-50 rounded transition cursor-pointer"
                    >
                      <FaUserCog /> Change Role
                    </button>
                    {u.role === "teacher" && (
                      <button
                        onClick={() => {
                          setLimitModalUser(u);
                          setLimitValue(u.examLimit ?? 5);
                        }}
                        className="inline-flex items-center gap-1 text-xs text-violet-600 hover:text-violet-800 font-bold p-1 hover:bg-violet-50 rounded transition cursor-pointer"
                      >
                        <FaGraduationCap /> Set Limit
                      </button>
                    )}
                    <button
                      onClick={() => handleDeleteUser(u.id, u.name)}
                      className="inline-flex items-center gap-1 text-xs text-red-600 hover:text-red-800 font-bold p-1 hover:bg-red-50 rounded transition cursor-pointer"
                    >
                      <FaTrashAlt /> Delete
                    </button>
                  </td>
                </tr>
              ))}

              {users.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-gray-500 font-medium">
                    No users registered in system.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Exam Limit Edit Modal ─────────────────────────────────── */}
      {limitModalUser && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-gray-100">
            <div className="flex justify-between items-center pb-4 mb-5 border-b border-gray-100">
              <div>
                <h3 className="text-lg font-black text-gray-900">Set Exam Creation Limit</h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Teacher: <span className="font-bold text-gray-700">{limitModalUser.name}</span>
                </p>
              </div>
              <button
                onClick={() => setLimitModalUser(null)}
                className="text-gray-400 hover:text-gray-600 transition cursor-pointer"
              >
                <FaTimes />
              </button>
            </div>

            <form onSubmit={handleSaveLimit} className="space-y-5">
              {/* Current usage info */}
              <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 text-xs text-blue-700 font-medium">
                Currently created:{" "}
                <span className="font-bold">{limitModalUser.createdExamsCount ?? 0} exam(s)</span>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700 block mb-2">
                  Maximum Exams Allowed
                  <span className="ml-1 text-gray-400 font-normal">(use -1 for unlimited)</span>
                </label>

                {/* Quick presets */}
                <div className="flex flex-wrap gap-2 mb-3">
                  {[-1, 3, 5, 10, 20, 50].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setLimitValue(preset)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition cursor-pointer ${
                        limitValue === preset
                          ? "bg-violet-600 text-white border-violet-600 shadow-sm"
                          : "bg-gray-50 text-gray-600 border-gray-200 hover:border-violet-400 hover:text-violet-600"
                      }`}
                    >
                      {preset === -1 ? "∞ Unlimited" : preset}
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500 font-medium">Custom:</span>
                  <input
                    type="number"
                    min={-1}
                    max={999}
                    value={limitValue}
                    onChange={(e) => setLimitValue(parseInt(e.target.value) || 0)}
                    className="w-24 border-2 border-gray-200 rounded-xl px-3 py-2 text-sm font-bold outline-none focus:border-violet-500 transition"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setLimitModalUser(null)}
                  className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs rounded-xl transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingLimit}
                  className="flex-1 py-2.5 bg-violet-600 hover:bg-violet-700 text-white font-bold text-xs rounded-xl transition shadow-md cursor-pointer disabled:opacity-50"
                >
                  {savingLimit ? "Saving..." : "Save Limit"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Add User Modal ─────────────────────────────────────────── */}
      {addUserOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-gray-100 animate-fadeIn">
            <div className="flex justify-between items-center pb-4 mb-4 border-b border-gray-100">
              <h3 className="text-xl font-black text-gray-900">Create New Account</h3>
              <button
                onClick={() => setAddUserOpen(false)}
                className="text-gray-400 hover:text-gray-600 transition cursor-pointer"
              >
                <FaTimes />
              </button>
            </div>

            {addError && (
              <div className="mb-4 p-3 bg-red-50 text-red-700 border border-red-200 rounded-xl text-xs font-semibold">
                {addError}
              </div>
            )}

            <form onSubmit={handleAddUser} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">Full Name</label>
                <Input
                  icon={<FaUser className="text-gray-400" />}
                  placeholder="John Doe"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">Email Address</label>
                <Input
                  icon={<FaEnvelope className="text-gray-400" />}
                  type="email"
                  placeholder="john@example.com"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">Initial Password</label>
                <Input
                  icon={<FaLock className="text-gray-400" />}
                  type="password"
                  placeholder="••••••••"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">Access Role</label>
                <CustomSelect
                  options={roleOptions}
                  value={newRole}
                  onChange={(val) => setNewRole(val)}
                  placeholder="Select Role"
                />
              </div>

              {/* Exam limit — only shown when teacher is selected */}
              {newRole === "teacher" && (
                <div className="p-3 bg-violet-50 border border-violet-100 rounded-xl space-y-2">
                  <label className="text-xs font-bold text-violet-800 block">
                    Exam Creation Limit
                    <span className="ml-1 text-violet-500 font-normal">(−1 = unlimited)</span>
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {[-1, 3, 5, 10, 20].map((preset) => (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => setNewExamLimit(preset)}
                        className={`px-3 py-1 rounded-lg text-xs font-bold border transition cursor-pointer ${
                          newExamLimit === preset
                            ? "bg-violet-600 text-white border-violet-600"
                            : "bg-white text-gray-600 border-gray-200 hover:border-violet-400"
                        }`}
                      >
                        {preset === -1 ? "∞" : preset}
                      </button>
                    ))}
                  </div>
                  <div className="flex items-center gap-2 pt-1">
                    <span className="text-xs text-violet-600 font-semibold">Custom:</span>
                    <input
                      type="number"
                      min={-1}
                      max={999}
                      value={newExamLimit}
                      onChange={(e) => setNewExamLimit(parseInt(e.target.value) || 0)}
                      className="w-20 border border-violet-200 rounded-lg px-2 py-1.5 text-sm font-bold outline-none focus:border-violet-500 bg-white"
                    />
                  </div>
                </div>
              )}

              <div className="flex gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setAddUserOpen(false)}
                  className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-2.5 bg-[#dd6b01] hover:bg-orange-600 text-white font-bold text-xs rounded-xl transition shadow-md"
                >
                  {submitting ? "Creating..." : "Create Account"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </PageContainer>
  );
}
