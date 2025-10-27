"use client";

import React, { useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { FaBookOpen, FaImage, FaListUl, FaPlusCircle } from "react-icons/fa";
import CustomSelect from "@/components/ui/CustomSelect";
import ImageUploader from "@/components/ui/ImageUploader";
import { MdOutlineDeleteSweep } from "react-icons/md";

// --- TYPES ---
type QuestionType = "mcq" | "passage" | "picture";

interface Question {
  id: string;
  type: QuestionType;
  questionText: string;
  options: string[];
  correctAnswer: string;
  passage?: string;
  pictureUrl?: string | null;
}

interface ExamData {
  examName: string;
  examPack: string;
  questions: Question[];
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
      className="w-full border rounded-md p-2 text-sm focus:outline-[#dd6b01]"
    />
    {optionCount > 4 && (
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
}: {
  onAddQuestion: (q: Question) => void;
}) => {
  const [type, setType] = useState<QuestionType>("mcq");
  const [questionText, setQuestionText] = useState("");
  const [passage, setPassage] = useState("");
  const [pictureUrl, setPictureUrl] = useState<string | null>(null);
  const [options, setOptions] = useState<string[]>(["", "", "", ""]);
  const [correctAnswer, setCorrectAnswer] = useState("");

  const handleAddOption = () => setOptions([...options, ""]);
  const handleRemoveOption = (index: number) =>
    setOptions(options.filter((_, i) => i !== index));
  const handleOptionChange = (index: number, value: string) =>
    setOptions(options.map((opt, i) => (i === index ? value : opt)));

  const handleImageUpload = (base64: string | null) => {
    setPictureUrl(base64);
    console.log("Uploaded image base64:", base64);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!questionText.trim()) return alert("Question text is required!");
    if (options.filter(Boolean).length < 2)
      return alert("Please provide at least 2 options!");
    if (!correctAnswer.trim()) return alert("Please select a correct answer!");

    const newQuestion: Question = {
      id: Date.now().toString(),
      type,
      questionText,
      options: options.filter(Boolean),
      correctAnswer,
      passage: type === "passage" ? passage : undefined,
      pictureUrl: type === "picture" ? pictureUrl : undefined,
    };

    onAddQuestion(newQuestion);

    // Reset
    setQuestionText("");
    setPassage("");
    setPictureUrl("");
    setOptions(["", ""]);
    setCorrectAnswer("");
  };

  return (
    <motion.form
      onSubmit={handleSubmit}
      className="bg-white border border-gray-200 rounded-2xl shadow-md p-6 space-y-4"
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
          className="text-[#dd6b01] text-sm font-semibold mt-1 hover:underline"
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
          className="bg-[#dd6b01] text-white px-5 py-2 rounded-md font-semibold hover:bg-[#c25b00] transition"
        >
          Add Question
        </button>
      </div>
    </motion.form>
  );
};

// --- MAIN ADD EXAM PAGE ---
export default function AddExamPage() {
  const [examData, setExamData] = useState<ExamData>({
    examName: "",
    examPack: "",
    questions: [],
  });

  const handleAddQuestion = (question: Question) => {
    setExamData((prev) => ({
      ...prev,
      questions: [...prev.questions, question],
    }));
  };

  return (
    <div className="min-h-screen py-8 px-5 md:px-10 font-sans">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <h1 className="text-2xl md:text-3xl font-bold text-[#dd6b01]">
            🧾 Create New Exam
          </h1>
        </div>

        {/* Exam Info */}
        <div className="grid md:grid-cols-2 gap-5 bg-white border border-gray-200 p-6 rounded-2xl shadow-md">
          <div>
            <label className="text-sm font-semibold text-gray-700 block mb-1">
              Exam Pack Name
            </label>
            <CustomSelect
              label="Select Exam Pack Name"
              options={[
                "Science Explorer",
                "Math Master",
                "Bangla Literature",
                "History Genius",
              ]}
              value={examData.examPack}
              onChange={(val) => setExamData({ ...examData, examPack: val })}
            />
          </div>

          <div>
            <label className="text-sm font-semibold text-gray-700 block mb-1">
              Exam Name
            </label>
            <CustomSelect
              label="Select Exam Name"
              options={[
                "Science 1st Grade",
                "Math 1st Grade",
                "English 1st Grade",
                "History 1st Grade",
              ]}
              value={examData.examName}
              onChange={(val) => setExamData({ ...examData, examName: val })}
            />
          </div>
        </div>

        {/* Add Question Form */}
        <QuestionForm onAddQuestion={handleAddQuestion} />

        {/* Preview Section */}
        {examData.questions.length > 0 && (
          <div className="bg-white border border-gray-200 rounded-2xl shadow-md p-6 mt-8">
            <h3 className="text-lg font-semibold text-[#dd6b01] mb-4">
              Preview ({examData.questions.length})
            </h3>
            <div className="space-y-3">
              {examData.questions.map((q, i) => (
                <div
                  key={q.id}
                  className="border rounded-md p-3 bg-gray-50 text-sm"
                >
                  <p className="font-semibold text-gray-800">
                    {i + 1}. {q.questionText}
                  </p>

                  {q.type === "passage" && (
                    <p className="text-gray-500 mt-1">{q.passage}</p>
                  )}
                  {q.type === "picture" && q.pictureUrl && (
                    <Image
                      src={q.pictureUrl}
                      alt="preview"
                      width={200}
                      height={200}
                      className="rounded-md mt-2"
                    />
                  )}

                  {/* Options Preview */}
                  <ul className="mt-2 list-disc list-inside text-gray-700">
                    {q.options.map((opt, idx) => (
                      <li
                        key={idx}
                        className={`${
                          opt === q.correctAnswer
                            ? "text-green-600 font-medium"
                            : ""
                        }`}
                      >
                        {opt}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
