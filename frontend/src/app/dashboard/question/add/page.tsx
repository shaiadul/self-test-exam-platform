"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { FaBookOpen, FaImage, FaListUl, FaPlusCircle, FaArrowLeft } from "react-icons/fa";
import CustomSelect from "../../../../components/ui/CustomSelect";
import ImageUploader from "../../../../components/ui/ImageUploader";
import { MdOutlineDeleteSweep } from "react-icons/md";
import { PageContainer } from "../../../../components/common/PageContainer";
import { useSearchParams, useRouter } from "next/navigation";
import {
  getExamDetailsAction,
  getExamPackDetailsAction,
  getExamPacksAction,
  getExamsAction,
  createQuestionAction,
  getQuestionsAction
} from "../../../../lib/actions";

// --- TYPES ---
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

// --- COMPONENTS ---

// Option Input Component
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
        className="text-red-600 hover:text-red-800 font-bold text-2xl cursor-pointer"
      >
        <MdOutlineDeleteSweep />
      </button>
    )}
  </div>
);

// Question Form Component
const QuestionForm = ({
  onAddQuestion,
  disabled,
}: {
  onAddQuestion: (q: Omit<Question, "id">) => Promise<boolean>;
  disabled: boolean;
}) => {
  const [type, setType] = useState<QuestionType>("mcq");
  const [questionText, setQuestionText] = useState("");
  const [passage, setPassage] = useState("");
  const [pictureUrl, setPictureUrl] = useState<string | null>(null);
  const [options, setOptions] = useState<string[]>(["", "", "", ""]);
  const [correctAnswer, setCorrectAnswer] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleAddOption = () => setOptions([...options, ""]);
  const handleRemoveOption = (index: number) =>
    setOptions(options.filter((_, i) => i !== index));
  const handleOptionChange = (index: number, value: string) =>
    setOptions(options.map((opt, i) => (i === index ? value : opt)));

  const handleImageUpload = (base64: string | null) => {
    setPictureUrl(base64);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (disabled) return alert("Please select an exam pack and exam first.");
    if (!questionText.trim()) return alert("Question text is required!");
    if (options.filter(Boolean).length < 2)
      return alert("Please provide at least 2 options!");
    if (!correctAnswer.trim()) return alert("Please select a correct answer!");

    const newQuestion = {
      type,
      questionText,
      options: options.filter(Boolean),
      correctAnswer,
      passage: type === "passage" ? passage : undefined,
      pictureUrl: type === "picture" ? pictureUrl : undefined,
    };

    setSubmitting(true);
    const success = await onAddQuestion(newQuestion);
    setSubmitting(false);

    if (success) {
      // Reset form
      setQuestionText("");
      setPassage("");
      setPictureUrl(null);
      setOptions(["", "", "", ""]);
      setCorrectAnswer("");
    }
  };

  return (
    <motion.form
      onSubmit={handleSubmit}
      className={`bg-white border border-gray-200 rounded-2xl shadow-md p-6 space-y-4 ${disabled ? "opacity-60 pointer-events-none" : ""}`}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <h3 className="text-lg font-semibold text-[#dd6b01] flex items-center gap-2">
        <FaPlusCircle /> Add New Question
      </h3>

      {/* Question Type */}
      <div>
        <label className="text-sm font-semibold text-gray-700 block mb-1">
          Question Type
        </label>
        <CustomSelect
          label="Select type"
          options={["mcq", "passage", "picture"]}
          value={type}
          onChange={(val) => setType(val as QuestionType)}
        />
      </div>

      {/* Question Text */}
      <div>
        <label className="text-sm font-semibold text-gray-700 block mb-1">
          Question
        </label>
        <textarea
          value={questionText}
          onChange={(e) => setQuestionText(e.target.value)}
          rows={2}
          placeholder="Write your question..."
          className="w-full border rounded-md p-2 text-sm focus:outline-[#dd6b01]"
        />
      </div>

      {/* Conditional Fields */}
      {type === "passage" && (
        <div>
          <label className="text-sm font-semibold text-gray-700 block mb-1 flex items-center gap-1">
            <FaBookOpen className="text-[#dd6b01]" /> Passage
          </label>
          <textarea
            value={passage}
            onChange={(e) => setPassage(e.target.value)}
            rows={3}
            placeholder="Enter passage text..."
            className="w-full border rounded-md p-2 text-sm focus:outline-[#dd6b01]"
          />
        </div>
      )}

      {type === "picture" && (
        <div>
          <label className="text-sm font-semibold text-gray-700 block mb-1 flex items-center gap-1">
            <FaImage className="text-[#dd6b01]" /> Upload Picture
          </label>
          <ImageUploader
            label=""
            onUpload={handleImageUpload}
            preview={pictureUrl}
          />
        </div>
      )}

      {/* Options (for all question types) */}
      <div className="space-y-2">
        <label className="text-sm font-semibold text-gray-700 block flex items-center gap-1">
          <FaListUl className="text-[#dd6b01]" /> Options
        </label>
        {options.map((opt, i) => (
          <OptionInput
            key={i}
            value={opt}
            placeholder={`Option ${i + 1}`}
            onChange={(v) => handleOptionChange(i, v)}
            onRemove={() => handleRemoveOption(i)}
            optionCount={options.length}
          />
        ))}
        <button
          type="button"
          onClick={handleAddOption}
          className="text-[#dd6b01] text-sm font-semibold mt-1 hover:underline cursor-pointer"
        >
          + Add Option
        </button>

        {/* Correct Answer */}
        <div className="mt-2">
          <label className="text-sm font-semibold text-gray-700 block mb-1">
            Correct Answer
          </label>
          <CustomSelect
            label="Select correct answer"
            options={options.filter(Boolean)}
            value={correctAnswer}
            onChange={setCorrectAnswer}
          />
        </div>
      </div>

      {/* Submit */}
      <div className="pt-3">
        <button
          type="submit"
          disabled={submitting}
          className="bg-[#dd6b01] text-white px-5 py-2 rounded-md font-semibold hover:bg-[#c25b00] transition disabled:opacity-50 cursor-pointer"
        >
          {submitting ? "Adding Question..." : "Add Question"}
        </button>
      </div>
    </motion.form>
  );
};

