"use client";

import { useState } from "react";
import { FaUserPlus, FaUsers, FaUserCog } from "react-icons/fa";
import { PageContainer } from "@/components/common/PageContainer";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  status: "Active" | "Inactive";
}

const mockUsers: User[] = [
  { id: "U-101", name: "Md Saidul Basar", email: "saidul@example.com", role: "Teacher", status: "Active" },
  { id: "U-102", name: "Rafid Khan", email: "rafid@example.com", role: "Student", status: "Inactive" },
  { id: "U-103", name: "Tanzim Hasan", email: "tanzim@example.com", role: "Admin", status: "Active" },
];

export default function UserManagementPage() {
  const [users, setUsers] = useState(mockUsers);

  return (
    <PageContainer className="space-y-6">
      <h1 className="text-3xl font-bold text-[#dd6b01]">User Management</h1>
      <p className="text-gray-500">Create, manage users and assign roles.</p>

      {/* Add user button */}
      <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#dd6b01] text-white hover:bg-orange-600 transition">
        <FaUserPlus /> Add User
      </button>

      {/* Users table */}
      <div className="overflow-x-auto mt-6">
        <table className="min-w-full bg-white rounded-xl shadow-lg">
          <thead className="bg-amber-50 text-gray-500">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-semibold">ID</th>
              <th className="px-6 py-3 text-left text-sm font-semibold">Name</th>
              <th className="px-6 py-3 text-left text-sm font-semibold">Email</th>
              <th className="px-6 py-3 text-left text-sm font-semibold">Role</th>
              <th className="px-6 py-3 text-left text-sm font-semibold">Status</th>
              <th className="px-6 py-3 text-left text-sm font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white">
            {users.map((user) => (
              <tr key={user.id} className="border-b hover:bg-[#ffedd5]/50 transition">
                <td className="px-6 py-4 font-mono">{user.id}</td>
                <td className="px-6 py-4 font-semibold text-[#dd6b01]">{user.name}</td>
                <td className="px-6 py-4">{user.email}</td>
                <td className="px-6 py-4">{user.role}</td>
                <td className="px-6 py-4">{user.status}</td>
                <td className="px-6 py-4 flex gap-2">
                  <button className="px-3 py-1 text-sm border border-[#dd6b01] rounded-lg hover:bg-[#dd6b01] hover:text-white transition">
                    <FaUserCog /> Edit
                  </button>
                  <button className="px-3 py-1 text-sm border border-red-500 rounded-lg hover:bg-red-500 hover:text-white transition">
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
