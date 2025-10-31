// Auto-generated changelog data loader
// This file imports the JSON source of truth and re-exports with TypeScript types
// The JSON file is maintained by scripts/generate-changelog.ts

import changelogData from './generated-data.json';

export interface GeneratedTimelineItem {
	date: string;
	title: string;
	description: string;
	items: string[];
	type: 'breaking' | 'feature' | 'improvement' | 'deprecation' | 'fix';
	icon: string;
	color: string;
}

// Re-export the timeline from JSON with proper types
export const generatedTimeline: GeneratedTimelineItem[] =
	changelogData.timeline as GeneratedTimelineItem[];

// Re-export metadata
export const lastUpdated = changelogData.generatedAt;
export const lastProcessedCommit = changelogData.lastProcessedCommit;
