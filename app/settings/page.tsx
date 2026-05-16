'use client';

import { useState } from 'react';
import { useLocalStorage } from '../../hooks/useLocalStorage';

export default function SettingsPage() {
  const [provider, setProvider] = useLocalStorage<'openai' | 'gemini'>('compareo-ai-provider', 'openai');
  const [apiKey, setApiKey] = useLocalStorage('compareo-ai-key', '');
  const [draftKey, setDraftKey] = useState(apiKey ?? '');
  const [message, setMessage] = useState('');

  const saveSettings = () => {
    setApiKey(draftKey);
    setMessage('Saved AI API key locally in your browser.');
  };

  return (
    <main className="main-shell py-16">
      <div className="mb-10 space-y-4">
        <p className="text-sm uppercase tracking-[0.28em] text-brand-700">Settings</p>
          <h1 className="text-4xl font-semibold tracking-tight text-slate-950 dark:text-white">ChatGPT, Gemini, and report preferences</h1>
        <p className="max-w-2xl text-slate-600 dark:text-slate-300">
          Store your own OpenAI or Gemini API key for on-demand candidate summaries and interview recommendation generation.
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        <div className="card-glass rounded-[2rem] border p-8 shadow-glass">
          <label className="mb-4 block text-sm font-semibold text-slate-900">AI Provider</label>
          <select
            value={provider}
            onChange={(event) => setProvider(event.target.value as 'openai' | 'gemini')}
            className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition"
          >
            <option value="openai">ChatGPT / OpenAI</option>
            <option value="gemini">Gemini</option>
          </select>

          <label className="mt-8 block text-sm font-semibold text-slate-900">AI API key</label>
          <input
            type="password"
            value={draftKey}
            onChange={(event) => setDraftKey(event.target.value)}
            placeholder="sk-... or Gemini API key"
            className="mt-2 w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-brand-500"
          />
          <button
            className="mt-6 inline-flex items-center justify-center rounded-2xl bg-brand-700 px-6 py-3 text-sm font-semibold text-white transition hover:bg-brand-800"
            onClick={saveSettings}
          >
            Save settings
          </button>
          {message ? <p className="mt-4 text-sm text-brand-700">{message}</p> : null}
        </div>
        <div className="card-glass rounded-[2rem] border p-8 shadow-glass">
          <h2 className="text-xl font-semibold">Privacy and usage</h2>
          <p className="mt-4 text-slate-600 dark:text-slate-300">
            Your API key is stored only in your browser local storage. No AI credentials are saved on a backend server in this version.
          </p>
          <p className="mt-4 text-slate-600 dark:text-slate-300">
            If you need a dedicated server proxy later, the architecture supports adding secure endpoints without changing the client experience.
          </p>
        </div>
      </div>
    </main>
  );
}
