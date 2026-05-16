import { CandidateAnalysis, GithubAnalysis, LeetCodeAnalysis } from '../types/candidate';

type AiProvider = 'openai' | 'gemini';

export type AiRequest = {
  provider: AiProvider;
  apiKey: string;
  analysis: CandidateAnalysis[];
};

function buildPrompt(candidate: CandidateAnalysis) {
  return `Review the candidate data below and provide a concise professional engineering summary, strengths, potential gaps, and interview focus recommendations. Use evidence-based language and avoid assigning absolute rankings.

Candidate: ${candidate.name}
Final score:
- Overall: ${candidate.score}/100
- GitHub: ${candidate.scoreBreakdown.github}/100
- LeetCode: ${candidate.scoreBreakdown.leetcode}/100
- Documentation: ${candidate.scoreBreakdown.documentation}/100
- Activity: ${candidate.scoreBreakdown.activity}/100

GitHub analysis:
- Public repos: ${candidate.github?.publicRepos ?? 'N/A'}
- Stars: ${candidate.github?.totalStars ?? 'N/A'}
- Languages: ${candidate.github?.topLanguages.join(', ') ?? 'N/A'}
- Most-used stack: ${candidate.github?.languageBreakdown.map((item) => `${item.language} ${item.percentage}%`).join(', ') ?? 'N/A'}
- Commit window: ${candidate.github?.activityWindowLabel ?? 'N/A'}
- Window commits: ${candidate.github?.recentCommitCount ?? 'N/A'}
- Commits per day: ${candidate.github?.commitsPerDay ?? 'N/A'}
- Active commit days: ${candidate.github?.activeCommitDays ?? 'N/A'}
- Most active recent repo: ${candidate.github?.busiestRepo ?? 'N/A'}
- README coverage: ${candidate.github?.readmeCoverage ?? 'N/A'}
- TypeScript ratio: ${candidate.github?.typeScriptRatio ?? 'N/A'}
- Project maturity: ${candidate.github?.projectMaturity ?? 'N/A'}
- Testing signal: ${candidate.github?.testSignal ?? 'N/A'}
- Commitment consistency: ${candidate.github?.commitConsistency ?? 'N/A'}

LeetCode analysis:
- Solved total: ${candidate.leetcode?.solvedTotal ?? 'N/A'}
- Easy: ${candidate.leetcode?.easy ?? 'N/A'}
- Medium: ${candidate.leetcode?.medium ?? 'N/A'}
- Hard: ${candidate.leetcode?.hard ?? 'N/A'}
- Ranking: ${candidate.leetcode?.ranking ?? 'N/A'}
- Consistency: ${candidate.leetcode?.consistency ?? 'N/A'}

Provide:
1. Executive summary
2. Strengths
3. Potential gaps
4. Interview focus recommendations

Respond in short paragraphs and keep the tone professional.`;
}

export async function generateAiSummary(request: AiRequest): Promise<string> {
  if (!request.apiKey) {
    return 'AI key not available. Provide your OpenAI or Gemini key in settings to generate candidate summaries.';
  }

  const prompt = request.analysis
    .map((candidate) => buildPrompt(candidate))
    .join('\n\n---\n\n');

  if (request.provider === 'openai') {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${request.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 650,
        temperature: 0.3
      })
    });

    if (!response.ok) {
      throw new Error('AI provider returned an error.');
    }

    const json = await response.json();
    return json.choices?.[0]?.message?.content ?? 'Unable to generate AI summary.';
  }

  if (request.provider === 'gemini') {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${request.apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [
          {
            role: 'user',
            parts: [{ text: prompt }]
          }
        ],
        generationConfig: {
          maxOutputTokens: 650,
          temperature: 0.3
        }
      })
    });

    if (!response.ok) {
      throw new Error('Gemini provider returned an error.');
    }

    const json = await response.json();
    return json.candidates?.[0]?.content?.parts?.[0]?.text ?? 'Unable to generate AI summary.';
  }

  return 'Unsupported provider selected.';
}
