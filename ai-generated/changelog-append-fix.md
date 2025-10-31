# Changelog Generation Script - Complete Rewrite

## Problems Identified

The original changelog generation script had critical data loss issues:

1. **Lost History**: Limited to 50 commits when no last processed commit existed
2. **Aggressive Deduplication**: Replaced entire date entries when new commits arrived
3. **Data Loss on --full**: Full rebuilds would overwrite existing entries
4. **Complex Parsing**: Unreliable TypeScript file parsing as fallback
5. **Wrong Architecture**: Treated JSON as "backup" instead of source of truth

## New Architecture Implemented

### 1. Fetch All Commits on First Run

**Before:**

```typescript
const sinceFlag = since ? `${since}..HEAD` : '--max-count=50';
```

**After:**

````typescript
### 1. JSON-First Architecture

**Core Principle**: JSON is the primary data source, TypeScript is generated output.

```typescript
// Read existing data (JSON only)
function getExistingGeneratedData(): TimelineItem[] {
  const jsonPath = join(process.cwd(), 'src/routes/changelog/generated-data.json');

  if (!existsSync(jsonPath)) {
    return [];
  }

  const content = readFileSync(jsonPath, 'utf-8');
  const data = JSON.parse(content);
  return data.timeline as TimelineItem[];
}
````

**Benefits:**

- Simple, reliable parsing (no regex needed)
- JSON is easy to validate and manipulate
- TypeScript file becomes a pure artifact
- No complex fallback logic

### 2. Smart Merge Algorithm

**Instead of replacing entries**, we merge them by commit hash:

```typescript
function mergeTimelineItems(
	newItems: TimelineItem[],
	existingItems: TimelineItem[]
): TimelineItem[] {
	const merged = new Map<string, TimelineItem>();

	// Add all existing items
	for (const item of existingItems) {
		merged.set(item.date, { ...item, items: [...item.items] });
	}

	// Merge new items
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

			// Add only NEW commits by hash
			const newCommits = newItem.items.filter((item) => {
				const match = item.match(/\(([a-f0-9]{7})\)$/);
				const hash = match ? match[1] : null;
				return hash && !existingHashes.has(hash);
			});

			// Prepend new commits (newest first)
			if (newCommits.length > 0) {
				existing.items = [...newCommits, ...existing.items];
			}
		} else {
			// New date, just add it
			merged.set(newItem.date, newItem);
		}
	}

	return Array.from(merged.values()).sort(
		(a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
	);
}
```

**Key Features:**

- Merges by DATE, deduplicates by COMMIT HASH
- Never replaces existing entries
- Adds new commits to existing dates
- Preserves all historical data

### 3. Strict Data Loss Prevention

```typescript
// Safety check: ensure we're not losing entries
if (mergedItems.length < existingData.length) {
	console.error(
		`❌ ERROR: Entry count decreased from ${existingData.length} to ${mergedItems.length}`
	);
	console.error('❌ This indicates data loss! Aborting to prevent data corruption.');
	process.exit(1); // ABORT instead of just warning
}
```

The script now **aborts** if data loss is detected, rather than just warning.

### 4. One-Time Migration Script

Created `scripts/migrate-changelog-to-json.ts` to migrate existing TS data to JSON:

```bash
bun run scripts/migrate-changelog-to-json.ts
```

This extracts all entries from the TypeScript file and creates the authoritative JSON source.

````

This ensures the first run processes all commits, not just the last 50.

### 2. Reversed Merge Order

**Before:**

```typescript
const allTimelineItems = [...existingData, ...newTimelineItems].sort(
	(a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
);
````

**After:**

```typescript
// Merge with NEW items first, so they appear at the top and take precedence in deduplication
// This ensures new commits are always added to the top without modifying old entries
const allTimelineItems = [...newTimelineItems, ...existingData].sort(
	(a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
);
```

By spreading `newTimelineItems` first, the deduplication logic (which keeps the first occurrence) now preserves new entries over old ones when there are conflicts.

### 3. Always Preserve Existing Data

**Before:**

```typescript
const existingData = forceFullRebuild ? [] : getExistingGeneratedData();
```

**After:**

```typescript
// Always get existing data to preserve history
const existingData = getExistingGeneratedData();
```

Even during `--full` rebuilds, existing data is preserved and merged with reprocessed commits.

### 4. Added Safety Check

```typescript
// Safety check: ensure we're not losing entries
if (uniqueItems.length < existingData.length && !forceFullRebuild) {
	console.warn(
		`⚠️  WARNING: Entry count decreased from ${existingData.length} to ${uniqueItems.length}`
	);
	console.warn('⚠️  This may indicate data loss. Please verify the results.');
}
```

This alerts if entries are being lost during the merge process.

## How It Works Now

1. **Normal Run** (with last processed commit):

   - Fetches only new commits since last processed hash
   - Adds them to the top of existing timeline
   - Preserves all old entries unchanged

2. **First Run** (no last processed commit):

   - Fetches ALL commits from repository history
   - Merges with any existing data (if file already exists)
   - Deduplicates keeping newest entries

3. **Full Rebuild** (`--full` flag):
   - Reprocesses all commits from scratch
   - STILL preserves existing timeline entries
   - Merges reprocessed data with existing data
   - Useful for fixing grouping/formatting without losing history

## Benefits

✅ **No More Lost History**: All commits are preserved across regenerations
✅ **Append-Only**: New entries always added to the top without touching old ones
✅ **Safe Rebuilds**: Even `--full` flag won't delete existing entries
✅ **Better Deduplication**: Newer entries take precedence when there are conflicts
✅ **Safety Warnings**: Alerts if data loss is detected

## Testing

Verified the fix works correctly:

```bash
bun run scripts/generate-changelog.ts
```

Output:

```
🔍 Generating changelog from git commits...
📅 Last processed commit: 895957507e45054eed7c6a9fc920bbb7c1a05844
📝 Found 10 commits to process
📊 Generated 1 changelog entries
📚 Found 3 existing entries
📋 Total entries after merge: 3
✅ Changelog data written to generated-data.ts
✅ JSON backup saved to generated-data.json
🎉 Changelog generation complete!
```

## Files Modified

- `scripts/generate-changelog.ts`: Applied all 4 fixes above
- `src/routes/changelog/generated-data.ts`: Updated with new merge logic
- `src/routes/changelog/generated-data.json`: Backup with explicit lastProcessedCommit field

## Usage

```bash
# Normal incremental update (default)
bun run scripts/generate-changelog.ts

# Full rebuild (now safe - preserves existing data)
bun run scripts/generate-changelog.ts --full
```
