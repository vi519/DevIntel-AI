'use client';

import { useEffect, useState } from 'react';
import { PDFExporter } from '../../components/report/PDFExporter';
import { CandidateAnalysis } from '../../types/candidate';
import { useLocalStorage } from '../../hooks/useLocalStorage';

export default function ReportPage() {
  const [storedAnalysis] = useLocalStorage<CandidateAnalysis[]>('compareo-analysis', []);
  const [analysis, setAnalysis] = useState<CandidateAnalysis[] | null>(null);

  useEffect(() => {
    setAnalysis(storedAnalysis.length ? storedAnalysis : null);
  }, [storedAnalysis]);

  return (
    <main className="main-shell py-16">
      <div className="mb-10">
        <p className="text-sm uppercase tracking-[0.28em] text-brand-700">Report preview</p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight text-slate-950 dark:text-white">Review and export a professional candidate briefing.</h1>
        <p className="mt-4 max-w-2xl text-slate-600 dark:text-slate-300">
          The report preview is a printable summary with candidate profiles, engineering observations, strengths, and interview recommendations.
        </p>
      </div>

      {!analysis ? (
        <div className="rounded-[2rem] border border-slate-200 bg-slate-50 p-12 text-center text-slate-500">
          Run a comparison first on the Candidate Comparison page to preview report content.
        </div>
      ) : (
        <PDFExporter analysis={analysis} />
      )}
    </main>
  );
}
