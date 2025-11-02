/**
 * Mock GitHub Contribution Data
 *
 * This file contains static data extracted from actual API responses
 * to test LayerChart components locally without fetching from GitHub API.
 *
 * Data based on logs from user 'michael' for year 2025
 */

// Monthly aggregated data for bar chart
export const monthlyData = [
	{ date: new Date(2024, 11, 1), contributionCount: 73 }, // December 2024 (index 0 in logs due to year boundary)
	{ date: new Date(2025, 0, 1), contributionCount: 80 }, // January
	{ date: new Date(2025, 1, 1), contributionCount: 58 }, // February
	{ date: new Date(2025, 2, 1), contributionCount: 11 }, // March
	{ date: new Date(2025, 3, 1), contributionCount: 77 }, // April
	{ date: new Date(2025, 4, 1), contributionCount: 66 }, // May
	{ date: new Date(2025, 5, 1), contributionCount: 81 }, // June
	{ date: new Date(2025, 6, 1), contributionCount: 165 }, // July
	{ date: new Date(2025, 7, 1), contributionCount: 138 }, // August
	{ date: new Date(2025, 8, 1), contributionCount: 88 }, // September
	{ date: new Date(2025, 9, 1), contributionCount: 5 }, // October
	{ date: new Date(2025, 10, 1), contributionCount: 0 } // November
];

// Sample calendar data (first 50 days for testing)
// In production, this would be all 365 days
export const calendarDataSample = [
	{ date: new Date('2025-01-01'), value: 2, color: '#9be9a8' },
	{ date: new Date('2025-01-02'), value: 0, color: '#ebedf0' },
	{ date: new Date('2025-01-03'), value: 0, color: '#ebedf0' },
	{ date: new Date('2025-01-04'), value: 0, color: '#ebedf0' },
	{ date: new Date('2025-01-05'), value: 0, color: '#ebedf0' },
	{ date: new Date('2025-01-06'), value: 3, color: '#40c463' },
	{ date: new Date('2025-01-07'), value: 5, color: '#30a14e' },
	{ date: new Date('2025-01-08'), value: 2, color: '#9be9a8' },
	{ date: new Date('2025-01-09'), value: 1, color: '#9be9a8' },
	{ date: new Date('2025-01-10'), value: 0, color: '#ebedf0' },
	{ date: new Date('2025-01-11'), value: 4, color: '#40c463' },
	{ date: new Date('2025-01-12'), value: 0, color: '#ebedf0' },
	{ date: new Date('2025-01-13'), value: 2, color: '#9be9a8' },
	{ date: new Date('2025-01-14'), value: 1, color: '#9be9a8' },
	{ date: new Date('2025-01-15'), value: 3, color: '#40c463' },
	{ date: new Date('2025-01-16'), value: 0, color: '#ebedf0' },
	{ date: new Date('2025-01-17'), value: 5, color: '#30a14e' },
	{ date: new Date('2025-01-18'), value: 0, color: '#ebedf0' },
	{ date: new Date('2025-01-19'), value: 0, color: '#ebedf0' },
	{ date: new Date('2025-01-20'), value: 2, color: '#9be9a8' },
	{ date: new Date('2025-01-21'), value: 6, color: '#30a14e' },
	{ date: new Date('2025-01-22'), value: 4, color: '#40c463' },
	{ date: new Date('2025-01-23'), value: 3, color: '#40c463' },
	{ date: new Date('2025-01-24'), value: 0, color: '#ebedf0' },
	{ date: new Date('2025-01-25'), value: 1, color: '#9be9a8' },
	{ date: new Date('2025-01-26'), value: 0, color: '#ebedf0' },
	{ date: new Date('2025-01-27'), value: 2, color: '#9be9a8' },
	{ date: new Date('2025-01-28'), value: 5, color: '#30a14e' },
	{ date: new Date('2025-01-29'), value: 3, color: '#40c463' },
	{ date: new Date('2025-01-30'), value: 0, color: '#ebedf0' },
	{ date: new Date('2025-01-31'), value: 4, color: '#40c463' },
	{ date: new Date('2025-02-01'), value: 2, color: '#9be9a8' },
	{ date: new Date('2025-02-02'), value: 0, color: '#ebedf0' },
	{ date: new Date('2025-02-03'), value: 3, color: '#40c463' },
	{ date: new Date('2025-02-04'), value: 1, color: '#9be9a8' },
	{ date: new Date('2025-02-05'), value: 5, color: '#30a14e' },
	{ date: new Date('2025-02-06'), value: 0, color: '#ebedf0' },
	{ date: new Date('2025-02-07'), value: 2, color: '#9be9a8' },
	{ date: new Date('2025-02-08'), value: 0, color: '#ebedf0' },
	{ date: new Date('2025-02-09'), value: 1, color: '#9be9a8' },
	{ date: new Date('2025-02-10'), value: 4, color: '#40c463' },
	{ date: new Date('2025-02-11'), value: 3, color: '#40c463' },
	{ date: new Date('2025-02-12'), value: 0, color: '#ebedf0' },
	{ date: new Date('2025-02-13'), value: 2, color: '#9be9a8' },
	{ date: new Date('2025-02-14'), value: 5, color: '#30a14e' },
	{ date: new Date('2025-02-15'), value: 0, color: '#ebedf0' },
	{ date: new Date('2025-02-16'), value: 1, color: '#9be9a8' },
	{ date: new Date('2025-02-17'), value: 3, color: '#40c463' },
	{ date: new Date('2025-02-18'), value: 0, color: '#ebedf0' },
	{ date: new Date('2025-02-19'), value: 2, color: '#9be9a8' }
];

