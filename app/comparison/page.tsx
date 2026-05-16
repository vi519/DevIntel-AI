'use client';

import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import CandidateForm from '../../components/candidate/CandidateForm';
import ComparisonDashboard from '../../components/dashboard/ComparisonDashboard';
import { CandidateInput, CandidateAnalysis, CommitWindow } from '../../types/candidate';
import { fetchAnalysis } from '../../lib/api';
import { useLocalStorage } from '../../hooks/useLocalStorage';

export default function ComparisonPage() {
  const [candidates, setCandidates] = useState<CandidateInput[]>([
    { id: 'candidate-1', name: '', github: '', leetcode: '' }
  ]);
  const [analysis, setAnalysis] = useState<CandidateAnalysis[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [aiProvider, setAiProvider] = useLocalStorage<'openai' | 'gemini'>('compareo-ai-provider', 'openai');
  const [apiKey, setApiKey] = useLocalStorage('compareo-ai-key', '');
  const [commitWindow, setCommitWindow] = useState<CommitWindow>('2y');

  const validCandidates = useMemo(
    () => candidates.filter((candidate) => candidate.github.trim() || candidate.leetcode.trim()),
    [candidates]
  );

  async function handleAnalyze() {
    setError(null);
    if (!validCandidates.length) {
      setError('Add at least one GitHub or LeetCode profile to analyze.');
      return;
    }

    setLoading(true);
    try {
      const response = await fetchAnalysis(validCandidates, commitWindow);
      setAnalysis(response);
      window.localStorage.setItem('compareo-analysis', JSON.stringify(response));
    } catch (err) {
      setError('Unable to retrieve candidate signals. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="main-shell py-16">
      <div className="mb-10 grid gap-8 lg:grid-cols-[0.9fr_0.7fr]">
        <div className="space-y-4">
          <p className="text-sm uppercase tracking-[0.28em] text-brand-700">Candidate comparison</p>
          <h1 className="text-4xl font-semibold tracking-tight text-slate-950 dark:text-white">Build a side-by-side candidate intelligence brief.</h1>
          <p className="max-w-2xl text-slate-600 dark:text-slate-300">
            Enter GitHub and LeetCode usernames for multiple candidates, then generate an evidence-based analysis and comparison dashboard.
          </p>
        </div>
        <div className="rounded-[2rem] border border-slate-200 bg-white/85 p-8 shadow-glass backdrop-blur-xl">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">What this page does</p>
          <ul className="mt-6 grid gap-3 text-slate-600 dark:text-slate-300">
            <li>Collect profiles with dynamic candidate cards</li>
            <li>Fetch public GitHub and LeetCode signals</li>
            <li>Prepare the data for report generation</li>
          </ul>
        </div>
      </div>

      <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-6">
          <CandidateForm candidates={candidates} setCandidates={setCandidates} />
          <div className="rounded-[2rem] border border-slate-200 bg-white/90 p-6 shadow-glass">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-sm uppercase tracking-[0.28em] text-brand-700">Commit comparison</p>
                <h2 className="mt-2 text-xl font-semibold text-slate-950">Choose activity window</h2>
                <p className="mt-2 text-sm text-slate-500">GitHub commits are compared across the selected public repo history window.</p>
              </div>
              <label className="w-full space-y-2 text-sm text-slate-700 sm:w-56">
                <span>Window</span>
                <select
                  value={commitWindow}
                  onChange={(event) => setCommitWindow(event.target.value as CommitWindow)}
                  className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-brand-500"
                >
                  <option value="6m">Last 6 months</option>
                  <option value="1y">Last 1 year</option>
                  <option value="2y">Last 2 years</option>
                  <option value="3y">Last 3 years</option>
                  <option value="5y">Last 5 years</option>
                </select>
              </label>
            </div>
          </div>
          <div className="rounded-[2rem] border border-slate-200 bg-white/90 p-6 shadow-glass">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-sm uppercase tracking-[0.28em] text-brand-700">AI analysis</p>
                <h2 className="mt-2 text-xl font-semibold text-slate-950">Use your ChatGPT or Gemini key</h2>
                <p className="mt-2 text-sm text-slate-500">Stored locally in this browser and used only when you generate an AI summary.</p>
              </div>
            </div>
            <div className="mt-5 grid gap-4 sm:grid-cols-[0.45fr_1fr]">
              <label className="space-y-2 text-sm text-slate-700">
                <span>Provider</span>
                <select
                  value={aiProvider}
                  onChange={(event) => setAiProvider(event.target.value as 'openai' | 'gemini')}
                  className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-brand-500"
                >
                  <option value="openai">ChatGPT / OpenAI</option>
                  <option value="gemini">Gemini</option>
                </select>
              </label>
              <label className="space-y-2 text-sm text-slate-700">
                <span>API key</span>
                <input
                  type="password"
                  value={apiKey}
                  onChange={(event) => setApiKey(event.target.value)}
                  placeholder={aiProvider === 'openai' ? 'sk-...' : 'Gemini API key'}
                  className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-brand-500"
                />
              </label>
            </div>
          </div>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <button
              className="inline-flex items-center justify-center rounded-2xl bg-brand-700 px-6 py-3 text-sm font-semibold text-white transition hover:bg-brand-800 disabled:cursor-not-allowed disabled:opacity-60"
              onClick={handleAnalyze}
              disabled={loading}
            >
              {loading ? (
                <span className="inline-flex items-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Analyzing profiles
                </span>
              ) : (
                'Generate comparison'
              )}
            </button>
            <p className="text-sm text-slate-500">Analysis uses public GitHub and LeetCode data only.</p>
          </div>
          {error ? <p className="rounded-3xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p> : null}
        </div>
        <div className="card-glass rounded-[2rem] border p-8 shadow-glass">
          <h2 className="text-xl font-semibold">Tips for strong signals</h2>
          <div className="mt-5 space-y-4 text-sm text-slate-600 dark:text-slate-300">
            <p>Look for consistent contribution activity, readable README documentation, and evidence of testing.</p>
            <p>Balance LeetCode performance as a problem-solving signal, not a final hiring verdict.</p>
            <p>Use AI summaries to translate observable engineering evidence into interview focus suggestions.</p>
          </div>
        </div>
      </motion.section>

      <section className="mt-12">
        {loading ? (
          <div className="grid gap-4 lg:grid-cols-2">
            {[1, 2].map((item) => (
              <div key={item} className="h-64 rounded-[2rem] border border-slate-200 bg-slate-50 p-6 shadow-glass animate-pulse" />
            ))}
          </div>
        ) : analysis ? (
          <ComparisonDashboard analysis={analysis} aiProvider={aiProvider} apiKey={apiKey} />
        ) : (
          <div className="rounded-[2rem] border border-dashed border-slate-300 bg-slate-50 p-12 text-center text-slate-500">
            Add candidates and generate your first comparison analysis.
          </div>
        )}
      </section>
    </main>
  );
}
