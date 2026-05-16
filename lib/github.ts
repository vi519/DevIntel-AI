import { CommitWindow, GithubAnalysis } from '../types/candidate';

const GH_API = 'https://api.github.com';
const COMMIT_SCAN_REPO_LIMIT = 8;
const COMMIT_SCAN_PAGE_LIMIT = 5;
const COMMIT_WINDOWS: Record<CommitWindow, { days: number; label: string }> = {
  '6m': { days: 183, label: '6 months' },
  '1y': { days: 365, label: '1 year' },
  '2y': { days: 730, label: '2 years' },
  '3y': { days: 1095, label: '3 years' },
  '5y': { days: 1825, label: '5 years' }
};

type GithubRepo = {
  name: string;
  html_url: string;
  description: string | null;
  language: string | null;
  stargazers_count: number;
  forks_count: number;
  pushed_at: string;
  fork: boolean;
};

type GithubCommit = {
  commit?: {
    author?: {
      date?: string;
    };
    committer?: {
      date?: string;
    };
  };
};

async function fetchJson<T>(url: string): Promise<T | null> {
  try {
    const response = await fetch(url, {
      headers: { Accept: 'application/vnd.github.v3+json' }
    });
    if (!response.ok) {
      return null;
    }
    return (await response.json()) as T;
  } catch {
    return null;
  }
}

async function hasReadme(owner: string, repo: string) {
  const response = await fetch(`${GH_API}/repos/${owner}/${repo}/readme`, {
    headers: { Accept: 'application/vnd.github.v3+json' }
  });
  return response.ok;
}

