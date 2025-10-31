#!/usr/bin/env bun

import { execSync } from 'child_process';
import { writeFileSync, readFileSync, existsSync } from 'fs';
import { join } from 'path';

interface CommitInfo {
	hash: string;
	date: string;
	isoDate?: string;
	timestamp?: number;
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
	const jsonPath = join(process.cwd(), 'src/routes/changelog/generated-data.json');
	// Prefer the JSON backup which contains an explicit lastProcessedCommit field
	if (existsSync(jsonPath)) {
		try {
			const content = readFileSync(jsonPath, 'utf-8');
			const data = JSON.parse(content);
			return data.lastProcessedCommit || null;
		} catch (err) {
			// fallthrough to try TS parse
			console.warn('Failed to parse generated JSON for last processed commit:', err);
		}
	}

	const dataPath = join(process.cwd(), 'src/routes/changelog/generated-data.ts');
	if (!existsSync(dataPath)) return null;

	try {
		const content = readFileSync(dataPath, 'utf-8');
		const match = content.match(/\/\/ Last processed commit: ([a-f0-9]+)/i);
		return match ? match[1] : null;
	} catch (err) {
		console.warn('Failed to read generated-data.ts for last processed commit:', err);
		return null;
	}
}

// Get existing generated timeline items from JSON (primary source of truth)
function getExistingGeneratedData(): TimelineItem[] {
	const jsonPath = join(process.cwd(), 'src/routes/changelog/generated-data.json');

	if (!existsSync(jsonPath)) {
		console.log('📝 No existing JSON data found - starting fresh');
		return [];
	}

	try {
		const content = readFileSync(jsonPath, 'utf-8');
		const data = JSON.parse(content);

		if (Array.isArray(data.timeline)) {
			console.log(`📚 Loaded ${data.timeline.length} existing entries from JSON`);
			return data.timeline as TimelineItem[];
		}

		console.warn('⚠️  JSON file exists but timeline is not an array');
		return [];
	} catch (error) {
		console.error('❌ Failed to parse JSON data file:', error);
		console.error('💡 You may need to run: bun run scripts/migrate-changelog-to-json.ts');
		return [];
	}
}

