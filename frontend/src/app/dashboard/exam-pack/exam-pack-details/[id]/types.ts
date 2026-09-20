export type Answer = string;

export interface QuestionData {
  id: number;
  type: "mcq" | "passage" | "picture";
  questionText: string;
  options: string[];
  correctAnswer: string;
  passage?: string;
  pictureUrl?: string;
}

export interface ExamMeta {
  title: string;
  subject: string;
  durationMinutes: number;
  totalMarks: number;
  passMarks: number;
  negativeMarks: number;
  isPrivate: boolean;
  passcode?: string;
  randomization?: boolean;
  feedback?: boolean;
  startDate?: string;
  endDate?: string;
}
