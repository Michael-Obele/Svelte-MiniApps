#!/usr/bin/env bun

import { execSync } from 'child_process';
import { writeFileSync, readFileSync, existsSync } from 'fs';
import { join } from 'path';

interface CommitInfo {
	hash: string;
	date: string;
	message: string;
	author: string;
	files: string[];
}

interface TimelineItem {
	date: string;
	title: string;
	description: string;
	items: string[];
	type: 'breaking' | 'feature' | 'improvement' | 'deprecation' | 'fix';
	icon: string;
	color: string;
}

// Map of commit patterns to changelog types
const COMMIT_TYPE_MAP = {
	feat: { type: 'feature', icon: 'Rocket', color: 'from-green-500 to-emerald-500' },
	fix: { type: 'fix', icon: 'Wrench', color: 'from-blue-500 to-cyan-500' },
	perf: { type: 'improvement', icon: 'Zap', color: 'from-yellow-500 to-orange-500' },
	refactor: { type: 'improvement', icon: 'Code', color: 'from-purple-500 to-violet-500' },
	style: { type: 'improvement', icon: 'Palette', color: 'from-pink-500 to-rose-500' },
	docs: { type: 'improvement', icon: 'FileText', color: 'from-gray-500 to-slate-500' },
	test: { type: 'improvement', icon: 'TestTube', color: 'from-indigo-500 to-blue-500' },
	build: { type: 'improvement', icon: 'Package', color: 'from-amber-500 to-yellow-500' },
	ci: { type: 'improvement', icon: 'Settings', color: 'from-teal-500 to-cyan-500' },
	chore: { type: 'improvement', icon: 'Cog', color: 'from-gray-500 to-zinc-500' },
	revert: { type: 'deprecation', icon: 'Undo', color: 'from-red-500 to-orange-500' },
	breaking: { type: 'breaking', icon: 'AlertTriangle', color: 'from-red-500 to-pink-500' },
	improvement: { type: 'improvement', icon: 'Code', color: 'from-purple-500 to-violet-500' }
} as const;

// Get the last processed commit hash
function getLastProcessedCommit(): string | null {
	const dataPath = join(process.cwd(), 'src/routes/changelog/generated-data.ts');
	if (!existsSync(dataPath)) return null;

	try {
		const content = readFileSync(dataPath, 'utf-8');
		const match = content.match(/\/\/ Last processed commit: ([a-f0-9]+)/);
		return match ? match[1] : null;
	} catch {
		return null;
	}
}

// Get commits since last processed commit
function getCommits(since?: string): CommitInfo[] {
	const sinceFlag = since ? `${since}..HEAD` : '--max-count=50';

	try {
		const gitLog = execSync(`git log ${sinceFlag} --pretty=format:"%H|%ai|%s|%an" --name-only`, {
			encoding: 'utf-8'
		});

		const commits: CommitInfo[] = [];
		const entries = gitLog.trim().split('\n\n');

		for (const entry of entries) {
			const lines = entry.trim().split('\n');
			if (lines.length < 2) continue;

			const [hash, date, message, author] = lines[0].split('|');
			const files = lines.slice(1).filter((line) => line.trim() && !line.includes('|'));

			// Skip merge commits and generated commits
			if (message.startsWith('Merge') || message.includes('[skip ci]')) continue;

			commits.push({
				hash: hash.trim(),
				date: new Date(date).toLocaleDateString('en-US', {
					year: 'numeric',
					month: 'long',
					day: 'numeric'
				}),
				message: message.trim(),
				author: author.trim(),
				files
			});
		}

		return commits;
	} catch (error) {
		console.error('Error getting git commits:', error);
		return [];
	}
}

// Parse commit message to extract type and description
function parseCommitMessage(message: string): {
	type: string;
	scope?: string;
	description: string;
	breaking: boolean;
} {
	// Conventional commit format: type(scope): description
	const conventionalMatch = message.match(/^(\\w+)(\\(.+\\))?(!?):\\s*(.+)$/);

	if (conventionalMatch) {
		const [, type, scope, breaking, description] = conventionalMatch;
		return {
			type: type.toLowerCase(),
			scope: scope?.slice(1, -1), // Remove parentheses
			description,
			breaking: !!breaking
		};
	}

	// Try to detect type from message content
	const lowerMessage = message.toLowerCase();
	if (lowerMessage.includes('breaking'))
		return { type: 'breaking', description: message, breaking: true };
	if (lowerMessage.includes('feat') || lowerMessage.includes('add'))
		return { type: 'feat', description: message, breaking: false };
	if (lowerMessage.includes('fix')) return { type: 'fix', description: message, breaking: false };
	if (lowerMessage.includes('update') || lowerMessage.includes('improve'))
		return { type: 'improvement', description: message, breaking: false };

	return { type: 'improvement', description: message, breaking: false };
}

