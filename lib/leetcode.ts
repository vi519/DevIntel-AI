import { LeetCodeAnalysis } from '../types/candidate';

const LEETCODE_GRAPHQL = 'https://leetcode.com/graphql';

const profileQuery = `query userProfile($username: String!) {
  matchedUser(username: $username) {
    username
    realName
    profile {
      ranking
    }
    submitStats {
      acSubmissionNum {
        difficulty
        count
      }
    }
  }
  recentSubmissionList(username: $username, limit: 50) {
    title
    status
    timestamp
  }
}`;

async function fetchJson<T>(body: Record<string, any>): Promise<T | null> {
  try {
    const response = await fetch(LEETCODE_GRAPHQL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json'
      },
      body: JSON.stringify(body)
    });
    if (!response.ok) {
      return null;
    }
    return (await response.json()) as T;
  } catch {
    return null;
  }
}

export async function fetchLeetCodeAnalysis(username: string): Promise<LeetCodeAnalysis | null> {
  const payload = await fetchJson<{ data?: any }>(
    { query: profileQuery, variables: { username } }
  );
  if (!payload?.data?.matchedUser) {
    return null;
  }

  const user = payload.data.matchedUser;
  const counts = user.submitStats?.acSubmissionNum ?? [];
  const solvedTotal = counts.reduce((sum: number, item: any) => sum + (item.count ?? 0), 0);
  const easy = counts.find((item: any) => item.difficulty === 'Easy')?.count ?? 0;
  const medium = counts.find((item: any) => item.difficulty === 'Medium')?.count ?? 0;
  const hard = counts.find((item: any) => item.difficulty === 'Hard')?.count ?? 0;
  const ranking = user.profile?.ranking ? `Top ${Math.ceil(user.profile.ranking)}%` : null;

  const recentSubmissions = payload.data.recentSubmissionList ?? [];
  const activityCount = recentSubmissions.filter((submission: any) => submission.status === 'AC').length;
  const consistency = activityCount >= 8
    ? 'Strong observable evidence of recent problem-solving consistency.'
    : activityCount >= 3
    ? 'Moderate consistent activity in recent LeetCode submissions.'
    : 'Limited recent problem-solving activity on LeetCode.';

  const observations = [
    solvedTotal > 200
      ? 'Strong evidence of established problem-solving exposure.'
      : 'Moderate evidence of algorithmic practice volume.',
    `Distribution: ${easy} easy, ${medium} medium, ${hard} hard problems solved.`,
    ranking ? `LeetCode ranking is ${ranking}.` : 'Public ranking information is limited.',
    consistency
  ];

  return {
    username,
    solvedTotal,
    easy,
    medium,
    hard,
    contestRating: null,
    ranking,
    consistency,
    observations
  };
}
