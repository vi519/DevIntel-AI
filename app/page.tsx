 'use client';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { HiArrowRight, HiSparkles } from 'react-icons/hi2';

export default function HomePage() {
  return (
    <main className="main-shell py-16">
      <div className="relative overflow-hidden rounded-[2rem] border border-white/60 bg-white/80 p-10 shadow-glass backdrop-blur-xl">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(99,102,241,0.18),_transparent_22%),_radial-gradient(circle_at_bottom_right,_rgba(56,189,248,0.14),_transparent_20%)]" />
        <div className="relative grid gap-10 lg:grid-cols-[1.1fr_0.9fr]">
          <section className="space-y-8">
            <div className="inline-flex items-center gap-2 rounded-full border border-brand-200/80 bg-brand-50/70 px-4 py-1 text-sm font-medium text-brand-700">
              <HiSparkles className="h-4 w-4" />
              Evidence-first engineering intelligence
            </div>
            <div className="space-y-6">
              <h1 className="text-5xl font-semibold tracking-tight text-slate-950 dark:text-white sm:text-6xl">
                AI-Powered Engineering Candidate Intelligence
              </h1>
              <p className="max-w-2xl text-lg leading-8 text-slate-600 dark:text-slate-300">
                Compare GitHub and LeetCode profiles to extract meaningful engineering and problem-solving signals for better interview decisions.
              </p>
            </div>
            <div className="flex flex-col gap-4 sm:flex-row">
              <Link href="/comparison" className="inline-flex items-center justify-center rounded-2xl bg-brand-700 px-6 py-3 text-sm font-semibold text-white transition hover:bg-brand-800">
                Start Comparing
                <HiArrowRight className="ml-2 h-4 w-4" />
              </Link>
              <Link href="/report" className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-50">
                Generate Report
              </Link>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-3xl border border-slate-200 bg-slate-50/80 p-5 text-sm">
                <p className="font-semibold text-slate-900">AI summaries</p>
                <p className="mt-2 text-slate-600">Automated insights for engineering strengths and interview focus.</p>
              </div>
              <div className="rounded-3xl border border-slate-200 bg-slate-50/80 p-5 text-sm">
                <p className="font-semibold text-slate-900">GitHub signals</p>
                <p className="mt-2 text-slate-600">Repository health, tech mix, activity, and maturity indicators.</p>
              </div>
              <div className="rounded-3xl border border-slate-200 bg-slate-50/80 p-5 text-sm">
                <p className="font-semibold text-slate-900">Problem-solving</p>
                <p className="mt-2 text-slate-600">LeetCode activity, contest rating, and consistency signals.</p>
              </div>
            </div>
          </section>
          <motion.div
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="rounded-[2rem] border border-slate-200 bg-slate-950/95 p-8 text-white shadow-glass"
          >
            <div className="mb-8 space-y-4 text-slate-100">
              <p className="text-sm uppercase tracking-[0.3em] text-brand-200">Comparison snapshot</p>
              <h2 className="text-3xl font-semibold">From data to confident hiring conversations.</h2>
              <p className="text-slate-400">Build a polished candidate comparison report that highlights engineering tradeoffs without overrating any single signal.</p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-3xl bg-slate-900/90 p-5">
                <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Engineering signal</p>
                <p className="mt-3 text-2xl font-semibold">Strong observable evidence</p>
              </div>
              <div className="rounded-3xl bg-slate-900/90 p-5">
                <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Interview focus</p>
                <p className="mt-3 text-2xl font-semibold">Evidence-backed recommendations</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      <section className="mt-16 grid gap-6 lg:grid-cols-3">
        <div className="card-glass rounded-[2rem] border p-8 shadow-glass">
          <h3 className="text-xl font-semibold">Recruiter-friendly workflow</h3>
          <p className="mt-3 text-slate-600 dark:text-slate-300">Collect candidate profiles, generate side-by-side comparisons, and export polished PDF reports.</p>
        </div>
        <div className="card-glass rounded-[2rem] border p-8 shadow-glass">
          <h3 className="text-xl font-semibold">Modern engineering signals</h3>
          <p className="mt-3 text-slate-600 dark:text-slate-300">Analyze GitHub and LeetCode activity with clear metrics and balanced summaries.</p>
        </div>
        <div className="card-glass rounded-[2rem] border p-8 shadow-glass">
          <h3 className="text-xl font-semibold">AI-powered briefing</h3>
          <p className="mt-3 text-slate-600 dark:text-slate-300">Use your own OpenAI or Gemini key for secure AI insights and candidate briefings.</p>
        </div>
      </section>
    </main>
  );
}