// --- MAIN ADD QUESTION PAGE ---
export default function AddQuestionPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const examIdParam = searchParams.get("examId") || "";

  // Dynamic States
  const [examId, setExamId] = useState<string>(examIdParam);
  const [examName, setExamName] = useState<string>("");
  const [examPackTitle, setExamPackTitle] = useState<string>("");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Dropdown options when selecting manually
  const [examPacks, setExamPacks] = useState<any[]>([]);
  const [exams, setExams] = useState<any[]>([]);
  const [selectedPackId, setSelectedPackId] = useState<number | "">("");

  // Load initial data
  useEffect(() => {
    async function initData() {
      setLoading(true);
      if (examIdParam) {
        try {
          const exam = await getExamDetailsAction(examIdParam);
          if (exam) {
            setExamId(examIdParam);
            setExamName(exam.name);
            // Fetch pack details
            const pack = await getExamPackDetailsAction(exam.examPackId);
            if (pack) {
              setExamPackTitle(pack.title);
            }
            // Fetch existing questions
            const qList = await getQuestionsAction(examIdParam);
            setQuestions(qList || []);
          } else {
            alert("Specified exam not found. You can select an exam pack and exam manually.");
            setExamId("");
          }
        } catch (err) {
          console.error(err);
        }
      }
      
      // Fetch all packs for manual selection dropdown (always useful to have as fallback)
      try {
        const packs = await getExamPacksAction();
        setExamPacks(packs || []);
      } catch (err) {
        console.error(err);
      }
      setLoading(false);
    }
    initData();
  }, [examIdParam]);

  // Load exams when pack is manually selected
  useEffect(() => {
    async function loadExams() {
      if (selectedPackId) {
        try {
          const examList = await getExamsAction(Number(selectedPackId));
          setExams(examList || []);
          setExamId("");
          setQuestions([]);
          setExamName("");
        } catch (err) {
          console.error(err);
        }
      } else {
        setExams([]);
      }
    }
    loadExams();
  }, [selectedPackId]);

  // Load questions when exam is manually selected
  const handleExamChange = async (examNameOption: string) => {
    const matchedExam = exams.find(e => e.name === examNameOption);
    if (matchedExam) {
      setExamId(matchedExam.id);
      setExamName(matchedExam.name);
      setLoading(true);
      try {
        const qList = await getQuestionsAction(matchedExam.id);
        setQuestions(qList || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleAddQuestion = async (qData: Omit<Question, "id">) => {
    if (!examId) {
      alert("Please select an exam first!");
      return false;
    }

    try {
      const res = await createQuestionAction(examId, qData);
      if (res.success) {
        // Refresh question list
        const qList = await getQuestionsAction(examId);
        setQuestions(qList || []);
        return true;
      } else {
        alert(res.error || "Failed to add question to backend.");
        return false;
      }
    } catch (err) {
      alert("Failed to save question.");
      return false;
    }
  };

  if (loading && examIdParam) {
    return (
      <PageContainer>
        <div className="flex flex-col items-center justify-center min-h-[400px]">
          <div className="w-12 h-12 border-4 border-[#dd6b01] border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-600 font-medium">Loading Exam details...</p>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-600 hover:text-[#dd6b01] font-semibold transition cursor-pointer"
          >
            <FaArrowLeft /> Back
          </button>
          <h1 className="text-2xl md:text-3xl font-bold text-[#dd6b01]">
            🧾 Create New Question
          </h1>
        </div>
        {examId && (
          <button
            onClick={() => {
              if (selectedPackId) {
                router.push(`/dashboard/manage-exam-pack/${selectedPackId}`);
              } else {
                router.push("/dashboard/manage-exam-pack");
              }
            }}
            className="px-5 py-2 bg-gradient-to-r from-[#dd6b01] to-[#f0b176] text-white font-semibold rounded-lg hover:opacity-90 transition cursor-pointer"
          >
            Finish & View Exam
          </button>
        )}
      </div>

      {/* Exam Info Selectors */}
      <div className="bg-white border border-gray-200 p-6 rounded-2xl shadow-md">
        {examIdParam && examName ? (
          <div className="text-gray-800">
            <span className="font-semibold text-gray-500">Exam Pack:</span>{" "}
            <span className="font-bold text-lg text-[#dd6b01] mr-6">{examPackTitle || `Pack #${selectedPackId || "Preselected"}`}</span>
            <span className="font-semibold text-gray-500">Exam Name:</span>{" "}
            <span className="font-bold text-lg text-[#dd6b01]">{examName}</span>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-5">
            <div>
              <label className="text-sm font-semibold text-gray-700 block mb-1">
                Exam Pack Name
              </label>
              <CustomSelect
                label="Select Exam Pack Name"
                options={examPacks.map(p => p.title)}
                value={examPacks.find(p => p.id === selectedPackId)?.title || ""}
                onChange={(val) => {
                  const matched = examPacks.find(p => p.title === val);
                  if (matched) {
                    setSelectedPackId(matched.id);
                  }
                }}
              />
            </div>

            <div>
              <label className="text-sm font-semibold text-gray-700 block mb-1">
                Exam Name
              </label>
              <CustomSelect
                label="Select Exam Name"
                options={exams.map(e => e.name)}
                value={examName}
                onChange={handleExamChange}
                disabled={!selectedPackId}
              />
            </div>
          </div>
        )}
      </div>

      {/* Add Question Form */}
      <QuestionForm onAddQuestion={handleAddQuestion} disabled={!examId} />

      {/* Preview Section */}
      {questions.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-2xl shadow-md p-6 mt-8">
          <h3 className="text-lg font-semibold text-[#dd6b01] mb-4">
            Preview ({questions.length})
          </h3>
          <div className="space-y-4">
            {questions.map((q, i) => (
              <div
                key={q.id}
                className="border border-gray-200 rounded-xl p-4 bg-gray-50 text-sm"
              >
                <p className="font-semibold text-gray-800 text-base">
                  {i + 1}. {q.questionText}
                </p>

                {q.type === "passage" && q.passage && (
                  <div className="mt-2 p-3 bg-white border border-gray-100 rounded-lg text-gray-600 italic">
                    {q.passage}
                  </div>
                )}
                {q.type === "picture" && q.pictureUrl && (
                  <div className="relative w-48 h-32 mt-2 rounded-lg overflow-hidden border border-gray-200">
                    <Image
                      src={q.pictureUrl}
                      alt="Question attachment"
                      fill
                      className="object-cover"
                    />
                  </div>
                )}

                {/* Options Preview */}
                <ul className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-2 text-gray-700">
                  {q.options.map((opt, idx) => (
                    <li
                      key={idx}
                      className={`px-3 py-1.5 rounded-lg border text-sm ${
                        opt === q.correctAnswer
                          ? "bg-green-50 border-green-200 text-green-700 font-semibold"
                          : "bg-white border-gray-200"
                      }`}
                    >
                      <span className="font-bold mr-1.5">{String.fromCharCode(65 + idx)})</span> {opt}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* --- Relevant Rules Section --- */}
      <div className="mt-14 w-full bg-orange-50 border border-[#fcd6aa] rounded-2xl p-6 md:p-10 shadow-sm">
        <h2 className="text-xl md:text-2xl font-semibold text-[#dd6b01] mb-4">
          📘 Relevant Rules for Creating Question
        </h2>

        <ul className="list-disc list-inside space-y-2 text-gray-700 text-base leading-relaxed">
          <li>
            The <span className="font-bold">Exam Pack Name</span> must be
            unique, descriptive, and easily recognizable.
          </li>
          <li>
            Maximum image ratio is{" "}
            <span className="font-bold">around 663×322 (≈2.06:1)</span>.
          </li>
          <li>
            Ensure that any <span className="font-bold">uploaded images</span>{" "}
            are high-quality and do not exceed{" "}
            <span className="font-bold">2MB</span> in size.
          </li>
          <li>
            Use accurate <span className="font-bold">exam level</span> and{" "}
            <span className="font-bold">batch</span> details to categorize exams
            properly.
          </li>
          <li>
            Include complete and clear information in the{" "}
            <span className="font-bold">“Details”</span> section to help
            students understand the exam content.
          </li>
          <li>
            Review all <span className="font-bold">questions and options</span>{" "}
            for correctness before publishing.
          </li>
          <li>
            Once published, exam packs can be edited but cannot be deleted
            directly without admin approval.
          </li>
          <li>
            Maintain a consistent{" "}
            <span className="font-bold">format and style</span> for questions,
            passages, and images to ensure uniformity across the exam pack.
          </li>
        </ul>

        <p className="mt-5 text-gray-600 text-sm italic">
          Tip: Well-structured and accurate exam packs help students quickly
          find relevant materials and improve their learning experience.
        </p>
      </div>
    </PageContainer>
  );
}
