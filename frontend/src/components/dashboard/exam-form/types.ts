export interface ExamFormData {
  name: string;
  details: string;
  level: string;
  batch: string;
  image: string;
  totalMarks: number;
  perQuestionMark: number;
  passMark: number;
  durationMinutes: number;
  startDate: string;
  endDate: string;
}

export interface ExamSettingsData {
  randomization: boolean;
  feedback: boolean;
  negativeMarking: boolean;
  negativeValue: number;
  privateExam: boolean;
  privatePassword?: string;
}
