"use client";

import { useState } from "react";
import { toast } from "sonner";
import { FaUserPlus, FaUsers, FaUserCog, FaTrashAlt, FaTimes, FaEnvelope, FaLock, FaUser } from "react-icons/fa";
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
}

interface UserManagementClientViewProps {
  initialUsers: User[];
}

export default function UserManagementClientView({ initialUsers }: UserManagementClientViewProps) {
  const [users, setUsers] = useState<User[]>(initialUsers || []);

  // Edit role states
  const [editingUserId, setEditingUserId] = useState<number | null>(null);
  const [selectedRole, setSelectedRole] = useState<string>("");

  // Add User modal states
  const [addUserOpen, setAddUserOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newRole, setNewRole] = useState("student");
  const [submitting, setSubmitting] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);

  async function handleRoleChange(userId: number, role: string) {
    try {
      const res = await adminUpdateUserAction(userId, role);
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
          await adminUpdateUserAction(res.user.id, newRole);
          res.user.role = newRole;
        }

        setUsers((prev) => [res.user, ...prev]);
        toast.success("New user account created successfully.");
        setAddUserOpen(false);
        setNewName("");
        setNewEmail("");
        setNewPassword("");
        setNewRole("student");
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
              User & Role Management
            </h1>
          </div>
          <p className="text-xs md:text-sm text-gray-500 font-medium mt-1">
            System administration tool to configure platform access rights and roles.
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
                  <td colSpan={5} className="py-8 text-center text-gray-500 font-medium">
                    No users registered in system.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add User Modal */}
      {addUserOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-gray-100 animate-fadeIn">
            <div className="flex justify-between items-center pb-4 mb-4 border-b border-gray-100">
              <h3 className="text-xl font-black text-gray-900">Create New Account</h3>
              <button
                onClick={() => setAddUserOpen(false)}
                className="text-gray-400 hover:text-gray-600 transition"
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