// Group commits by date and type
function groupCommits(commits: CommitInfo[]): TimelineItem[] {
	const grouped = new Map<string, { commits: CommitInfo[]; types: Set<string> }>();

	for (const commit of commits) {
		const key = commit.date;
		if (!grouped.has(key)) {
			grouped.set(key, { commits: [], types: new Set() });
		}

		const parsed = parseCommitMessage(commit.message);
		grouped.get(key)!.commits.push(commit);
		grouped.get(key)!.types.add(parsed.breaking ? 'breaking' : parsed.type);
	}

	const timelineItems: TimelineItem[] = [];

	for (const [date, { commits, types }] of grouped) {
		// Determine the primary type for this date
		let primaryType = 'improvement';
		if (types.has('breaking')) primaryType = 'breaking';
		else if (types.has('feat')) primaryType = 'feat';
		else if (types.has('fix')) primaryType = 'fix';

		const typeInfo =
			COMMIT_TYPE_MAP[primaryType as keyof typeof COMMIT_TYPE_MAP] || COMMIT_TYPE_MAP.improvement;

		// Generate title based on commits
		const title = generateTitle(commits, primaryType);
		const description = generateDescription(commits);

		timelineItems.push({
			date,
			title,
			description,
			items: commits.map((commit) => {
				const parsed = parseCommitMessage(commit.message);
				return `${parsed.description} (${commit.hash.substring(0, 7)})`;
			}),
			type: typeInfo.type,
			icon: typeInfo.icon,
			color: typeInfo.color
		});
	}

	return timelineItems.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

function generateTitle(commits: CommitInfo[], primaryType: string): string {
	if (commits.length === 1) {
		const parsed = parseCommitMessage(commits[0].message);
		return parsed.description;
	}

	const typeLabels = {
		breaking: 'Breaking Changes',
		feature: 'New Features',
		fix: 'Bug Fixes',
		improvement: 'Improvements',
		deprecation: 'Deprecations'
	};

	return typeLabels[primaryType as keyof typeof typeLabels] || 'Updates';
}

function generateDescription(commits: CommitInfo[]): string {
	if (commits.length === 1) {
		const files = commits[0].files.slice(0, 3); // Show up to 3 files
		const fileList = files.join(', ');
		return `Updated ${fileList}${files.length < commits[0].files.length ? ' and more' : ''}`;
	}

	const allFiles = new Set(commits.flatMap((c) => c.files));
	const fileCount = allFiles.size;
	return `Multiple updates across ${fileCount} file${fileCount === 1 ? '' : 's'}`;
}

// Generate the TypeScript file content
function generateDataFile(timelineItems: TimelineItem[], lastCommit?: string): string {
	return `// Auto-generated changelog data
// Last processed commit: ${lastCommit || 'unknown'}
// Generated at: ${new Date().toISOString()}

export interface GeneratedTimelineItem {
  date: string;
  title: string;
  description: string;
  items: string[];
  type: 'breaking' | 'feature' | 'improvement' | 'deprecation' | 'fix';
  icon: string;
  color: string;
}

export const generatedTimeline: GeneratedTimelineItem[] = ${JSON.stringify(timelineItems, null, 2)};

export const lastUpdated = '${new Date().toISOString()}';
`;
}

// Main execution
async function main() {
	console.log('🔍 Generating changelog from git commits...');

	const lastProcessed = getLastProcessedCommit();
	console.log(
		lastProcessed
			? `📅 Last processed commit: ${lastProcessed}`
			: '📅 Processing all recent commits'
	);

	const commits = getCommits(lastProcessed || undefined);
	console.log(`📝 Found ${commits.length} new commits`);

	if (commits.length === 0) {
		console.log('✅ No new commits to process');
		return;
	}

	const timelineItems = groupCommits(commits);
	console.log(`📊 Generated ${timelineItems.length} changelog entries`);

	const latestCommit = commits[0]?.hash;
	const fileContent = generateDataFile(timelineItems, latestCommit);

	const outputPath = join(process.cwd(), 'src/routes/changelog/generated-data.ts');
	writeFileSync(outputPath, fileContent);

	console.log(`✅ Changelog data written to ${outputPath}`);
	console.log('🎉 Changelog generation complete!');
}

// Main execution when script is run directly
main().catch(console.error);
