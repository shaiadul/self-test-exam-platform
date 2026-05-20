export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  board?: string;
  level?: string;
  batch?: string;
  institution?: string;
  image?: string;
}

export interface Exam {
  id: string;
  name: string;
  score?: string;
  negative?: string;
  answerSheet?: string;
  dateTime?: string;
  image?: string;
}

export interface ExamPack {
  id: string;
  title: string;
  description: string;
  price: number;
  image: string;
}

export interface Stat {
  label: string;
  value: string | number;
  icon?: React.ReactNode;
}

export interface MenuItem {
  name: string;
  href: string;
  icon: React.ReactNode;
}
