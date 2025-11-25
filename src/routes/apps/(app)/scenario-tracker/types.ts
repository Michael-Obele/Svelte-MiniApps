// Status enum for activities
export type Status = 'planning' | 'active' | 'paused' | 'complete';

// Risk severity levels
export type Severity = 'low' | 'medium' | 'high' | 'critical';

// Activity/log entry for an option
export interface Activity {
	id: string;
	date: string; // ISO date string
	description: string;
	timeSpent: number; // hours
	progressMetric: string; // e.g., "$500 earned", "2 certs completed"
	status: Status;
	notes: string;
}

// Individual option (e.g., Freelance Dev, Company Job, Luck-Based)
export interface Option {
	id: string;
	name: string;
	description: string;
	color: string; // Tailwind color class or hex
	totalTimeSpent: number; // calculated from activities
	progress: number; // percentage 0-100
	estimatedTimeToCompletion: string; // e.g., "2-4 years"
	allocation: number; // percentage of total effort
	activities: Activity[];
	createdAt: string;
}

// Timeline entry for tracking daily/weekly progress across options
export interface TimelineEntry {
	id: string;
	date: string; // ISO date string
	optionsWorked: string[]; // array of option IDs
	timeAllocation: Record<string, number>; // optionId -> percentage
	outcomes: string;
	adjustments: string;
}

// Risk/assumption tracking
export interface Risk {
	id: string;
	description: string;
	severity: Severity;
	mitigation: string;
	optionId: string | null; // null for general risks
	createdAt: string;
}

// Dashboard summary stats
export interface DashboardStats {
	totalTimeSpent: number;
	averageProgress: number;
	remainingYears: number;
	remainingDays: number;
}

// Default options for the scenario tracker
export const DEFAULT_OPTIONS: Omit<Option, 'id' | 'createdAt'>[] = [
	{
		name: 'Freelance Software Dev',
		description: 'Passion job; slow growth but paying out. Scale via international clients.',
		color: 'bg-blue-500',
		totalTimeSpent: 0,
		progress: 0,
		estimatedTimeToCompletion: '2-4 years',
		allocation: 60,
		activities: []
	},
	{
		name: 'Company Job',
		description: 'Promised role; hate lifestyle/exams but certs enable exit.',
		color: 'bg-amber-500',
		totalTimeSpent: 0,
		progress: 0,
		estimatedTimeToCompletion: '3-5 years',
		allocation: 30,
		activities: []
	},
	{
		name: 'Luck-Based',
		description: "Fast payouts but unreliable; use for cash boosts. Don't double down.",
		color: 'bg-purple-500',
		totalTimeSpent: 0,
		progress: 0,
		estimatedTimeToCompletion: '1-3 years',
		allocation: 10,
		activities: []
	}
];

// Helper function to generate unique IDs
export function generateId(): string {
	return crypto.randomUUID();
}

// Helper function to get status badge color
export function getStatusColor(status: Status): string {
	switch (status) {
		case 'planning':
			return 'bg-slate-500';
		case 'active':
			return 'bg-green-500';
		case 'paused':
			return 'bg-amber-500';
		case 'complete':
			return 'bg-blue-500';
		default:
			return 'bg-slate-500';
	}
}

// Helper function to get severity badge color
export function getSeverityColor(severity: Severity): string {
	switch (severity) {
		case 'low':
			return 'bg-green-500';
		case 'medium':
			return 'bg-amber-500';
		case 'high':
			return 'bg-orange-500';
		case 'critical':
			return 'bg-red-500';
		default:
			return 'bg-slate-500';
	}
}

// Helper function to format date
export function formatDate(dateString: string): string {
	const date = new Date(dateString);
	return date.toLocaleDateString('en-US', {
		year: 'numeric',
		month: 'short',
		day: 'numeric'
	});
}

// Helper function to calculate days remaining
export function calculateDaysRemaining(endDate: Date): number {
	const now = new Date();
	const diff = endDate.getTime() - now.getTime();
	return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

// Helper function to calculate years remaining
export function calculateYearsRemaining(endDate: Date): number {
	const now = new Date();
	const diffYears = (endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24 * 365.25);
	return Math.max(0, Math.round(diffYears * 10) / 10); // Round to 1 decimal
}
