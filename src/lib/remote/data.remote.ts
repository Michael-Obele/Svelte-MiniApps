import { query } from '$app/server';
import * as v from 'valibot';
import { GraphQLClient, gql } from 'graphql-request';
import { error } from '@sveltejs/kit';

// ========== Type Definitions ==========

export interface ContributionDay {
	contributionCount: number;
	date: string;
	color: string;
}

export interface ContributionWeek {
	contributionDays: ContributionDay[];
}

export interface Repository {
	name: string;
	nameWithOwner: string;
	url: string;
	description: string | null;
	stargazerCount: number;
	forkCount: number;
	primaryLanguage: {
		name: string;
		color: string;
	} | null;
}

export interface ContributionStats {
	totalCommitContributions: number;
	totalIssueContributions: number;
	totalPullRequestContributions: number;
	totalPullRequestReviewContributions: number;
	totalRepositoryContributions: number;
	totalRepositoriesWithContributedCommits: number;
	totalRepositoriesWithContributedIssues: number;
	totalRepositoriesWithContributedPullRequests: number;
	totalRepositoriesWithContributedPullRequestReviews: number;
	restrictedContributionsCount: number;
}

export interface ContributionData {
	user: string;
	year: string;
	totalContributions: number;
	weeks: ContributionWeek[];
	contributions: ContributionDay[];
	stats: ContributionStats;
	repositories: Repository[];
	contributionYears: number[];
	streakStats: {
		light: string | null;
		dark: string | null;
	};
}

// ========== Schema Validation ==========

const contributionQuerySchema = v.object({
	username: v.pipe(
		v.string(),
		v.minLength(1, 'Username is required'),
		v.maxLength(39, 'Username is too long'),
		v.regex(/^[a-z\d](?:[a-z\d]|-(?=[a-z\d])){0,38}$/i, 'Invalid GitHub username format')
	),
	year: v.pipe(
		v.string(),
		v.regex(/^\d{4}$/, 'Year must be a 4-digit number'),
		v.transform((val) => parseInt(val, 10)),
		v.minValue(2008, 'GitHub was founded in 2008'),
		v.maxValue(new Date().getFullYear(), 'Year cannot be in the future')
	)
});

// ========== GraphQL Queries ==========

const CONTRIBUTION_QUERY = gql`
	query ($username: String!, $from: DateTime!, $to: DateTime!) {
		user(login: $username) {
			contributionsCollection(from: $from, to: $to) {
				contributionCalendar {
					totalContributions
					weeks {
						contributionDays {
							contributionCount
							date
							color
						}
					}
				}
				totalCommitContributions
				totalIssueContributions
				totalPullRequestContributions
				totalPullRequestReviewContributions
				totalRepositoryContributions
				totalRepositoriesWithContributedCommits
				totalRepositoriesWithContributedIssues
				totalRepositoriesWithContributedPullRequests
				totalRepositoriesWithContributedPullRequestReviews
				restrictedContributionsCount
				contributionYears
			}
			repositoriesContributedTo(
				first: 100
				contributionTypes: [COMMIT, ISSUE, PULL_REQUEST, PULL_REQUEST_REVIEW]
				orderBy: { field: STARGAZERS, direction: DESC }
			) {
				nodes {
					name
					nameWithOwner
					url
					description
					stargazerCount
					forkCount
					primaryLanguage {
						name
						color
					}
				}
			}
		}
	}
`;

// ========== Helper Functions ==========

/**
 * Creates a GraphQL client with GitHub token
 */
function createGitHubClient(): GraphQLClient {
	let token = process.env.VITE_GITHUB_TOKEN || '';
	token = token.trim();

	console.log(`[GitHub API] Checking for GitHub token...`);
	if (!token) {
		console.error(`[GitHub API] No VITE_GITHUB_TOKEN found in environment`);
		throw error(500, 'GitHub token not configured');
	}
	console.log(`[GitHub API] Token found (length: ${token.length})`);

	return new GraphQLClient('https://api.github.com/graphql', {
		headers: {
			Authorization: `Bearer ${token}`,
			'User-Agent': 'Svelte-MiniApps-GitHub-Tracker',
			'X-GitHub-Api-Version': '2022-11-28'
		}
	});
}

