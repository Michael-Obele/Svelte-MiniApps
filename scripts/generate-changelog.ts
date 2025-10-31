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

// Smart merge: combines timeline items by date, deduplicating by commit hash
function mergeTimelineItems(
	newItems: TimelineItem[],
	existingItems: TimelineItem[]
): TimelineItem[] {
	const merged = new Map<string, TimelineItem>();

	// First, add all existing items to the map
	for (const item of existingItems) {
		merged.set(item.date, { ...item, items: [...item.items] });
	}

	// Then merge or add new items
	for (const newItem of newItems) {
		const existing = merged.get(newItem.date);

		if (existing) {
			// Extract commit hashes from existing items
			const existingHashes = new Set(
				existing.items
					.map((item) => {
						const match = item.match(/\(([a-f0-9]{7})\)$/);
						return match ? match[1] : null;
					})
					.filter(Boolean)
			);

			// Add only new commits (by hash) - prepend to keep newest first
			const newCommits = newItem.items.filter((item) => {
				const match = item.match(/\(([a-f0-9]{7})\)$/);
				const hash = match ? match[1] : null;
				return hash && !existingHashes.has(hash);
			});

			if (newCommits.length > 0) {
				// Prepend new commits (newest first)
				existing.items = [...newCommits, ...existing.items];

				// Update description
				const totalFiles = new Set(existing.items).size;
				existing.description = `Multiple updates across ${totalFiles} commit${totalFiles === 1 ? '' : 's'}`;

				console.log(`  ✓ Merged ${newCommits.length} new commit(s) into ${newItem.date}`);
			}
		} else {
			// New date entry, just add it
			merged.set(newItem.date, newItem);
			console.log(`  ✓ Added new date entry: ${newItem.date}`);
		}
	}

	// Sort by date (newest first)
	return Array.from(merged.values()).sort(
		(a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
	);
}

// Get commits since last processed commit
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
		// Ensure commits for the same date are newest-first
		commits.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
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

		// Ensure JSON backup exists even when no new commits
		const jsonPath = join(process.cwd(), 'src/routes/changelog/generated-data.json');
		if (!existsSync(jsonPath)) {
			console.log('📝 Creating JSON backup from existing TS file...');
			const existingData = getExistingGeneratedData();
			if (existingData.length > 0) {
				writeFileSync(
					jsonPath,
					JSON.stringify(
						{
							lastProcessedCommit: lastProcessed || 'unknown',
							generatedAt: new Date().toISOString(),
							timeline: existingData
						},
						null,
						2
					)
				);
				console.log(`✅ JSON backup created with ${existingData.length} entries`);
			}
		}
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
	const fileContent = generateDataFile(mergedItems, latestCommit);

	const outputPath = join(process.cwd(), 'src/routes/changelog/generated-data.ts');
	const jsonPath = join(process.cwd(), 'src/routes/changelog/generated-data.json');

	// Save JSON first (source of truth), then generate TS file
	writeFileSync(
		jsonPath,
		JSON.stringify(
			{
				lastProcessedCommit: latestCommit,
				generatedAt: new Date().toISOString(),
				timeline: mergedItems
			},
			null,
			2
		)
	);

	// Generate TypeScript file from JSON (for types and IDE support)
	writeFileSync(outputPath, fileContent);

	console.log(`✅ Changelog data written to ${outputPath}`);
	console.log(`✅ JSON backup saved to ${jsonPath}`);
	console.log('🎉 Changelog generation complete!');
}

// Main execution when script is run directly
main().catch(console.error);