function normalizeGithubUsername(input: string) {
  const trimmed = input.trim();
  const withoutUrl = trimmed
    .replace(/^https?:\/\/(www\.)?github\.com\//i, '')
    .replace(/^github\.com\//i, '');
  return withoutUrl.split(/[/?#]/)[0].replace(/^@/, '');
}

async function fetchRepoCommits(owner: string, repo: string, since: string) {
  const pages: GithubCommit[][] = [];

  for (let page = 1; page <= COMMIT_SCAN_PAGE_LIMIT; page += 1) {
    const commits = await fetchJson<GithubCommit[]>(
      `${GH_API}/repos/${owner}/${repo}/commits?author=${owner}&since=${since}&per_page=100&page=${page}`
    );

    if (!commits?.length) break;
    pages.push(commits);
    if (commits.length < 100) break;
  }

  return pages.flat();
}

function getCommitWindow(window: CommitWindow = '2y') {
  return COMMIT_WINDOWS[window] ?? COMMIT_WINDOWS['2y'];
}

async function buildCommitSignals(username: string, repos: GithubRepo[], commitWindow: CommitWindow) {
  const windowConfig = getCommitWindow(commitWindow);
  const today = new Date();
  const start = new Date(today);
  start.setDate(today.getDate() - (windowConfig.days - 1));
  start.setHours(0, 0, 0, 0);
  const since = start.toISOString();

  const monthCounts = new Map<string, number>();
  for (let index = 0; index < windowConfig.days; index += 1) {
    const date = new Date(start);
    date.setDate(start.getDate() + index);
    monthCounts.set(date.toISOString().slice(0, 7), 0);
  }

  const repoCounts = new Map<string, number>();
  const reposToScan = repos
    .filter((repo) => !repo.fork)
    .filter((repo) => new Date(repo.pushed_at) >= start)
    .slice(0, COMMIT_SCAN_REPO_LIMIT);

  const commitResults = await Promise.all(
    reposToScan.map(async (repo) => ({
      repo: repo.name,
      commits: await fetchRepoCommits(username, repo.name, since)
    }))
  );

  const activeDays = new Set<string>();
  let recentCommitCount = 0;

  commitResults.forEach((result) => {
    result.commits.forEach((commit) => {
      const commitDate = new Date(commit.commit?.author?.date ?? commit.commit?.committer?.date ?? '');
      if (Number.isNaN(commitDate.getTime()) || commitDate < start) return;

      const monthKey = commitDate.toISOString().slice(0, 7);
      const dayKey = commitDate.toISOString().slice(0, 10);

      recentCommitCount += 1;
      activeDays.add(dayKey);
      monthCounts.set(monthKey, (monthCounts.get(monthKey) ?? 0) + 1);
      repoCounts.set(result.repo, (repoCounts.get(result.repo) ?? 0) + 1);
    });
  });

  const commitActivity = Array.from(monthCounts.entries()).map(([date, commits]) => ({ date, commits }));
  const activeCommitDays = activeDays.size;
  const busiestRepo = Array.from(repoCounts.entries()).sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;

  return {
    recentCommitCount,
    commitsPerDay: Number((recentCommitCount / windowConfig.days).toFixed(2)),
    activeCommitDays,
    commitActivity,
    busiestRepo,
    activityWindowDays: windowConfig.days,
    activityWindowLabel: windowConfig.label
  };
}

export async function fetchGithubAnalysis(username: string, commitWindow: CommitWindow = '2y'): Promise<GithubAnalysis | null> {
  const normalizedUsername = normalizeGithubUsername(username);
  const profile = await fetchJson<{ login: string; name: string; avatar_url: string; public_repos: number; created_at: string; updated_at: string }>(
    `${GH_API}/users/${normalizedUsername}`
  );
  if (!profile) return null;

  const repos = await fetchJson<GithubRepo[]>(
    `${GH_API}/users/${normalizedUsername}/repos?per_page=100&type=owner&sort=updated`
  );
  if (!repos) return null;

  const topRepos = repos.slice(0, 5);
  const readmeChecks = await Promise.all(topRepos.map((repo) => hasReadme(normalizedUsername, repo.name)));
  const readmeCount = readmeChecks.filter(Boolean).length;
  const commitSignals = await buildCommitSignals(normalizedUsername, repos, commitWindow);

  const totalStars = repos.reduce((sum, repo) => sum + (repo.stargazers_count ?? 0), 0);
  const languageMap = repos.reduce<Record<string, number>>((map, repo) => {
    const language = repo.language || 'Other';
    map[language] = (map[language] || 0) + 1;
    return map;
  }, {});
  const topLanguages = Object.entries(languageMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([lang]) => lang);
  const languageBreakdown = Object.entries(languageMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([language, count]) => ({
      language,
      count,
      percentage: repos.length ? Math.round((count / repos.length) * 100) : 0
    }));
  const repositoryHighlights = topRepos.map((repo) => ({
    name: repo.name,
    url: repo.html_url,
    language: repo.language || 'Other',
    stars: repo.stargazers_count ?? 0,
    forks: repo.forks_count ?? 0,
    pushedAt: repo.pushed_at,
    description: repo.description
  }));

  const typeScriptCount = repos.filter((repo) => repo.language === 'TypeScript').length;
  const typeScriptRatio = repos.length ? `${Math.round((typeScriptCount / repos.length) * 100)}%` : '0%';

  const hasTestSignals = repos.some((repo) => /test|spec|jest|mocha|chai/i.test(repo.name));
  const testSignal = hasTestSignals
    ? 'Moderate observable evidence of test awareness in repository metadata.'
    : 'Limited observable evidence of explicit test suite naming in public repository metadata.';

  const recentRepoCount = repos.filter((repo) => {
    const pushed = new Date(repo.pushed_at).getTime();
    return Date.now() - pushed < 1000 * 60 * 60 * 24 * 120;
  }).length;
  const commitConsistency =
    commitSignals.activeCommitDays >= Math.round(commitSignals.activityWindowDays * 0.11)
      ? `Strong ${commitSignals.activityWindowLabel} commit rhythm: ${commitSignals.recentCommitCount} public commits across ${commitSignals.activeCommitDays} active days.`
      : commitSignals.activeCommitDays >= Math.round(commitSignals.activityWindowDays * 0.03)
      ? `Moderate ${commitSignals.activityWindowLabel} commit rhythm: ${commitSignals.recentCommitCount} public commits across ${commitSignals.activeCommitDays} active days.`
      : recentRepoCount / Math.max(repos.length, 1) > 0.4
      ? 'Strong observable evidence of regular repository updates in recent months.'
      : `Limited public commit activity across the ${commitSignals.activityWindowLabel} repo scan.`;

  const maturitySignal = totalStars > 50 || topRepos.some((repo) => repo.forks_count > 20)
    ? 'Strong observable evidence of mature shared projects.'
    : 'Moderate observable evidence of early-stage or smaller public projects.';

  const frontEndScore = ['TypeScript', 'JavaScript', 'CSS', 'HTML'].filter((lang) => topLanguages.includes(lang)).length;
  const backEndScore = ['Python', 'Java', 'Go', 'Ruby', 'Rust', 'PHP'].filter((lang) => topLanguages.includes(lang)).length;

  const observations = [
    totalStars > 30
      ? 'Strong observable evidence of community interest in public repositories.'
      : 'Moderate observable evidence of public GitHub traction.',
    `Top languages include ${topLanguages.join(', ')}.`,
    `Most-used stack by repo count: ${languageBreakdown.map((item) => `${item.language} ${item.percentage}%`).join(', ')}.`,
    `${commitSignals.activityWindowLabel} public commit pace is ${commitSignals.commitsPerDay} commits per day.`,
    commitSignals.busiestRepo ? `Most active repo in the ${commitSignals.activityWindowLabel} commit scan: ${commitSignals.busiestRepo}.` : `No public commits were visible in the ${commitSignals.activityWindowLabel} commit scan.`,
    `README coverage on top repositories is ${readmeCount} of ${topRepos.length}.`,
    typeScriptCount > 0 ? 'TypeScript usage is present, indicating modern tooling.' : 'TypeScript usage is limited in public repositories.',
    testSignal,
    commitConsistency
  ];

  return {
    login: profile.login,
    name: profile.name || profile.login,
    avatarUrl: profile.avatar_url,
    publicRepos: profile.public_repos,
    totalStars,
    topLanguages,
    languageBreakdown,
    repositoryHighlights,
    ...commitSignals,
    readmeCoverage: `${readmeCount}/${topRepos.length}`,
    typeScriptRatio,
    testSignal,
    commitConsistency,
    projectMaturity: maturitySignal,
    frontEndScore,
    backEndScore,
    observations
  };
}
