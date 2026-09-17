"use client";

import React, { useState } from "react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { FaBookOpen, FaImage, FaListUl, FaPlusCircle, FaArrowLeft, FaCheckCircle } from "react-icons/fa";
import CustomSelect from "../../../../components/ui/CustomSelect";
import ImageUploader from "../../../../components/ui/ImageUploader";
import { PrimaryBtn } from "../../../../components/ui/PrimaryBtn";
import { OutlineBtn } from "../../../../components/ui/OutlineBtn";
import { Badge } from "../../../../components/ui/Badge";
import { PageContainer } from "../../../../components/common/PageContainer";
import EmptyState from "../../../../components/common/EmptyState";
import { useRouter } from "next/navigation";
import {
  getExamsAction,
  createQuestionAction,
  updateQuestionAction,
  deleteQuestionAction,
  getQuestionsAction,
} from "../../../../lib/actions";

type QuestionType = "mcq" | "passage" | "picture";

interface Question {
  id: number | string;
  type: QuestionType;
  questionText: string;
  options: string[];
  correctAnswer: string;
  passage?: string;
  pictureUrl?: string | null;
}

interface AddQuestionClientViewProps {
  examIdParam: string;
  initialPacks: any[];
  initialExam: any;
  initialPack: any;
  initialQuestions: any[];
}

