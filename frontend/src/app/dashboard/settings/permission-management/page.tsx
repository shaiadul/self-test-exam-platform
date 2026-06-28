"use client";

import { useState, useEffect } from "react";
import { FaUserShield, FaEdit, FaSave, FaTimes, FaLock, FaGlobe } from "react-icons/fa";
import { PageContainer } from "../../../../components/common/PageContainer";
import { adminGetPermissionsAction, adminUpdatePermissionAction } from "../../../../lib/actions";
import CustomSelect from "../../../../components/ui/CustomSelect";

interface Permission {
  id: number;
  role: string;
  module: string;
  access: string;
}

export default function PermissionManagementPage() {
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Editing state
  const [editingId, setEditingId] = useState<number | null>(null);
  const [selectedAccess, setSelectedAccess] = useState<string>("");

  async function loadPermissions() {
    setLoading(true);
    setError(null);
    try {
      const res = await adminGetPermissionsAction();
      if (Array.isArray(res)) {
        setPermissions(res);
      } else {
        setError("Invalid permissions response received from server.");
      }
    } catch (err) {
      console.error(err);
      setError("Failed to fetch permissions from database.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadPermissions();
  }, []);

  async function handleUpdateAccess(id: number, access: string) {
    try {
      const res = await adminUpdatePermissionAction(id, access);
      if (res.success) {
        setPermissions((prev) =>
          prev.map((p) => (p.id === id ? { ...p, access } : p))
        );
        setEditingId(null);
      } else {
        alert(res.error || "Failed to update permission");
      }
    } catch (err) {
      console.error(err);
      alert("An error occurred while updating the permission.");
    }
  }

  return (
    <PageContainer className="space-y-6 animate-fadeIn">
      <div>
        <h1 className="text-3xl font-black text-gray-900 tracking-tight">Permission Management</h1>
        <p className="text-gray-500 font-medium">Manage access permissions for different system roles.</p>
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
                      perm.role === "Admin"
                        ? "bg-red-50 text-red-700 border-red-200"
                        : perm.role === "Teacher"
                          ? "bg-blue-50 text-blue-700 border-blue-200"
                          : "bg-orange-50 text-orange-700 border-orange-200"
                    }`}>
                      {perm.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600 flex items-center gap-2">
                    <FaGlobe className="text-gray-300 text-sm" /> {perm.module}
                  </td>
                  <td className="px-6 py-4">
                    {editingId === perm.id ? (
                      <div className="w-32">
                        <CustomSelect
                          options={["Full", "Read", "None"]}
                          value={selectedAccess}
                          onChange={(val) => handleUpdateAccess(perm.id, val)}
                        />
                      </div>
                    ) : (
                      <span className={`px-3 py-1 rounded-full text-xs font-black border uppercase tracking-wider ${
                        perm.access === "Full"
                          ? "bg-green-50 text-green-700 border-green-200"
                          : perm.access === "Read"
                            ? "bg-blue-50 text-blue-700 border-blue-200"
                            : "bg-gray-50 text-gray-500 border-gray-200"
                      }`}>
                        {perm.access}
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {editingId === perm.id ? (
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleUpdateAccess(perm.id, selectedAccess)}
                          className="p-2 text-sm text-green-600 bg-green-50 hover:bg-green-100 rounded-xl transition cursor-pointer"
                          title="Save Changes"
                        >
                          <FaSave />
                        </button>
                        <button
                          onClick={() => setEditingId(null)}
                          className="p-2 text-sm text-gray-500 bg-gray-50 hover:bg-gray-100 rounded-xl transition cursor-pointer"
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
                        className="p-2 text-sm text-[#dd6b01] bg-[#dd6b01]/5 hover:bg-[#dd6b01]/10 rounded-xl transition cursor-pointer"
                        title="Edit Permissions"
                      >
                        <FaEdit />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {permissions.length === 0 && (
            <div className="text-center text-gray-500 py-12 flex flex-col items-center justify-center space-y-2">
              <FaLock className="text-4xl text-gray-300" />
              <p className="font-semibold text-gray-600">No permissions registered</p>
            </div>
          )}
        </div>
      )}
    </PageContainer>
  );
}
