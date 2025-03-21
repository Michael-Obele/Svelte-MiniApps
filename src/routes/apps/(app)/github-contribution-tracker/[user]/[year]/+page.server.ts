import { error } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { gql, GraphQLClient } from 'graphql-request';

interface ContributionData {
	user: {
		contributionsCollection: {
			contributionCalendar: {
				totalContributions: number;
				weeks: Array<{
					contributionDays: Array<{
						contributionCount: number;
						date: string;
					}>;
				}>;
			};
		};
	};
}

async function fetchGitHubData(user: string, year: string) {
	const query = gql`
        query {
            user(login: "${user}") {
                contributionsCollection(
                    from: "${year}-01-01T00:00:00Z"
                    to: "${year}-12-31T23:59:59Z"
                ) {
                    contributionCalendar {
                        totalContributions
                        weeks {
                            contributionDays {
                                contributionCount
                                date
                            }
                        }
                    }
                }
            }
        }
    `;

	const client = new GraphQLClient('https://api.github.com/graphql', {
		headers: {
			Authorization: `bearer ${process.env.VITE_GITHUB_TOKEN}`
		}
	});

	return client.request<ContributionData>(query);
}

async function fetchStreakStats(user: string, theme: 'light' | 'dark') {
	const streakStatsUrl = {
		light: `https://github-readme-streak-stats-nine-alpha.vercel.app?user=${user}&theme=default`,
		dark: `https://github-readme-streak-stats-nine-alpha.vercel.app?user=${user}&theme=highcontrast`
	};

	const response = await fetch(streakStatsUrl[theme]);
	return response.ok ? await response.text() : null;
}

export const load = (async ({ params, setHeaders }) => {
	const { user, year } = params;

	if (!user || !year) {
		throw error(400, 'Username and year are required');
	}

	try {
		setHeaders({
			'Cache-Control': 'public, max-age=3600',
			'Access-Control-Allow-Origin': '*'
		});

		const data = await fetchGitHubData(user, year);
		const {
			contributionCalendar: { weeks, totalContributions }
		} = data.user.contributionsCollection;

		const gitContributions = weeks.flatMap((week) =>
			week.contributionDays.map((day) => ({
				date: day.date,
				contributionCount: day.contributionCount
			}))
		);
		const [lightStreakStats, darkStreakStats] = await Promise.all([
			fetchStreakStats(user, 'light'),
			fetchStreakStats(user, 'dark')
		]);

		return {
			props: { user, year },
			gitContributions,
			totalContributions,
			streakStats: {
				light: lightStreakStats,
				dark: darkStreakStats
			},
			calendar: gitContributions
		};
	} catch (error) {
		console.error('Error fetching GitHub data:', error);
		if (error instanceof Error) {
			throw error; // Re-throw the original error
			// Or create a new error with more context:
			// throw new Error(`Failed to fetch GitHub data: ${error.message}`);
		} else {
			throw new Error(`Failed to fetch GitHub data: ${String(error)}`); // Handle non-Error values
		}
	}
}) satisfies PageServerLoad;

// export const actions = {
// 	default: async ({ request }) => {
// 		const formData = await request.formData();
// 		const user = String(formData.get('user'));
// 		const year = Number(formData.get('year'));

// 		try {
// 			const response = await fetchGitHubData(user, year.toString());
// 			return {
// 				props: { user, year },
// 				success: true
// 			};
// 		} catch (err) {
// 			const errorMessage = err instanceof Error ? err.message : String(err);
// 			console.error(`Error fetching data: ${errorMessage}`);
// 			throw error(500, 'Failed to fetch GitHub data');
// 		}
// 	}
// } satisfies Actions;
