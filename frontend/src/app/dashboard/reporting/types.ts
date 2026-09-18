export type Report = {
  id: number;
  examId: string;
  examName: string;
  packName: string;
  answers: string;
  total: number;
  correct: number;
  wrong: number;
  negative: number;
  finalScore: number;
  passed: boolean;
  warningCount: number;
  securityMessage: string;
  createdAt: string;
};

export interface ReportingSummary {
  totalExams: number;
  passedExams: number;
  failedExams: number;
  avgScore: string;
  passRate: number;
}
