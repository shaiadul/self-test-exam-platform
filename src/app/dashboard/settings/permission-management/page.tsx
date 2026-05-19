"use client";

import { useState } from "react";
import { FaLock, FaUserShield } from "react-icons/fa";
import { PageContainer } from "@/components/common/PageContainer";

interface Permission {
  id: string;
  role: string;
  module: string;
  access: "Full" | "Read" | "None";
}

const mockPermissions: Permission[] = [
  { id: "P-101", role: "Admin", module: "User Management", access: "Full" },
  { id: "P-102", role: "Teacher", module: "Exam Analysis", access: "Read" },
  { id: "P-103", role: "Student", module: "Financial Report", access: "None" },
];

export default function PermissionManagementPage() {
  const [permissions, setPermissions] = useState(mockPermissions);

  return (
    <PageContainer className="space-y-6">
      <h1 className="text-3xl font-bold text-[#dd6b01]">Permission Management</h1>
      <p className="text-gray-500">Manage access permissions for different roles.</p>

      <div className="overflow-x-auto mt-6">
        <table className="min-w-full bg-white rounded-xl shadow-lg">
          <thead className="bg-amber-50 text-gray-500">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-semibold">ID</th>
              <th className="px-6 py-3 text-left text-sm font-semibold">Role</th>
              <th className="px-6 py-3 text-left text-sm font-semibold">Module</th>
              <th className="px-6 py-3 text-left text-sm font-semibold">Access</th>
              <th className="px-6 py-3 text-left text-sm font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white">
            {permissions.map((perm) => (
              <tr key={perm.id} className="border-b hover:bg-[#ffedd5]/50 transition">
                <td className="px-6 py-4 font-mono">{perm.id}</td>
                <td className="px-6 py-4 font-semibold text-[#dd6b01]">{perm.role}</td>
                <td className="px-6 py-4">{perm.module}</td>
                <td className="px-6 py-4 font-bold">{perm.access}</td>
                <td className="px-6 py-4 flex gap-2">
                  <button className="px-3 py-1 border border-[#dd6b01] rounded-lg hover:bg-[#dd6b01] hover:text-white transition">
                    Edit
                  </button>
                  <button className="px-3 py-1 border border-red-500 rounded-lg hover:bg-red-500 hover:text-white transition">
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </PageContainer>
  );
}
