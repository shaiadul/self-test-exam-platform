import React from "react";
import { FaBookOpen, FaImage, FaListUl, FaPlusCircle, FaCheckCircle, FaSave } from "react-icons/fa";
import CustomSelect from "../../../../../components/ui/CustomSelect";
import ImageUploader from "../../../../../components/ui/ImageUploader";
import { PrimaryBtn } from "../../../../../components/ui/PrimaryBtn";
import { OutlineBtn } from "../../../../../components/ui/OutlineBtn";
import { QuestionType } from "../types";

interface QuestionComposerFormProps {
  type: QuestionType;
  setType: (type: QuestionType) => void;
  questionText: string;
  setQuestionText: (val: string) => void;
  options: string[];
  setOptions: (opts: string[]) => void;
  correctIndex: number;
  setCorrectIndex: React.Dispatch<React.SetStateAction<number>>;
  passage: string;
  setPassage: (val: string) => void;
  pictureUrl: string | null;
  setPictureUrl: (url: string | null) => void;
  submitting: boolean;
  editingId: number | string | null;
  examId: string;
  onSubmit: (e: React.FormEvent) => void;
  onReset: () => void;
}

export const QuestionComposerForm: React.FC<QuestionComposerFormProps> = ({
  type,
  setType,
  questionText,
  setQuestionText,
  options,
  setOptions,
  correctIndex,
  setCorrectIndex,
  passage,
  setPassage,
  pictureUrl,
  setPictureUrl,
  submitting,
  editingId,
  examId,
  onSubmit,
  onReset,
}) => {
  const handleAddOption = () => {
    if (options.length < 6) setOptions([...options, ""]);
  };

  const handleOptionChange = (index: number, val: string) => {
    const updated = [...options];
    updated[index] = val;
    setOptions(updated);
  };

  return (
    <div className="lg:col-span-7 bg-white p-3.5 sm:p-5 rounded border border-slate-200/80 shadow-2xs space-y-4 sm:space-y-5">
      <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
        <div>
          <h2 className="text-xs sm:text-sm font-bold text-slate-900">
            {editingId !== null ? "Edit Question Specification" : "Compose New Question Item"}
          </h2>
        </div>
        {editingId !== null && (
          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200">
            EDITING MODE
          </span>
        )}
      </div>

      {/* Question Type Selector */}
      <div>
        <label className="text-xs font-mono font-bold uppercase tracking-wider text-slate-600 block mb-1.5">
          Question Classification
        </label>
        <div className="grid grid-cols-3 gap-2">
          {[
            { id: "mcq", label: "Multiple Choice", icon: <FaListUl /> },
            { id: "passage", label: "Passage Context", icon: <FaBookOpen /> },
            { id: "picture", label: "Picture / Diagram", icon: <FaImage /> },
          ].map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setType(t.id as QuestionType)}
              className={`py-2 px-2.5 rounded text-xs font-mono font-bold flex items-center justify-center gap-1.5 border transition cursor-pointer ${
                type === t.id
                  ? "bg-primary text-white border-primary shadow-2xs"
                  : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
              }`}
            >
              <span className="text-xs">{t.icon}</span>
              <span className="truncate">{t.label}</span>
            </button>
          ))}
        </div>
      </div>

      <form onSubmit={onSubmit} className="space-y-4">
        {type === "passage" && (
          <div className="space-y-1">
            <label className="text-xs font-mono font-bold uppercase tracking-wider text-slate-600 block">
              Passage Comprehension Context *
            </label>
            <textarea
              className="w-full p-3 border border-slate-300 rounded text-xs font-medium outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 min-h-[90px] transition resize-none text-slate-800"
              placeholder="Type or paste the passage text here..."
              value={passage}
              onChange={(e) => setPassage(e.target.value)}
              required
            />
          </div>
        )}

        {type === "picture" && (
          <div className="space-y-1">
            <ImageUploader
              label="Question Diagram / Image Asset *"
              folder="questions"
              height="h-44"
              value={pictureUrl}
              onChange={(url) => setPictureUrl(url)}
              description="Upload diagram, formula sheet, or illustration."
            />
          </div>
        )}

        <div className="space-y-1">
          <label className="text-xs font-mono font-bold uppercase tracking-wider text-slate-600 block">
            Question Statement / Prompt *
          </label>
          <textarea
            className="w-full p-3 border border-slate-300 rounded text-xs font-medium outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 min-h-[75px] transition resize-none text-slate-800"
            placeholder="Formulate the prompt or problem statement..."
            value={questionText}
            onChange={(e) => setQuestionText(e.target.value)}
            required
          />
        </div>

        {/* Options */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-mono font-bold uppercase tracking-wider text-slate-600 block">
              Choice Options (Click checkmark to set answer key)
            </label>
            <span className="text-[10px] font-mono font-bold text-slate-400">{options.length} CHOICES</span>
          </div>

          <div className="space-y-2">
            {options.map((opt, idx) => {
              const label = String.fromCharCode(65 + idx);
              const isCorrect = correctIndex === idx;

              return (
                <div key={idx} className="flex items-center gap-2">
                  <span
                    className={`w-7 h-7 rounded text-xs font-mono font-bold flex items-center justify-center shrink-0 border ${
                      isCorrect
                        ? "bg-emerald-50 text-emerald-700 border-emerald-300 font-black"
                        : "bg-slate-100 text-slate-600 border-slate-200"
                    }`}
                  >
                    [{label}]
                  </span>
                  <input
                    type="text"
                    value={opt}
                    onChange={(e) => handleOptionChange(idx, e.target.value)}
                    placeholder={`Option ${label} answer statement`}
                    className={`w-full border rounded px-3 py-1.5 text-xs font-medium outline-none transition ${
                      isCorrect
                        ? "border-emerald-500 bg-emerald-50/20 text-emerald-900 font-semibold"
                        : "border-slate-300 focus:border-primary text-slate-800"
                    }`}
                  />
                  <button
                    type="button"
                    title={isCorrect ? "Correct Key Assigned" : "Designate as Correct Answer Key"}
                    onClick={() => opt.trim() && setCorrectIndex(idx)}
                    disabled={!opt.trim()}
                    className={`w-8 h-8 rounded text-xs border flex items-center justify-center transition cursor-pointer shrink-0 ${
                      isCorrect
                        ? "bg-emerald-600 text-white border-emerald-600 shadow-2xs"
                        : "bg-slate-50 text-slate-400 border-slate-200 hover:border-emerald-400 hover:text-emerald-600"
                    }`}
                  >
                    <FaCheckCircle className="text-xs" />
                  </button>
                </div>
              );
            })}
          </div>

          {options.length < 6 && (
            <button
              type="button"
              onClick={handleAddOption}
              className="text-xs font-mono font-bold text-primary hover:underline flex items-center gap-1.5 cursor-pointer pt-1"
            >
              <FaPlusCircle className="text-xs" />
              <span>+ ADD CHOICE OPTION</span>
            </button>
          )}
        </div>

        {/* Designated Correct Key Dropdown */}
        <div>
          <label className="text-xs font-mono font-bold uppercase tracking-wider text-slate-600 block mb-1">
            Designated Correct Answer Key *
          </label>
          <CustomSelect
            options={options.map(
              (o, i) => `${String.fromCharCode(65 + i)}. ${o || "(empty option)"}`
            )}
            value={
              correctIndex >= 0 && options[correctIndex] !== undefined
                ? `${String.fromCharCode(65 + correctIndex)}. ${options[correctIndex] || "(empty option)"}`
                : ""
            }
            onChange={(val) => {
              const idx = val.charCodeAt(0) - 65;
              if (idx >= 0 && idx < options.length) setCorrectIndex(idx);
            }}
            placeholder="Select Correct Option"
          />
        </div>

        <div className="rounded bg-white border border-slate-200/80 p-3.5 sm:p-4 shadow-2xs flex flex-col sm:flex-row items-center justify-center sm:justify-between mx-auto gap-3">
          <div className="text-xs text-slate-500">
            {editingId !== null ? "Ready to save question changes" : "Ready to save question to bank"}
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto justify-center sm:justify-end">
            <OutlineBtn
              type="button"
              onClick={onReset}
              className="!text-xs !py-1.5 !px-3.5 !rounded"
            >
              {editingId !== null ? "Cancel Edit" : "Reset Form"}
            </OutlineBtn>

            <PrimaryBtn
              type="submit"
              disabled={!examId || submitting}
              className="!text-xs !py-1.5 !px-4 gap-1.5 !rounded shadow-2xs"
            >
              {submitting ? (
                <>
                  <span className="animate-spin inline-block w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full" />
                  <span>{editingId !== null ? "Updating Question…" : "Writing to Bank…"}</span>
                </>
              ) : (
                <>
                  <FaSave className="text-[11px]" />
                  <span>{editingId !== null ? "Update Question" : "Commit Question"}</span>
                </>
              )}
            </PrimaryBtn>
          </div>
        </div>
      </form>
    </div>
  );
};
