'use client';

import { useRef, useState } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { CandidateAnalysis } from '../../types/candidate';

type PDFExporterProps = {
  analysis: CandidateAnalysis[];
};

export function PDFExporter({ analysis }: PDFExporterProps) {
  const reportRef = useRef<HTMLDivElement | null>(null);
  const [downloading, setDownloading] = useState(false);

  const handleExport = async () => {
    if (!reportRef.current) {
      return;
    }
    setDownloading(true);
    const canvas = await html2canvas(reportRef.current, { scale: 2, useCORS: true });
    const imageData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({ orientation: 'portrait', unit: 'pt', format: 'a4' });
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const imageWidth = pageWidth - 40;
    const imageHeight = (canvas.height / canvas.width) * imageWidth;
    pdf.addImage(imageData, 'PNG', 20, 20, imageWidth, Math.min(imageHeight, pageHeight - 40));
    pdf.save('compareo-report.pdf');
    setDownloading(false);
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 rounded-[2rem] border border-slate-200 bg-white/90 p-8 shadow-glass sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.28em] text-brand-700">Printable report</p>
          <h2 className="mt-2 text-2xl font-semibold text-slate-950">Download a polished candidate report</h2>
        </div>
        <button
          type="button"
          onClick={handleExport}
          disabled={downloading}
          className="inline-flex items-center rounded-2xl bg-brand-700 px-6 py-3 text-sm font-semibold text-white transition hover:bg-brand-800 disabled:opacity-60"
        >
          {downloading ? 'Preparing PDF...' : 'Export PDF'}
        </button>
      </div>

      <div ref={reportRef} className="space-y-8 rounded-[2rem] border border-slate-200 bg-slate-50 p-8 shadow-glass">
        <section className="space-y-3 border-b border-slate-200 pb-6">
          <h1 className="text-3xl font-semibold text-slate-950">Compareo candidate briefing</h1>
          <p className="text-slate-600">Executive summary, profile signals, comparative insights, and interview guidance for your hiring review.</p>
        </section>

        {analysis.map((candidate) => (
          <section key={candidate.id} className="space-y-4 rounded-[1.75rem] border border-slate-200 bg-white p-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <h2 className="text-2xl font-semibold text-slate-950">{candidate.name}</h2>
              <div className="text-right">
                <p className="text-3xl font-semibold text-brand-700">{candidate.score}/100</p>
                <p className="text-sm text-slate-500">Final score</p>
              </div>
            </div>
            <div className="grid gap-3 rounded-3xl bg-slate-100 p-4 text-sm text-slate-700 sm:grid-cols-4">
              <p>GitHub {candidate.scoreBreakdown.github}</p>
              <p>LeetCode {candidate.scoreBreakdown.leetcode}</p>
              <p>Docs {candidate.scoreBreakdown.documentation}</p>
              <p>Activity {candidate.scoreBreakdown.activity}</p>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-3xl bg-slate-50 p-4">
                <p className="font-semibold text-slate-900">GitHub highlights</p>
                {candidate.github ? (
                  <div className="mt-3 grid gap-3 text-sm text-slate-700 sm:grid-cols-2">
                    <p>{candidate.github.publicRepos} public repos</p>
                    <p>{candidate.github.recentCommitCount} commits in {candidate.github.activityWindowLabel}</p>
                    <p>{candidate.github.commitsPerDay} commits per day</p>
                    <p>{candidate.github.languageBreakdown[0]?.language ?? 'N/A'} top stack</p>
                  </div>
                ) : null}
                <ul className="mt-3 list-disc space-y-2 pl-5 text-slate-600">
                  {candidate.github?.observations.map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
              </div>
              <div className="rounded-3xl bg-slate-50 p-4">
                <p className="font-semibold text-slate-900">LeetCode highlights</p>
                <ul className="mt-3 list-disc space-y-2 pl-5 text-slate-600">
                  {candidate.leetcode?.observations.map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="rounded-3xl bg-slate-100 p-4">
              <p className="font-semibold text-slate-900">Summary</p>
              <p className="mt-3 text-slate-700">{candidate.summary}</p>
            </div>
            {candidate.github ? (
              <div className="rounded-3xl bg-slate-100 p-4">
                <p className="font-semibold text-slate-900">Repositories</p>
                <ul className="mt-3 list-disc space-y-2 pl-5 text-slate-700">
                  {candidate.github.repositoryHighlights.slice(0, 5).map((repo) => (
                    <li key={repo.name}>
                      {repo.name}: {repo.language}, {repo.stars} stars, {repo.forks} forks
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
            <div className="rounded-3xl bg-slate-100 p-4">
              <p className="font-semibold text-slate-900">Interview focus</p>
              <ul className="mt-3 list-disc space-y-2 pl-5 text-slate-700">
                {candidate.interviewFocus.map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
