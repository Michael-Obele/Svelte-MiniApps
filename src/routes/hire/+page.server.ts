import type { PageServerLoad } from './$types';

// ─── GitHub live receipts for the /hire machine ─────────────────────────────
// Every number rendered by the step row must be a live receipt: fetched from
// GitHub's public API with a 1-hour TTL cache (unauthenticated limit is 60
// req/hr per IP). On failure we serve the last good snapshot; with no snapshot
// at all the page renders a "signal lost" state instead of invented numbers.

type Week = { commits: number; week: number };
type RepoStat = { name: string; stars: number; forks: number };

type HireData = {
	weeks: Week[]; // last 16 weeks of commit activity
	publicRepos: number | null;
	followers: number | null;
	lastCommitDate: string | null;
	miniAppsCommits: number | null;
	repos: RepoStat[];
};

let cached: HireData | null = null;
let cacheTimestamp = 0;
const TTL = 60 * 60 * 1000; // 1 hour

const API = 'https://api.github.com';
const GH = { Accept: 'application/vnd.github.v3+json' } as const;

const KEY_REPOS = [
	'Svelte-MiniApps',
	'VaultNote',
	'shadcn-svelte-mcp',
	'sveltekit-api-gen',
	'cinder',
	'svelte-idb'
];

/** Parse `Link: ...page=N>; rel="last"` to get the total commit count. */
function lastPageFromLink(link: string | null): number | null {
	if (!link) return null;
	const m = link.match(/page=(\d+)>;\s*rel="last"/);
	return m ? Number(m[1]) : null;
}

async function fetchAll(): Promise<HireData> {
	const [activityRes, userRes, reposRes, commitsRes] = await Promise.all([
		fetch(`${API}/repos/Michael-Obele/Svelte-MiniApps/stats/commit_activity`, { headers: GH }),
		fetch(`${API}/users/Michael-Obele`, { headers: GH }),
		fetch(`${API}/users/Michael-Obele/repos?per_page=100&sort=pushed`, { headers: GH }),
		fetch(`${API}/repos/Michael-Obele/Svelte-MiniApps/commits?per_page=1`, { headers: GH })
	]);

	if (!activityRes.ok || !userRes.ok) throw new Error('GitHub API rejected the request');

	const activity = (await activityRes.json()) as Array<{ total: number; week: number }>;
	const user = (await userRes.json()) as { public_repos: number; followers: number };
	const repos = (await reposRes.json()) as Array<{
		name: string;
		stargazers_count: number;
		forks_count: number;
	}>;
	const commits = (await commitsRes.json()) as Array<{
		commit?: { committer?: { date?: string } };
	}>;
	const lastCommitDate = commits[0]?.commit?.committer?.date ?? null;

	const weeks: Week[] = Array.isArray(activity)
		? activity.slice(-16).map((w) => ({ commits: w.total ?? 0, week: w.week }))
		: [];

	const found: RepoStat[] = KEY_REPOS.map((name) =>
		repos.find((r) => r.name.toLowerCase() === name.toLowerCase())
	)
		.filter((r): r is { name: string; stargazers_count: number; forks_count: number } => !!r)
		.map((r) => ({ name: r.name, stars: r.stargazers_count, forks: r.forks_count }));

	return {
		weeks,
		publicRepos: user.public_repos ?? null,
		followers: user.followers ?? null,
		lastCommitDate,
		miniAppsCommits: commits.length
			? (lastPageFromLink(commitsRes.headers.get('link')) ?? null)
			: null,
		repos: found
	};
}

export const load: PageServerLoad = async (): Promise<HireData> => {
	const now = Date.now();
	if (cached && now - cacheTimestamp < TTL) return cached;

	try {
		const data = await fetchAll();
		cached = data;
		cacheTimestamp = now;
		return data;
	} catch {
		// Serve the last good snapshot; otherwise an honest "signal lost" state.
		return (
			cached ?? {
				weeks: [],
				publicRepos: null,
				followers: null,
				lastCommitDate: null,
				miniAppsCommits: null,
				repos: []
			}
		);
	}
};
