'use client';

import { useMemo, useState } from 'react';
import { CandidateAnalysis } from '../../types/candidate';
import { generateAiSummary } from '../../lib/ai';
import {
  Bar,
  BarChart,
  CartesianGrid,
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';

type ComparisonDashboardProps = {
  analysis: CandidateAnalysis[];
  aiProvider: 'openai' | 'gemini';
  apiKey: string;
};

export default function ComparisonDashboard({ analysis, aiProvider, apiKey }: ComparisonDashboardProps) {
  const [aiSummary, setAiSummary] = useState<string | null>(null);
  const [aiPending, setAiPending] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  const radarData = useMemo(() => {
    const categories = ['Frontend', 'Backend', 'Stability', 'Documentation', 'ProblemSolving'] as const;
    return categories.map((label) => {
      const row: Record<string, string | number> = { category: label };
      analysis.forEach((candidate, index) => {
        const score =
          label === 'Frontend'
            ? candidate.github?.frontEndScore ?? 0
            : label === 'Backend'
            ? candidate.github?.backEndScore ?? 0
            : label === 'Stability'
            ? candidate.github
              ? Math.min(5, Math.round((candidate.github.totalStars / 30) * 2))
              : 1
            : label === 'Documentation'
            ? candidate.github
              ? Math.min(5, Math.round((parseInt(candidate.github.readmeCoverage.split('/')[0], 10) / 5) * 5))
              : 1
            : candidate.leetcode
            ? Math.min(5, Math.round(candidate.leetcode.solvedTotal / 120))
            : 1;
        row[`candidate${index}`] = score;
      });
      return row;
    });
  }, [analysis]);

  const solvedData = useMemo(
    () =>
      analysis.map((candidate) => ({
        name: candidate.name,
        Easy: candidate.leetcode?.easy ?? 0,
        Medium: candidate.leetcode?.medium ?? 0,
        Hard: candidate.leetcode?.hard ?? 0
      })),
    [analysis]
  );

  const commitData = useMemo(() => {
    const dates = Array.from(new Set(analysis.flatMap((candidate) => candidate.github?.commitActivity.map((day) => day.date) ?? []))).sort();
    return dates.map((date) => {
      const row: Record<string, string | number> = { date };
      analysis.forEach((candidate, index) => {
        row[`candidate${index}`] = candidate.github?.commitActivity.find((day) => day.date === date)?.commits ?? 0;
      });
      return row;
    });
  }, [analysis]);

  const activityWindowLabel = analysis.find((candidate) => candidate.github)?.github?.activityWindowLabel ?? 'selected window';
  const rankedCandidates = useMemo(() => [...analysis].sort((a, b) => b.score - a.score), [analysis]);

  const handleAIGenerate = async () => {
    setAiError(null);
    setAiPending(true);
    try {
      const summary = await generateAiSummary({ provider: aiProvider, apiKey, analysis });
      setAiSummary(summary);
    } catch (error) {
      setAiError('AI generation failed. Confirm your API key and provider settings.');
    } finally {
      setAiPending(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="grid gap-6 lg:grid-cols-2">
        {analysis.map((candidate) => (
          <div key={candidate.id} className="rounded-[2rem] border border-slate-200 bg-white/90 p-8 shadow-glass">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xl font-semibold text-slate-950">{candidate.name}</p>
                <p className="mt-2 text-sm text-slate-500">{candidate.github?.login ? `GitHub: ${candidate.github.login}` : ''}</p>
              </div>
              <span className="rounded-full bg-brand-100 px-3 py-1 text-xs font-semibold text-brand-800">Profile summary</span>
            </div>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-sm uppercase tracking-[0.16em] text-slate-500">GitHub signal</p>
                <p className="mt-3 text-lg font-semibold text-slate-900">{candidate.github?.publicRepos ?? 0} repos</p>
                <p className="mt-2 text-sm text-slate-600">{candidate.github?.projectMaturity}</p>
              </div>
              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-sm uppercase tracking-[0.16em] text-slate-500">LeetCode signal</p>
                <p className="mt-3 text-lg font-semibold text-slate-900">{candidate.leetcode?.solvedTotal ?? 0} solved</p>
                <p className="mt-2 text-sm text-slate-600">{candidate.leetcode?.consistency}</p>
              </div>
            </div>
            {candidate.github ? (
              <div className="mt-6 grid gap-4 sm:grid-cols-3">
                <div className="rounded-3xl border border-slate-200 bg-white p-4">
                  <p className="text-sm uppercase tracking-[0.16em] text-slate-500">{candidate.github.activityWindowLabel} commits</p>
                  <p className="mt-3 text-2xl font-semibold text-slate-950">{candidate.github.recentCommitCount}</p>
                  <p className="mt-1 text-sm text-slate-500">public owner repos</p>
                </div>
                <div className="rounded-3xl border border-slate-200 bg-white p-4">
                  <p className="text-sm uppercase tracking-[0.16em] text-slate-500">Per day</p>
                  <p className="mt-3 text-2xl font-semibold text-slate-950">{candidate.github.commitsPerDay}</p>
                  <p className="mt-1 text-sm text-slate-500">{candidate.github.activeCommitDays} active days</p>
                </div>
                <div className="rounded-3xl border border-slate-200 bg-white p-4">
                  <p className="text-sm uppercase tracking-[0.16em] text-slate-500">Top stack</p>
                  <p className="mt-3 text-2xl font-semibold text-slate-950">{candidate.github.languageBreakdown[0]?.language ?? 'N/A'}</p>
                  <p className="mt-1 text-sm text-slate-500">{candidate.github.languageBreakdown[0]?.percentage ?? 0}% of repos</p>
                </div>
              </div>
            ) : null}
            <div className="mt-6 space-y-3 text-sm text-slate-600">
              {candidate.github?.observations.map((item, index) => (
                <p key={index}>• {item}</p>
              ))}
              {candidate.leetcode?.observations.map((item, index) => (
                <p key={`leetcode-${index}`}>• {item}</p>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">
        <div className="rounded-[2rem] border border-slate-200 bg-white/90 p-6 shadow-glass">
          <div>
            <p className="text-sm uppercase tracking-[0.28em] text-brand-700">Commit rhythm</p>
            <h2 className="mt-3 text-2xl font-semibold text-slate-950">Public commits over {activityWindowLabel}</h2>
          </div>
          <div className="mt-8 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={commitData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="date" tickLine={false} axisLine={false} minTickGap={18} />
                <YAxis tickLine={false} axisLine={false} allowDecimals={false} />
                <Tooltip />
                {analysis.map((candidate, index) => (
                  <Bar
                    key={candidate.id}
                    dataKey={`candidate${index}`}
                    name={candidate.name}
                    fill={index === 0 ? '#4f46e5' : '#0284c7'}
                    radius={[6, 6, 0, 0]}
                  />
                ))}
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="rounded-[2rem] border border-slate-200 bg-white/90 p-6 shadow-glass">
          <div>
            <p className="text-sm uppercase tracking-[0.28em] text-brand-700">Repository detail</p>
            <h2 className="mt-3 text-2xl font-semibold text-slate-950">Top repos and stack usage</h2>
          </div>
          <div className="mt-6 space-y-6">
            {analysis.map((candidate) => (
              <div key={candidate.id} className="space-y-4">
                <p className="font-semibold text-slate-950">{candidate.name}</p>
                <div className="flex flex-wrap gap-2">
                  {candidate.github?.languageBreakdown.map((item) => (
                    <span key={item.language} className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                      {item.language} &middot; {item.count} repos
                    </span>
                  ))}
                </div>
                <div className="space-y-3">
                  {candidate.github?.repositoryHighlights.slice(0, 4).map((repo) => (
                    <a key={repo.name} href={repo.url} target="_blank" rel="noreferrer" className="block rounded-3xl border border-slate-200 bg-slate-50 p-4 transition hover:border-brand-200 hover:bg-brand-50">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-semibold text-slate-950">{repo.name}</p>
                          <p className="mt-1 line-clamp-2 text-sm text-slate-600">{repo.description ?? 'No public description provided.'}</p>
                        </div>
                        <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-600">{repo.language}</span>
                      </div>
                      <p className="mt-3 text-xs text-slate-500">{repo.stars} stars &middot; {repo.forks} forks &middot; pushed {new Date(repo.pushedAt).toLocaleDateString()}</p>
                    </a>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[0.9fr_1fr]">
        <div className="rounded-[2rem] border border-slate-200 bg-white/90 p-6 shadow-glass">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm uppercase tracking-[0.28em] text-brand-700">Visual signals</p>
              <h2 className="mt-3 text-2xl font-semibold text-slate-950">Engineering radar comparison</h2>
            </div>
          </div>
          <div className="mt-8 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart outerRadius="90%" data={radarData}>
                <PolarGrid />
                <PolarAngleAxis dataKey="category" />
                <PolarRadiusAxis angle={30} domain={[0, 5]} />
                {analysis.map((candidate, index) => (
                  <Radar
                    key={candidate.id}
                    name={candidate.name}
                    dataKey={`candidate${index}`}
                    stroke={index === 0 ? '#4f46e5' : '#0284c7'}
                    fill={index === 0 ? 'rgba(79,70,229,0.24)' : 'rgba(2,132,199,0.22)'}
                    fillOpacity={0.7}
                  />
                ))}
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="rounded-[2rem] border border-slate-200 bg-white/90 p-6 shadow-glass">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm uppercase tracking-[0.28em] text-brand-700">Problem-solving</p>
              <h2 className="mt-3 text-2xl font-semibold text-slate-950">LeetCode distribution</h2>
            </div>
          </div>
          <div className="mt-8 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={solvedData}>
                <XAxis dataKey="name" tickLine={false} axisLine={false} />
                <YAxis tickLine={false} axisLine={false} />
                <Tooltip />
                <Bar dataKey="Easy" stackId="a" fill="#c7d2fe" />
                <Bar dataKey="Medium" stackId="a" fill="#7dd3fc" />
                <Bar dataKey="Hard" stackId="a" fill="#38bdf8" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="rounded-[2rem] border border-slate-200 bg-white/90 p-8 shadow-glass">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.28em] text-brand-700">AI briefing</p>
            <h2 className="mt-3 text-2xl font-semibold text-slate-950">Generate a candidate summary</h2>
          </div>
          <button
            type="button"
            onClick={handleAIGenerate}
            disabled={aiPending}
            className="inline-flex items-center rounded-2xl bg-brand-700 px-6 py-3 text-sm font-semibold text-white transition hover:bg-brand-800 disabled:opacity-60"
          >
            {aiPending ? 'Generating...' : 'Generate AI summary'}
          </button>
        </div>
        <p className="mt-4 text-sm text-slate-600">Using {aiProvider.toUpperCase()} key stored in settings.</p>
        {aiError ? <p className="mt-4 rounded-3xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{aiError}</p> : null}
        {aiSummary ? <div className="mt-6 whitespace-pre-wrap rounded-3xl border border-slate-200 bg-slate-50 p-6 text-sm text-slate-700">{aiSummary}</div> : null}
      </div>

      <div className="rounded-[2rem] border border-slate-200 bg-white/90 p-8 shadow-glass">
        <div>
          <p className="text-sm uppercase tracking-[0.28em] text-brand-700">Final score</p>
          <h2 className="mt-3 text-2xl font-semibold text-slate-950">Candidate comparison score</h2>
        </div>
        <div className="mt-6 grid gap-4 lg:grid-cols-2">
          {rankedCandidates.map((candidate, index) => (
            <div key={candidate.id} className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.16em] text-slate-500">Rank {index + 1}</p>
                  <p className="mt-2 text-lg font-semibold text-slate-950">{candidate.name}</p>
                </div>
                <div className="text-right">
                  <p className="text-4xl font-semibold text-brand-700">{candidate.score}</p>
                  <p className="text-sm text-slate-500">/100</p>
                </div>
              </div>
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                {Object.entries(candidate.scoreBreakdown).map(([label, value]) => (
                  <div key={label}>
                    <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                      <span>{label}</span>
                      <span>{value}</span>
                    </div>
                    <div className="mt-2 h-2 rounded-full bg-white">
                      <div className="h-2 rounded-full bg-brand-600" style={{ width: `${value}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
