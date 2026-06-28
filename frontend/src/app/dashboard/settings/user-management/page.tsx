"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { FaUserPlus, FaUsers, FaUserCog, FaTrashAlt, FaTimes, FaEnvelope, FaLock, FaUser } from "react-icons/fa";
import { PageContainer } from "../../../../components/common/PageContainer";
import { adminGetUsersAction, adminUpdateUserAction, adminDeleteUserAction, registerAction } from "../../../../lib/actions";
import { Input } from "../../../../components/ui/Input";
import CustomSelect from "../../../../components/ui/CustomSelect";

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  status?: string;
}

export default function UserManagementPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  async function loadUsers() {
    setLoading(true);
    setError(null);
    try {
      const res = await adminGetUsersAction();
      if (Array.isArray(res)) {
        setUsers(res);
      } else {
        setError("Invalid response format received from server.");
      }
    } catch (err) {
      console.error(err);
      setError("Failed to fetch users from database.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadUsers();
  }, []);

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
        const createdUser = res.user;

        if (newRole !== "student" && createdUser.id) {
          await adminUpdateUserAction(createdUser.id, newRole);
        }

        setNewName("");
        setNewEmail("");
        setNewPassword("");
        setNewRole("student");
        setAddUserOpen(false);
        toast.success("User registered successfully.");
        loadUsers();
      } else {
        setAddError(res.error || "Failed to register user");
      }
    } catch (err) {
      setAddError("An unexpected error occurred.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <PageContainer className="space-y-6 animate-fadeIn">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">User Management</h1>
          <p className="text-gray-500 font-medium">Create, manage users and assign permissions.</p>
        </div>
        <button
          onClick={() => setAddUserOpen(true)}
          className="flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-[#dd6b01] text-white hover:bg-orange-600 shadow-lg shadow-orange-500/10 font-bold transition duration-300 w-full md:w-auto cursor-pointer"
        >
          <FaUserPlus /> Add New User
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-2xl font-medium">
          {error}
        </div>
      )}

      {loading ? (
        <div className="min-h-[50vh] flex items-center justify-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#dd6b01]"></div>
        </div>
      ) : (
        <div className="overflow-x-auto bg-white border border-gray-100 rounded-3xl shadow-lg">
          <table className="min-w-full border-collapse">
            <thead className="bg-[#fff4ec] text-[#dd6b01] border-b border-orange-100/50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider">ID</th>
                <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider">Name</th>
                <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider">Email</th>
                <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider">Role</th>
                <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-[#ffedd5]/25 transition font-semibold">
                  <td className="px-6 py-4 text-sm font-mono font-bold text-gray-400">#{user.id}</td>
                  <td className="px-6 py-4 flex items-center gap-3">
                    <div className="w-9 h-9 flex items-center justify-center rounded-2xl bg-[#dd6b01]/10 text-[#dd6b01] font-bold text-sm">
                      {user.name ? user.name.charAt(0).toUpperCase() : "?"}
                    </div>
                    <span className="font-bold text-gray-900">{user.name}</span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">{user.email}</td>
                  <td className="px-6 py-4">
                    {editingUserId === user.id ? (
                      <div className="w-40">
                        <CustomSelect
                          options={["student", "teacher", "admin"]}
                          value={selectedRole}
                          onChange={(val) => handleRoleChange(user.id, val)}
                        />
                      </div>
                    ) : (
                      <span className={`px-3 py-1 rounded-full text-xs font-bold border uppercase tracking-wider ${
                        user.role === "admin"
                          ? "bg-red-50 text-red-700 border-red-200"
                          : user.role === "teacher"
                            ? "bg-blue-50 text-blue-700 border-blue-200"
                            : "bg-orange-50 text-orange-700 border-orange-200"
                      }`}>
                        {user.role}
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2.5 py-1 text-[10px] font-bold rounded-full bg-green-50 text-green-700 border border-green-200">
                      ACTIVE
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setEditingUserId(user.id);
                          setSelectedRole(user.role);
                        }}
                        className="p-2 text-sm text-[#dd6b01] bg-[#dd6b01]/5 hover:bg-[#dd6b01]/10 rounded-xl transition cursor-pointer"
                        title="Edit User Role"
                      >
                        <FaUserCog />
                      </button>
                      <button
                        onClick={() => handleDeleteUser(user.id, user.name)}
                        className="p-2 text-sm text-red-600 bg-red-50 hover:bg-red-100 rounded-xl transition cursor-pointer"
                        title="Delete User"
                      >
                        <FaTrashAlt />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {users.length === 0 && (
            <div className="text-center text-gray-500 py-12 flex flex-col items-center justify-center space-y-2">
              <FaUsers className="text-4xl text-gray-300" />
              <p className="font-semibold text-gray-600">No users found</p>
            </div>
          )}
        </div>
      )}

      {/* ---- Add User Modal ---- */}
      {addUserOpen && (
        <div className="fixed inset-0 bg-black/55 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden border border-gray-100 shadow-2xl animate-scaleUp">
            <div className="bg-[#fff4ec] px-6 py-4 flex justify-between items-center border-b border-orange-100">
              <h3 className="text-lg font-black text-[#dd6b01] flex items-center gap-2">
                <FaUserPlus /> Create User Account
              </h3>
              <button
                onClick={() => setAddUserOpen(false)}
                className="text-gray-400 hover:text-gray-600 transition p-1 bg-white rounded-xl shadow-sm border border-gray-150 cursor-pointer"
              >
                <FaTimes />
              </button>
            </div>

            <form onSubmit={handleAddUser} className="p-6 space-y-4">
              {addError && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs font-semibold">
                  {addError}
                </div>
              )}

              <Input
                label="Full Name"
                icon={<FaUser className="text-gray-400" />}
                required
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="e.g. Jannatul Ferdaus"
              />

              <Input
                label="Email Address"
                icon={<FaEnvelope className="text-gray-400" />}
                type="email"
                required
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                placeholder="name@example.com"
              />

              <Input
                label="Password"
                icon={<FaLock className="text-gray-400" />}
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••"
              />

              <CustomSelect
                label="System Role"
                options={["student", "teacher", "admin"]}
                value={newRole}
                onChange={(val) => setNewRole(val)}
              />

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3 bg-[#dd6b01] text-white hover:bg-orange-600 font-bold rounded-2xl shadow-lg shadow-orange-500/10 transition mt-6 disabled:bg-orange-300 cursor-pointer"
              >
                {submitting ? "Registering..." : "Register User"}
              </button>
            </form>
          </div>
        </div>
      )}
    </PageContainer>
  );
}