/**
 * Fetches streak statistics SVG from external service
 */
async function fetchStreakStats(username: string, theme: 'light' | 'dark'): Promise<string | null> {
	const streakStatsUrl = {
		light: `https://github-readme-streak-stats-nine-alpha.vercel.app?user=${username}&theme=default`,
		dark: `https://github-readme-streak-stats-nine-alpha.vercel.app?user=${username}&theme=highcontrast`
	};

	try {
		const response = await fetch(streakStatsUrl[theme]);
		return response.ok ? await response.text() : null;
	} catch (err) {
		console.error(`Failed to fetch streak stats for theme ${theme}:`, err);
		return null;
	}
}

/**
 * Processes raw GitHub API response into clean contribution data
 */
function processContributionData(
	rawData: any,
	username: string,
	year: string
): Omit<ContributionData, 'streakStats'> {
	const collection = rawData.user.contributionsCollection;
	const calendar = collection.contributionCalendar;

	// Flatten contribution days for easier processing
	const contributions = calendar.weeks.flatMap((week: ContributionWeek) =>
		week.contributionDays.map((day) => ({
			date: day.date,
			contributionCount: day.contributionCount,
			color: day.color
		}))
	);

	// Extract stats
	const stats: ContributionStats = {
		totalCommitContributions: collection.totalCommitContributions,
		totalIssueContributions: collection.totalIssueContributions,
		totalPullRequestContributions: collection.totalPullRequestContributions,
		totalPullRequestReviewContributions: collection.totalPullRequestReviewContributions,
		totalRepositoryContributions: collection.totalRepositoryContributions,
		totalRepositoriesWithContributedCommits: collection.totalRepositoriesWithContributedCommits,
		totalRepositoriesWithContributedIssues: collection.totalRepositoriesWithContributedIssues,
		totalRepositoriesWithContributedPullRequests:
			collection.totalRepositoriesWithContributedPullRequests,
		totalRepositoriesWithContributedPullRequestReviews:
			collection.totalRepositoriesWithContributedPullRequestReviews,
		restrictedContributionsCount: collection.restrictedContributionsCount
	};

	// Extract repositories
	const repositories: Repository[] =
		rawData.user.repositoriesContributedTo.nodes?.map((repo: any) => ({
			name: repo.name,
			nameWithOwner: repo.nameWithOwner,
			url: repo.url,
			description: repo.description,
			stargazerCount: repo.stargazerCount,
			forkCount: repo.forkCount,
			primaryLanguage: repo.primaryLanguage
		})) || [];

	return {
		user: username,
		year,
		totalContributions: calendar.totalContributions,
		weeks: calendar.weeks,
		contributions,
		stats,
		repositories,
		contributionYears: collection.contributionYears || []
	};
}

// ========== Remote Functions ==========

/**
 * Fetches comprehensive GitHub contribution data for a user and year
 */
