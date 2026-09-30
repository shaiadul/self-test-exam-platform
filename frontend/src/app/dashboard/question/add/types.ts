export type QuestionType = "mcq" | "passage" | "picture";

export interface Question {
  id: number | string;
  type: QuestionType;
  questionText: string;
  options: string[];
  correctAnswer: string;
  passage?: string;
  pictureUrl?: string | null;
}
