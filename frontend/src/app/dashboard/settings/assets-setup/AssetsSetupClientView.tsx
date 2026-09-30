"use client";

import { useState } from "react";
import { toast } from "sonner";
import {
  FaPlus,
  FaTimes,
  FaGlobe,
  FaLayerGroup,
  FaCalendarAlt,
  FaBuilding,
  FaCheck,
  FaClock,
  FaChevronDown,
  FaChevronUp,
  FaEdit,
  FaSave,
  FaUndo,
} from "react-icons/fa";
import { PageContainer } from "../../../../components/common/PageContainer";
import {
  createSystemAssetAction,
  updateSystemAssetAction,
  deleteSystemAssetAction,
  updateInstitutionSuggestionAction,
  approveInstitutionSuggestionAction,
  rejectInstitutionSuggestionAction,
} from "../../../../lib/actions";
import { Input } from "../../../../components/ui/Input";

interface SystemAsset {
  id: number;
  type: string;
  value: string;
}

interface InstitutionSuggestion {
  id: number;
  userId: number;
  userName: string;
  value: string;
  status: string;
  created_at: string;
}

interface AssetsSetupClientViewProps {
  initialAssets: SystemAsset[];
  initialSuggestions: InstitutionSuggestion[];
}

export default function AssetsSetupClientView({
  initialAssets,
  initialSuggestions,
}: AssetsSetupClientViewProps) {
  const [assets, setAssets] = useState<SystemAsset[]>(initialAssets || []);
  const [suggestions, setSuggestions] = useState<InstitutionSuggestion[]>(
    initialSuggestions || []
  );
  const [suggestionsOpen, setSuggestionsOpen] = useState(true);

  // Input states for adding new assets
  const [newLevel, setNewLevel] = useState("");
  const [newBoard, setNewBoard] = useState("");
  const [newBatch, setNewBatch] = useState("");
  const [newInstitution, setNewInstitution] = useState("");
  const [addingType, setAddingType] = useState<string | null>(null);
  const [processingId, setProcessingId] = useState<number | null>(null);

  // Editing suggestion states
  const [editingSuggestionId, setEditingSuggestionId] = useState<number | null>(
    null
  );
  const [editingSuggestionValue, setEditingSuggestionValue] =
    useState<string>("");

  async function handleAddAsset(
    type: string,
    value: string,
    clearInput: () => void
  ) {
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

  async function handleUpdateAsset(id: number, value: string) {
    if (!value.trim()) {
      toast.warning("Asset value cannot be empty.");
      return;
    }
    try {
      const res = await updateSystemAssetAction(id, value.trim());
      if (res.success) {
        setAssets((prev) =>
          prev.map((a) => (a.id === id ? { ...a, value: value.trim() } : a))
        );
        toast.success("Asset updated successfully.");
      } else {
        toast.error(res.error || "Failed to update asset.");
      }
    } catch (err) {
      console.error(err);
      toast.error("An unexpected error occurred.");
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

  function handleStartEditSuggestion(s: InstitutionSuggestion) {
    setEditingSuggestionId(s.id);
    setEditingSuggestionValue(s.value);
  }

  function handleCancelEditSuggestion() {
    setEditingSuggestionId(null);
    setEditingSuggestionValue("");
  }

  async function handleSaveEditedSuggestion(id: number) {
    if (!editingSuggestionValue.trim()) {
      toast.warning("Institution name cannot be empty.");
      return;
    }
    setProcessingId(id);
    try {
      const res = await updateInstitutionSuggestionAction(
        id,
        editingSuggestionValue.trim()
      );
      if (res.success) {
        setSuggestions((prev) =>
          prev.map((x) =>
            x.id === id ? { ...x, value: editingSuggestionValue.trim() } : x
          )
        );
        toast.success("Suggestion updated.");
        handleCancelEditSuggestion();
      } else {
        toast.error(res.error || "Failed to update suggestion.");
      }
    } catch {
      toast.error("An unexpected error occurred.");
    } finally {
      setProcessingId(null);
    }
  }

  async function handleApproveSuggestion(
    s: InstitutionSuggestion,
    overrideValue?: string
  ) {
    const finalValue = (overrideValue !== undefined ? overrideValue : s.value).trim();
    if (!finalValue) {
      toast.warning("Institution name cannot be empty.");
      return;
    }

    setProcessingId(s.id);
    try {
      const res = await approveInstitutionSuggestionAction(s.id, finalValue);
      if (res.success) {
        // Update suggestion status and value in local state
        setSuggestions((prev) =>
          prev.map((x) =>
            x.id === s.id
              ? { ...x, value: finalValue, status: "approved" }
              : x
          )
        );
        // Add to institutions panel if not already there
        setAssets((prev) => {
          const exists = prev.some(
            (a) => a.type === "institution" && a.value.toLowerCase() === finalValue.toLowerCase()
          );
          if (exists) return prev;
          return [
            ...prev,
            {
              id: res.suggestion?.id ?? Date.now(),
              type: "institution",
              value: finalValue,
            },
          ];
        });
        toast.success(`"${finalValue}" made a permanent institution asset!`);
        if (editingSuggestionId === s.id) {
          handleCancelEditSuggestion();
        }
      } else {
        toast.error(res.error || "Failed to make asset permanent.");
      }
    } catch {
      toast.error("An unexpected error occurred.");
    } finally {
      setProcessingId(null);
    }
  }

  async function handleRejectSuggestion(s: InstitutionSuggestion) {
    if (!confirm(`Reject suggestion "${s.value}"?`)) return;
    setProcessingId(s.id);
    try {
      const res = await rejectInstitutionSuggestionAction(s.id);
      if (res.success) {
        setSuggestions((prev) =>
          prev.map((x) => (x.id === s.id ? { ...x, status: "rejected" } : x))
        );
        toast.success("Suggestion rejected.");
        if (editingSuggestionId === s.id) {
          handleCancelEditSuggestion();
        }
      } else {
        toast.error(res.error || "Failed to reject suggestion.");
      }
    } catch {
      toast.error("An unexpected error occurred.");
    } finally {
      setProcessingId(null);
    }
  }

  // Filter and group assets
  const levels = assets.filter((a) => a.type === "level");
  const boards = assets.filter((a) => a.type === "board");
  const batches = assets.filter((a) => a.type === "batch");
  const institutions = assets.filter((a) => a.type === "institution");
  const pendingSuggestions = suggestions.filter((s) => s.status === "pending");

  return (
    <PageContainer className="space-y-6 animate-fadeIn pb-20 sm:pb-6">
      {/* Top Header Command Strip */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200/80 pb-4">
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 border border-slate-200 font-bold">
              {assets.length} Parameters Configured
            </span>
            {pendingSuggestions.length > 0 && (
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-amber-50 text-amber-700 border border-amber-200 font-bold animate-pulse">
                {pendingSuggestions.length} Pending Review
              </span>
            )}
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Curriculum Assets &amp; Taxonomies
          </h1>
        </div>
      </div>

      {/* 4-column asset panels */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {/* Levels */}
        <AssetPanel
          title="Academic Levels"
          icon={<FaLayerGroup />}
          iconBg="bg-orange-50 text-primary border-orange-200/60"
          btnBg="bg-primary hover:bg-primary-dark"
          countLabel="NODES"
          items={levels}
          newValue={newLevel}
          setNewValue={setNewLevel}
          addingType={addingType}
          type="level"
          placeholder="e.g. Class 12, HSC"
          onAdd={handleAddAsset}
          onUpdate={handleUpdateAsset}
          onDelete={handleDeleteAsset}
        />

        {/* Education Boards */}
        <AssetPanel
          title="Education Boards"
          icon={<FaGlobe />}
          iconBg="bg-blue-50 text-blue-600 border-blue-200/60"
          btnBg="bg-blue-600 hover:bg-blue-700"
          countLabel="Boards"
          items={boards}
          newValue={newBoard}
          setNewValue={setNewBoard}
          addingType={addingType}
          type="board"
          placeholder="e.g. Dhaka Board"
          onAdd={handleAddAsset}
          onUpdate={handleUpdateAsset}
          onDelete={handleDeleteAsset}
        />

        {/* Batches */}
        <AssetPanel
          title="Target Batches"
          icon={<FaCalendarAlt />}
          iconBg="bg-purple-50 text-purple-600 border-purple-200/60"
          btnBg="bg-purple-600 hover:bg-purple-700"
          countLabel="Batches"
          items={batches}
          newValue={newBatch}
          setNewValue={setNewBatch}
          addingType={addingType}
          type="batch"
          placeholder="e.g. Batch 2026"
          onAdd={handleAddAsset}
          onUpdate={handleUpdateAsset}
          onDelete={handleDeleteAsset}
        />

        {/* Institutions */}
        <AssetPanel
          title="Institutions"
          icon={<FaBuilding />}
          iconBg="bg-emerald-50 text-emerald-600 border-emerald-200/60"
          btnBg="bg-emerald-600 hover:bg-emerald-700"
          countLabel="Listed"
          items={institutions}
          newValue={newInstitution}
          setNewValue={setNewInstitution}
          addingType={addingType}
          type="institution"
          placeholder="e.g. Dhaka College"
          onAdd={handleAddAsset}
          onUpdate={handleUpdateAsset}
          onDelete={handleDeleteAsset}
        />
      </div>

      {/* Institution Suggestions Queue */}
      <div className="bg-white rounded border border-slate-200/80 shadow-2xs overflow-hidden">
        {/* Header */}
        <button
          type="button"
          onClick={() => setSuggestionsOpen((o) => !o)}
          className="w-full flex items-center justify-between px-4 py-3 border-b border-slate-100 bg-slate-50/60 hover:bg-slate-50 transition cursor-pointer"
        >
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-amber-50 text-amber-600 border border-amber-200/60 rounded text-xs">
              <FaClock />
            </div>
            <div className="text-left">
              <h3 className="text-xs font-bold text-slate-900">
                Institution Suggestions Queue
              </h3>
              <p className="text-[10px] text-slate-500 font-medium">
                Users submitted custom institutions via &ldquo;Other&rdquo; option — edit to fix typos and make them permanent assets
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {pendingSuggestions.length > 0 && (
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 font-bold border border-amber-200">
                {pendingSuggestions.length} pending
              </span>
            )}
            {suggestionsOpen ? (
              <FaChevronUp className="text-slate-400 text-xs" />
            ) : (
              <FaChevronDown className="text-slate-400 text-xs" />
            )}
          </div>
        </button>

        {/* Suggestion Rows */}
        {suggestionsOpen && (
          <div className="divide-y divide-slate-100">
            {suggestions.length === 0 && (
              <p className="text-xs text-slate-400 text-center py-8 font-mono">
                No institution suggestions yet.
              </p>
            )}
            {suggestions.map((s) => {
              const isEditing = editingSuggestionId === s.id;
              const isProcessing = processingId === s.id;

              return (
                <div
                  key={s.id}
                  className={`px-4 py-3 transition ${
                    isEditing ? "bg-amber-50/40" : "hover:bg-slate-50/60"
                  }`}
                >
                  {isEditing ? (
                    /* Inline Edit Mode */
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold font-mono text-amber-700 flex items-center gap-1.5">
                          <FaEdit className="text-[9px]" /> EDIT INSTITUTION SUGGESTION (by {s.userName || `User #${s.userId}`})
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {new Date(s.created_at).toLocaleDateString()}
                        </span>
                      </div>

                      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                        <input
                          type="text"
                          value={editingSuggestionValue}
                          onChange={(e) => setEditingSuggestionValue(e.target.value)}
                          placeholder="Correct institution name..."
                          className="flex-1 h-8 px-2.5 rounded border border-amber-300 bg-white text-xs font-semibold text-slate-900 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              handleApproveSuggestion(s, editingSuggestionValue);
                            } else if (e.key === "Escape") {
                              handleCancelEditSuggestion();
                            }
                          }}
                          autoFocus
                        />

                        <div className="flex items-center gap-1.5 shrink-0 justify-end">
                          <button
                            type="button"
                            onClick={() => handleApproveSuggestion(s, editingSuggestionValue)}
                            disabled={isProcessing}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold font-mono shadow-2xs transition cursor-pointer disabled:opacity-50"
                            title="Save edited name and make it a permanent institution asset"
                          >
                            <FaCheck className="text-[9px]" /> MAKE PERMANENT
                          </button>

                          <button
                            type="button"
                            onClick={() => handleSaveEditedSuggestion(s.id)}
                            disabled={isProcessing}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 text-[11px] font-bold font-mono transition cursor-pointer disabled:opacity-50"
                            title="Save suggestion text only"
                          >
                            <FaSave className="text-[9px]" /> SAVE
                          </button>

                          <button
                            type="button"
                            onClick={handleCancelEditSuggestion}
                            disabled={isProcessing}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded bg-white hover:bg-slate-50 text-slate-500 border border-slate-200 text-[11px] font-bold font-mono transition cursor-pointer"
                          >
                            CANCEL
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    /* Default Display Mode */
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-start sm:items-center gap-3 min-w-0">
                        <div
                          className={`shrink-0 w-2 h-2 rounded-full mt-1 sm:mt-0 ${
                            s.status === "pending"
                              ? "bg-amber-400"
                              : s.status === "approved"
                              ? "bg-emerald-500"
                              : "bg-rose-400"
                          }`}
                        />
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-slate-900 truncate">
                            {s.value}
                          </p>
                          <p className="text-[10px] text-slate-400 font-mono">
                            by {s.userName || `User #${s.userId}`} ·{" "}
                            {new Date(s.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 ml-5 sm:ml-0 shrink-0">
                        {s.status === "pending" ? (
                          <>
                            <button
                              type="button"
                              onClick={() => handleApproveSuggestion(s)}
                              disabled={isProcessing}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold font-mono hover:bg-emerald-100 transition cursor-pointer disabled:opacity-50"
                              title="Make this a permanent institution asset"
                            >
                              <FaCheck className="text-[8px]" /> MAKE PERMANENT
                            </button>
                            <button
                              type="button"
                              onClick={() => handleStartEditSuggestion(s)}
                              disabled={isProcessing}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-slate-50 text-slate-700 border border-slate-200 text-[10px] font-bold font-mono hover:bg-slate-100 transition cursor-pointer disabled:opacity-50"
                              title="Edit name before approving"
                            >
                              <FaEdit className="text-[8px]" /> EDIT
                            </button>
                            <button
                              type="button"
                              onClick={() => handleRejectSuggestion(s)}
                              disabled={isProcessing}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-rose-50 text-rose-600 border border-rose-200 text-[10px] font-bold font-mono hover:bg-rose-100 transition cursor-pointer disabled:opacity-50"
                            >
                              <FaTimes className="text-[8px]" /> REJECT
                            </button>
                          </>
                        ) : s.status === "approved" ? (
                          <div className="flex items-center gap-1.5">
                            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded border bg-emerald-50 text-emerald-700 border-emerald-200 inline-flex items-center gap-1">
                              <FaCheck className="text-[8px]" /> PERMANENT ASSET
                            </span>
                            <button
                              type="button"
                              onClick={() => handleStartEditSuggestion(s)}
                              className="text-slate-400 hover:text-slate-700 p-1 text-[10px] transition cursor-pointer"
                              title="Edit suggestion"
                            >
                              <FaEdit />
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5">
                            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded border bg-rose-50 text-rose-600 border-rose-200">
                              REJECTED
                            </span>
                            <button
                              type="button"
                              onClick={() => handleStartEditSuggestion(s)}
                              className="text-slate-400 hover:text-slate-700 p-1 text-[10px] transition cursor-pointer"
                              title="Edit and approve"
                            >
                              <FaEdit />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </PageContainer>
  );
}

// ── Reusable Asset Panel with Inline Edit & Delete ───────────────────────────

interface AssetPanelProps {
  title: string;
  icon: React.ReactNode;
  iconBg: string;
  btnBg: string;
  countLabel: string;
  items: { id: number; value: string }[];
  newValue: string;
  setNewValue: (v: string) => void;
  addingType: string | null;
  type: string;
  placeholder: string;
  onAdd: (type: string, value: string, clear: () => void) => void;
  onUpdate: (id: number, value: string) => void;
  onDelete: (id: number) => void;
}

function AssetPanel({
  title,
  icon,
  iconBg,
  btnBg,
  countLabel,
  items,
  newValue,
  setNewValue,
  addingType,
  type,
  placeholder,
  onAdd,
  onUpdate,
  onDelete,
}: AssetPanelProps) {
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingVal, setEditingVal] = useState("");

  function startEdit(id: number, val: string) {
    setEditingId(id);
    setEditingVal(val);
  }

  function cancelEdit() {
    setEditingId(null);
    setEditingVal("");
  }

  function saveEdit(id: number) {
    if (editingVal.trim()) {
      onUpdate(id, editingVal.trim());
    }
    cancelEdit();
  }

  return (
    <div className="bg-white p-4 rounded border border-slate-200/80 shadow-2xs flex flex-col space-y-4">
      <div>
        <div className="flex items-center justify-between mb-3 pb-2.5 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div
              className={`p-2 border rounded shadow-2xs text-xs ${iconBg}`}
            >
              {icon}
            </div>
            <h3 className="font-bold text-slate-900 text-xs">{title}</h3>
          </div>
          <span className="text-[10px] font-mono text-slate-500 font-bold">
            {items.length} {countLabel}
          </span>
        </div>

        <div className="flex gap-2 mb-3">
          <Input
            placeholder={placeholder}
            value={newValue}
            onChange={(e) => setNewValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                onAdd(type, newValue, () => setNewValue(""));
              }
            }}
          />
          <button
            onClick={() => onAdd(type, newValue, () => setNewValue(""))}
            disabled={addingType === type}
            className={`px-3 text-white rounded font-bold font-mono text-xs flex items-center gap-1 shadow-2xs transition cursor-pointer disabled:opacity-50 ${btnBg}`}
          >
            <FaPlus className="text-[9px]" /> ADD
          </button>
        </div>

        <div className="space-y-1.5 max-h-56 overflow-y-auto pr-0.5">
          {items.map((item) => (
            <div
              key={item.id}
              className="flex justify-between items-center p-2 bg-slate-50/70 rounded text-xs font-mono font-bold text-slate-800 border border-slate-200/70 hover:bg-slate-50 transition"
            >
              {editingId === item.id ? (
                <div className="flex items-center gap-1.5 w-full">
                  <input
                    type="text"
                    value={editingVal}
                    onChange={(e) => setEditingVal(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        saveEdit(item.id);
                      } else if (e.key === "Escape") {
                        cancelEdit();
                      }
                    }}
                    className="flex-1 h-6 px-1.5 bg-white border border-primary rounded text-xs font-mono text-slate-900 focus:outline-none"
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => saveEdit(item.id)}
                    className="text-emerald-600 hover:text-emerald-700 p-1 cursor-pointer"
                    title="Save"
                  >
                    <FaCheck className="text-[10px]" />
                  </button>
                  <button
                    type="button"
                    onClick={cancelEdit}
                    className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
                    title="Cancel"
                  >
                    <FaTimes className="text-[10px]" />
                  </button>
                </div>
              ) : (
                <>
                  <span className="truncate">{item.value}</span>
                  <div className="flex items-center gap-1 ml-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => startEdit(item.id, item.value)}
                      className="text-slate-400 hover:text-primary transition cursor-pointer p-0.5"
                      title="Edit"
                    >
                      <FaEdit className="text-[9px]" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onDelete(item.id)}
                      className="text-slate-400 hover:text-rose-500 transition cursor-pointer p-0.5"
                      title="Delete"
                    >
                      <FaTimes className="text-[10px]" />
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}
          {items.length === 0 && (
            <p className="text-xs text-slate-400 text-center py-4 font-mono">
              None configured.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
