import type { PageServerLoad } from './$types';
import { generateMantra } from '$lib/utility/greetings.server';

async function fetchGitHubStats(): Promise<{
	lastCommitDate: string | null;
	weeklyActivity: Array<{ total: number; week: number }>;
} | null> {
	try {
		// Use GitHub Stats API — returns 52 weeks of commit counts (1 full year)
		const statsRes = await fetch(
			'https://api.github.com/repos/Michael-Obele/Svelte-MiniApps/stats/commit_activity',
			{ headers: { Accept: 'application/vnd.github.v3+json' } }
		);
		if (!statsRes.ok) return fallbackFromCommits();

		const stats: Array<{ total: number; week: number }> = await statsRes.json();
		if (!Array.isArray(stats) || stats.length === 0) return fallbackFromCommits();

		// Pass both total AND the week timestamp so the component can
		// accurately place each week into the right month
		const weeklyActivity = stats.map((w) => ({ total: w.total, week: w.week }));

		// Last commit date from the most recent commit (separate call, lightweight)
		const lastCommitRes = await fetch(
			'https://api.github.com/repos/Michael-Obele/Svelte-MiniApps/commits?per_page=1',
			{ headers: { Accept: 'application/vnd.github.v3+json' } }
		);
		let lastCommitDate: string | null = null;
		if (lastCommitRes.ok) {
			const [latest]: Array<{ commit: { author: { date: string } } }> = await lastCommitRes.json();
			lastCommitDate = latest?.commit?.author?.date ?? null;
		}

		return { lastCommitDate, weeklyActivity };
	} catch {
		return null;
	}
}

/** Fallback: fetch ALL commits via pagination, filter CI noise */
async function fallbackFromCommits(): Promise<{
	lastCommitDate: string | null;
	weeklyActivity: Array<{ total: number; week: number }>;
} | null> {
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
