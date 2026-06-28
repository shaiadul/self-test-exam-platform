"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { FaPlus, FaTimes, FaCog, FaGlobe, FaLayerGroup, FaCalendarAlt } from "react-icons/fa";
import { PageContainer } from "../../../../components/common/PageContainer";
import { getSystemAssetsAction, createSystemAssetAction, deleteSystemAssetAction } from "../../../../lib/actions";
import { Input } from "../../../../components/ui/Input";

interface SystemAsset {
  id: number;
  type: string;
  value: string;
}

export default function AssetsSetupPage() {
  const [assets, setAssets] = useState<SystemAsset[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Input states for adding new assets
  const [newLevel, setNewLevel] = useState("");
  const [newBoard, setNewBoard] = useState("");
  const [newBatch, setNewBatch] = useState("");
  const [addingType, setAddingType] = useState<string | null>(null);

  async function loadAssets() {
    setLoading(true);
    setError(null);
    try {
      const res = await getSystemAssetsAction();
      if (Array.isArray(res)) {
        setAssets(res);
      } else {
        setError("Invalid response format received from server.");
      }
    } catch (err) {
      console.error(err);
      setError("Failed to fetch system assets from database.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAssets();
  }, []);

  async function handleAddAsset(type: string, value: string, clearInput: () => void) {
    if (!value.trim()) {
      toast.warning("Please enter a valid value.");
      return;
    }
    setAddingType(type);
    try {
      const res = await createSystemAssetAction(type, value.trim());
      if (res.success) {
        clearInput();
        toast.success(`${type} added successfully.`);
        loadAssets();
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

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-2xl font-semibold">
          {error}
        </div>
      )}

      {loading ? (
        <div className="min-h-[50vh] flex items-center justify-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#dd6b01]"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-6">
          {/* ---- Level Config Card ---- */}
          <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-lg flex flex-col justify-between min-h-[350px]">
            <div className="space-y-4">
              <div className="flex items-center gap-2 border-b border-orange-50 pb-3">
                <div className="w-10 h-10 rounded-2xl bg-orange-50 text-[#dd6b01] flex items-center justify-center text-md">
                  <FaLayerGroup />
                </div>
                <div>
                  <h3 className="font-black text-gray-800">Exam Levels</h3>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Type: level</p>
                </div>
              </div>

              {/* Active Pills List */}
              <div className="flex flex-wrap gap-2.5 min-h-[120px] items-start align-top content-start">
                {levels.map((lvl) => (
                  <span
                    key={lvl.id}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-orange-50 text-[#dd6b01] font-bold text-xs rounded-xl border border-orange-100 transition"
                  >
                    {lvl.value}
                    <button
                      onClick={() => handleDeleteAsset(lvl.id)}
                      className="text-orange-400 hover:text-orange-700 transition p-0.5 hover:bg-orange-100 rounded-md cursor-pointer"
                    >
                      <FaTimes className="text-[10px]" />
                    </button>
                  </span>
                ))}
                {levels.length === 0 && (
                  <p className="text-sm text-gray-400 font-semibold py-2">No levels configured.</p>
                )}
              </div>
            </div>

            {/* Input to add */}
            <div className="pt-4 border-t border-gray-50 flex items-end gap-2">
              <div className="flex-1">
                <Input
                  value={newLevel}
                  onChange={(e) => setNewLevel(e.target.value)}
                  placeholder="e.g. BCS"
                  disabled={addingType === "level"}
                />
              </div>
              <button
                onClick={() => handleAddAsset("level", newLevel, () => setNewLevel(""))}
                disabled={addingType === "level"}
                className="p-4 bg-[#dd6b01] text-white hover:bg-orange-600 rounded-xl shadow-md transition disabled:bg-orange-300 flex items-center justify-center h-[52px] w-[52px] cursor-pointer"
              >
                <FaPlus className="text-sm" />
              </button>
            </div>
          </div>

          {/* ---- Board Config Card ---- */}
          <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-lg flex flex-col justify-between min-h-[350px]">
            <div className="space-y-4">
              <div className="flex items-center gap-2 border-b border-orange-50 pb-3">
                <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center text-md">
                  <FaGlobe />
                </div>
                <div>
                  <h3 className="font-black text-gray-800">Education Boards</h3>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Type: board</p>
                </div>
              </div>

              {/* Active Pills List */}
              <div className="flex flex-wrap gap-2.5 min-h-[120px] items-start align-top content-start">
                {boards.map((brd) => (
                  <span
                    key={brd.id}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-600 font-bold text-xs rounded-xl border border-blue-100 transition"
                  >
                    {brd.value}
                    <button
                      onClick={() => handleDeleteAsset(brd.id)}
                      className="text-blue-400 hover:text-blue-700 transition p-0.5 hover:bg-blue-100 rounded-md cursor-pointer"
                    >
                      <FaTimes className="text-[10px]" />
                    </button>
                  </span>
                ))}
                {boards.length === 0 && (
                  <p className="text-sm text-gray-400 font-semibold py-2">No boards configured.</p>
                )}
              </div>
            </div>

            {/* Input to add */}
            <div className="pt-4 border-t border-gray-50 flex items-end gap-2">
              <div className="flex-1">
                <Input
                  value={newBoard}
                  onChange={(e) => setNewBoard(e.target.value)}
                  placeholder="e.g. Jessore"
                  disabled={addingType === "board"}
                />
              </div>
              <button
                onClick={() => handleAddAsset("board", newBoard, () => setNewBoard(""))}
                disabled={addingType === "board"}
                className="p-4 bg-blue-600 text-white hover:bg-blue-750 rounded-xl shadow-md transition disabled:bg-blue-300 flex items-center justify-center h-[52px] w-[52px] cursor-pointer"
              >
                <FaPlus className="text-sm" />
              </button>
            </div>
          </div>

          {/* ---- Batch Config Card ---- */}
          <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-lg flex flex-col justify-between min-h-[350px]">
            <div className="space-y-4">
              <div className="flex items-center gap-2 border-b border-orange-50 pb-3">
                <div className="w-10 h-10 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center text-md">
                  <FaCalendarAlt />
                </div>
                <div>
                  <h3 className="font-black text-gray-800">Academic Batches</h3>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Type: batch</p>
                </div>
              </div>

              {/* Active Pills List */}
              <div className="flex flex-wrap gap-2.5 min-h-[120px] items-start align-top content-start">
                {batches.map((btc) => (
                  <span
                    key={btc.id}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-purple-50 text-purple-600 font-bold text-xs rounded-xl border border-purple-100 transition"
                  >
                    {btc.value}
                    <button
                      onClick={() => handleDeleteAsset(btc.id)}
                      className="text-purple-400 hover:text-purple-700 transition p-0.5 hover:bg-purple-100 rounded-md cursor-pointer"
                    >
                      <FaTimes className="text-[10px]" />
                    </button>
                  </span>
                ))}
                {batches.length === 0 && (
                  <p className="text-sm text-gray-400 font-semibold py-2">No batches configured.</p>
                )}
              </div>
            </div>

            {/* Input to add */}
            <div className="pt-4 border-t border-gray-50 flex items-end gap-2">
              <div className="flex-1">
                <Input
                  value={newBatch}
                  onChange={(e) => setNewBatch(e.target.value)}
                  placeholder="e.g. 2022-2023"
                  disabled={addingType === "batch"}
                />
              </div>
              <button
                onClick={() => handleAddAsset("batch", newBatch, () => setNewBatch(""))}
                disabled={addingType === "batch"}
                className="p-4 bg-purple-600 text-white hover:bg-purple-750 rounded-xl shadow-md transition disabled:bg-purple-300 flex items-center justify-center h-[52px] w-[52px] cursor-pointer"
              >
                <FaPlus className="text-sm" />
              </button>
            </div>
          </div>
        </div>
      )}
    </PageContainer>
  );
}
