export interface PeerStudent {
  id: string | number;
  merit: number;
  name: string;
  board: string;
  time: string;
  score: number;
  negative: number;
  image?: string;
  institution?: string;
}

export interface QuestionItem {
  id: string | number;
  questionText?: string;
  text?: string;
  passage?: string;
  pictureUrl?: string;
  options?: string[];
  correctAnswer?: string;
  correctIndex?: number;
  explanation?: string;
}
