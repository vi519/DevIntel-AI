'use client';

import { CandidateInput } from '../../types/candidate';
import { HiPlusCircle, HiTrash } from 'react-icons/hi2';

type CandidateFormProps = {
  candidates: CandidateInput[];
  setCandidates: React.Dispatch<React.SetStateAction<CandidateInput[]>>;
};

export default function CandidateForm({ candidates, setCandidates }: CandidateFormProps) {
  const updateCandidate = (id: string, field: keyof CandidateInput, value: string) => {
    setCandidates((current) => current.map((entry) => (entry.id === id ? { ...entry, [field]: value } : entry)));
  };

  const addCandidate = () => {
    setCandidates((current) => [
      ...current,
      { id: `candidate-${Date.now()}`, name: '', github: '', leetcode: '' }
    ]);
  };

  const removeCandidate = (id: string) => {
    setCandidates((current) => current.filter((entry) => entry.id !== id));
  };

  return (
    <div className="space-y-6 rounded-[2rem] border border-slate-200 bg-white/90 p-8 shadow-glass">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-[0.28em] text-brand-700">Candidate profiles</p>
          <h2 className="mt-2 text-2xl font-semibold text-slate-950">Add profiles to compare</h2>
        </div>
        <button
          type="button"
          onClick={addCandidate}
          className="inline-flex items-center rounded-2xl bg-brand-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-800"
        >
          <HiPlusCircle className="mr-2 h-4 w-4" />
          Add candidate
        </button>
      </div>

      <div className="space-y-6">
        {candidates.map((candidate, index) => (
          <div key={candidate.id} className="rounded-[2rem] border border-slate-200 bg-slate-50 p-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-lg font-semibold text-slate-950">Candidate {index + 1}</p>
                <p className="text-sm text-slate-500">Provide GitHub and LeetCode usernames for analysis.</p>
              </div>
              {candidates.length > 1 ? (
                <button
                  type="button"
                  onClick={() => removeCandidate(candidate.id)}
                  className="inline-flex items-center rounded-2xl bg-red-100 px-3 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-200"
                >
                  <HiTrash className="mr-2 h-4 w-4" />
                  Remove
                </button>
              ) : null}
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-3">
              <label className="space-y-2 text-sm text-slate-700">
                <span>Name</span>
                <input
                  value={candidate.name}
                  onChange={(event) => updateCandidate(candidate.id, 'name', event.target.value)}
                  placeholder="Full name or role"
                  className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 outline-none transition focus:border-brand-500"
                />
              </label>
              <label className="space-y-2 text-sm text-slate-700">
                <span>GitHub username</span>
                <input
                  value={candidate.github}
                  onChange={(event) => updateCandidate(candidate.id, 'github', event.target.value)}
                  placeholder="github.com/username"
                  className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 outline-none transition focus:border-brand-500"
                />
              </label>
              <label className="space-y-2 text-sm text-slate-700">
                <span>LeetCode username</span>
                <input
                  value={candidate.leetcode}
                  onChange={(event) => updateCandidate(candidate.id, 'leetcode', event.target.value)}
                  placeholder="leetcode.com/username"
                  className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 outline-none transition focus:border-brand-500"
                />
              </label>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
