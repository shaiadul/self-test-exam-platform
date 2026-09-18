"use client";

import { useState } from "react";
import { toast } from "sonner";
import { FaUserPlus } from "react-icons/fa";
import { PageContainer } from "../../../../components/common/PageContainer";
import { adminUpdateUserAction, adminDeleteUserAction, registerAction } from "../../../../lib/actions";
import { User } from "./types";
import { UserManagementTable } from "./components/UserManagementTable";
import { UserManagementMobileCards } from "./components/UserManagementMobileCards";
import { EditExamLimitModal } from "./components/EditExamLimitModal";
import { AddUserModal } from "./components/AddUserModal";

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
        <UserManagementTable
          users={users}
          editingUserId={editingUserId}
          selectedRole={selectedRole}
          onStartEditRole={(userId, currentRole) => {
            setEditingUserId(userId);
            setSelectedRole(currentRole);
          }}
          onRoleSelectChange={setSelectedRole}
          onSaveRole={handleRoleChange}
          onCancelEditRole={() => setEditingUserId(null)}
          onOpenLimitModal={(u) => {
            setLimitModalUser(u);
            setLimitValue(u.examLimit ?? 5);
          }}
          onDeleteUser={handleDeleteUser}
        />

        {/* Mobile Cards View */}
        <UserManagementMobileCards
          users={users}
          editingUserId={editingUserId}
          selectedRole={selectedRole}
          onStartEditRole={(userId, currentRole) => {
            setEditingUserId(userId);
            setSelectedRole(currentRole);
          }}
          onRoleSelectChange={setSelectedRole}
          onSaveRole={handleRoleChange}
          onCancelEditRole={() => setEditingUserId(null)}
          onOpenLimitModal={(u) => {
            setLimitModalUser(u);
            setLimitValue(u.examLimit ?? 5);
          }}
          onDeleteUser={handleDeleteUser}
        />
      </div>

      {/* Exam Limit Edit Modal */}
      {limitModalUser && (
        <EditExamLimitModal
          user={limitModalUser}
          limitValue={limitValue}
          savingLimit={savingLimit}
          onLimitChange={setLimitValue}
          onClose={() => setLimitModalUser(null)}
          onSubmit={handleSaveLimit}
        />
      )}

      {/* Add User Modal */}
      <AddUserModal
        isOpen={addUserOpen}
        onClose={() => setAddUserOpen(false)}
        onSubmit={handleAddUser}
        newName={newName}
        setNewName={setNewName}
        newEmail={newEmail}
        setNewEmail={setNewEmail}
        newPassword={newPassword}
        setNewPassword={setNewPassword}
        newRole={newRole}
        setNewRole={setNewRole}
        newExamLimit={newExamLimit}
        setNewExamLimit={setNewExamLimit}
        submitting={submitting}
        addError={addError}
        roleOptions={roleOptions}
      />
    </PageContainer>
  );
}
