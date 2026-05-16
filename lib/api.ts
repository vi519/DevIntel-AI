import { CandidateAnalysis, CandidateInput, CommitWindow } from '../types/candidate';
import { ApiResponse } from '../types/analysis';

export async function fetchAnalysis(candidates: CandidateInput[], commitWindow: CommitWindow): Promise<CandidateAnalysis[]> {
  const response = await fetch('/api/analyze', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ candidates, commitWindow })
  });

  const result: ApiResponse<CandidateAnalysis[]> = await response.json();
  if (!response.ok || !result.success || !result.data) {
    throw new Error(result.error || 'Unable to fetch analysis.');
  }

  return result.data;
}
