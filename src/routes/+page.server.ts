import type { PageServerLoad } from './$types';
import { generateMantra } from '$lib/utility/greetings.server';

// ─── In-memory cache ───────────────────────────────────────────
// GitHub's unauthenticated API allows 60 requests/hour per IP.
// Caching avoids hitting the rate limit on every SSR page load.
// The data is public (repo stats), so shared across all users is safe.

type GitHubStatsData = {
	lastCommitDate: string | null;
	weeklyActivity: Array<{ total: number; week: number }>;
};

let cachedStats: GitHubStatsData | null = null;
let cacheTimestamp = 0;
const STATS_TTL = 60 * 60 * 1000; // 1 hour — weekly stats change slowly

let cachedCommitDate: string | null = null;
let commitDateTimestamp = 0;
const COMMIT_DATE_TTL = 5 * 60 * 1000; // 5 minutes — last commit changes more often

async function fetchGitHubStats(): Promise<GitHubStatsData | null> {
	const now = Date.now();

	// Return cached data if still fresh — zero API calls
	if (cachedStats && now - cacheTimestamp < STATS_TTL) {
		// Still refresh lastCommitDate if its cache is stale (cheap 1-commit API)
		if (!cachedCommitDate || now - commitDateTimestamp >= COMMIT_DATE_TTL) {
			const fresh = await fetchLastCommitDate();
			if (fresh) {
				cachedCommitDate = fresh;
				commitDateTimestamp = now;
			}
		}
		return { ...cachedStats, lastCommitDate: cachedCommitDate ?? cachedStats.lastCommitDate };
	}

	try {
		// Primary: GitHub Stats API — 52 weeks of commit counts
		const statsRes = await fetch(
			'https://api.github.com/repos/Michael-Obele/Svelte-MiniApps/stats/commit_activity',
			{ headers: { Accept: 'application/vnd.github.v3+json' } }
		);

		if (statsRes.ok) {
			const stats: Array<{ total: number; week: number }> = await statsRes.json();
			if (Array.isArray(stats) && stats.length > 0) {
				const weeklyActivity = stats.map((w) => ({ total: w.total, week: w.week }));

				const lastCommitDate = (await fetchLastCommitDate()) ?? null;

				cachedStats = { lastCommitDate, weeklyActivity };
				cacheTimestamp = now;
				if (lastCommitDate) {
					cachedCommitDate = lastCommitDate;
					commitDateTimestamp = now;
				}
				return cachedStats;
			}
		}

		// Fallback: paginated commits API
		const fallback = await fallbackFromCommits();
		if (fallback) {
			cachedStats = fallback;
			cacheTimestamp = now;
			if (fallback.lastCommitDate) {
				cachedCommitDate = fallback.lastCommitDate;
				commitDateTimestamp = now;
			}
			return fallback;
		}

		// If everything fails, return stale cache if we have it
		return cachedStats;
	} catch {
		// Return stale data rather than nothing
		return cachedStats;
	}
}

async function fetchLastCommitDate(): Promise<string | null> {
	try {
		const res = await fetch(
			'https://api.github.com/repos/Michael-Obele/Svelte-MiniApps/commits?per_page=1',
			{ headers: { Accept: 'application/vnd.github.v3+json' } }
		);
		if (!res.ok) return null;
		const [latest]: Array<{ commit: { author: { date: string } } }> = await res.json();
		return latest?.commit?.author?.date ?? null;
	} catch {
		return null;
	}
}

/** Fallback: paginate through all commits within 52-week window */
async function fallbackFromCommits(): Promise<GitHubStatsData | null> {
	try {
		// Paginate through all commits within the last 52 weeks
		const ALL_WEEKS = 52;
		const cutoff = Date.now() - ALL_WEEKS * 7 * 24 * 60 * 60 * 1000;

		let allCommits: Array<{
			commit: { author: { date: string }; message: string };
			author: { login: string } | null;
		}> = [];

		let page = 1;
		let done = false;
		while (!done && page <= 20) {
			const res = await fetch(
				`https://api.github.com/repos/Michael-Obele/Svelte-MiniApps/commits?per_page=100&page=${page}`,
				{ headers: { Accept: 'application/vnd.github.v3+json' } }
			);
			if (!res.ok) break;

			const pageCommits: typeof allCommits = await res.json();
			if (pageCommits.length === 0) break;

			allCommits = allCommits.concat(pageCommits);

			// Stop if we've passed the 52-week cutoff
			const oldest = new Date(pageCommits[pageCommits.length - 1].commit.author.date).getTime();
			if (oldest < cutoff || pageCommits.length < 100) {
				done = true;
			}
			page++;
		}

		if (allCommits.length === 0) return null;

		const lastCommitDate = allCommits[0]?.commit?.author?.date ?? null;

		// Filter out CI auto commits
		const real = allCommits.filter((c) => {
			const msg = c.commit.message;
			if (msg.includes('[skip ci]')) return false;
			if (c.author?.login === 'actions-user') return false;
			return true;
		});

		const now = Date.now();
		// Build 52-week array as {total, week} objects
		const weeklyActivity: Array<{ total: number; week: number }> = [];
		for (let i = 0; i < ALL_WEEKS; i++) {
			// Week timestamp: Sunday of each week, counting back 52..1 weeks
			const sundayMs = now - (ALL_WEEKS - i) * 7 * 24 * 60 * 60 * 1000;
			weeklyActivity.push({ total: 0, week: Math.floor(sundayMs / 1000) });
		}

		for (const c of real) {
			const date = new Date(c.commit.author.date).getTime();
			const weekIndex = Math.floor((now - date) / (7 * 24 * 60 * 60 * 1000));
			if (weekIndex >= 0 && weekIndex < ALL_WEEKS) {
				weeklyActivity[ALL_WEEKS - 1 - weekIndex].total++;
			}
		}

		return { lastCommitDate, weeklyActivity };
	} catch {
		return null;
	}
}

// Note: Svelte Load function
export const load: PageServerLoad = async (event) => {
	const github = await fetchGitHubStats();
	return {
		user: event.locals.user,
		mantra: generateMantra(),
		github
	};
};