// Smart merge: deduplicates by commit hash (each entry is now a single commit)
function mergeTimelineItems(
	newItems: TimelineItem[],
	existingItems: TimelineItem[]
): TimelineItem[] {
	const merged = new Map<string, TimelineItem>();

	// First, add all existing items to the map (keyed by commit hash)
	for (const item of existingItems) {
		const hashMatch = item.items[0]?.match(/\(([a-f0-9]{7})\)$/);
		const hash = hashMatch ? hashMatch[1] : item.title; // fallback to title if no hash
		merged.set(hash, { ...item });
	}

	// Then add new items (only if they don't already exist)
	let newCommitsAdded = 0;
	for (const newItem of newItems) {
		const hashMatch = newItem.items[0]?.match(/\(([a-f0-9]{7})\)$/);
		const hash = hashMatch ? hashMatch[1] : newItem.title;

		if (!merged.has(hash)) {
			merged.set(hash, newItem);
			newCommitsAdded++;
		}
	}

	console.log(`  ✓ Added ${newCommitsAdded} new commit entries`);

	// Convert back to array and sort by date (newest first)
	const result = Array.from(merged.values()).sort((a, b) => {
		// Parse dates for comparison
		const dateA = new Date(a.date);
		const dateB = new Date(b.date);

		// If dates are the same, sort by commit hash (assuming newer commits have higher hashes)
		if (dateA.getTime() === dateB.getTime()) {
			const hashA = a.items[0]?.match(/\(([a-f0-9]{7})\)$/)?.[1] || '';
			const hashB = b.items[0]?.match(/\(([a-f0-9]{7})\)$/)?.[1] || '';
			return hashB.localeCompare(hashA); // Reverse alphabetical for newer hashes first
		}

		return dateB.getTime() - dateA.getTime();
	});

	return result;
} // Get commits since last processed commit
function getCommits(since?: string): CommitInfo[] {
	// When no since hash, get all commits instead of limiting to 50
	// This prevents losing old commit history
	const sinceFlag = since ? `${since}..HEAD` : '--all';

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

			const parsedDate = new Date(date);
			commits.push({
				hash: hash.trim(),
				date: parsedDate.toLocaleDateString('en-US', {
					year: 'numeric',
					month: 'long',
					day: 'numeric'
				}),
				isoDate: parsedDate.toISOString(),
				timestamp: parsedDate.getTime(),
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

// Create individual timeline entries for each commit
function groupCommits(commits: CommitInfo[]): TimelineItem[] {
	const timelineItems: TimelineItem[] = [];

	for (const commit of commits) {
		const parsed = parseCommitMessage(commit.message);
		const commitType = parsed.breaking ? 'breaking' : parsed.type;
		const typeInfo =
			COMMIT_TYPE_MAP[commitType as keyof typeof COMMIT_TYPE_MAP] || COMMIT_TYPE_MAP.improvement;

		// Create individual entry for each commit
		timelineItems.push({
			date: commit.date,
			title: parsed.description,
			description: `Updated ${commit.files.slice(0, 3).join(', ')}${commit.files.length > 3 ? ' and more' : ''}`,
			items: [`${parsed.description} (${commit.hash.substring(0, 7)})`],
			type: typeInfo.type,
			icon: typeInfo.icon,
			color: typeInfo.color
		});
	}

	// Sort by timestamp (newest first)
	return timelineItems.sort((a, b) => {
		// Find the corresponding commits to compare timestamps
		const aCommit = commits.find(
			(c) => c.hash.substring(0, 7) === a.items[0].match(/\(([a-f0-9]{7})\)$/)?.[1]
		);
		const bCommit = commits.find(
			(c) => c.hash.substring(0, 7) === b.items[0].match(/\(([a-f0-9]{7})\)$/)?.[1]
		);
		return (bCommit?.timestamp || 0) - (aCommit?.timestamp || 0);
	});
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

// Generate the JSON data structure
function generateJsonData(
	timelineItems: TimelineItem[],
	lastCommit?: string
): {
	lastProcessedCommit: string;
	generatedAt: string;
	timeline: TimelineItem[];
} {
	return {
		lastProcessedCommit: lastCommit || 'unknown',
		generatedAt: new Date().toISOString(),
		timeline: timelineItems
	};
}

// Main execution
async function main() {
	console.log('🔍 Generating changelog from git commits...');

	// Check for command line arguments
	const args = process.argv.slice(2);
	const forceFullRebuild = args.includes('--full') || args.includes('-f');

	const lastProcessed = forceFullRebuild ? null : getLastProcessedCommit();

	if (forceFullRebuild) {
		console.log('🔄 Force full rebuild requested - reprocessing all commits');
		console.log('ℹ️  Note: Existing entries will be preserved and merged with reprocessed data');
	} else {
		console.log(
			lastProcessed
				? `📅 Last processed commit: ${lastProcessed}`
				: '📅 No previous commit found - processing all commits'
		);
	}

	const commits = getCommits(lastProcessed || undefined);
	console.log(`📝 Found ${commits.length} commits to process`);

	if (commits.length === 0) {
		console.log('✅ No new commits to process');
		console.log('� Changelog is up to date');
		return;
	}

	const newTimelineItems = groupCommits(commits);
	console.log(`📊 Generated ${newTimelineItems.length} new changelog entries`);

	// Always get existing data to preserve history (JSON is source of truth)
	const existingData = getExistingGeneratedData();

	// Smart merge: combines by date, deduplicates by commit hash
	console.log('🔄 Merging with existing entries...');
	const mergedItems = mergeTimelineItems(newTimelineItems, existingData);

	console.log(`📋 Total entries after merge: ${mergedItems.length}`);

	// Safety check: ensure we're not losing entries
	if (mergedItems.length < existingData.length) {
		console.error(
			`❌ ERROR: Entry count decreased from ${existingData.length} to ${mergedItems.length}`
		);
		console.error('❌ This indicates data loss! Aborting to prevent data corruption.');
		console.error('💡 Please check the changelog files and report this issue.');
		process.exit(1);
	}

	const latestCommit = commits[0]?.hash;
	const jsonData = generateJsonData(mergedItems, latestCommit);
	const jsonPath = join(process.cwd(), 'src/routes/changelog/generated-data.json');

	// Write to JSON file (single source of truth)
	// The TypeScript file (generated-data.ts) imports and re-exports this JSON
	writeFileSync(jsonPath, JSON.stringify(jsonData, null, 2));

	console.log(`✅ Changelog JSON updated with ${mergedItems.length} entries`);
	console.log(`✅ Last processed commit: ${latestCommit}`);
	console.log('🎉 Changelog generation complete!');
}

// Main execution when script is run directly
main().catch(console.error);
