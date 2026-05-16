export type CandidateInput = {
  id: string;
  name: string;
  github: string;
  leetcode: string;
};

export type CommitWindow = '6m' | '1y' | '2y' | '3y' | '5y';

export type GithubAnalysis = {
  login: string;
  name: string;
  avatarUrl?: string;
  publicRepos: number;
  totalStars: number;
  topLanguages: string[];
  languageBreakdown: {
    language: string;
    count: number;
    percentage: number;
  }[];
  repositoryHighlights: {
    name: string;
    url: string;
    language: string;
    stars: number;
    forks: number;
    pushedAt: string;
    description: string | null;
  }[];
  recentCommitCount: number;
  commitsPerDay: number;
  activeCommitDays: number;
  commitActivity: {
    date: string;
    commits: number;
  }[];
  busiestRepo: string | null;
  activityWindowDays: number;
  activityWindowLabel: string;
  readmeCoverage: string;
  typeScriptRatio: string;
  testSignal: string;
  commitConsistency: string;
  projectMaturity: string;
  frontEndScore: number;
  backEndScore: number;
  observations: string[];
};

export type LeetCodeAnalysis = {
  username: string;
  solvedTotal: number;
  easy: number;
  medium: number;
  hard: number;
  contestRating: number | null;
  ranking: string | null;
  consistency: string;
  observations: string[];
};

export type CandidateAnalysis = {
  id: string;
  name: string;
  github: GithubAnalysis | null;
  leetcode: LeetCodeAnalysis | null;
  score: number;
  scoreBreakdown: {
    github: number;
    leetcode: number;
    documentation: number;
    activity: number;
  };
  summary: string;
  interviewFocus: string[];
};
