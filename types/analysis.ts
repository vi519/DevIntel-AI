import { CommitWindow } from './candidate';

export type AnalysisPayload = {
  candidates: {
    id: string;
    name: string;
    github: string;
    leetcode: string;
  }[];
  commitWindow?: CommitWindow;
};

export type ApiResponse<T> = {
  success: boolean;
  data?: T;
  error?: string;
};