export const getContributionData = query(contributionQuerySchema, async (input) => {
	const { username, year } = input;

	console.log(`[GitHub API] ========== Starting data fetch ==========`);
	console.log(`[GitHub API] User: ${username}, Year: ${year}`);
	console.log(`[GitHub API] Request input:`, input);

	try {
		console.log(`[GitHub API] Step 1: Creating GraphQL client...`);
		const client = createGitHubClient();
		console.log(`[GitHub API] ✓ GraphQL client created successfully`);

		// Construct date range for the year
		const from = `${year}-01-01T00:00:00Z`;
		const to = `${year}-12-31T23:59:59Z`;
		console.log(`[GitHub API] Step 2: Date range - ${from} to ${to}`);

		// Fetch GitHub data
		console.log(`[GitHub API] Step 3: Making GraphQL request to GitHub API...`);
		const rawData = await client.request<any>(CONTRIBUTION_QUERY, {
			username,
			from,
			to
		});
		console.log(`[GitHub API] ✓ GraphQL request completed`);
		console.log(`[GitHub API] Raw data keys:`, Object.keys(rawData));

		// Check if user exists
		if (!rawData.user) {
			console.error(`[GitHub API] ✗ User "${username}" not found in API response`);
			throw error(404, `GitHub user "${username}" not found`);
		}
		console.log(`[GitHub API] ✓ User "${username}" found`);

		// Process the data
		console.log(`[GitHub API] Step 4: Processing contribution data...`);
		const processedData = processContributionData(rawData, username, year.toString());
		console.log(`[GitHub API] ✓ Data processing completed`);
		console.log(`[GitHub API] Processed data:`, {
			user: processedData.user,
			year: processedData.year,
			totalContributions: processedData.totalContributions,
			weeksCount: processedData.weeks.length,
			contributionsCount: processedData.contributions.length,
			repositoriesCount: processedData.repositories.length
		});

		// Fetch streak stats in parallel
		console.log(`[GitHub API] Step 5: Fetching streak stats for ${username}...`);
		const [lightStreakStats, darkStreakStats] = await Promise.all([
			fetchStreakStats(username, 'light'),
			fetchStreakStats(username, 'dark')
		]);
		console.log(
			`[GitHub API] ✓ Streak stats fetched - Light: ${lightStreakStats ? 'success' : 'failed'}, Dark: ${darkStreakStats ? 'success' : 'failed'}`
		);

		const result: ContributionData = {
			...processedData,
			streakStats: {
				light: lightStreakStats,
				dark: darkStreakStats
			}
		};

		console.log(`[GitHub API] ========== ✓ FETCH COMPLETED SUCCESSFULLY ==========`);
		console.log(`[GitHub API] Returning data for ${username}/${year}`);
		console.log(`[GitHub API] Result summary:`, {
			totalContributions: result.totalContributions,
			hasStreakStats: !!(result.streakStats.light || result.streakStats.dark),
			dataStructure: Object.keys(result)
		});

		return result;
	} catch (err) {
		console.error(`[GitHub API] ========== ✗ ERROR OCCURRED ==========`);
		console.error(`[GitHub API] Error for ${username}/${year}:`, err);
		console.error(`[GitHub API] Error type:`, typeof err);
		console.error(`[GitHub API] Error details:`, {
			message: err instanceof Error ? err.message : 'Unknown',
			stack: err instanceof Error ? err.stack : undefined
		});

		// Handle specific error types
		if (err && typeof err === 'object') {
			// graphql-request ClientError structure
			const response = (err as any).response;
			const statusCode = response?.status || (err as any).status;

			console.error(`[GitHub API] Detected status code: ${statusCode}`);

			if (statusCode === 404) {
				console.error(`[GitHub API] Throwing 404 - User not found`);
				throw error(404, `GitHub user "${username}" not found`);
			}
			if (statusCode === 401 || statusCode === 403) {
				console.error(`[GitHub API] Throwing 500 - Authentication failed (Status: ${statusCode})`);
				throw error(500, 'GitHub API authentication failed. Please check your token configuration.');
			}
		}

		console.error(`[GitHub API] Throwing 500 - Generic error`);
		throw error(500, 'Failed to fetch GitHub contribution data');
	}
});

/**
 * Fetches available contribution years for a user
 */
export const getContributionYears = query(
	v.object({
		username: v.pipe(
			v.string(),
			v.minLength(1, 'Username is required'),
			v.maxLength(39, 'Username is too long')
		)
	}),
	async ({ username }) => {
		try {
			const client = createGitHubClient();
			const currentYear = new Date().getFullYear();

			const query = gql`
				query ($username: String!, $from: DateTime!, $to: DateTime!) {
					user(login: $username) {
						contributionsCollection(from: $from, to: $to) {
							contributionYears
						}
					}
				}
			`;

			const data = await client.request<any>(query, {
				username,
				from: `${currentYear}-01-01T00:00:00Z`,
				to: `${currentYear}-12-31T23:59:59Z`
			});

			if (!data.user) {
				throw error(404, `GitHub user "${username}" not found`);
			}

			return data.user.contributionsCollection.contributionYears || [];
		} catch (err) {
			console.error('Error fetching contribution years:', err);

			if (err && typeof err === 'object') {
				const response = (err as any).response;
				const statusCode = response?.status || (err as any).status;

				if (statusCode === 401 || statusCode === 403) {
					throw error(500, 'GitHub API authentication failed. Please check your token configuration.');
				}
			}

			throw error(500, 'Failed to fetch contribution years');
		}
	}
);
