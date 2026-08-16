"use client";

import { useState } from "react";
import { toast } from "sonner";
import { FaPlus, FaTimes, FaGlobe, FaLayerGroup, FaCalendarAlt } from "react-icons/fa";
import { PageContainer } from "../../../../components/common/PageContainer";
import { createSystemAssetAction, deleteSystemAssetAction } from "../../../../lib/actions";
import { Input } from "../../../../components/ui/Input";

interface SystemAsset {
  id: number;
  type: string;
  value: string;
}

interface AssetsSetupClientViewProps {
  initialAssets: SystemAsset[];
}

export default function AssetsSetupClientView({ initialAssets }: AssetsSetupClientViewProps) {
  const [assets, setAssets] = useState<SystemAsset[]>(initialAssets || []);

  // Input states for adding new assets
  const [newLevel, setNewLevel] = useState("");
  const [newBoard, setNewBoard] = useState("");
  const [newBatch, setNewBatch] = useState("");
  const [addingType, setAddingType] = useState<string | null>(null);

  async function handleAddAsset(type: string, value: string, clearInput: () => void) {
    if (!value.trim()) {
      toast.warning("Please enter a valid value.");
      return;
    }
    setAddingType(type);
    try {
      const res = await createSystemAssetAction(type, value.trim());
      if (res.success && res.asset) {
        clearInput();
        toast.success(`${type} added successfully.`);
        setAssets((prev) => [...prev, res.asset]);
      } else {
        toast.error(res.error || `Failed to add ${type}`);
      }
    } catch (err) {
      console.error(err);
      toast.error("An unexpected error occurred.");
    } finally {
      setAddingType(null);
    }
  }

  async function handleDeleteAsset(id: number) {
    if (!confirm("Are you sure you want to delete this asset option?")) {
      return;
    }
    try {
      const res = await deleteSystemAssetAction(id);
      if (res.success) {
        setAssets((prev) => prev.filter((a) => a.id !== id));
        toast.success("Asset option deleted successfully.");
      } else {
        toast.error(res.error || "Failed to delete asset");
      }
    } catch (err) {
      console.error(err);
      toast.error("An unexpected error occurred.");
    }
  }

  // Filter and group assets
  const levels = assets.filter((a) => a.type === "level");
  const boards = assets.filter((a) => a.type === "board");
  const batches = assets.filter((a) => a.type === "batch");

  return (
    <PageContainer className="space-y-6 animate-fadeIn">
      <div>
        <h1 className="text-3xl font-black text-gray-900 tracking-tight">Assets Setup</h1>
        <p className="text-gray-500 font-medium">
          Configure levels, boards, batches and other parameters used throughout mock exams and profiles.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Levels */}
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-md flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3 mb-4 pb-3 border-b border-gray-100">
              <div className="p-2.5 bg-orange-100 text-[#dd6b01] rounded-2xl">
                <FaLayerGroup />
              </div>
              <div>
                <h3 className="font-bold text-gray-900">Academic Levels</h3>
                <p className="text-xs text-gray-400">Class 10, HSC, Admission, etc.</p>
              </div>
            </div>

            <div className="flex gap-2 mb-4">
              <Input
                placeholder="e.g. Class 12"
                value={newLevel}
                onChange={(e) => setNewLevel(e.target.value)}
              />
              <button
                onClick={() => handleAddAsset("level", newLevel, () => setNewLevel(""))}
                disabled={addingType === "level"}
                className="px-4 bg-[#dd6b01] hover:bg-orange-600 text-white rounded-xl font-bold text-xs flex items-center gap-1 shadow transition cursor-pointer"
              >
                <FaPlus /> Add
              </button>
            </div>

            <div className="space-y-2 max-h-60 overflow-y-auto">
              {levels.map((item) => (
                <div key={item.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-xl text-xs font-bold text-gray-800 border border-gray-100">
                  <span>{item.value}</span>
                  <button onClick={() => handleDeleteAsset(item.id)} className="text-gray-400 hover:text-red-500 transition cursor-pointer">
                    <FaTimes />
                  </button>
                </div>
              ))}
              {levels.length === 0 && <p className="text-xs text-gray-400 text-center py-4">No levels configured.</p>}
            </div>
          </div>
        </div>

        {/* Education Boards */}
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-md flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3 mb-4 pb-3 border-b border-gray-100">
              <div className="p-2.5 bg-blue-100 text-blue-600 rounded-2xl">
                <FaGlobe />
              </div>
              <div>
                <h3 className="font-bold text-gray-900">Education Boards</h3>
                <p className="text-xs text-gray-400">Dhaka, Rajshahi, Cambridge, etc.</p>
              </div>
            </div>

            <div className="flex gap-2 mb-4">
              <Input
                placeholder="e.g. Dhaka Board"
                value={newBoard}
                onChange={(e) => setNewBoard(e.target.value)}
              />
              <button
                onClick={() => handleAddAsset("board", newBoard, () => setNewBoard(""))}
                disabled={addingType === "board"}
                className="px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs flex items-center gap-1 shadow transition cursor-pointer"
              >
                <FaPlus /> Add
              </button>
            </div>

            <div className="space-y-2 max-h-60 overflow-y-auto">
              {boards.map((item) => (
                <div key={item.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-xl text-xs font-bold text-gray-800 border border-gray-100">
                  <span>{item.value}</span>
                  <button onClick={() => handleDeleteAsset(item.id)} className="text-gray-400 hover:text-red-500 transition cursor-pointer">
                    <FaTimes />
                  </button>
                </div>
              ))}
              {boards.length === 0 && <p className="text-xs text-gray-400 text-center py-4">No boards configured.</p>}
            </div>
          </div>
        </div>

        {/* Batches */}
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-md flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3 mb-4 pb-3 border-b border-gray-100">
              <div className="p-2.5 bg-purple-100 text-purple-600 rounded-2xl">
                <FaCalendarAlt />
              </div>
              <div>
                <h3 className="font-bold text-gray-900">Target Batches</h3>
                <p className="text-xs text-gray-400">Batch 2025, Batch 2026, etc.</p>
              </div>
            </div>

            <div className="flex gap-2 mb-4">
              <Input
                placeholder="e.g. Batch 2026"
                value={newBatch}
                onChange={(e) => setNewBatch(e.target.value)}
              />
              <button
                onClick={() => handleAddAsset("batch", newBatch, () => setNewBatch(""))}
                disabled={addingType === "batch"}
                className="px-4 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold text-xs flex items-center gap-1 shadow transition cursor-pointer"
              >
                <FaPlus /> Add
              </button>
            </div>

            <div className="space-y-2 max-h-60 overflow-y-auto">
              {batches.map((item) => (
                <div key={item.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-xl text-xs font-bold text-gray-800 border border-gray-100">
                  <span>{item.value}</span>
                  <button onClick={() => handleDeleteAsset(item.id)} className="text-gray-400 hover:text-red-500 transition cursor-pointer">
                    <FaTimes />
                  </button>
                </div>
              ))}
              {batches.length === 0 && <p className="text-xs text-gray-400 text-center py-4">No batches configured.</p>}
            </div>
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
