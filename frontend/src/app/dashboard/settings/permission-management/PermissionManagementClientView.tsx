"use client";

import { useState } from "react";
import { toast } from "sonner";
import { FaEdit, FaSave, FaTimes } from "react-icons/fa";
import { PageContainer } from "../../../../components/common/PageContainer";
import { adminUpdatePermissionAction } from "../../../../lib/actions";

interface Permission {
  id: number;
  role: string;
  module: string;
  access: string;
}

interface PermissionManagementClientViewProps {
  initialPermissions: Permission[];
}

export default function PermissionManagementClientView({ initialPermissions }: PermissionManagementClientViewProps) {
  const [permissions, setPermissions] = useState<Permission[]>(initialPermissions || []);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [selectedAccess, setSelectedAccess] = useState<string>("");

  async function handleUpdateAccess(id: number, access: string) {
    try {
      const res = await adminUpdatePermissionAction(id, access);
      if (res.success) {
        setPermissions((prev) =>
          prev.map((p) => (p.id === id ? { ...p, access } : p))
        );
        setEditingId(null);
        toast.success("Permission updated successfully.");
      } else {
        toast.error(res.error || "Failed to update permission");
      }
    } catch (err) {
      console.error(err);
      toast.error("An error occurred while updating the permission.");
    }
  }

  return (
    <PageContainer className="space-y-6 animate-fadeIn">
      <div>
        <h1 className="text-3xl font-black text-gray-900 tracking-tight">Permission Management</h1>
        <p className="text-gray-500 font-medium">Manage access permissions for different system roles.</p>
      </div>

      <div className="overflow-x-auto bg-white border border-gray-100 rounded-3xl shadow-lg">
        <table className="min-w-full border-collapse">
          <thead className="bg-[#fff4ec] text-[#dd6b01] border-b border-orange-100/50">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider">ID</th>
              <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider">Role</th>
              <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider">Module</th>
              <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider">Access</th>
              <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {permissions.map((perm) => (
              <tr key={perm.id} className="hover:bg-[#ffedd5]/25 transition font-semibold">
                <td className="px-6 py-4 text-sm font-mono font-bold text-gray-400">#PERM-{perm.id}</td>
                <td className="px-6 py-4 font-bold text-gray-950">
                  <span className={`px-2.5 py-1 rounded-lg text-xs font-black border uppercase tracking-wider ${
                    perm.role === "admin" ? "bg-purple-50 text-purple-700 border-purple-200" :
                    perm.role === "teacher" ? "bg-blue-50 text-blue-700 border-blue-200" :
                    "bg-orange-50 text-[#dd6b01] border-orange-200"
                  }`}>
                    {perm.role}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-700 font-bold">{perm.module}</td>
                <td className="px-6 py-4 text-sm">
                  {editingId === perm.id ? (
                    <select
                      value={selectedAccess}
                      onChange={(e) => setSelectedAccess(e.target.value)}
                      className="border border-gray-300 rounded-lg px-2.5 py-1 text-xs font-bold text-gray-800 bg-white outline-none focus:border-[#dd6b01]"
                    >
                      <option value="Full Access">Full Access</option>
                      <option value="Read & Create">Read & Create</option>
                      <option value="Read Only">Read Only</option>
                      <option value="Restricted Access">Restricted Access</option>
                    </select>
                  ) : (
                    <span className={`px-3 py-1 rounded-full text-xs font-extrabold border ${
                      perm.access.includes("Full") ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
                      perm.access.includes("Read & Create") ? "bg-blue-50 text-blue-700 border-blue-200" :
                      perm.access.includes("Read Only") ? "bg-amber-50 text-amber-700 border-amber-200" :
                      "bg-rose-50 text-rose-700 border-rose-200"
                    }`}>
                      {perm.access}
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 text-sm">
                  {editingId === perm.id ? (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleUpdateAccess(perm.id, selectedAccess)}
                        className="p-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition"
                        title="Save Permission"
                      >
                        <FaSave />
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className="p-1.5 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg transition"
                        title="Cancel"
                      >
                        <FaTimes />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => {
                        setEditingId(perm.id);
                        setSelectedAccess(perm.access);
                      }}
                      className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                      title="Edit Permission"
                    >
                      <FaEdit />
                    </button>
                  )}
                </td>
              </tr>
            ))}

            {permissions.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-gray-500 font-semibold text-sm">
                  No system permissions configured.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </PageContainer>
  );
}