// Full year calendar data generator
// Generates realistic pattern based on the monthly aggregation
export function generateFullCalendarData(): Array<{ date: Date; value: number; color: string }> {
	const data: Array<{ date: Date; value: number; color: string }> = [];
	const monthlyTotals = [73, 80, 58, 11, 77, 66, 81, 165, 138, 88, 5, 0];

	// Start from January 1, 2025
	const startDate = new Date(2025, 0, 1);

	for (let day = 0; day < 365; day++) {
		const currentDate = new Date(startDate);
		currentDate.setDate(startDate.getDate() + day);

		const month = currentDate.getMonth();
		const monthTotal = monthlyTotals[month];
		const daysInMonth = new Date(2025, month + 1, 0).getDate();

		// Distribute monthly total across days with some randomness
		// Average per day for this month
		const avgPerDay = monthTotal / daysInMonth;

		// Add some variation (0 to 2x average, with some days having 0)
		let value = Math.random() < 0.3 ? 0 : Math.floor(Math.random() * (avgPerDay * 2));

		// Determine color based on contribution count (GitHub's color scheme)
		let color: string;
		if (value === 0) {
			color = '#ebedf0'; // No contributions
		} else if (value <= 2) {
			color = '#9be9a8'; // Low (1-2)
		} else if (value <= 5) {
			color = '#40c463'; // Medium (3-5)
		} else if (value <= 9) {
			color = '#30a14e'; // High (6-9)
		} else {
			color = '#216e39'; // Very high (10+)
		}

		data.push({
			date: new Date(currentDate),
			value,
			color
		});
	}

	return data;
}

// Stats from the API
export const stats = {
	totalCommitContributions: 360,
	totalIssueContributions: 114,
	totalPullRequestContributions: 28,
	totalPullRequestReviewContributions: 0,
	totalRepositoryContributions: 3,
	totalRepositoriesWithContributedCommits: 4,
	totalRepositoriesWithContributedIssues: 2,
	totalRepositoriesWithContributedPullRequests: 1,
	totalRepositoriesWithContributedPullRequestReviews: 0,
	restrictedContributionsCount: 337
};

// Contribution types for display
export const contributionTypes = [
	{
		label: 'Commits',
		value: 360,
		color: 'text-green-500'
	},
	{
		label: 'Pull Requests',
		value: 28,
		color: 'text-blue-500'
	},
	{
		label: 'Issues',
		value: 114,
		color: 'text-yellow-500'
	},
	{
		label: 'Reviews',
		value: 0,
		color: 'text-purple-500'
	}
];

// Insights
export const insights = {
	avgPerDay: '2.3',
	mostActiveType: 'Commits',
	repoCount: 3,
	hasPrivateContributions: true
};

// Total contributions
export const totalContributions = 842;

// Export a combined mock data object
export const mockContributionData = {
	user: 'michael',
	year: '2025',
	totalContributions,
	stats,
	monthlyData,
	calendarData: generateFullCalendarData(),
	calendarDataSample,
	contributionTypes,
	insights
};
