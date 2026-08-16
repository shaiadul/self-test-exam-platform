"use client";

import React, { useState } from "react";
import { toast } from "sonner";
import Image from "next/image";
import { motion } from "framer-motion";
import { FaBookOpen, FaImage, FaListUl, FaPlusCircle, FaArrowLeft } from "react-icons/fa";
import CustomSelect from "../../../../components/ui/CustomSelect";
import ImageUploader from "../../../../components/ui/ImageUploader";
import { MdOutlineDeleteSweep } from "react-icons/md";
import { PageContainer } from "../../../../components/common/PageContainer";
import { useRouter } from "next/navigation";
import {
  getExamsAction,
  createQuestionAction,
  getQuestionsAction
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

const OptionInput = ({
  value,
  onChange,
  onRemove,
  placeholder,
  optionCount,
}: {
  value: string;
  onChange: (value: string) => void;
  onRemove: () => void;
  placeholder: string;
  optionCount: number;
}) => (
  <div className="flex items-center gap-2">
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full border border-gray-300 rounded-md p-2 text-sm focus:outline-[#dd6b01] focus:ring-1 focus:ring-[#dd6b01]"
    />
    {optionCount > 2 && (
      <button
        type="button"
        onClick={onRemove}
        className="text-red-500 hover:text-red-700 text-sm font-bold p-1 cursor-pointer"
        title="Remove Option"
      >
        ✕
      </button>
    )}
  </div>
);

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
  const [correctAnswer, setCorrectAnswer] = useState("");
  const [passage, setPassage] = useState("");
  const [pictureUrl, setPictureUrl] = useState<string | null>(null);

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
    if (options.length > 2) {
      setOptions(options.filter((_, i) => i !== index));
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
      toast.error("At least 2 options are required.");
      return;
    }
    if (!correctAnswer) {
      toast.error("Please select the correct answer.");
      return;
    }

    const correctIndex = cleanOptions.indexOf(correctAnswer);

    try {
      const res = await createQuestionAction(examId, {
        text: questionText,
        type,
        options: cleanOptions,
        correctIndex: correctIndex >= 0 ? correctIndex : 0,
        explanation: passage || "",
      });

      if (res.success) {
        toast.success("Question created successfully!");
        setQuestionText("");
        setOptions(["", "", "", ""]);
        setCorrectAnswer("");
        setPassage("");
        setPictureUrl(null);
        // Refresh question list
        const updatedQs = await getQuestionsAction(examId);
        setQuestions(updatedQs || []);
      } else {
        toast.error(res.error || "Failed to create question.");
      }
    } catch {
      toast.error("Failed to create question.");
    }
  };

  return (
    <PageContainer className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-sm text-[#dd6b01] font-bold mb-2 cursor-pointer hover:underline"
          >
            <FaArrowLeft /> Back
          </button>
          <h1 className="text-3xl font-extrabold text-gray-900">Question Bank Manager</h1>
          <p className="text-xs text-gray-500 font-semibold mt-1">
            {examName ? `Configuring questions for: ${examName} (${examPackTitle})` : "Select an exam pack and exam to manage questions."}
          </p>
        </div>
      </div>

      {/* Selector controls if exam not pre-selected */}
      {!examIdParam && (
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-bold text-gray-700 block mb-1">Select Exam Pack</label>
            <CustomSelect
              options={examPacks.map((p) => `${p.id} - ${p.title}`)}
              value={selectedPackId ? `${selectedPackId}` : ""}
              onChange={(val) => handlePackSelect(val.split(" - ")[0])}
              placeholder="Choose Exam Pack"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-gray-700 block mb-1">Select Exam</label>
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
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Question Creator Form */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-6">
          <h2 className="text-lg font-extrabold text-[#dd6b01]">Create New Question</h2>

          {/* Question Type Selector */}
          <div className="flex gap-2">
            {[
              { id: "mcq", label: "MCQ", icon: <FaListUl /> },
              { id: "passage", label: "Passage Based", icon: <FaBookOpen /> },
              { id: "picture", label: "Picture Based", icon: <FaImage /> },
            ].map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setType(t.id as QuestionType)}
                className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 border transition cursor-pointer ${
                  type === t.id
                    ? "bg-[#dd6b01] text-white border-[#dd6b01] shadow"
                    : "bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100"
                }`}
              >
                {t.icon} {t.label}
              </button>
            ))}
          </div>

          <form onSubmit={handleCreateQuestion} className="space-y-4">
            {type === "passage" && (
              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">Passage Text</label>
                <textarea
                  className="w-full p-3 border border-gray-300 rounded-xl text-sm outline-none focus:border-[#dd6b01] min-h-[100px]"
                  placeholder="Enter passage context..."
                  value={passage}
                  onChange={(e) => setPassage(e.target.value)}
                />
              </div>
            )}

            {type === "picture" && (
              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">Question Image</label>
                <ImageUploader preview={pictureUrl} onUpload={(url) => setPictureUrl(url)} />
              </div>
            )}

            <div>
              <label className="text-xs font-bold text-gray-700 block mb-1">Question Prompt</label>
              <textarea
                className="w-full p-3 border border-gray-300 rounded-xl text-sm outline-none focus:border-[#dd6b01] min-h-[80px]"
                placeholder="Type your question prompt here..."
                value={questionText}
                onChange={(e) => setQuestionText(e.target.value)}
                required
              />
            </div>

            {/* Options */}
            <div className="space-y-3">
              <label className="text-xs font-bold text-gray-700 block">Answer Choices</label>
              {options.map((opt, idx) => (
                <OptionInput
                  key={idx}
                  value={opt}
                  onChange={(val) => handleOptionChange(idx, val)}
                  onRemove={() => handleRemoveOption(idx)}
                  placeholder={`Option ${String.fromCharCode(65 + idx)}`}
                  optionCount={options.length}
                />
              ))}

              {options.length < 6 && (
                <button
                  type="button"
                  onClick={handleAddOption}
                  className="text-xs font-bold text-[#dd6b01] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <FaPlusCircle /> Add Choice Option
                </button>
              )}
            </div>

            {/* Correct Answer Select */}
            <div>
              <label className="text-xs font-bold text-gray-700 block mb-1">Correct Answer Choice</label>
              <CustomSelect
                options={options.filter((o) => o.trim() !== "")}
                value={correctAnswer}
                onChange={(val) => setCorrectAnswer(val)}
                placeholder="Select Correct Option"
              />
            </div>

            <button
              type="submit"
              disabled={!examId}
              className="w-full py-3 bg-[#dd6b01] hover:bg-orange-600 text-white font-bold text-sm rounded-xl shadow transition disabled:opacity-50 cursor-pointer"
            >
              Add Question to Bank
            </button>
          </form>
        </div>

        {/* Right Col: Current Questions List */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <h3 className="text-base font-extrabold text-gray-900">Existing Questions ({questions.length})</h3>
          </div>

          <div className="space-y-4 max-h-[600px] overflow-y-auto pr-1">
            {questions.map((q, idx) => (
              <motion.div
                key={q.id || idx}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 rounded-xl border border-gray-200 bg-gray-50/50 space-y-2 text-xs"
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="font-bold text-gray-900">
                    Q{idx + 1}. {q.questionText}
                  </span>
                  <span className="px-2 py-0.5 bg-orange-100 text-[#dd6b01] rounded text-[10px] font-bold uppercase">
                    {q.type}
                  </span>
                </div>

                <div className="space-y-1 text-gray-600 pl-2">
                  {q.options && q.options.map((opt, oIdx) => (
                    <div
                      key={oIdx}
                      className={opt === q.correctAnswer ? "font-bold text-emerald-700" : ""}
                    >
                      • {String.fromCharCode(65 + oIdx)}. {opt} {opt === q.correctAnswer && "✓"}
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}

            {questions.length === 0 && (
              <div className="text-center py-12 text-gray-400 font-medium text-xs">
                No questions added to this exam yet.
              </div>
            )}
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
