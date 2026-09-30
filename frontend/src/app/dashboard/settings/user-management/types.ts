export interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  status?: string;
  examLimit?: number;
  createdExamsCount?: number;
  examPackLimit?: number;
  createdPacksCount?: number;
}

