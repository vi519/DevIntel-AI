'use client';

import Link from 'next/link';

export default function CreditsPage() {
  return (
    <main className="main-shell py-16">
      <div className="rounded-[2rem] border border-slate-200 bg-white/90 p-10 shadow-glass">
        <div className="max-w-3xl space-y-8">
          <p className="text-sm uppercase tracking-[0.28em] text-brand-700">Developer credit</p>
          <h1 className="text-4xl font-semibold tracking-tight text-slate-950">Built by Vineet Mishra</h1>
          <p className="text-lg leading-8 text-slate-600">
            Senior Engineer - Software Development at Accelya with a strong background in React.js, Node.js, Python, and full-stack web development.
            This application is designed to deliver a polished recruiter-friendly candidate intelligence experience based on evidence-based engineering signals.
          </p>
          <div className="grid gap-4 rounded-[1.75rem] border border-slate-200 bg-slate-50 p-6 text-slate-700">
            <p><span className="font-semibold text-slate-950">Bio:</span> Senior Engineer - Software Development at Accelya | React.js | Node.js | Full Stack Developer | Python | JavaScript | 100K+ views on Medium blog.</p>
            <div className="flex flex-wrap gap-4 text-sm">
              <a className="font-semibold text-brand-700 hover:text-brand-800" href="https://github.com/vi519" target="_blank" rel="noreferrer">
                GitHub
              </a>
              <a className="font-semibold text-brand-700 hover:text-brand-800" href="https://www.linkedin.com/in/vineet-mishra-8850981a6/" target="_blank" rel="noreferrer">
                LinkedIn
              </a>
            </div>
          </div>

          <div className="grid gap-6 rounded-[2rem] border border-slate-200 bg-slate-50 p-8">
            <div>
              <h2 className="text-xl font-semibold text-slate-950">Why this page exists</h2>
              <p className="mt-3 text-slate-600">
                The developer credit page gives a clear reference to the author and reflects the product's mission: transparent engineering insights for hiring teams.
              </p>
            </div>
            <div>
              <h2 className="text-xl font-semibold text-slate-950">Features built here</h2>
              <ul className="mt-3 list-disc space-y-2 pl-5 text-slate-600">
                <li>Candidate profile input and validation</li>
                <li>GitHub and LeetCode signal extraction</li>
                <li>AI summary generation with user-provided keys</li>
                <li>Professional PDF export flow</li>
                <li>Responsive, modern recruiter-friendly UI</li>
              </ul>
            </div>
          </div>

          <div className="rounded-[2rem] border border-slate-200 bg-white p-8">
            <h2 className="text-xl font-semibold text-slate-950">Connect with the developer</h2>
            <p className="mt-3 text-slate-600">This project was created as a clean, scalable SaaS prototype for hiring teams who need better candidate comparison intelligence.</p>
            <Link href="/" className="mt-6 inline-flex items-center rounded-2xl bg-brand-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-brand-800">
              Back to home
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
