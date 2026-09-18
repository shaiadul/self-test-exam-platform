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
    <PageContainer className="space-y-6 animate-fadeIn pb-12">
      {/* Top Header Command Strip */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200/80 pb-4">
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">
              PRIVILEGE MATRIX // [MOD-PRM]
            </span>
            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 border border-slate-200 font-bold">
              {permissions.length} RULES DEFINED
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Role Permission Matrix
          </h1>
        </div>
      </div>

      <div className="bg-white border border-slate-200/80 rounded-none shadow-2xs overflow-hidden">
        {/* Desktop Table View */}
        <div className="hidden sm:block overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/70 border-b border-slate-200/80 text-slate-500 font-mono font-bold text-[10px] uppercase tracking-wider">
                <th className="py-3 px-4">Rule ID</th>
                <th className="py-3 px-4">Target Role</th>
                <th className="py-3 px-4">Module Namespace</th>
                <th className="py-3 px-4">Access Level</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {permissions.map((perm) => (
                <tr key={perm.id} className="hover:bg-slate-50/50 transition">
                  <td className="py-3.5 px-4 font-mono font-bold text-slate-400 text-[11px]">#PERM-{perm.id}</td>
                  <td className="py-3.5 px-4 font-bold text-slate-900">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border uppercase ${
                      perm.role === "admin" ? "bg-purple-50 text-purple-700 border-purple-200" :
                      perm.role === "teacher" ? "bg-blue-50 text-blue-700 border-blue-200" :
                      "bg-slate-100 text-slate-700 border-slate-200"
                    }`}>
                      {perm.role}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-slate-800 font-mono font-bold">{perm.module}</td>
                  <td className="py-3.5 px-4">
                    {editingId === perm.id ? (
                      <select
                        value={selectedAccess}
                        onChange={(e) => setSelectedAccess(e.target.value)}
                        className="border border-slate-200 rounded px-2 py-1 text-xs font-bold font-mono text-slate-800 bg-white outline-none focus:border-primary"
                      >
                        <option value="Full Access">Full Access</option>
                        <option value="Read & Create">Read & Create</option>
                        <option value="Read Only">Read Only</option>
                        <option value="Restricted Access">Restricted Access</option>
                      </select>
                    ) : (
                      <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase border ${
                        perm.access.includes("Full") ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
                        perm.access.includes("Read & Create") ? "bg-blue-50 text-blue-700 border-blue-200" :
                        perm.access.includes("Read Only") ? "bg-amber-50 text-amber-700 border-amber-200" :
                        "bg-rose-50 text-rose-700 border-rose-200"
                      }`}>
                        {perm.access}
                      </span>
                    )}
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    {editingId === perm.id ? (
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          onClick={() => handleUpdateAccess(perm.id, selectedAccess)}
                          className="px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs font-bold font-mono transition"
                          title="Save Permission"
                        >
                          SAVE
                        </button>
                        <button
                          onClick={() => setEditingId(null)}
                          className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-xs font-bold transition"
                          title="Cancel"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => {
                          setEditingId(perm.id);
                          setSelectedAccess(perm.access);
                        }}
                        className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition cursor-pointer"
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
                  <td colSpan={5} className="py-8 text-center text-slate-400 font-medium">
                    No system permissions configured.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards View */}
        <div className="block sm:hidden divide-y divide-slate-100">
          {permissions.map((perm) => (
            <div key={perm.id} className="p-3.5 space-y-2 hover:bg-slate-50/50 transition">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[10px] text-slate-400 font-bold">#PERM-{perm.id}</span>
                <span className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold border uppercase ${
                  perm.role === "admin" ? "bg-purple-50 text-purple-700 border-purple-200" :
                  perm.role === "teacher" ? "bg-blue-50 text-blue-700 border-blue-200" :
                  "bg-slate-100 text-slate-700 border-slate-200"
                }`}>
                  {perm.role}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-slate-800">{perm.module}</span>
                {!editingId || editingId !== perm.id ? (
                  <button
                    onClick={() => {
                      setEditingId(perm.id);
                      setSelectedAccess(perm.access);
                    }}
                    className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition cursor-pointer text-xs"
                    title="Edit Permission"
                  >
                    <FaEdit />
                  </button>
                ) : null}
              </div>

              {editingId === perm.id ? (
                <div className="space-y-2 pt-1">
                  <select
                    value={selectedAccess}
                    onChange={(e) => setSelectedAccess(e.target.value)}
                    className="w-full border border-slate-200 rounded px-2 py-1.5 text-xs font-bold font-mono text-slate-800 bg-white outline-none focus:border-primary"
                  >
                    <option value="Full Access">Full Access</option>
                    <option value="Read & Create">Read & Create</option>
                    <option value="Read Only">Read Only</option>
                    <option value="Restricted Access">Restricted Access</option>
                  </select>
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => setEditingId(null)}
                      className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-xs font-bold transition"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => handleUpdateAccess(perm.id, selectedAccess)}
                      className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs font-bold font-mono transition"
                    >
                      SAVE
                    </button>
                  </div>
                </div>
              ) : (
                <div className="pt-1">
                  <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase border ${
                    perm.access.includes("Full") ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
                    perm.access.includes("Read & Create") ? "bg-blue-50 text-blue-700 border-blue-200" :
                    perm.access.includes("Read Only") ? "bg-amber-50 text-amber-700 border-amber-200" :
                    "bg-rose-50 text-rose-700 border-rose-200"
                  }`}>
                    {perm.access}
                  </span>
                </div>
              )}
            </div>
          ))}

          {permissions.length === 0 && (
            <div className="py-8 px-4 text-center text-slate-400 font-medium text-xs">
              No system permissions configured.
            </div>
          )}
        </div>
      </div>
    </PageContainer>
  );
}
