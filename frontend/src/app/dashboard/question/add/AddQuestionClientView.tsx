"use client";

import React, { useState } from "react";
import { toast } from "sonner";
import { FaArrowLeft } from "react-icons/fa";
import CustomSelect from "../../../../components/ui/CustomSelect";
import { OutlineBtn } from "../../../../components/ui/OutlineBtn";
import { PageContainer } from "../../../../components/common/PageContainer";
import { useRouter } from "next/navigation";
import {
  getExamsAction,
  createQuestionAction,
  updateQuestionAction,
  deleteQuestionAction,
  getQuestionsAction,
} from "../../../../lib/actions";
import { Question, QuestionType } from "./types";
import { QuestionComposerForm } from "./components/QuestionComposerForm";
import { QuestionBankList } from "./components/QuestionBankList";

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
  const [examPackTitle] = useState<string>(initialPack?.title || "Exam Pack");
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
    if (questionText.trim().length < 3) {
      toast.error("Question text must be at least 3 characters long.");
      return;
    }

    const cleanOptions = options.map((o) => o.trim()).filter(Boolean);
    if (cleanOptions.length < 2) {
      toast.error("At least 2 non-empty options are required.");
      return;
    }

    const uniqueOptions = new Set(cleanOptions);
    if (uniqueOptions.size < cleanOptions.length) {
      toast.error("Duplicate options are not allowed. Each option must be distinct.");
      return;
    }

    if (correctIndex < 0 || !options[correctIndex]?.trim()) {
      toast.error("Please select which option is the correct answer.");
      return;
    }

    const targetCorrect = options[correctIndex].trim();
    if (!cleanOptions.includes(targetCorrect)) {
      toast.error("Selected correct answer must match one of the valid options.");
      return;
    }

    if (type === "passage" && !passage.trim()) {
      toast.error("Passage text is required for comprehension questions.");
      return;
    }

    if (type === "picture" && !pictureUrl?.trim()) {
      toast.error("Please upload or provide an image for picture questions.");
      return;
    }

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
    <PageContainer className="space-y-4 sm:space-y-6 animate-fadeIn pb-20 sm:pb-6">
      {/* Top Header Command Strip */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-4">
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
              {examId && (
                <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded bg-amber-50 text-amber-700 border border-amber-200">
                  Exam #{examId}
                </span>
              )}
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Question Bank
            </h1>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              {examName ? `Configuring question items for: ${examName} (${examPackTitle})` : "Select an exam pack and exam to author question items."}
            </p>
          </div>
        </div>

        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-blue-50 text-blue-700 border border-blue-200 text-xs font-bold">
          {questions.length} Questions in Bank
        </span>
      </div>

      {/* Selector controls if exam not pre-selected */}
      {!examIdParam && (
        <div className="bg-white p-3.5 sm:p-4 rounded border border-slate-200/80 shadow-2xs grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Select Exam Pack</label>
            <CustomSelect
              options={examPacks.map((p) => `${p.id} - ${p.title}`)}
              value={selectedPackId ? `${selectedPackId}` : ""}
              onChange={(val) => handlePackSelect(val.split(" - ")[0])}
              placeholder="Choose Exam Pack"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Select Target Exam</label>
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
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 items-start">
        {/* Left 7 Cols: Question Creator Form */}
        <QuestionComposerForm
          type={type}
          setType={setType}
          questionText={questionText}
          setQuestionText={setQuestionText}
          options={options}
          setOptions={setOptions}
          correctIndex={correctIndex}
          setCorrectIndex={setCorrectIndex}
          passage={passage}
          setPassage={setPassage}
          pictureUrl={pictureUrl}
          setPictureUrl={setPictureUrl}
          submitting={submitting}
          editingId={editingId}
          examId={examId}
          onSubmit={handleCreateQuestion}
          onReset={resetForm}
        />

        {/* Right 5 Cols: Current Questions List */}
        <QuestionBankList
          questions={questions}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </div>
    </PageContainer>
  );
}
