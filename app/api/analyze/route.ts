import { NextResponse } from 'next/server';
import type { CandidateInput, CandidateAnalysis, CommitWindow } from '../../../types/candidate';
import { fetchGithubAnalysis } from '../../../lib/github';
import { fetchLeetCodeAnalysis } from '../../../lib/leetcode';

function clampScore(score: number) {
  return Math.max(0, Math.min(100, Math.round(score)));
}

function buildCandidateScore(github: CandidateAnalysis['github'], leetcode: CandidateAnalysis['leetcode']) {
  const githubScore = github
    ? Math.min(35, github.frontEndScore * 5 + github.backEndScore * 5 + Math.min(10, github.totalStars / 5) + Math.min(5, github.publicRepos / 4))
    : 0;
  const leetcodeScore = leetcode
    ? Math.min(25, leetcode.solvedTotal / 12 + leetcode.medium / 20 + leetcode.hard / 8)
    : 0;
  const documentationScore = github
    ? Math.min(20, (parseInt(github.readmeCoverage.split('/')[0], 10) / Math.max(1, parseInt(github.readmeCoverage.split('/')[1], 10))) * 20)
    : 0;
  const activityScore = github
    ? Math.min(20, (github.activeCommitDays / Math.max(1, github.activityWindowDays * 0.12)) * 20)
    : 0;

  return {
    score: clampScore(githubScore + leetcodeScore + documentationScore + activityScore),
    scoreBreakdown: {
      github: clampScore((githubScore / 35) * 100),
      leetcode: clampScore((leetcodeScore / 25) * 100),
      documentation: clampScore((documentationScore / 20) * 100),
      activity: clampScore((activityScore / 20) * 100)
    }
  };
}

export async function POST(request: Request) {
  const body = await request.json();
  const candidates: CandidateInput[] = body?.candidates ?? [];
  const commitWindow: CommitWindow = body?.commitWindow ?? '2y';

  if (!Array.isArray(candidates) || candidates.length === 0) {
    return NextResponse.json({ success: false, error: 'Please provide candidate profiles.' }, { status: 400 });
  }

  const analysis = await Promise.all(
    candidates.map(async (candidate) => {
      const github = candidate.github ? await fetchGithubAnalysis(candidate.github.trim(), commitWindow) : null;
      const leetcode = candidate.leetcode ? await fetchLeetCodeAnalysis(candidate.leetcode.trim()) : null;

      const summaryParts: string[] = [];
      if (github) {
        summaryParts.push(`GitHub profile analysis for ${github.name}: ${github.publicRepos} repos, ${github.recentCommitCount} public commits in the ${github.activityWindowLabel} scan, and top stack signals led by ${github.languageBreakdown[0]?.language ?? 'N/A'}. ${github.observations.slice(0, 2).join(' ')}.`);
      }
      if (leetcode) {
        summaryParts.push(`LeetCode profile extracted ${leetcode.solvedTotal} solved problems and ${leetcode.consistency.toLowerCase()}.`);
      }
      if (!github && !leetcode) {
        summaryParts.push('No public signals were available from GitHub or LeetCode.');
      }

      const scoring = buildCandidateScore(github, leetcode);

      const interviewFocus: string[] = [];
      if (github) {
        interviewFocus.push('Discuss project architecture and contribution consistency.');
        interviewFocus.push(`Review top repositories, ${github.activityWindowLabel} commit rhythm, and ownership depth.`);
        interviewFocus.push('Review evidence of testing and documentation practices.');
      }
      if (leetcode) {
        interviewFocus.push('Explore problem-solving approach for medium and hard problems.');
        interviewFocus.push('Ask about recent algorithmic practice and consistency.');
      }

      return {
        id: candidate.id,
        name: candidate.name || github?.name || candidate.github || candidate.leetcode || 'Candidate',
        github,
        leetcode,
        score: scoring.score,
        scoreBreakdown: scoring.scoreBreakdown,
        summary: summaryParts.join(' '),
        interviewFocus
      } as CandidateAnalysis;
    })
  );

  return NextResponse.json({ success: true, data: analysis });
}