export default function AddQuestionClientView({
  examIdParam,
  initialPacks,
  initialExam,
  initialPack,
  initialQuestions,
}: AddQuestionClientViewProps) {
  const router = useRouter();

  const [examId, setExamId] = useState<string>(examIdParam || "");
  const [examPackTitle, setExamPackTitle] = useState<string>(initialPack?.title || "Exam Pack");
  const [examName, setExamName] = useState<string>(initialExam?.name || "Exam");
  const [questions, setQuestions] = useState<Question[]>(initialQuestions || []);

  const [examPacks] = useState<any[]>(initialPacks || []);
  const [exams, setExams] = useState<any[]>([]);
  const [selectedPackId, setSelectedPackId] = useState<number | "">("");

  // Question Form State
  const [type, setType] = useState<QuestionType>("mcq");
  const [questionText, setQuestionText] = useState("");
  const [options, setOptions] = useState<string[]>(["", "", "", ""]);
  const [correctIndex, setCorrectIndex] = useState<number>(-1);
  const [passage, setPassage] = useState("");
  const [pictureUrl, setPictureUrl] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<number | string | null>(null);

  const handlePackSelect = async (packIdStr: string) => {
    const pId = parseInt(packIdStr);
    setSelectedPackId(pId);
    try {
      const examList = await getExamsAction(pId);
      setExams(examList || []);
      setExamId("");
      setQuestions([]);
      setExamName("");
    } catch {
      toast.error("Failed to load exams for selected pack.");
    }
  };

  const handleExamSelect = async (eId: string) => {
    setExamId(eId);
    const selected = exams.find((e) => e.id === eId);
    if (selected) {
      setExamName(selected.name);
    }
    try {
      const qList = await getQuestionsAction(eId);
      setQuestions(qList || []);
    } catch {
      toast.error("Failed to load questions.");
    }
  };

  const handleAddOption = () => {
    if (options.length < 6) setOptions([...options, ""]);
  };

  const handleOptionChange = (index: number, val: string) => {
    const updated = [...options];
    updated[index] = val;
    setOptions(updated);
  };

  const handleRemoveOption = (index: number) => {
    if (options.length <= 2) return;
    const updated = options.filter((_, i) => i !== index);
    setOptions(updated);
    setCorrectIndex((prev) => {
      if (prev === index) return -1;
      if (prev > index) return prev - 1;
      return prev;
    });
  };

  const resetForm = () => {
    setType("mcq");
    setQuestionText("");
    setOptions(["", "", "", ""]);
    setCorrectIndex(-1);
    setPassage("");
    setPictureUrl(null);
    setEditingId(null);
  };

  const handleEdit = (q: Question) => {
    setEditingId(q.id);
    setType(q.type || "mcq");
    setQuestionText(q.questionText || "");
    const qOptions = q.options && q.options.length ? [...q.options] : ["", "", "", ""];
    setOptions(qOptions);
    setCorrectIndex(qOptions.findIndex((o) => o === q.correctAnswer));
    setPassage(q.passage || "");
    setPictureUrl(q.pictureUrl || null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (q: Question) => {
    if (!examId) return;
    if (!window.confirm("Delete this question permanently?")) return;
    try {
      const res = await deleteQuestionAction(examId, q.id);
      if (res.success) {
        toast.success("Question deleted.");
        if (editingId === q.id) resetForm();
        const updatedQs = await getQuestionsAction(examId);
        setQuestions(updatedQs || []);
      } else {
        toast.error(res.error || "Failed to delete question.");
      }
    } catch {
      toast.error("Failed to delete question.");
    }
  };

  const handleCreateQuestion = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!examId) {
      toast.error("Please select an exam first.");
      return;
    }
    if (!questionText.trim()) {
      toast.error("Please enter the question text.");
      return;
    }
    const cleanOptions = options.map((o) => o.trim()).filter(Boolean);
    if (cleanOptions.length < 2) {
      toast.error("At least 2 non-empty options are required.");
      return;
    }
    const targetCorrect =
      correctIndex >= 0 && options[correctIndex] && options[correctIndex].trim()
        ? options[correctIndex].trim()
        : cleanOptions[0];
    const correctPos = Math.max(0, cleanOptions.indexOf(targetCorrect));

    setSubmitting(true);
    try {
      const payload = {
        questionText: questionText.trim(),
        text: questionText.trim(),
        type,
        options: cleanOptions,
        correctAnswer: targetCorrect,
        correctIndex: correctPos,
        passage: passage.trim() || undefined,
        pictureUrl: pictureUrl || undefined,
      };

      const res =
        editingId !== null
          ? await updateQuestionAction(examId, editingId, payload)
          : await createQuestionAction(examId, payload);

      if (res.success) {
        toast.success(editingId !== null ? "Question updated successfully!" : "Question created successfully!");
        resetForm();
        // Refresh question list
        const updatedQs = await getQuestionsAction(examId);
        setQuestions(updatedQs || []);
      } else {
        toast.error(res.error || `Failed to ${editingId !== null ? "update" : "create"} question.`);
      }
    } catch {
      toast.error("Failed to save question.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <PageContainer className="space-y-6 animate-fadeIn pb-12">
      {/* Top Header Command Strip */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200/80 pb-4">
        <div className="flex items-center gap-3">
          <OutlineBtn
            onClick={() => router.back()}
            className="!p-2 !rounded !text-slate-600 hover:!text-primary shadow-2xs border-slate-200 cursor-pointer"
            title="Back"
          >
            <FaArrowLeft className="text-xs" />
          </OutlineBtn>
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">
                EVALUATION_ENGINE // QUESTION_BANK
              </span>
              {examId && (
                <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded bg-amber-50 text-amber-700 border border-amber-200">
                  EXAM #{examId}
                </span>
              )}
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Question Bank Authoring Console
            </h1>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              {examName ? `Configuring question items for: ${examName} (${examPackTitle})` : "Select an exam pack and exam to author question items."}
            </p>
          </div>
        </div>

        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-blue-50 text-blue-700 border border-blue-200 text-xs font-mono font-bold">
          {questions.length} QUESTIONS IN BANK
        </span>
      </div>

      {/* Selector controls if exam not pre-selected */}
      {!examIdParam && (
        <div className="bg-white p-4 rounded border border-slate-200/80 shadow-2xs grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-mono font-bold text-slate-600 block mb-1">SELECT EXAM PACK CONTAINER</label>
            <CustomSelect
              options={examPacks.map((p) => `${p.id} - ${p.title}`)}
              value={selectedPackId ? `${selectedPackId}` : ""}
              onChange={(val) => handlePackSelect(val.split(" - ")[0])}
              placeholder="Choose Exam Pack"
            />
          </div>

          <div>
            <label className="text-xs font-mono font-bold text-slate-600 block mb-1">SELECT TARGET EXAMINATION</label>
            <CustomSelect
              options={exams.map((e) => `${e.id} - ${e.name}`)}
              value={examId}
              onChange={(val) => handleExamSelect(val.split(" - ")[0])}
              placeholder="Choose Exam"
              disabled={!exams.length}
            />
          </div>
        </div>
      )}

      {/* Main Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left 7 Cols: Question Creator Form */}
        <div className="lg:col-span-7 bg-white p-5 rounded border border-slate-200/80 shadow-2xs space-y-5">
          <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 block">
                [Q-AUTHOR] SPECIFICATION COMPOSER
              </span>
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

          <form onSubmit={handleCreateQuestion} className="space-y-4">
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
                      <span className={`w-7 h-7 rounded text-xs font-mono font-bold flex items-center justify-center shrink-0 border ${
                        isCorrect
                          ? "bg-emerald-50 text-emerald-700 border-emerald-300 font-black"
                          : "bg-slate-100 text-slate-600 border-slate-200"
                      }`}>
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

            <div className="pt-2 flex items-center gap-2">
              <PrimaryBtn
                type="submit"
                disabled={!examId || submitting}
                className="w-full !py-2 !rounded !text-xs shadow-2xs font-bold gap-1.5"
              >
                {submitting
                  ? editingId !== null
                    ? "Updating Question..."
                    : "Writing to Bank..."
                  : editingId !== null
                  ? "Update Question Specification"
                  : "+ Commit Question to Bank"}
              </PrimaryBtn>
            </div>

            {editingId !== null && (
              <button
                type="button"
                onClick={resetForm}
                className="w-full text-xs font-mono font-bold text-slate-500 hover:text-slate-800 cursor-pointer pt-1"
              >
                CANCEL EDITING
              </button>
            )}
          </form>
        </div>

        {/* Right 5 Cols: Current Questions List */}
        <div className="lg:col-span-5 bg-white p-4 rounded border border-slate-200/80 shadow-2xs space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
            <div>
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 block">
                INVENTORY REPOSITORY
              </span>
              <h3 className="text-xs sm:text-sm font-bold text-slate-900">
                Authored Items ({questions.length})
              </h3>
            </div>
          </div>

          <div className="space-y-2.5 max-h-[650px] overflow-y-auto custom-scrollbar pr-1">
            {questions.map((q, idx) => (
              <motion.div
                key={q.id || idx}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3 rounded border border-slate-200/80 bg-slate-50/50 space-y-2 text-xs hover:border-slate-300 transition-colors"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono font-bold text-slate-500 text-[11px] bg-slate-200/80 px-1 py-0.2 rounded">
                      Q-{String(idx + 1).padStart(2, "0")}
                    </span>
                    <span className="font-bold text-slate-900 line-clamp-1">
                      {q.questionText}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <span className="text-[9px] font-mono font-bold uppercase px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 border border-slate-200">
                      {q.type}
                    </span>
                    <button
                      type="button"
                      title="Edit question"
                      onClick={() => handleEdit(q)}
                      className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold text-blue-700 bg-blue-50 border border-blue-200 hover:bg-blue-100 transition cursor-pointer"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      title="Delete question"
                      onClick={() => handleDelete(q)}
                      className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold text-rose-700 bg-rose-50 border border-rose-200 hover:bg-rose-100 transition cursor-pointer"
                    >
                      Del
                    </button>
                  </div>
                </div>

                <div className="space-y-0.5 text-[11px] text-slate-600 pl-1 font-mono">
                  {q.options &&
                    q.options.map((opt, oIdx) => (
                      <div
                        key={oIdx}
                        className={opt === q.correctAnswer ? "font-bold text-emerald-700 flex items-center gap-1" : "text-slate-500"}
                      >
                        [{String.fromCharCode(65 + oIdx)}] {opt} {opt === q.correctAnswer && "✓"}
                      </div>
                    ))}
                </div>
              </motion.div>
            ))}

            {questions.length === 0 && (
              <EmptyState
                compact
                type="exam"
                title="No Authored Questions"
                description="This paper has no questions authored yet. Compose questions using the creator tool."
              />
            )}
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
