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
    <PageContainer className="space-y-6 animate-fadeIn pb-20 sm:pb-6">
      {/* Top Header Command Strip */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200/80 pb-4">
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 border border-slate-200 font-bold">
              {assets.length} Parameters Configured
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Curriculum Assets &amp; Taxonomies
          </h1>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Levels */}
        <div className="bg-white p-4 rounded border border-slate-200/80 shadow-2xs flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between mb-3 pb-2.5 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-orange-50 text-primary border border-orange-200/60 rounded shadow-2xs text-xs">
                  <FaLayerGroup />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-xs">Academic Levels</h3>
                </div>
              </div>
              <span className="text-[10px] font-mono text-slate-500 font-bold">
                {levels.length} NODES
              </span>
            </div>

            <div className="flex gap-2 mb-3">
              <Input
                placeholder="e.g. Class 12, HSC"
                value={newLevel}
                onChange={(e) => setNewLevel(e.target.value)}
              />
              <button
                onClick={() => handleAddAsset("level", newLevel, () => setNewLevel(""))}
                disabled={addingType === "level"}
                className="px-3 bg-primary hover:bg-primary-hover text-white rounded font-bold font-mono text-xs flex items-center gap-1 shadow-2xs transition cursor-pointer disabled:opacity-50"
              >
                <FaPlus className="text-[9px]" /> ADD
              </button>
            </div>

            <div className="space-y-1.5 max-h-64 overflow-y-auto pr-0.5">
              {levels.map((item) => (
                <div key={item.id} className="flex justify-between items-center p-2 bg-slate-50/70 rounded text-xs font-mono font-bold text-slate-800 border border-slate-200/70 hover:bg-slate-50 transition">
                  <span>{item.value}</span>
                  <button onClick={() => handleDeleteAsset(item.id)} className="text-slate-400 hover:text-rose-500 transition cursor-pointer p-0.5" title="Delete">
                    <FaTimes className="text-[10px]" />
                  </button>
                </div>
              ))}
              {levels.length === 0 && <p className="text-xs text-slate-400 text-center py-4 font-mono">No levels configured.</p>}
            </div>
          </div>
        </div>

        {/* Education Boards */}
        <div className="bg-white p-4 rounded border border-slate-200/80 shadow-2xs flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between mb-3 pb-2.5 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-blue-50 text-blue-600 border border-blue-200/60 rounded shadow-2xs text-xs">
                  <FaGlobe />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-xs">Education Boards</h3>
                </div>
              </div>
              <span className="text-[10px] font-mono text-slate-500 font-bold">
                {boards.length} Boards
              </span>
            </div>

            <div className="flex gap-2 mb-3">
              <Input
                placeholder="e.g. Dhaka Board"
                value={newBoard}
                onChange={(e) => setNewBoard(e.target.value)}
              />
              <button
                onClick={() => handleAddAsset("board", newBoard, () => setNewBoard(""))}
                disabled={addingType === "board"}
                className="px-3 bg-blue-600 hover:bg-blue-700 text-white rounded font-bold font-mono text-xs flex items-center gap-1 shadow-2xs transition cursor-pointer disabled:opacity-50"
              >
                <FaPlus className="text-[9px]" /> ADD
              </button>
            </div>

            <div className="space-y-1.5 max-h-64 overflow-y-auto pr-0.5">
              {boards.map((item) => (
                <div key={item.id} className="flex justify-between items-center p-2 bg-slate-50/70 rounded text-xs font-mono font-bold text-slate-800 border border-slate-200/70 hover:bg-slate-50 transition">
                  <span>{item.value}</span>
                  <button onClick={() => handleDeleteAsset(item.id)} className="text-slate-400 hover:text-rose-500 transition cursor-pointer p-0.5" title="Delete">
                    <FaTimes className="text-[10px]" />
                  </button>
                </div>
              ))}
              {boards.length === 0 && <p className="text-xs text-slate-400 text-center py-4 font-mono">No boards configured.</p>}
            </div>
          </div>
        </div>

        {/* Batches */}
        <div className="bg-white p-4 rounded border border-slate-200/80 shadow-2xs flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between mb-3 pb-2.5 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-purple-50 text-purple-600 border border-purple-200/60 rounded shadow-2xs text-xs">
                  <FaCalendarAlt />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-xs">Target Batches</h3>
                </div>
              </div>
              <span className="text-[10px] font-mono text-slate-500 font-bold">
                {batches.length} Batches
              </span>
            </div>

            <div className="flex gap-2 mb-3">
              <Input
                placeholder="e.g. Batch 2026"
                value={newBatch}
                onChange={(e) => setNewBatch(e.target.value)}
              />
              <button
                onClick={() => handleAddAsset("batch", newBatch, () => setNewBatch(""))}
                disabled={addingType === "batch"}
                className="px-3 bg-purple-600 hover:bg-purple-700 text-white rounded font-bold font-mono text-xs flex items-center gap-1 shadow-2xs transition cursor-pointer disabled:opacity-50"
              >
                <FaPlus className="text-[9px]" /> ADD
              </button>
            </div>

            <div className="space-y-1.5 max-h-64 overflow-y-auto pr-0.5">
              {batches.map((item) => (
                <div key={item.id} className="flex justify-between items-center p-2 bg-slate-50/70 rounded text-xs font-mono font-bold text-slate-800 border border-slate-200/70 hover:bg-slate-50 transition">
                  <span>{item.value}</span>
                  <button onClick={() => handleDeleteAsset(item.id)} className="text-slate-400 hover:text-rose-500 transition cursor-pointer p-0.5" title="Delete">
                    <FaTimes className="text-[10px]" />
                  </button>
                </div>
              ))}
              {batches.length === 0 && <p className="text-xs text-slate-400 text-center py-4 font-mono">No batches configured.</p>}
            </div>
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
