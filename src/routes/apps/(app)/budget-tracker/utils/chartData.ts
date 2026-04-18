import type { Budget, Expense } from '../states.svelte';

export interface ChartDataPoint {
	name: string;
	value: number;
	percentage?: number;
}

export interface TrendDataPoint {
	date: string;
	spent: number;
	remaining: number;
}

/**
 * Format expense data for category breakdown pie chart
 */
export function formatCategoryChartData(expenses: Expense[]): ChartDataPoint[] {
	const categories: Record<string, number> = {};

	expenses.forEach((expense) => {
		const category = expense.description || 'Uncategorized';
		categories[category] = (categories[category] || 0) + expense.amount;
	});

	const total = Object.values(categories).reduce((sum, val) => sum + val, 0);

	return Object.entries(categories)
		.map(([name, value]) => ({
			name,
			value,
			percentage: total > 0 ? (value / total) * 100 : 0
		}))
		.sort((a, b) => b.value - a.value);
}

/**
 * Format budget vs spent data for comparison bar chart
 */
export function formatComparisonChartData(budget: Budget): Array<{
	category: string;
	allocated: number;
	spent: number;
}> {
	const spent = budget.expenses.reduce((sum, exp) => sum + exp.amount, 0);
	const remaining = Math.max(budget.amount - spent, 0);

	return [
		{
			category: budget.name,
			allocated: budget.amount,
			spent: spent
		},
		{
			category: 'Remaining',
			allocated: remaining,
			spent: 0
		}
	];
}

/**
 * Format expenses for trend line chart over time period
 * Returns daily/weekly aggregated spending
 */
export function formatTrendChartData(
	expenses: Expense[],
	timePeriod: 'week' | 'month' | 'year' | 'all'
): TrendDataPoint[] {
	const now = new Date();
	const data: Record<string, number> = {};
	let startDate: Date;

	// Determine date range
	switch (timePeriod) {
		case 'week':
			startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
			break;
		case 'month':
			startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
			break;
		case 'year':
			startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
			break;
		default:
			startDate = new Date(0); // All time
	}

	// Initialize all days in range with 0
	const currentDate = new Date(startDate);
	while (currentDate <= now) {
		const dateStr = currentDate.toISOString().split('T')[0];
		data[dateStr] = 0;
		currentDate.setDate(currentDate.getDate() + 1);
	}

	// Aggregate expenses by date
	expenses.forEach((expense) => {
		const expenseDate = new Date(expense.createdAt);
		if (expenseDate >= startDate && expenseDate <= now) {
			const dateStr = expenseDate.toISOString().split('T')[0];
			data[dateStr] = (data[dateStr] || 0) + expense.amount;
		}
	});

	// Convert to array and sort by date
	return Object.entries(data)
		.map(([date, spent]) => ({
			date,
			spent,
			remaining: 0 // Will be calculated if needed
		}))
		.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
}

/**
 * Get month label for X-axis
 */
export function getDateLabel(
	dateStr: string,
	timePeriod: 'week' | 'month' | 'year' | 'all'
): string {
	const date = new Date(dateStr);

	switch (timePeriod) {
		case 'week':
			return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
		case 'month':
			return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
		case 'year':
			return date.toLocaleDateString('en-US', { month: 'short' });
		default:
			return date.toLocaleDateString('en-US', { year: '2-digit', month: 'short' });
	}
}
